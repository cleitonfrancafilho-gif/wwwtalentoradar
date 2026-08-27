import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Trophy, ThumbsUp, Crown, Medal, Loader2 } from "lucide-react";

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

  const getWeekStart = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff)).toISOString().split("T")[0];
  };

  const loadRanking = async () => {
    setLoading(true);
    const weekStart = getWeekStart();

    const { data: votes } = await supabase
      .from("community_votes")
      .select("athlete_id")
      .eq("week_start", weekStart);

    if (!votes || votes.length === 0) {
      // Show all athletes if no votes yet
      const { data: athletes } = await supabase
        .from("profiles")
        .select("id, full_name, sport, position, avatar_url")
        .eq("profile_type", "atleta")
        .limit(10);

      setRanking((athletes || []).map(a => ({
        athlete_id: a.id,
        full_name: a.full_name,
        sport: a.sport,
        position: a.position,
        avatar_url: a.avatar_url,
        votes: 0,
      })));
      setLoading(false);
      return;
    }

    // Count votes per athlete
    const voteCounts: Record<string, number> = {};
    votes.forEach(v => {
      voteCounts[v.athlete_id] = (voteCounts[v.athlete_id] || 0) + 1;
    });

    const athleteIds = Object.keys(voteCounts);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, sport, position, avatar_url")
      .in("id", athleteIds);

    const ranked = (profiles || [])
      .map(p => ({
        athlete_id: p.id,
        full_name: p.full_name,
        sport: p.sport,
        position: p.position,
        avatar_url: p.avatar_url,
        votes: voteCounts[p.id] || 0,
      }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 10);

    setRanking(ranked);
    setLoading(false);
  };

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
            {lang === "en" ? "Community Vote" : "Voto da Galeria"}
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

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : ranking.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            {lang === "en" ? "No athletes registered yet" : "Nenhum atleta cadastrado ainda"}
          </div>
        ) : (
          <div className="space-y-2">
            {ranking.map((athlete, index) => (
              <div key={athlete.athlete_id} className={`glass-card rounded-xl p-4 flex items-center gap-3 border ${index < 3 ? "border-primary/30" : "border-transparent"}`}>
                <div className="flex-shrink-0">{getMedal(index)}</div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {athlete.avatar_url ? (
                    <img src={athlete.avatar_url} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="font-display font-bold text-primary">{athlete.full_name?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground text-sm truncate">{athlete.full_name}</p>
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
