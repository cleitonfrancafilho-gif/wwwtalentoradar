import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { ArrowLeft, Ruler, Weight, Save, Activity, Users } from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend,
} from "recharts";

const SPORTS_POSITIONS: Record<string, string[]> = {
  "Futebol": ["Goleiro", "Zagueiro", "Lateral Direito", "Lateral Esquerdo", "Volante", "Meia Atacante", "Atacante", "Ponta"],
  "Vôlei": ["Levantador", "Líbero", "Ponteira", "Central", "Oposto"],
  "Basquete": ["Armador", "Ala", "Ala-Pivô", "Pivô"],
  "Futsal": ["Goleiro", "Fixo", "Ala", "Pivô"],
  "Handebol": ["Goleiro", "Armador", "Meia", "Ponta", "Pivô"],
};

const PRO_BENCHMARKS: Record<string, Record<string, { height: number; weight: number; bmi: number; wingspan: number }>> = {
  "Futebol": {
    Goleiro: { height: 188, weight: 82, bmi: 23.2, wingspan: 192 },
    Zagueiro: { height: 185, weight: 80, bmi: 23.4, wingspan: 188 },
    "Lateral Direito": { height: 176, weight: 72, bmi: 23.2, wingspan: 178 },
    "Lateral Esquerdo": { height: 176, weight: 72, bmi: 23.2, wingspan: 178 },
    Volante: { height: 180, weight: 76, bmi: 23.5, wingspan: 183 },
    "Meia Atacante": { height: 176, weight: 72, bmi: 23.2, wingspan: 178 },
    Atacante: { height: 178, weight: 74, bmi: 23.3, wingspan: 181 },
    Ponta: { height: 174, weight: 70, bmi: 23.1, wingspan: 176 },
  },
  "Vôlei": {
    Levantador: { height: 185, weight: 78, bmi: 22.8, wingspan: 190 },
    Líbero: { height: 175, weight: 70, bmi: 22.9, wingspan: 178 },
    Ponteira: { height: 190, weight: 82, bmi: 22.7, wingspan: 195 },
    Central: { height: 198, weight: 90, bmi: 22.9, wingspan: 205 },
    Oposto: { height: 195, weight: 88, bmi: 23.1, wingspan: 200 },
  },
  "Basquete": {
    Armador: { height: 185, weight: 80, bmi: 23.4, wingspan: 195 },
    Ala: { height: 198, weight: 95, bmi: 24.2, wingspan: 210 },
    "Ala-Pivô": { height: 203, weight: 105, bmi: 25.5, wingspan: 215 },
    Pivô: { height: 208, weight: 110, bmi: 25.4, wingspan: 220 },
  },
  "Futsal": {
    Goleiro: { height: 178, weight: 75, bmi: 23.7, wingspan: 180 },
    Fixo: { height: 175, weight: 72, bmi: 23.5, wingspan: 177 },
    Ala: { height: 173, weight: 70, bmi: 23.4, wingspan: 175 },
    Pivô: { height: 176, weight: 74, bmi: 23.9, wingspan: 178 },
  },
  "Handebol": {
    Goleiro: { height: 190, weight: 90, bmi: 24.9, wingspan: 198 },
    Armador: { height: 185, weight: 85, bmi: 24.8, wingspan: 192 },
    Meia: { height: 188, weight: 88, bmi: 24.9, wingspan: 195 },
    Ponta: { height: 180, weight: 78, bmi: 24.1, wingspan: 185 },
    Pivô: { height: 192, weight: 100, bmi: 27.1, wingspan: 200 },
  },
};

const getBmiCategory = (bmi: number, lang: string) => {
  if (bmi < 18.5) return { label: lang === "en" ? "Underweight" : "Abaixo do peso", color: "text-secondary" };
  if (bmi < 24.9) return { label: lang === "en" ? "Ideal weight" : "Peso ideal", color: "text-primary" };
  if (bmi < 29.9) return { label: lang === "en" ? "Overweight" : "Sobrepeso", color: "text-secondary" };
  return { label: lang === "en" ? "Obese" : "Obesidade", color: "text-destructive" };
};

