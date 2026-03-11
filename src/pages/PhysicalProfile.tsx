import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import {
  ArrowLeft, Ruler, Weight, Save, Activity,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend,
} from "recharts";

const PRO_BENCHMARKS: Record<string, { height: number; weight: number; bmi: number; wingspan: number }> = {
  Goleiro: { height: 188, weight: 82, bmi: 23.2, wingspan: 192 },
  Zagueiro: { height: 185, weight: 80, bmi: 23.4, wingspan: 188 },
  "Lateral Direito": { height: 176, weight: 72, bmi: 23.2, wingspan: 178 },
  "Lateral Esquerdo": { height: 176, weight: 72, bmi: 23.2, wingspan: 178 },
  Volante: { height: 180, weight: 76, bmi: 23.5, wingspan: 183 },
  "Meia Atacante": { height: 176, weight: 72, bmi: 23.2, wingspan: 178 },
  Atacante: { height: 178, weight: 74, bmi: 23.3, wingspan: 181 },
  Ponta: { height: 174, weight: 70, bmi: 23.1, wingspan: 176 },
};

const getBmiCategory = (bmi: number) => {
  if (bmi < 18.5) return { label: "Abaixo do peso", color: "text-secondary" };
  if (bmi < 24.9) return { label: "Peso ideal", color: "text-primary" };
  if (bmi < 29.9) return { label: "Sobrepeso", color: "text-secondary" };
  return { label: "Obesidade", color: "text-destructive" };
};

const PhysicalProfile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [wingspan, setWingspan] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setHeight(profile.height_cm?.toString() || "");
      setWeight(profile.weight_kg?.toString() || "");
      setWingspan((profile as any).wingspan_cm?.toString() || "");
    }
  }, [profile]);

  const heightNum = parseFloat(height) || 0;
  const weightNum = parseFloat(weight) || 0;
  const wingspanNum = parseFloat(wingspan) || 0;
  const bmi = heightNum > 0 ? weightNum / ((heightNum / 100) ** 2) : 0;
  const bmiInfo = getBmiCategory(bmi);

  const position = profile?.position || "Atacante";
  const benchmark = PRO_BENCHMARKS[position] || PRO_BENCHMARKS["Atacante"];

  const radarData = heightNum > 0 ? [
    { attr: "Altura", user: Math.min((heightNum / benchmark.height) * 100, 120), pro: 100 },
    { attr: "Peso", user: Math.min((weightNum / benchmark.weight) * 100, 120), pro: 100 },
    { attr: "IMC", user: Math.min((bmi / benchmark.bmi) * 100, 120), pro: 100 },
    { attr: "Envergadura", user: wingspanNum > 0 ? Math.min((wingspanNum / benchmark.wingspan) * 100, 120) : 0, pro: 100 },
    { attr: "Agilidade", user: 75, pro: 100 },
    { attr: "Resistência", user: 80, pro: 100 },
  ] : [];

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      height_cm: heightNum || null,
      weight_kg: weightNum || null,
      wingspan_cm: wingspanNum || null,
    } as any).eq("id", user.id);
    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar dados físicos");
    } else {
      toast.success("Perfil físico atualizado!");
      refreshProfile();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-foreground text-lg">Perfil Físico</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-slide-up">
        {/* Input Form */}
        <div className="glass-card rounded-xl p-5 border border-transparent">
          <h2 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Seus Dados
          </h2>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                <Ruler className="w-3 h-3" /> Altura (cm)
              </Label>
              <Input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="178" className="bg-muted/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                <Weight className="w-3 h-3" /> Peso (kg)
              </Label>
              <Input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="72" className="bg-muted/50" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                <Ruler className="w-3 h-3" /> Envergadura (cm)
              </Label>
              <Input type="number" value={wingspan} onChange={(e) => setWingspan(e.target.value)} placeholder="181" className="bg-muted/50" />
            </div>
          </div>
          <Button size="sm" className="w-full mt-4" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? "Salvando..." : "Salvar Dados"}
          </Button>
        </div>

        {/* BMI Result */}
        {bmi > 0 && (
          <div className="glass-card rounded-xl p-5 border border-transparent">
            <h2 className="font-display font-bold text-foreground mb-3">Índice de Massa Corporal</h2>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className={`text-4xl font-display font-bold ${bmiInfo.color}`}>{bmi.toFixed(1)}</p>
                <p className={`text-xs font-display ${bmiInfo.color}`}>{bmiInfo.label}</p>
              </div>
              <div className="flex-1">
                <div className="w-full h-3 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-secondary via-primary to-destructive transition-all"
                    style={{ width: `${Math.min((bmi / 35) * 100, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                  <span>18.5</span><span>24.9</span><span>29.9</span><span>35+</span>
                </div>
              </div>
            </div>

            {/* Comparison */}
            <div className="mt-4 pt-4 border-t border-border/50">
              <p className="text-xs text-muted-foreground mb-2">
                Comparação com a média de <span className="text-foreground font-display font-bold">{position}</span> profissional:
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Altura</p>
                  <p className="text-sm font-display font-bold text-foreground">{heightNum}cm</p>
                  <p className="text-[10px] text-muted-foreground">Média: {benchmark.height}cm</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Peso</p>
                  <p className="text-sm font-display font-bold text-foreground">{weightNum}kg</p>
                  <p className="text-[10px] text-muted-foreground">Média: {benchmark.weight}kg</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">IMC</p>
                  <p className="text-sm font-display font-bold text-foreground">{bmi.toFixed(1)}</p>
                  <p className="text-[10px] text-muted-foreground">Média: {benchmark.bmi}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Radar Chart */}
        {radarData.length > 0 && (
          <div className="glass-card rounded-xl p-5 border border-transparent">
            <h2 className="font-display font-bold text-foreground mb-3">Gráfico de Atributos</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="75%">
                  <PolarGrid stroke="hsl(0 0% 20%)" />
                  <PolarAngleAxis dataKey="attr" tick={{ fill: "hsl(0 0% 60%)", fontSize: 11, fontFamily: "Rajdhani" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 120]} tick={false} axisLine={false} />
                  <Radar name="Você" dataKey="user" stroke="hsl(110 100% 55%)" fill="hsl(110 100% 55%)" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="Pro Médio" dataKey="pro" stroke="hsl(187 100% 50%)" fill="hsl(187 100% 50%)" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
                  <Legend wrapperStyle={{ fontSize: 11, fontFamily: "Rajdhani" }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              * Agilidade e Resistência são estimativas baseadas no biotipo. Complete avaliações físicas para dados precisos.
            </p>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default PhysicalProfile;
