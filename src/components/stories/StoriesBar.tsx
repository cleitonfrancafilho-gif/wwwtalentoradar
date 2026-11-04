import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import StoryViewer, { Story, StorySlide } from "./StoryViewer";
import StoryCreator from "./StoryCreator";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { groupActiveStories, StoryRow } from "@/lib/stories";

interface StoriesBarProps {
  className?: string;
}

const StoriesBar = ({ className }: StoriesBarProps) => {
  const { user } = useAuth();
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [stories, setStories] = useState<Story[]>([]);
  const [viewedIds, setViewedIds] = useState<Set<number>>(new Set());

  const load = async () => {
    const { data } = await supabase
      .from("stories")
      .select("*")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });
    const rows = (data ?? []) as StoryRow[];
    const ids = [...new Set(rows.map(r => r.user_id))];
    const { data: profiles } = ids.length
      ? await supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids)
      : { data: [] as { id: string; full_name: string; avatar_url: string | null }[] };
    setStories(groupActiveStories(rows, profiles ?? [], user?.id, new Date()));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60_000); // drop stories as they hit 24h
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleView = (index: number) => {
    setViewedIds(prev => new Set([...prev, stories[index].id]));
    setViewingIndex(index);
  };

  const insertStory = async (row: { media_url: string; media_type: string; effect?: string | null; music_name?: string | null; music_artist?: string | null }) => {
    if (!user) return;
    const { error } = await supabase.from("stories").insert({ user_id: user.id, ...row });
    if (error) throw error;
    await load();
  };

  const handlePublish = async (data: { type: string; effect: string; music?: { name: string; artist: string }; file: File }) => {
    if (!user) { toast.error("Entre na sua conta para publicar"); return; }
    try {
      const ext = data.file.name.split(".").pop() || (data.file.type.startsWith("video") ? "mp4" : "jpg");
      const path = `stories/${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("videos").upload(path, data.file, { contentType: data.file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from("videos").getPublicUrl(path);
      await insertStory({
        media_url: pub.publicUrl,
        media_type: data.type,
        effect: data.effect !== "none" ? data.effect : null,
        music_name: data.music?.name ?? null,
        music_artist: data.music?.artist ?? null,
      });
      setCreating(false);
      toast.success("Story publicado! Ele some automaticamente em 24h.");
    } catch (e: any) {
      toast.error("Erro ao publicar: " + (e.message || "tente novamente"));
    }
  };

  const handleRepost = async (story: Story, slideIdx: number) => {
    const s: StorySlide = story.slides[slideIdx];
    if (!s.url) return;
    try {
      await insertStory({ media_url: s.url, media_type: s.type, effect: s.effect ?? null, music_name: s.music?.name ?? null, music_artist: s.music?.artist ?? null });
      toast.success("Story repostado no seu perfil!");
    } catch (e: any) {
      toast.error("Erro: " + e.message);
    }
  };

  return (
    <>
      <div className={`flex gap-3 overflow-x-auto px-4 py-3 scrollbar-none ${className}`}>
        <button onClick={() => setCreating(true)} className="shrink-0 flex flex-col items-center gap-1">
          <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-primary/40 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <span className="text-[10px] text-muted-foreground font-display">Criar</span>
        </button>

        {stories.map((story, i) => {
          const viewed = viewedIds.has(story.id);
          return (
            <button key={story.id} onClick={() => handleView(i)} className="shrink-0 flex flex-col items-center gap-1">
              <div className={`w-16 h-16 rounded-full p-0.5 ${viewed ? "bg-muted-foreground/30" : "bg-gradient-to-br from-primary via-secondary to-cyan"}`}>
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-lg overflow-hidden">
                  {story.userAvatar ? <img src={story.userAvatar} className="w-full h-full object-cover" /> : story.isOwn ? "📱" : "👤"}
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground font-display w-16 truncate text-center">{story.userName}</span>
            </button>
          );
        })}
      </div>

      {viewingIndex !== null && stories[viewingIndex] && (
        <StoryViewer stories={stories} initialIndex={viewingIndex} onClose={() => setViewingIndex(null)} onRepost={handleRepost} />
      )}

      {creating && <StoryCreator onClose={() => setCreating(false)} onPublish={handlePublish} />}
    </>
  );
};

export default StoriesBar;
