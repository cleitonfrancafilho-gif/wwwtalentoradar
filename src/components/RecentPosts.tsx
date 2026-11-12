import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PostItem {
  id: string;
  user_id: string;
  video_url: string;
  media_type?: string;
  description: string | null;
  tags: string[] | null;
  created_at: string;
  author?: { full_name: string; avatar_url: string | null };
}

const RecentPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostItem[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("posts").select("id, user_id, video_url, media_type, description, tags, created_at").order("created_at", { ascending: false }).limit(20);
      const rows = (data ?? []) as PostItem[];
      const ids = [...new Set(rows.map(r => r.user_id))];
      if (ids.length) {
        const { data: profs } = await supabase.from("profiles").select("id, full_name, avatar_url").in("id", ids);
        rows.forEach(r => { r.author = profs?.find(p => p.id === r.user_id); });
      }
      setPosts(rows);
    })();
  }, []);

  if (!posts.length) return null;

  return (
    <div className="space-y-3">
      <p className="text-xs font-display font-bold text-muted-foreground uppercase tracking-wider">Publicações recentes</p>
      {posts.map(p => (
        <div key={p.id} className="glass-card rounded-xl overflow-hidden border border-transparent">
          <button onClick={() => navigate(`/perfil/${p.user_id}`)} className="flex items-center gap-2 p-3 w-full text-left">
            <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-sm font-bold text-primary">
              {p.author?.avatar_url ? <img src={p.author.avatar_url} className="w-full h-full object-cover" /> : p.author?.full_name?.charAt(0) || "?"}
            </div>
            <span className="text-sm font-bold text-foreground">{p.author?.full_name || "Atleta"}</span>
            <span className="ml-auto text-[10px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</span>
          </button>
          {p.media_type === "image" ? <img src={p.video_url} alt={p.description || "Publicação"} loading="lazy" className="w-full max-h-[600px] object-cover bg-muted" /> : <video src={p.video_url} controls playsInline preload="metadata" className="w-full aspect-video bg-muted" />}
          {(p.description || p.tags?.length) && (
            <div className="p-3 text-xs space-y-1">
              {p.description && <p className="text-foreground">{p.description}</p>}
              {!!p.tags?.length && <p className="text-primary">{p.tags.join(" ")}</p>}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default RecentPosts;
