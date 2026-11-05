import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from "@/components/BottomNav";
import {
  ArrowLeft, Radio, Heart, Send, X, Share2, Camera, CameraOff, Mic, MicOff, RotateCcw,
  Eye, Gift, MonitorUp, Settings2, Ban, Loader2, Timer, MessageSquareOff,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  LiveHost, LiveViewer, PresenceViewer, buildHostStream, stopStream, parseHashtags, slowModeRemaining,
} from "@/lib/liveRtc";

interface LiveRow {
  id: string; host_id: string; title: string; description: string | null; hashtags: string[];
  source: string; status: string; comments_enabled: boolean; slow_mode_seconds: number; likes: number; started_at: string;
  host_name?: string; host_avatar?: string | null;
}
interface CommentRow { id: string; user_id: string; user_name: string; kind: string; content: string; created_at: string }

const GIFTS = [
  { id: "heart", emoji: "❤️", label: "Coração" },
  { id: "ball", emoji: "⚽", label: "Bola" },
  { id: "fire", emoji: "🔥", label: "Fogo" },
  { id: "medal", emoji: "🥇", label: "Medalha" },
  { id: "trophy", emoji: "🏆", label: "Troféu" },
  { id: "crown", emoji: "👑", label: "Coroa" },
];
const giftOf = (id: string) => GIFTS.find(g => g.id === id) ?? GIFTS[0];

