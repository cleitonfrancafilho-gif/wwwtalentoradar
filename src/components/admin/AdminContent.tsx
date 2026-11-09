import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, RefreshCw, Trash2, Square } from "lucide-react";

type Row = Record<string, any>;

const AdminContent = () => {
  const [posts, setPosts] = useState<Row[]>([]);
  const [stories, setStories] = useState<Row[]>([]);
  const [lives, setLives] = useState<Row[]>([]);
  const [comments, setComments] = useState<Row[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, s, l, c] = await Promise.all([
      supabase.from("posts").select("id, user_id, video_url, description, created_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("stories").select("id, user_id, media_url, media_type, created_at, expires_at").order("created_at", { ascending: false }).limit(100),
      supabase.from("live_streams").select("id, host_id, title, status, started_at").order("started_at", { ascending: false }).limit(100),
      supabase.from("live_comments").select("id, user_id, user_name, content, kind, created_at").order("created_at", { ascending: false }).limit(200),
    ]);
    setPosts(p.data ?? []); setStories(s.data ?? []); setLives(l.data ?? []); setComments(c.data ?? []);
    const ids = [...new Set([...(p.data ?? []).map((r) => r.user_id), ...(s.data ?? []).map((r) => r.user_id), ...(l.data ?? []).map((r) => r.host_id)])];
    if (ids.length) {
      const { data } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      setNames(Object.fromEntries((data ?? []).map((r) => [r.id, r.full_name || "(Sem nome)"])));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const remove = async (table: "posts" | "stories" | "live_streams" | "live_comments", id: string, setter: (fn: (r: Row[]) => Row[]) => void) => {
    if (!confirm("Apagar permanentemente?")) return;
    if (table === "live_streams") {
      await supabase.from("live_comments").delete().eq("stream_id", id);
      await supabase.from("live_bans").delete().eq("stream_id", id);
    }
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error("Erro: " + error.message);
    setter((rows) => rows.filter((r) => r.id !== id));
    toast.success("Apagado");
  };

  const endLive = async (id: string) => {
    const { error } = await supabase.from("live_streams").update({ status: "ended", ended_at: new Date().toISOString() }).eq("id", id);
    if (error) return toast.error("Erro: " + error.message);
    setLives((rows) => rows.map((r) => (r.id === id ? { ...r, status: "ended" } : r)));
    toast.success("Live encerrada");
  };

  const date = (d: string) => new Date(d).toLocaleString("pt-BR");
  const empty = (list: Row[]) => list.length === 0 && <p className="text-center text-muted-foreground text-sm py-8">Nada por aqui.</p>;

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-3">
      <div className="flex justify-end"><Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-1" /> Atualizar</Button></div>
      <Tabs defaultValue="posts">
        <TabsList className="grid grid-cols-4 w-full bg-muted">
          <TabsTrigger value="posts" className="text-xs">Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="stories" className="text-xs">Stories ({stories.length})</TabsTrigger>
          <TabsTrigger value="lives" className="text-xs">Lives ({lives.length})</TabsTrigger>
          <TabsTrigger value="comments" className="text-xs">Comentários</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-2 mt-3">
          {empty(posts)}
          {posts.map((r) => (
            <div key={r.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
              <video src={r.video_url} className="w-16 h-16 rounded-md object-cover bg-muted shrink-0" muted preload="metadata" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{names[r.user_id] ?? "Usuário"}</p>
                <p className="text-xs text-muted-foreground truncate">{r.description || "(sem descrição)"}</p>
                <p className="text-[10px] text-muted-foreground">{date(r.created_at)}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove("posts", r.id, setPosts)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="stories" className="space-y-2 mt-3">
          {empty(stories)}
          {stories.map((r) => {
            const active = new Date(r.expires_at) > new Date();
            return (
              <div key={r.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
                {r.media_type === "video"
                  ? <video src={r.media_url} className="w-12 h-16 rounded-md object-cover bg-muted shrink-0" muted preload="metadata" />
                  : <img src={r.media_url} className="w-12 h-16 rounded-md object-cover bg-muted shrink-0" alt="" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{names[r.user_id] ?? "Usuário"}</p>
                  <p className="text-[10px] text-muted-foreground">{date(r.created_at)}</p>
                </div>
                <Badge className={active ? "bg-primary/20 text-primary border-0" : "bg-muted text-muted-foreground border-0"}>{active ? "Ativo" : "Expirado"}</Badge>
                <Button size="icon" variant="ghost" onClick={() => remove("stories", r.id, setStories)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            );
          })}
        </TabsContent>

        <TabsContent value="lives" className="space-y-2 mt-3">
          {empty(lives)}
          {lives.map((r) => (
            <div key={r.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{r.title}</p>
                <p className="text-xs text-muted-foreground truncate">{names[r.host_id] ?? "Usuário"} · {date(r.started_at)}</p>
              </div>
              <Badge className={r.status === "live" ? "bg-destructive/20 text-destructive border-0" : "bg-muted text-muted-foreground border-0"}>{r.status === "live" ? "AO VIVO" : "Encerrada"}</Badge>
              {r.status === "live" && <Button size="icon" variant="ghost" title="Encerrar" onClick={() => endLive(r.id)}><Square className="w-4 h-4 text-secondary" /></Button>}
              <Button size="icon" variant="ghost" onClick={() => remove("live_streams", r.id, setLives)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="comments" className="space-y-2 mt-3">
          {empty(comments)}
          {comments.map((r) => (
            <div key={r.id} className="glass-card rounded-xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground"><span className="font-semibold">{r.user_name}:</span> {r.content}</p>
                <p className="text-[10px] text-muted-foreground">Live · {date(r.created_at)}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => remove("live_comments", r.id, setComments)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminContent;
