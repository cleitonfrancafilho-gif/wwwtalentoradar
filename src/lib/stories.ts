import type { Story } from "@/components/stories/StoryViewer";

export const STORY_LIFETIME_MS = 24 * 60 * 60 * 1000;

export interface StoryRow {
  id: string;
  user_id: string;
  media_url: string;
  media_type: string;
  effect: string | null;
  music_name: string | null;
  music_artist: string | null;
  created_at: string;
  expires_at: string;
}

export const isStoryActive = (row: Pick<StoryRow, "created_at">, now: Date) =>
  now.getTime() - new Date(row.created_at).getTime() < STORY_LIFETIME_MS;

const timeAgo = (iso: string, now: Date) => {
  const mins = Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "Agora";
  if (mins < 60) return `${mins}min`;
  return `${Math.floor(mins / 60)}h`;
};

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

/** Groups active (<24h) stories per user; own stories first. */
export const groupActiveStories = (
  rows: StoryRow[],
  profiles: { id: string; full_name: string; avatar_url: string | null }[],
  currentUserId: string | undefined,
  now: Date,
): Story[] => {
  const byUser = new Map<string, StoryRow[]>();
  rows.filter(r => isStoryActive(r, now)).forEach(r => {
    byUser.set(r.user_id, [...(byUser.get(r.user_id) ?? []), r]);
  });
  const result: Story[] = [...byUser.entries()].map(([uid, list]) => {
    const sorted = [...list].sort((a, b) => a.created_at.localeCompare(b.created_at));
    const p = profiles.find(x => x.id === uid);
    const own = uid === currentUserId;
    return {
      id: hash(uid),
      userId: hash(uid),
      userName: own ? "Seu Story" : p?.full_name || "Atleta",
      userAvatar: p?.avatar_url || undefined,
      isOwn: own,
      time: timeAgo(sorted[sorted.length - 1].created_at, now),
      slides: sorted.map(r => ({
        id: hash(r.id),
        type: (["photo", "video", "boomerang", "live_photo"].includes(r.media_type) ? r.media_type : "photo") as Story["slides"][number]["type"],
        url: r.media_url,
        duration: r.media_type === "video" ? 15 : r.media_type === "boomerang" ? 3 : 5,
        likes: 0,
        comments: [],
        liked: false,
        effect: r.effect || undefined,
        music: r.music_name ? { name: r.music_name, artist: r.music_artist || "" } : undefined,
      })),
    };
  });
  return result.sort((a, b) => Number(!!b.isOwn) - Number(!!a.isOwn));
};