const Live = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const me: PresenceViewer = { userId: user?.id ?? "", name: profile?.full_name || "Usuário" };

  const [mode, setMode] = useState<"browse" | "setup" | "host" | "watch">("browse");
  const [lives, setLives] = useState<LiveRow[]>([]);
  const [loadingLives, setLoadingLives] = useState(true);
  const [live, setLive] = useState<LiveRow | null>(null);

  // setup form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [source, setSource] = useState<"camera" | "screen">("camera");
  const [facing, setFacing] = useState<"user" | "environment">("user");
  const [starting, setStarting] = useState(false);

  // media
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hostRef = useRef<LiveHost | null>(null);
  const viewerRef = useRef<LiveViewer | null>(null);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [remoteReady, setRemoteReady] = useState(false);
  const [mutedPlayback, setMutedPlayback] = useState(true);

  // interaction
  const [viewers, setViewers] = useState<PresenceViewer[]>([]);
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [commentText, setCommentText] = useState("");
  const [lastSentAt, setLastSentAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [hearts, setHearts] = useState<number[]>([]);
  const [giftBursts, setGiftBursts] = useState<{ id: string; emoji: string; who: string }[]>([]);
  const [showGifts, setShowGifts] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [banned, setBanned] = useState<string[]>([]);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const loadLives = useCallback(async () => {
    setLoadingLives(true);
    const since = new Date(Date.now() - 12 * 3600 * 1000).toISOString();
    const { data } = await supabase.from("live_streams").select("*").eq("status", "live").gt("started_at", since).order("started_at", { ascending: false });
    const rows = (data ?? []) as LiveRow[];
    const ids = [...new Set(rows.map(r => r.host_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids);
      rows.forEach(r => { const p = profs?.find(x => x.id === r.host_id); r.host_name = p?.full_name; r.host_avatar = p?.avatar_url; });
    }
    setLives(rows);
    setLoadingLives(false);
  }, []);

  useEffect(() => { if (mode === "browse") loadLives(); }, [mode, loadLives]);
  useEffect(() => { commentsEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [comments]);
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 500); return () => clearInterval(t); }, []);

  // camera preview during setup
  useEffect(() => {
    if (mode !== "setup") return;
    let cancelled = false;
    (async () => {
      if (source !== "camera") { stopStream(streamRef.current); streamRef.current = null; if (videoRef.current) videoRef.current.srcObject = null; return; }
      try {
        const s = await buildHostStream("camera", facing);
        if (cancelled) { stopStream(s); return; }
        stopStream(streamRef.current);
        streamRef.current = s;
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch { toast.error("Permita o acesso à câmera e ao microfone"); }
    })();
    return () => { cancelled = true; };
  }, [mode, source, facing]);

  // realtime: comments, live settings, bans
  useEffect(() => {
    if (!live || (mode !== "host" && mode !== "watch")) return;
    supabase.from("live_comments").select("*").eq("stream_id", live.id).order("created_at").limit(100)
      .then(({ data }) => setComments((data ?? []) as CommentRow[]));
    if (mode === "host") supabase.from("live_bans").select("user_id").eq("stream_id", live.id).then(({ data }) => setBanned((data ?? []).map(b => b.user_id)));

    const ch = supabase.channel(`live-db-${live.id}-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_comments", filter: `stream_id=eq.${live.id}` }, ({ new: c }) => {
        const row = c as CommentRow;
        setComments(prev => prev.some(p => p.id === row.id) ? prev : [...prev.slice(-150), row]);
        if (row.kind === "gift") {
          const burst = { id: row.id, emoji: giftOf(row.content).emoji, who: row.user_name };
          setGiftBursts(prev => [...prev, burst]);
          setTimeout(() => setGiftBursts(prev => prev.filter(b => b.id !== burst.id)), 2500);
        }
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "live_comments" }, ({ old }) => {
        setComments(prev => prev.filter(p => p.id !== (old as { id: string }).id));
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "live_streams", filter: `id=eq.${live.id}` }, ({ new: n }) => {
        const row = n as LiveRow;
        setLive(prev => prev ? { ...prev, ...row } : prev);
        if (row.status !== "live" && mode === "watch") { toast("A live foi encerrada"); leaveWatch(); }
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "live_bans", filter: `stream_id=eq.${live.id}` }, ({ new: b }) => {
        const uid = (b as { user_id: string }).user_id;
        if (mode === "host") setBanned(prev => [...new Set([...prev, uid])]);
        else if (uid === user?.id) { toast.error("Você foi removido desta live"); leaveWatch(); }
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live?.id, mode]);

  // end the live if the host closes the tab
  useEffect(() => {
    if (mode !== "host" || !live) return;
    const onUnload = () => { supabase.from("live_streams").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", live.id).then(() => {}); hostRef.current?.end(); };
    window.addEventListener("beforeunload", onUnload);
    return () => window.removeEventListener("beforeunload", onUnload);
  }, [mode, live]);

  useEffect(() => () => { hostRef.current?.end(); viewerRef.current?.leave(); stopStream(streamRef.current); }, []);

  const startLive = async () => {
    if (!user) return;
    if (!title.trim()) { toast.error("Defina um título para a live"); return; }
    setStarting(true);
    try {
      if (source === "screen" || !streamRef.current) {
        stopStream(streamRef.current);
        streamRef.current = await buildHostStream(source, facing);
      }
      const s = streamRef.current!;
      s.getVideoTracks()[0]?.addEventListener("ended", () => { if (source === "screen") toast("Compartilhamento de tela parado"); });
      const { data, error } = await supabase.from("live_streams").insert({
        host_id: user.id, title: title.trim(), description: description.trim(), hashtags: parseHashtags(tagsRaw), source,
      }).select().single();
      if (error) throw error;
      setLive(data as LiveRow);
      setComments([]); setMicOn(true); setCamOn(true);
      hostRef.current = new LiveHost(data.id, me, () => streamRef.current, setViewers);
      setMode("host");
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = s; }, 50);
      toast.success("🔴 Você está ao vivo!");
    } catch (e: any) {
      toast.error(e?.message?.includes("Permission") || e?.name === "NotAllowedError" ? "Permissão negada para câmera/tela" : e.message || "Não foi possível iniciar");
    } finally { setStarting(false); }
  };

  const switchSource = async (next: "camera" | "screen", nextFacing = facing) => {
    try {
      const s = await buildHostStream(next, nextFacing);
      s.getAudioTracks().forEach(t => (t.enabled = micOn));
      hostRef.current?.replaceStream(s);
      stopStream(streamRef.current);
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setSource(next); setFacing(nextFacing); setCamOn(true);
      if (live) supabase.from("live_streams").update({ source: next }).eq("id", live.id).then(() => {});
    } catch (e: any) { toast.error(e.message || "Não foi possível trocar a fonte"); }
  };

  const endLive = async () => {
    if (live) await supabase.from("live_streams").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", live.id);
    hostRef.current?.end(); hostRef.current = null;
    stopStream(streamRef.current); streamRef.current = null;
    setLive(null); setViewers([]); setManageOpen(false);
    setMode("browse");
    toast("Live encerrada. Obrigado!");
  };

  const watch = (row: LiveRow) => {
    if (!user) return;
    if (row.host_id === user.id) { toast.info("Esta é a sua live"); }
    setLive(row); setRemoteReady(false); setMutedPlayback(true); setMode("watch");
    viewerRef.current = new LiveViewer(row.id, me,
      stream => { if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.play().catch(() => {}); } setRemoteReady(true); },
      () => { toast.error("Você foi removido desta live"); setMode("browse"); setLive(null); },
      () => { toast("A live foi encerrada"); leaveWatch(); },
    );
  };

  const leaveWatch = () => {
    viewerRef.current?.leave(); viewerRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setLive(null); setMode("browse");
  };

  const isHost = mode === "host";
  const wait = isHost || !live ? 0 : slowModeRemaining(lastSentAt, live.slow_mode_seconds, now);
  const commentsBlocked = !isHost && live ? !live.comments_enabled : false;

  const sendComment = async () => {
    if (!live || !user || !commentText.trim() || wait > 0 || commentsBlocked) return;
    const content = commentText.trim().slice(0, 300);
    setCommentText("");
    const { error } = await supabase.from("live_comments").insert({ stream_id: live.id, user_id: user.id, user_name: me.name, kind: "comment", content });
    if (error) { toast.error(error.message); setCommentText(content); } else setLastSentAt(Date.now());
  };

  const sendGift = async (giftId: string) => {
    if (!live || !user) return;
    setShowGifts(false);
    const { error } = await supabase.from("live_comments").insert({ stream_id: live.id, user_id: user.id, user_name: me.name, kind: "gift", content: giftId });
    if (error) toast.error(error.message);
  };

  const sendLike = async () => {
    if (!live) return;
    const id = Date.now() + Math.random();
    setHearts(prev => [...prev, id]);
    setTimeout(() => setHearts(prev => prev.filter(h => h !== id)), 1500);
    setLive(prev => prev ? { ...prev, likes: prev.likes + 1 } : prev);
    await supabase.rpc("like_live", { _stream_id: live.id });
  };

  const share = async () => {
    const url = `${window.location.origin}/live`;
    try { await navigator.clipboard.writeText(url); toast.success("Link copiado!"); } catch { toast(url); }
  };

  const updateLive = async (patch: Partial<LiveRow>) => {
    if (!live) return;
    setLive({ ...live, ...patch });
    const { error } = await supabase.from("live_streams").update(patch).eq("id", live.id);
    if (error) toast.error(error.message);
  };

  const banUser = async (uid: string, name: string) => {
    if (!live) return;
    const { error } = await supabase.from("live_bans").insert({ stream_id: live.id, user_id: uid });
    if (error && error.code !== "23505") { toast.error(error.message); return; }
    hostRef.current?.kick(uid);
    setBanned(prev => [...new Set([...prev, uid])]);
    toast.success(`${name} foi banido da live`);
  };
  const unbanUser = async (uid: string) => {
    if (!live) return;
    await supabase.from("live_bans").delete().eq("stream_id", live.id).eq("user_id", uid);
    setBanned(prev => prev.filter(b => b !== uid));
  };
  const deleteComment = async (id: string) => { await supabase.from("live_comments").delete().eq("id", id); };

  // ---------- Browse ----------
  if (mode === "browse") {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
            <div className="flex items-center gap-2"><Radio className="w-5 h-5 text-destructive" /><span className="font-display font-bold text-lg text-foreground">Lives</span></div>
            <Button size="sm" variant="destructive" onClick={() => setMode("setup")} className="gap-1"><Radio className="w-3.5 h-3.5" /> Iniciar</Button>
          </div>
        </header>
        <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          <div className="glass-card rounded-xl p-3 flex items-center gap-2 border border-destructive/20">
            <Radio className="w-4 h-4 text-destructive animate-pulse" />
            <p className="text-xs text-muted-foreground"><span className="text-destructive font-semibold">{lives.length} {lives.length === 1 ? "live" : "lives"}</span> acontecendo agora</p>
          </div>
          {loadingLives ? (
            <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : lives.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">Ninguém está ao vivo agora. Que tal começar a sua?</div>
          ) : lives.map(l => (
            <button key={l.id} onClick={() => watch(l)} className="w-full glass-card rounded-xl overflow-hidden border border-transparent hover:border-primary/20 transition-colors text-left">
              <div className="aspect-video bg-muted flex items-center justify-center relative">
                {l.source === "screen" ? <MonitorUp className="w-12 h-12 text-muted-foreground/30" /> : <Camera className="w-12 h-12 text-muted-foreground/30" />}
                <Badge variant="destructive" className="absolute top-2 left-2 text-[10px] gap-1"><Radio className="w-2.5 h-2.5 animate-pulse" /> AO VIVO</Badge>
                <Badge variant="secondary" className="absolute top-2 right-2 text-[10px] gap-1"><Heart className="w-2.5 h-2.5" /> {l.likes}</Badge>
              </div>
              <div className="p-3 space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-xs">{l.host_avatar ? <img src={l.host_avatar} className="w-full h-full object-cover" /> : "👤"}</div>
                  <span className="text-sm font-bold text-foreground">{l.host_name || "Atleta"}</span>
                </div>
                <p className="text-sm text-foreground">{l.title}</p>
                {l.hashtags.length > 0 && <p className="text-xs text-primary">{l.hashtags.join(" ")}</p>}
              </div>
            </button>
          ))}
        </main>
        <BottomNav />
      </div>
    );
  }

  // ---------- Setup ----------
  if (mode === "setup") {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col overflow-y-auto">
        <header className="flex items-center justify-between px-4 py-3">
          <button onClick={() => { stopStream(streamRef.current); streamRef.current = null; setMode("browse"); }} className="text-muted-foreground"><X className="w-6 h-6" /></button>
          <span className="font-display font-bold text-foreground">Configurar Live</span>
          <div className="w-6" />
        </header>
        <div className="max-w-md w-full mx-auto px-4 pb-8 space-y-4">
          <div className="aspect-video rounded-xl bg-muted overflow-hidden flex items-center justify-center relative">
            {source === "camera" ? (
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" style={{ transform: facing === "user" ? "scaleX(-1)" : undefined }} />
            ) : (
              <div className="text-center text-muted-foreground text-sm px-6"><MonitorUp className="w-10 h-10 mx-auto mb-2" />Ao iniciar, escolha a tela ou janela que deseja transmitir. O áudio do seu microfone vai junto.</div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant={source === "camera" ? "default" : "outline"} onClick={() => setSource("camera")} className="gap-2"><Camera className="w-4 h-4" /> Câmera</Button>
            <Button variant={source === "screen" ? "default" : "outline"} onClick={() => setSource("screen")} className="gap-2"><MonitorUp className="w-4 h-4" /> Tela</Button>
          </div>
          {source === "camera" && (
            <Button variant="ghost" size="sm" onClick={() => setFacing(f => f === "user" ? "environment" : "user")} className="gap-2 w-full"><RotateCcw className="w-4 h-4" /> Virar câmera</Button>
          )}
          <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título da live *" maxLength={100} />
          <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Descrição (opcional)" maxLength={500} rows={3} />
          <Input value={tagsRaw} onChange={e => setTagsRaw(e.target.value)} placeholder="Hashtags: #futebol #treino" />
          <Button onClick={startLive} disabled={starting} variant="destructive" className="w-full gap-2">
            {starting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />} Iniciar Live
          </Button>
          <p className="text-[11px] text-muted-foreground text-center">Transmissão direta entre aparelhos — ideal para até ~10 espectadores ao mesmo tempo.</p>
        </div>
      </div>
    );
  }

  // ---------- Host / Watch ----------
  return (
    <div className="fixed inset-0 z-[100] bg-background flex flex-col">
      <div className="flex-1 relative flex items-center justify-center bg-muted overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isHost || mutedPlayback}
          className="w-full h-full object-contain"
          style={{ transform: isHost && source === "camera" && facing === "user" ? "scaleX(-1)" : undefined }}
        />
        {!isHost && !remoteReady && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground text-sm">
            <Loader2 className="w-6 h-6 animate-spin text-primary" /> Conectando à transmissão...
          </div>
        )}
        {!isHost && remoteReady && mutedPlayback && (
          <Button size="sm" variant="secondary" className="absolute bottom-4 left-1/2 -translate-x-1/2 gap-2" onClick={() => setMutedPlayback(false)}>
            <Mic className="w-4 h-4" /> Toque para ativar o som
          </Button>
        )}
        {isHost && !camOn && <div className="absolute inset-0 bg-background/90 flex items-center justify-center text-muted-foreground"><CameraOff className="w-10 h-10" /></div>}

        <div className="absolute top-0 left-0 right-0 flex items-start justify-between px-4 pt-4 z-10 gap-2">
          <div className="glass rounded-xl px-3 py-2 max-w-[70%]">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="text-[10px] gap-1"><Radio className="w-2 h-2 animate-pulse" /> AO VIVO</Badge>
              <span className="text-xs font-bold text-foreground truncate">{isHost ? "Você" : live?.host_name}</span>
            </div>
            <p className="text-sm font-bold text-foreground mt-1 truncate">{live?.title}</p>
            {live?.description && <p className="text-[11px] text-muted-foreground line-clamp-2">{live.description}</p>}
            {!!live?.hashtags.length && <p className="text-[11px] text-primary truncate">{live.hashtags.join(" ")}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 glass rounded-full px-2 py-1"><Eye className="w-3 h-3 text-foreground" /><span className="text-foreground text-xs">{isHost ? viewers.length : "•"}</span></div>
            <div className="flex items-center gap-1 glass rounded-full px-2 py-1"><Heart className="w-3 h-3 text-destructive" /><span className="text-foreground text-xs">{live?.likes ?? 0}</span></div>
            {isHost && <button onClick={() => setManageOpen(true)} className="glass rounded-full p-1.5" aria-label="Gerenciar live"><Settings2 className="w-4 h-4 text-foreground" /></button>}
            <button onClick={() => (isHost ? endLive() : leaveWatch())} className="glass rounded-full p-1.5" aria-label="Sair"><X className="w-4 h-4 text-foreground" /></button>
          </div>
        </div>

        {hearts.map(h => (
          <div key={h} className="absolute bottom-24 right-8 text-2xl animate-bounce pointer-events-none" style={{ animationDuration: "1s" }}>❤️</div>
        ))}
        {giftBursts.map((g, i) => (
          <div key={g.id} className="absolute left-4 glass rounded-full px-3 py-1.5 flex items-center gap-2 animate-slide-up pointer-events-none" style={{ bottom: 96 + i * 44 }}>
            <span className="text-2xl">{g.emoji}</span><span className="text-xs text-foreground font-bold">{g.who} enviou um presente!</span>
          </div>
        ))}

        {isHost && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3 z-10">
            <button onClick={() => { const v = !micOn; streamRef.current?.getAudioTracks().forEach(t => (t.enabled = v)); setMicOn(v); }} className={`w-10 h-10 rounded-full flex items-center justify-center ${micOn ? "glass" : "bg-destructive"}`} aria-label="Microfone">
              {micOn ? <Mic className="w-5 h-5 text-foreground" /> : <MicOff className="w-5 h-5 text-destructive-foreground" />}
            </button>
            <button onClick={() => { const v = !camOn; streamRef.current?.getVideoTracks().forEach(t => (t.enabled = v)); setCamOn(v); }} className={`w-10 h-10 rounded-full flex items-center justify-center ${camOn ? "glass" : "bg-destructive"}`} aria-label="Vídeo">
              {camOn ? <Camera className="w-5 h-5 text-foreground" /> : <CameraOff className="w-5 h-5 text-destructive-foreground" />}
            </button>
            {source === "camera" && (
              <button onClick={() => switchSource("camera", facing === "user" ? "environment" : "user")} className="w-10 h-10 rounded-full glass flex items-center justify-center" aria-label="Virar câmera"><RotateCcw className="w-5 h-5 text-foreground" /></button>
            )}
            <button onClick={() => switchSource(source === "camera" ? "screen" : "camera")} className="w-10 h-10 rounded-full glass flex items-center justify-center" aria-label="Trocar câmera/tela">
              {source === "camera" ? <MonitorUp className="w-5 h-5 text-foreground" /> : <Camera className="w-5 h-5 text-foreground" />}
            </button>
            <Button size="sm" variant="destructive" onClick={endLive}>Encerrar</Button>
          </div>
        )}
      </div>

      <div className="bg-card border-t border-border">
        <div className="max-h-40 overflow-y-auto px-4 py-2 space-y-1">
          {comments.map(c => (
            <div key={c.id} className="flex gap-1.5 items-start group">
              <span className={`text-xs font-bold ${c.user_id === live?.host_id ? "text-primary" : "text-foreground"}`}>{c.user_name || "Usuário"}</span>
              <span className="text-xs text-muted-foreground flex-1">{c.kind === "gift" ? `enviou ${giftOf(c.content).emoji} ${giftOf(c.content).label}` : c.content}</span>
              {isHost && c.user_id !== user?.id && (
                <span className="flex gap-1 opacity-60">
                  <button onClick={() => deleteComment(c.id)} aria-label="Apagar comentário"><X className="w-3 h-3" /></button>
                  <button onClick={() => banUser(c.user_id, c.user_name)} aria-label="Banir"><Ban className="w-3 h-3 text-destructive" /></button>
                </span>
              )}
            </div>
          ))}
          {comments.length === 0 && <p className="text-xs text-muted-foreground">Seja o primeiro a comentar!</p>}
          <div ref={commentsEndRef} />
        </div>

        {showGifts && (
          <div className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-border">
            {GIFTS.map(g => (
              <button key={g.id} onClick={() => sendGift(g.id)} className="shrink-0 w-16 h-16 rounded-xl bg-muted flex flex-col items-center justify-center hover:bg-primary/20">
                <span className="text-2xl">{g.emoji}</span><span className="text-[9px] text-muted-foreground">{g.label}</span>
              </button>
            ))}
          </div>
        )}

        <div className="px-4 py-2 flex gap-2 items-center border-t border-border">
          <Input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendComment()}
            disabled={commentsBlocked || wait > 0}
            placeholder={commentsBlocked ? "Comentários desativados pelo criador" : wait > 0 ? `Aguarde ${wait}s para comentar` : "Comentar..."}
            className="flex-1 text-xs"
          />
          {!isHost && <button onClick={sendLike} className="p-2" aria-label="Curtir"><Heart className="w-5 h-5 text-destructive" /></button>}
          {!isHost && <button onClick={() => setShowGifts(s => !s)} className="p-2" aria-label="Presentes"><Gift className="w-5 h-5 text-secondary" /></button>}
          <button onClick={share} className="p-2" aria-label="Compartilhar"><Share2 className="w-5 h-5 text-muted-foreground" /></button>
          <Button size="icon" variant="ghost" onClick={sendComment} disabled={!commentText.trim() || wait > 0 || commentsBlocked}><Send className="w-4 h-4" /></Button>
        </div>
      </div>

      {isHost && live && (
        <Sheet open={manageOpen} onOpenChange={setManageOpen}>
          <SheetContent side="bottom" className="z-[150] max-h-[85vh] overflow-y-auto">
            <SheetHeader><SheetTitle>Gerenciar live</SheetTitle></SheetHeader>
            <ManagePanel
              live={live}
              viewers={viewers}
              banned={banned}
              onSave={updateLive}
              onBan={banUser}
              onUnban={unbanUser}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
};

const ManagePanel = ({ live, viewers, banned, onSave, onBan, onUnban }: {
  live: LiveRow; viewers: PresenceViewer[]; banned: string[];
  onSave: (p: Partial<LiveRow>) => void; onBan: (id: string, name: string) => void; onUnban: (id: string) => void;
}) => {
  const [t, setT] = useState(live.title);
  const [d, setD] = useState(live.description ?? "");
  const [h, setH] = useState(live.hashtags.join(" "));
  const [names, setNames] = useState<Record<string, string>>({});
  useEffect(() => {
    if (!banned.length) return;
    supabase.from("profiles").select("id, full_name").in("id", banned).then(({ data }) =>
      setNames(Object.fromEntries((data ?? []).map(p => [p.id, p.full_name]))));
  }, [banned]);

  return (
    <div className="space-y-5 py-4">
      <section className="space-y-2">
        <p className="text-sm font-bold text-foreground">Informações</p>
        <Input value={t} onChange={e => setT(e.target.value)} placeholder="Título" maxLength={100} />
        <Textarea value={d} onChange={e => setD(e.target.value)} placeholder="Descrição" rows={2} maxLength={500} />
        <Input value={h} onChange={e => setH(e.target.value)} placeholder="#hashtags" />
        <Button size="sm" onClick={() => { if (!t.trim()) return toast.error("Título obrigatório"); onSave({ title: t.trim(), description: d.trim(), hashtags: parseHashtags(h) }); toast.success("Live atualizada"); }}>Salvar</Button>
      </section>

      <section className="space-y-3">
        <p className="text-sm font-bold text-foreground">Comentários</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2"><MessageSquareOff className="w-4 h-4" /> Permitir comentários</span>
          <Switch checked={live.comments_enabled} onCheckedChange={v => onSave({ comments_enabled: v })} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground flex items-center gap-2"><Timer className="w-4 h-4" /> Intervalo entre comentários</span>
          <Select value={String(live.slow_mode_seconds)} onValueChange={v => onSave({ slow_mode_seconds: Number(v) })}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent className="z-[200]">
              {[0, 5, 10, 30, 60, 120].map(s => <SelectItem key={s} value={String(s)}>{s === 0 ? "Sem limite" : `${s}s`}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="space-y-2">
        <p className="text-sm font-bold text-foreground">Assistindo agora ({viewers.length})</p>
        {viewers.length === 0 && <p className="text-xs text-muted-foreground">Ninguém assistindo ainda.</p>}
        {viewers.map(v => (
          <div key={v.userId} className="flex items-center justify-between">
            <span className="text-sm text-foreground">{v.name}</span>
            <Button size="sm" variant="outline" className="gap-1 text-destructive" onClick={() => onBan(v.userId, v.name)}><Ban className="w-3.5 h-3.5" /> Banir</Button>
          </div>
        ))}
      </section>

      {banned.length > 0 && (
        <section className="space-y-2">
          <p className="text-sm font-bold text-foreground">Banidos</p>
          {banned.map(id => (
            <div key={id} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{names[id] || "Usuário"}</span>
              <Button size="sm" variant="ghost" onClick={() => onUnban(id)}>Desbanir</Button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

export default Live;