const PhysicalProfile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const { lang } = useLanguage();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [wingspan, setWingspan] = useState("");
  const [selectedSport, setSelectedSport] = useState("Futebol");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [saving, setSaving] = useState(false);

  // Comparison state
  const [compareMode, setCompareMode] = useState(false);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [compareA, setCompareA] = useState("");
  const [compareB, setCompareB] = useState("");

  useEffect(() => {
    if (profile) {
      setHeight(profile.height_cm?.toString() || "");
      setWeight(profile.weight_kg?.toString() || "");
      setWingspan((profile as any).wingspan_cm?.toString() || "");
      if (profile.sport) setSelectedSport(profile.sport);
      if (profile.position) setSelectedPosition(profile.position);
    }
  }, [profile]);

  useEffect(() => {
    const positions = SPORTS_POSITIONS[selectedSport] || [];
    if (positions.length > 0 && !positions.includes(selectedPosition)) {
      setSelectedPosition(positions[0]);
    }
  }, [selectedSport]);

  // Load athletes for comparison
  useEffect(() => {
    if (compareMode) {
      supabase.from("profiles").select("id, full_name, sport, position, height_cm, weight_kg, wingspan_cm").limit(50)
        .then(({ data }) => setAthletes(data || []));
    }
  }, [compareMode]);

  const heightNum = parseFloat(height) || 0;
  const weightNum = parseFloat(weight) || 0;
  const wingspanNum = parseFloat(wingspan) || 0;
  const bmi = heightNum > 0 ? weightNum / ((heightNum / 100) ** 2) : 0;
  const bmiInfo = getBmiCategory(bmi, lang);

  const sportBenchmarks = PRO_BENCHMARKS[selectedSport] || {};
  const benchmark = sportBenchmarks[selectedPosition] || { height: 178, weight: 74, bmi: 23.3, wingspan: 181 };

  const radarData = heightNum > 0 ? [
    { attr: lang === "en" ? "Height" : "Altura", user: Math.min((heightNum / benchmark.height) * 100, 120), pro: 100 },
    { attr: lang === "en" ? "Weight" : "Peso", user: Math.min((weightNum / benchmark.weight) * 100, 120), pro: 100 },
    { attr: "IMC", user: Math.min((bmi / benchmark.bmi) * 100, 120), pro: 100 },
    { attr: lang === "en" ? "Wingspan" : "Envergadura", user: wingspanNum > 0 ? Math.min((wingspanNum / benchmark.wingspan) * 100, 120) : 0, pro: 100 },
    { attr: lang === "en" ? "Agility" : "Agilidade", user: 75, pro: 100 },
    { attr: lang === "en" ? "Stamina" : "Resistência", user: 80, pro: 100 },
  ] : [];

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      height_cm: heightNum || null,
      weight_kg: weightNum || null,
      wingspan_cm: wingspanNum || null,
      sport: selectedSport,
      position: selectedPosition,
    } as any).eq("id", user.id);
    setSaving(false);
    if (error) toast.error(lang === "en" ? "Error saving" : "Erro ao salvar dados físicos");
    else { toast.success(lang === "en" ? "Physical profile updated!" : "Perfil físico atualizado!"); refreshProfile(); }
  };

  const athleteA = athletes.find(a => a.id === compareA);
  const athleteB = athletes.find(a => a.id === compareB);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="font-display font-bold text-foreground text-lg">{t("Perfil Físico", lang)}</h1>
          </div>
          <Button size="sm" variant={compareMode ? "default" : "outline"} onClick={() => setCompareMode(!compareMode)}>
            <Users className="w-4 h-4 mr-1" /> {t("Comparativo", lang)}
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-slide-up">
        {!compareMode ? (
          <>
            {/* Sport & Position Selection */}
            <div className="glass-card rounded-xl p-5 border border-transparent">
              <h2 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> {lang === "en" ? "Sport & Position" : "Esporte & Posição"}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5">{lang === "en" ? "Sport" : "Esporte"}</Label>
                  <Select value={selectedSport} onValueChange={setSelectedSport}>
                    <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.keys(SPORTS_POSITIONS).map(s => (
                        <SelectItem key={s} value={s}>{t(s, lang)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5">{lang === "en" ? "Position" : "Posição"}</Label>
                  <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                    <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(SPORTS_POSITIONS[selectedSport] || []).map(p => (
                        <SelectItem key={p} value={p}>{t(p, lang)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Input Form */}
            <div className="glass-card rounded-xl p-5 border border-transparent">
              <h2 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" /> {t("Seus Dados", lang)}
              </h2>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Ruler className="w-3 h-3" /> {lang === "en" ? "Height (cm)" : "Altura (cm)"}</Label>
                  <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="178" className="bg-muted/50" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Weight className="w-3 h-3" /> {lang === "en" ? "Weight (kg)" : "Peso (kg)"}</Label>
                  <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="72" className="bg-muted/50" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1"><Ruler className="w-3 h-3" /> {lang === "en" ? "Wingspan (cm)" : "Envergadura (cm)"}</Label>
                  <Input type="number" value={wingspan} onChange={(e) => setWingspan(e.target.value)} placeholder="181" className="bg-muted/50" />
                </div>
              </div>
              <Button size="sm" className="w-full mt-4" onClick={handleSave} disabled={saving}>
                <Save className="w-4 h-4 mr-2" /> {saving ? (lang === "en" ? "Saving..." : "Salvando...") : t("Salvar Dados", lang)}
              </Button>
            </div>

            {/* BMI */}
            {bmi > 0 && (
              <div className="glass-card rounded-xl p-5 border border-transparent">
                <h2 className="font-display font-bold text-foreground mb-3">{lang === "en" ? "Body Mass Index" : "Índice de Massa Corporal"}</h2>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className={`text-4xl font-display font-bold ${bmiInfo.color}`}>{bmi.toFixed(1)}</p>
                    <p className={`text-xs font-display ${bmiInfo.color}`}>{bmiInfo.label}</p>
                  </div>
                  <div className="flex-1">
                    <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-destructive transition-all" style={{ width: `${Math.min((bmi / 35) * 100, 100)}%` }} />
                    </div>
                    <div className="flex justify-between text-[9px] text-muted-foreground mt-1"><span>18.5</span><span>24.9</span><span>29.9</span><span>35+</span></div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-xs text-muted-foreground mb-2">
                    {lang === "en" ? "Comparison with average" : "Comparação com a média de"} <span className="text-foreground font-display font-bold">{t(selectedPosition, lang)}</span> ({t(selectedSport, lang)}):
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: lang === "en" ? "Height" : "Altura", val: `${heightNum}cm`, avg: `${benchmark.height}cm` },
                      { label: lang === "en" ? "Weight" : "Peso", val: `${weightNum}kg`, avg: `${benchmark.weight}kg` },
                      { label: "IMC", val: bmi.toFixed(1), avg: benchmark.bmi.toString() },
                    ].map((m) => (
                      <div key={m.label} className="text-center">
                        <p className="text-xs text-muted-foreground">{m.label}</p>
                        <p className="text-sm font-display font-bold text-foreground">{m.val}</p>
                        <p className="text-[10px] text-muted-foreground">{lang === "en" ? "Avg" : "Média"}: {m.avg}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Radar Chart */}
            {radarData.length > 0 && (
              <div className="glass-card rounded-xl p-5 border border-transparent">
                <h2 className="font-display font-bold text-foreground mb-3">{t("Gráfico de Atributos", lang)}</h2>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                      <PolarGrid stroke="hsl(0 0% 20%)" />
                      <PolarAngleAxis dataKey="attr" tick={{ fill: "hsl(0 0% 60%)", fontSize: 11, fontFamily: "Rajdhani" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 120]} tick={false} axisLine={false} />
                      <Radar name={lang === "en" ? "You" : "Você"} dataKey="user" stroke="hsl(110 100% 55%)" fill="hsl(110 100% 55%)" fillOpacity={0.2} strokeWidth={2} />
                      <Radar name={lang === "en" ? "Pro Average" : "Pro Médio"} dataKey="pro" stroke="hsl(187 100% 50%)" fill="hsl(187 100% 50%)" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
                      <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Rajdhani" }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Comparison Mode */
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-5 border border-primary/20">
              <h2 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" /> {lang === "en" ? "Compare Athletes" : "Comparar Atletas"}
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5">{lang === "en" ? "Athlete A" : "Atleta A"}</Label>
                  <Select value={compareA} onValueChange={setCompareA}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder={lang === "en" ? "Select..." : "Selecione..."} /></SelectTrigger>
                    <SelectContent>
                      {athletes.map(a => <SelectItem key={a.id} value={a.id}>{a.full_name} ({a.position || "—"})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5">{lang === "en" ? "Athlete B" : "Atleta B"}</Label>
                  <Select value={compareB} onValueChange={setCompareB}>
                    <SelectTrigger className="bg-muted/50"><SelectValue placeholder={lang === "en" ? "Select..." : "Selecione..."} /></SelectTrigger>
                    <SelectContent>
                      {athletes.filter(a => a.id !== compareA).map(a => <SelectItem key={a.id} value={a.id}>{a.full_name} ({a.position || "—"})</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {athleteA && athleteB && (
              <div className="glass-card rounded-xl p-5 border border-transparent">
                <h3 className="font-display font-bold text-foreground mb-4 text-center">
                  {athleteA.full_name} <span className="text-primary">vs</span> {athleteB.full_name}
                </h3>
                <div className="divide-y divide-border/30">
                  {[
                    { label: lang === "en" ? "Sport" : "Esporte", a: athleteA.sport || "—", b: athleteB.sport || "—" },
                    { label: lang === "en" ? "Position" : "Posição", a: athleteA.position || "—", b: athleteB.position || "—" },
                    { label: lang === "en" ? "Height" : "Altura", a: athleteA.height_cm ? `${athleteA.height_cm}cm` : "—", b: athleteB.height_cm ? `${athleteB.height_cm}cm` : "—" },
                    { label: lang === "en" ? "Weight" : "Peso", a: athleteA.weight_kg ? `${athleteA.weight_kg}kg` : "—", b: athleteB.weight_kg ? `${athleteB.weight_kg}kg` : "—" },
                    { label: lang === "en" ? "Wingspan" : "Envergadura", a: athleteA.wingspan_cm ? `${athleteA.wingspan_cm}cm` : "—", b: athleteB.wingspan_cm ? `${athleteB.wingspan_cm}cm` : "—" },
                    { label: "IMC", a: athleteA.height_cm && athleteA.weight_kg ? (athleteA.weight_kg / ((athleteA.height_cm / 100) ** 2)).toFixed(1) : "—", b: athleteB.height_cm && athleteB.weight_kg ? (athleteB.weight_kg / ((athleteB.height_cm / 100) ** 2)).toFixed(1) : "—" },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between py-3">
                      <span className="text-sm font-display font-bold text-primary w-20">{row.a}</span>
                      <span className="text-xs text-muted-foreground font-display">{row.label}</span>
                      <span className="text-sm font-display font-bold text-secondary w-20 text-right">{row.b}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default PhysicalProfile;
