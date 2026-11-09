import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Search, Trophy, ThumbsUp, Crown, Medal, Loader2 } from "lucide-react";

interface RankedAthlete {
  athlete_id: string;
  full_name: string;
  sport: string | null;
  position: string | null;
  avatar_url: string | null;
  votes: number;
}

const CommunityVote = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [ranking, setRanking] = useState<RankedAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sportFilter, setSportFilter] = useState("todos");
  const [allAthletes, setAllAthletes] = useState<RankedAthlete[]>([]);

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
  };

  const loadRanking = async () => {
    setLoading(true);
    const weekStart = getWeekStart();
    const [{ data: votes }, { data: athletes }] = await Promise.all([
      supabase.from("community_votes").select("athlete_id").eq("week_start", weekStart),
      supabase.from("profiles").select("id, full_name, sport, position, avatar_url").eq("profile_type", "atleta").eq("banned", false),
    ]);
    const voteCounts: Record<string, number> = {};
    (votes || []).forEach(v => { voteCounts[v.athlete_id] = (voteCounts[v.athlete_id] || 0) + 1; });
    const list = (athletes || []).map(a => ({
      athlete_id: a.id, full_name: a.full_name, sport: a.sport, position: a.position, avatar_url: a.avatar_url, votes: voteCounts[a.id] || 0,
    })).sort((a, b) => b.votes - a.votes);
    setAllAthletes(list);
    setRanking(list.slice(0, 10));
    setLoading(false);
  };

  const BASE_SPORTS = ["Futebol", "Basquete", "Vôlei", "Futsal", "Handebol", "Tênis", "Atletismo", "Natação", "Beach Tennis", "Lutas"];
  const sports = [...new Set([...BASE_SPORTS, ...(allAthletes.map(a => a.sport).filter(Boolean) as string[])])];
  const q = search.trim().toLowerCase();
  const bySport = allAthletes.filter(a => sportFilter === "todos" || a.sport === sportFilter);
  const shown = q ? bySport.filter(a => a.full_name?.toLowerCase().includes(q)) : bySport.slice(0, 10);

  useEffect(() => { loadRanking(); }, []);

  const handleVote = async (athleteId: string) => {
    if (!user) return;
    setVoting(athleteId);
    const weekStart = getWeekStart();

    const { error } = await supabase.from("community_votes").insert({
      voter_id: user.id,
      athlete_id: athleteId,
      week_start: weekStart,
    });

    if (error) {
      if (error.code === "23505") toast.info(lang === "en" ? "Already voted this week" : "Já votou esta semana");
      else toast.error("Erro: " + error.message);
    } else {
      toast.success("🗳️ " + (lang === "en" ? "Vote registered!" : "Voto registrado!"));
      loadRanking();
    }
    setVoting(null);
  };

  const getMedal = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-yellow-400" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-300" />;
    if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
    return <span className="w-5 h-5 flex items-center justify-center text-xs font-bold text-muted-foreground">{index + 1}</span>;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Trophy className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg text-foreground">
            {lang === "en" ? "Community Vote" : "Voto da Galera"}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        <div className="glass-card rounded-xl p-4 border border-primary/20 text-center">
          <h2 className="font-display font-bold text-foreground">
            🏆 Top 10 {lang === "en" ? "Weekly" : "Semanal"}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {lang === "en" ? "Vote for your favorite athlete of the week" : "Vote no seu atleta favorito da semana"}
          </p>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={lang === "en" ? "Search athlete..." : "Buscar atleta..."} className="pl-9" />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {["todos", ...sports].map(sp => (
            <Button key={sp} size="sm" variant={sportFilter === sp ? "default" : "outline"} onClick={() => setSportFilter(sp)} className="shrink-0 text-xs h-8">
              {sp === "todos" ? (lang === "en" ? "All" : "Todos") : sp}
            </Button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : shown.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {lang === "en" ? "No athletes found" : "Nenhum atleta encontrado"}
          </div>
        ) : (
          <div className="space-y-2">
            {shown.map((athlete, index) => (
              <div key={athlete.athlete_id} className={`glass-card rounded-xl p-4 flex items-center gap-3 border ${index < 3 ? "border-primary/30" : "border-transparent"}`}>
                <div className="flex-shrink-0">{getMedal(index)}</div>
                <button onClick={() => navigate(`/perfil/${athlete.athlete_id}`)} className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {athlete.avatar_url ? (
                    <img src={athlete.avatar_url} alt={athlete.full_name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="font-display font-bold text-primary">{athlete.full_name?.charAt(0)}</span>
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <button onClick={() => navigate(`/perfil/${athlete.athlete_id}`)} className="font-display font-bold text-foreground text-sm truncate hover:underline hover:text-primary block max-w-full text-left">{athlete.full_name}</button>
                  <div className="flex items-center gap-1">
                    <Badge className="bg-primary/20 text-primary border-0 text-[10px]">{athlete.sport || "—"}</Badge>
                    <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">{athlete.position || "—"}</Badge>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-foreground">{athlete.votes}</p>
                  <p className="text-[10px] text-muted-foreground">{lang === "en" ? "votes" : "votos"}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleVote(athlete.athlete_id)}
                  disabled={voting === athlete.athlete_id}
                  className="flex-shrink-0"
                >
                  {voting === athlete.athlete_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ThumbsUp className="w-4 h-4" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default CommunityVote;
