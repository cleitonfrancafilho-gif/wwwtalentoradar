import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Users, Plus, TrendingDown, TrendingUp, AlertTriangle, Loader2, Save, Search } from "lucide-react";

interface ManagedAthlete {
  id: string;
  full_name: string;
  sport: string | null;
  position: string | null;
  avatar_url: string | null;
  monthlyScores: { month: string; score: number }[];
  declining: boolean;
}

const BaseManagement = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { lang } = useLanguage();
  const [athletes, setAthletes] = useState<ManagedAthlete[]>([]);
  const [loading, setLoading] = useState(true);
  const [addDialog, setAddDialog] = useState(false);
  const [scoreDialog, setScoreDialog] = useState<ManagedAthlete | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<{ id: string; full_name: string; sport: string | null }[]>([]);
  const [newScore, setNewScore] = useState("7");
  const [saving, setSaving] = useState(false);

  const isClub = profile?.profile_type === "instituicao";

  // Load managed athletes from favorites (used as "managed" relationship)
  const loadAthletes = async () => {
    if (!user) return;
    setLoading(true);

    const { data: favs } = await supabase.from("favorites").select("athlete_id").eq("user_id", user.id);
    if (!favs || favs.length === 0) { setAthletes([]); setLoading(false); return; }

    const athleteIds = favs.map(f => f.athlete_id);
    const { data: profiles } = await supabase.from("profiles").select("id, full_name, sport, position, avatar_url").in("id", athleteIds);

    // Load evaluations for monthly scores
    const enriched: ManagedAthlete[] = await Promise.all(
      (profiles || []).map(async (p) => {
        const { data: evals } = await supabase
          .from("athlete_evaluations")
          .select("created_at, speed, strength, stamina, tactics, technique, dribble")
          .eq("athlete_id", p.id)
          .order("created_at", { ascending: true });

        const monthlyScores: { month: string; score: number }[] = [];
        (evals || []).forEach(ev => {
          const month = new Date(ev.created_at).toLocaleDateString(lang === "en" ? "en-US" : "pt-BR", { month: "short", year: "2-digit" });
          const avg = [ev.speed, ev.strength, ev.stamina, ev.tactics, ev.technique, ev.dribble]
            .filter(v => v !== null)
            .reduce((a, b) => a + (b || 0), 0) / 6;
          monthlyScores.push({ month, score: Math.round(avg * 10) / 10 });
        });

        // Check declining: last 2 scores decreasing
        const declining = monthlyScores.length >= 2 &&
          monthlyScores[monthlyScores.length - 1].score < monthlyScores[monthlyScores.length - 2].score &&
          (monthlyScores.length >= 3
            ? monthlyScores[monthlyScores.length - 2].score < monthlyScores[monthlyScores.length - 3].score
            : true);

        return { ...p, monthlyScores, declining };
      })
    );

    setAthletes(enriched);
    setLoading(false);
  };

  useEffect(() => { loadAthletes(); }, [user]);

  const searchAthletesToAdd = async (q: string) => {
    if (q.length < 2) { setSearchResults([]); return; }
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, sport")
      .eq("profile_type", "atleta")
      .ilike("full_name", `%${q}%`)
      .limit(8);
    setSearchResults(data || []);
  };

  const addAthlete = async (athleteId: string) => {
    if (!user) return;
    const { error } = await supabase.from("favorites").insert({ user_id: user.id, athlete_id: athleteId });
    if (error && error.code === "23505") toast.info(lang === "en" ? "Already in your base" : "Já está na sua base");
    else if (!error) {
      toast.success(lang === "en" ? "Athlete added!" : "Atleta adicionado!");
      setAddDialog(false);
      setSearchQuery("");
      loadAthletes();
    }
  };

  const saveMonthlyScore = async () => {
    if (!user || !scoreDialog) return;
    setSaving(true);
    const score = parseFloat(newScore);

    const { error } = await supabase.from("athlete_evaluations").insert({
      evaluator_id: user.id,
      athlete_id: scoreDialog.id,
      speed: score,
      strength: score,
      stamina: score,
      tactics: score,
      technique: score,
      dribble: score,
      notes: `Monthly score: ${score}`,
    });

    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success(lang === "en" ? "Score saved!" : "Nota salva!");
      setScoreDialog(null);
      loadAthletes();
    }
    setSaving(false);
  };

  if (!isClub) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{lang === "en" ? "Only clubs can access this" : "Apenas clubes podem acessar"}</p>
          <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> {lang === "en" ? "Back" : "Voltar"}
          </Button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Users className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">
              {lang === "en" ? "Base Management" : "Gestão de Base"}
            </span>
          </div>
          <Button size="sm" onClick={() => setAddDialog(true)}>
            <Plus className="w-4 h-4 mr-1" /> {lang === "en" ? "Add" : "Adicionar"}
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {/* Decline alerts */}
        {athletes.filter(a => a.declining).length > 0 && (
          <div className="glass-card rounded-xl p-4 border border-destructive/30 bg-destructive/5">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="font-display font-bold text-destructive text-sm">
                {lang === "en" ? "Performance Alert" : "Alerta de Rendimento"}
              </span>
            </div>
            {athletes.filter(a => a.declining).map(a => (
              <p key={a.id} className="text-xs text-muted-foreground ml-7">
                ⚠️ <strong>{a.full_name}</strong> — {lang === "en" ? "declining for 2+ months" : "queda por 2+ meses"}
              </p>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : athletes.length === 0 ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">{lang === "en" ? "No athletes in your base" : "Nenhum atleta na sua base"}</p>
          </div>
        ) : (
          athletes.map(athlete => (
            <div key={athlete.id} className={`glass-card rounded-xl p-4 border ${athlete.declining ? "border-destructive/30" : "border-transparent"}`}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  {athlete.avatar_url ? (
                    <img src={athlete.avatar_url} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="font-display font-bold text-primary">{athlete.full_name?.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-foreground text-sm truncate">{athlete.full_name}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Badge className="bg-primary/20 text-primary border-0 text-[10px]">{athlete.sport || "—"}</Badge>
                    <Badge className="bg-muted text-muted-foreground border-0 text-[10px]">{athlete.position || "—"}</Badge>
                    {athlete.declining && (
                      <Badge className="bg-destructive/20 text-destructive border-0 text-[10px] flex items-center gap-0.5">
                        <TrendingDown className="w-3 h-3" /> {lang === "en" ? "Declining" : "Em queda"}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setScoreDialog(athlete); setNewScore("7"); }}>
                  {lang === "en" ? "Score" : "Nota"}
                </Button>
              </div>

              {/* Mini evolution chart */}
              {athlete.monthlyScores.length > 0 && (
                <div className="mt-3 flex items-end gap-1 h-12">
                  {athlete.monthlyScores.slice(-6).map((ms, i) => (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-full rounded-t ${ms.score >= 7 ? "bg-primary/60" : ms.score >= 4 ? "bg-secondary/60" : "bg-destructive/60"}`}
                        style={{ height: `${(ms.score / 10) * 100}%` }}
                      />
                      <span className="text-[8px] text-muted-foreground mt-0.5">{ms.month}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </main>

      {/* Add Athlete Dialog */}
      <Dialog open={addDialog} onOpenChange={setAddDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">{lang === "en" ? "Add Athlete" : "Adicionar Atleta"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={lang === "en" ? "Search by name..." : "Buscar por nome..."}
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); searchAthletesToAdd(e.target.value); }}
                className="pl-10 bg-muted border-border"
              />
            </div>
            {searchResults.map(r => (
              <button key={r.id} onClick={() => addAthlete(r.id)} className="w-full glass-card rounded-lg p-3 flex items-center gap-3 text-left hover:border-primary/20 border border-transparent">
                <span className="font-display font-bold text-primary text-sm">{r.full_name?.charAt(0)}</span>
                <div>
                  <p className="text-sm font-bold text-foreground">{r.full_name}</p>
                  <p className="text-xs text-muted-foreground">{r.sport}</p>
                </div>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Score Dialog */}
      <Dialog open={!!scoreDialog} onOpenChange={() => setScoreDialog(null)}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">
              {lang === "en" ? "Monthly Score" : "Nota Mensal"} — {scoreDialog?.full_name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground">{lang === "en" ? "Score (1-10)" : "Nota (1-10)"}</Label>
            <Input type="number" min="1" max="10" value={newScore} onChange={e => setNewScore(e.target.value)} className="bg-muted border-border" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setScoreDialog(null)}>{lang === "en" ? "Cancel" : "Cancelar"}</Button>
            <Button onClick={saveMonthlyScore} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {lang === "en" ? "Save" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default BaseManagement;
