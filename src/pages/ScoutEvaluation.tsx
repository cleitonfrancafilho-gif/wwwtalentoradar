import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, ClipboardList, Search, Loader2, Save, Star } from "lucide-react";

interface AthleteOption {
  id: string;
  full_name: string;
  sport: string | null;
  position: string | null;
}

const attributes = [
  { key: "dribble", label: { pt: "Drible", en: "Dribble" }, emoji: "⚡" },
  { key: "technique", label: { pt: "Finalização", en: "Finishing" }, emoji: "🎯" },
  { key: "speed", label: { pt: "Velocidade", en: "Speed" }, emoji: "💨" },
  { key: "strength", label: { pt: "Força", en: "Strength" }, emoji: "💪" },
  { key: "stamina", label: { pt: "Resistência", en: "Stamina" }, emoji: "🫁" },
  { key: "tactics", label: { pt: "Tática", en: "Tactics" }, emoji: "🧠" },
];

const ScoutEvaluation = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { lang } = useLanguage();
  const [athletes, setAthletes] = useState<AthleteOption[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteOption | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({
    dribble: 5, technique: 5, speed: 5, strength: 5, stamina: 5, tactics: 5,
  });
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const isScout = profile?.profile_type === "olheiro" || profile?.profile_type === "instituicao";

  const searchAthletes = async (q: string) => {
    if (q.length < 2) { setAthletes([]); return; }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, sport, position")
      .eq("profile_type", "atleta")
      .ilike("full_name", `%${q}%`)
      .limit(10);
    setAthletes(data || []);
    setLoading(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => searchAthletes(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSave = async () => {
    if (!user || !selectedAthlete) return;
    setSaving(true);

    const { error } = await supabase.from("athlete_evaluations").insert({
      evaluator_id: user.id,
      athlete_id: selectedAthlete.id,
      dribble: scores.dribble,
      technique: scores.technique,
      speed: scores.speed,
      strength: scores.strength,
      stamina: scores.stamina,
      tactics: scores.tactics,
      notes: notes || null,
    });

    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success(lang === "en" ? "Evaluation saved!" : "Avaliação salva!");
      // Notify athlete
      await supabase.from("notifications").insert({
        user_id: selectedAthlete.id,
        type: "evaluation",
        title: lang === "en" ? "📋 New Evaluation" : "📋 Nova Avaliação",
        body: lang === "en"
          ? `A scout evaluated your profile!`
          : `Um olheiro avaliou seu perfil!`,
        action_url: `/perfil/${selectedAthlete.id}`,
      });
      setSelectedAthlete(null);
      setSearchQuery("");
      setScores({ dribble: 5, technique: 5, speed: 5, strength: 5, stamina: 5, tactics: 5 });
      setNotes("");
    }
    setSaving(false);
  };

  if (!isScout) {
    return (
      <div className="min-h-screen bg-background pb-20 flex items-center justify-center">
        <div className="text-center">
          <ClipboardList className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{lang === "en" ? "Only scouts can access this tool" : "Apenas olheiros podem acessar esta ferramenta"}</p>
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
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <ClipboardList className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg text-foreground">
            {lang === "en" ? "Scout Evaluation" : "Avaliação Técnica"}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {/* Search athlete */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={lang === "en" ? "Search athlete by name..." : "Buscar atleta por nome..."}
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedAthlete(null); }}
            className="pl-10 bg-muted border-border"
          />
          {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-primary" />}
        </div>

        {/* Search results */}
        {!selectedAthlete && athletes.length > 0 && (
          <div className="space-y-1">
            {athletes.map(a => (
              <button
                key={a.id}
                onClick={() => { setSelectedAthlete(a); setAthletes([]); }}
                className="w-full glass-card rounded-lg p-3 flex items-center gap-3 text-left hover:border-primary/20 transition-colors border border-transparent"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-display font-bold text-primary text-sm">{a.full_name?.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{a.full_name}</p>
                  <p className="text-xs text-muted-foreground">{a.sport} • {a.position}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Evaluation form */}
        {selectedAthlete && (
          <div className="space-y-4 animate-slide-up">
            <div className="glass-card rounded-xl p-4 border border-primary/20">
              <p className="font-display font-bold text-foreground">{selectedAthlete.full_name}</p>
              <div className="flex gap-1 mt-1">
                <Badge className="bg-primary/20 text-primary border-0 text-xs">{selectedAthlete.sport}</Badge>
                <Badge className="bg-muted text-muted-foreground border-0 text-xs">{selectedAthlete.position}</Badge>
              </div>
            </div>

            {attributes.map(attr => (
              <div key={attr.key} className="glass-card rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-foreground">
                    {attr.emoji} {attr.label[lang as "pt" | "en"]}
                  </Label>
                  <Badge className={`border-0 text-xs ${
                    scores[attr.key] >= 8 ? "bg-primary/20 text-primary" :
                    scores[attr.key] >= 5 ? "bg-secondary/20 text-secondary" :
                    "bg-destructive/20 text-destructive"
                  }`}>
                    {scores[attr.key]}/10
                  </Badge>
                </div>
                <Slider
                  value={[scores[attr.key]]}
                  onValueChange={([v]) => setScores(prev => ({ ...prev, [attr.key]: v }))}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}

            <div>
              <Label className="text-xs text-muted-foreground">{lang === "en" ? "Notes (optional)" : "Observações (opcional)"}</Label>
              <Input
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder={lang === "en" ? "Additional notes..." : "Notas adicionais..."}
                className="bg-muted border-border mt-1"
              />
            </div>

            <div className="flex items-center justify-between glass-card rounded-xl p-4 border border-primary/10">
              <div>
                <p className="text-sm font-bold text-foreground">{lang === "en" ? "Overall" : "Geral"}</p>
                <p className="text-xs text-muted-foreground">{lang === "en" ? "Average score" : "Nota média"}</p>
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400" />
                <span className="font-display text-2xl font-bold text-foreground">
                  {(Object.values(scores).reduce((a, b) => a + b, 0) / 6).toFixed(1)}
                </span>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              {lang === "en" ? "Save Evaluation" : "Salvar Avaliação"}
            </Button>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default ScoutEvaluation;
