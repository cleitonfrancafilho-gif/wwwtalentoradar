import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

// Peer-to-peer live streaming: the host sends audio/video directly to each viewer.
// Signaling (offers/answers/ICE) travels over a realtime broadcast room per live.
const ICE: RTCConfiguration = {
  iceServers: [{ urls: ["stun:stun.l.google.com:19302", "stun:stun1.l.google.com:19302"] }],
};

type Signal =
  | { type: "join"; from: string }
  | { type: "host-ready" }
  | { type: "offer"; to: string; sdp: RTCSessionDescriptionInit }
  | { type: "answer"; from: string; sdp: RTCSessionDescriptionInit }
  | { type: "ice"; to?: string; from?: string; candidate: RTCIceCandidateInit }
  | { type: "kick"; to: string }
  | { type: "end" };

export interface PresenceViewer { userId: string; name: string }

const roomName = (streamId: string) => `live-rtc-${streamId}`;

/** Builds the outgoing media: camera+mic, or screen (+ its audio) mixed with the mic. */
export async function buildHostStream(source: "camera" | "screen", facing: "user" | "environment" = "user") {
  if (source === "camera") {
    return navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: { echoCancellation: true, noiseSuppression: true },
    });
  }
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("Este aparelho/navegador não permite transmitir a tela. Use a câmera ou um computador.");
  }
  const screen = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });
  let mic: MediaStream | null = null;
  try { mic = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { /* mic optional */ }
  const ctx = new AudioContext();
  const dest = ctx.createMediaStreamDestination();
  [screen, mic].forEach(s => { if (s && s.getAudioTracks().length) ctx.createMediaStreamSource(s).connect(dest); });
  const out = new MediaStream([...screen.getVideoTracks(), ...dest.stream.getAudioTracks()]);
  // stop helpers when the outgoing stream stops
  const stopAll = () => { screen.getTracks().forEach(t => t.stop()); mic?.getTracks().forEach(t => t.stop()); ctx.close(); };
  (out as any)._cleanup = stopAll;
  return out;
}

export function stopStream(s: MediaStream | null) {
  if (!s) return;
  s.getTracks().forEach(t => t.stop());
  (s as any)._cleanup?.();
}

export class LiveHost {
  private channel: RealtimeChannel;
  private peers = new Map<string, RTCPeerConnection>();
  constructor(
    private streamId: string,
    private me: PresenceViewer,
    private getStream: () => MediaStream | null,
    onViewers: (v: PresenceViewer[]) => void,
  ) {
    this.channel = supabase.channel(roomName(streamId), { config: { broadcast: { self: false }, presence: { key: me.userId } } });
    this.channel
      .on("broadcast", { event: "signal" }, ({ payload }) => this.onSignal(payload as Signal))
      .on("presence", { event: "sync" }, () => {
        const state = this.channel.presenceState<PresenceViewer>();
        onViewers(Object.values(state).flat().filter(v => v.userId !== me.userId).map(v => ({ userId: v.userId, name: v.name })));
      })
      .on("presence", { event: "leave" }, ({ key }) => this.dropPeer(key))
      .subscribe(async status => {
        if (status === "SUBSCRIBED") {
          await this.channel.track(me);
          this.send({ type: "host-ready" });
        }
      });
  }
  private send(s: Signal) { this.channel.send({ type: "broadcast", event: "signal", payload: s }); }
  private async onSignal(s: Signal) {
    if (s.type === "join") await this.connect(s.from);
    else if (s.type === "answer") await this.peers.get(s.from)?.setRemoteDescription(s.sdp).catch(() => {});
    else if (s.type === "ice" && s.from) await this.peers.get(s.from)?.addIceCandidate(s.candidate).catch(() => {});
  }
  private async connect(viewerId: string) {
    this.dropPeer(viewerId);
    const stream = this.getStream();
    if (!stream) return;
    const pc = new RTCPeerConnection(ICE);
    this.peers.set(viewerId, pc);
    stream.getTracks().forEach(t => pc.addTrack(t, stream));
    pc.onicecandidate = e => e.candidate && this.send({ type: "ice", to: viewerId, candidate: e.candidate.toJSON() });
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    this.send({ type: "offer", to: viewerId, sdp: offer });
  }
  private dropPeer(id: string) { this.peers.get(id)?.close(); this.peers.delete(id); }
  /** Swap camera/screen without reconnecting viewers. */
  replaceStream(next: MediaStream) {
    this.peers.forEach(pc => pc.getSenders().forEach(sender => {
      const t = next.getTracks().find(tr => tr.kind === sender.track?.kind);
      if (t) sender.replaceTrack(t);
    }));
  }
  kick(userId: string) { this.send({ type: "kick", to: userId }); this.dropPeer(userId); }
  end() {
    this.send({ type: "end" });
    this.peers.forEach(pc => pc.close());
    this.peers.clear();
    setTimeout(() => supabase.removeChannel(this.channel), 300);
  }
}

export class LiveViewer {
  private channel: RealtimeChannel;
  private pc: RTCPeerConnection | null = null;
  private pendingIce: RTCIceCandidateInit[] = [];
  constructor(
    streamId: string,
    private me: PresenceViewer,
    private onStream: (s: MediaStream) => void,
    private onKicked: () => void,
    private onEnded: () => void,
  ) {
    this.channel = supabase.channel(roomName(streamId), { config: { broadcast: { self: false }, presence: { key: me.userId } } });
    this.channel
      .on("broadcast", { event: "signal" }, ({ payload }) => this.onSignal(payload as Signal))
      .subscribe(async status => {
        if (status === "SUBSCRIBED") {
          await this.channel.track(me);
          this.send({ type: "join", from: me.userId });
        }
      });
  }
  private send(s: Signal) { this.channel.send({ type: "broadcast", event: "signal", payload: s }); }
  private async onSignal(s: Signal) {
    if (s.type === "host-ready") this.send({ type: "join", from: this.me.userId });
    else if (s.type === "end") this.onEnded();
    else if (s.type === "kick" && s.to === this.me.userId) { this.leave(); this.onKicked(); }
    else if (s.type === "offer" && s.to === this.me.userId) {
      this.pc?.close();
      const pc = new RTCPeerConnection(ICE);
      this.pc = pc;
      pc.ontrack = e => this.onStream(e.streams[0]);
      pc.onicecandidate = e => e.candidate && this.send({ type: "ice", from: this.me.userId, candidate: e.candidate.toJSON() });
      await pc.setRemoteDescription(s.sdp);
      for (const c of this.pendingIce.splice(0)) await pc.addIceCandidate(c).catch(() => {});
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      this.send({ type: "answer", from: this.me.userId, sdp: answer });
    } else if (s.type === "ice" && s.to === this.me.userId) {
      if (this.pc?.remoteDescription) await this.pc.addIceCandidate(s.candidate).catch(() => {});
      else this.pendingIce.push(s.candidate);
    }
  }
  leave() { this.pc?.close(); this.pc = null; supabase.removeChannel(this.channel); }
}

export const parseHashtags = (raw: string) =>
  [...new Set(raw.split(/[\s,]+/).map(t => t.trim().replace(/^#+/, "")).filter(Boolean).map(t => `#${t}`))].slice(0, 10);

/** Seconds a viewer must still wait before commenting again (slow mode). */
export const slowModeRemaining = (lastSentAt: number | null, slowSeconds: number, now: number) => {
  if (!lastSentAt || slowSeconds <= 0) return 0;
  return Math.max(0, Math.ceil(slowSeconds - (now - lastSentAt) / 1000));
};
