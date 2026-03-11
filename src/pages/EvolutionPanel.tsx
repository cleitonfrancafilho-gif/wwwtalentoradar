import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import {
  ArrowLeft, Flame, Upload, Calendar, Trophy, Newspaper, Clock, MapPin, ChevronRight, CheckCircle2, Circle,
} from "lucide-react";

const weeklyChallenge = {
  title: "Desafio: 50 Embaixadinhas",
  description: "Grave um vídeo fazendo 50 embaixadinhas sem deixar a bola cair. Use diferentes partes do corpo para ganhar pontos extras!",
  difficulty: "Intermediário",
  xp: 200,
  deadline: "Domingo, 23:59",
};

const newsItems = [
  { id: 1, title: "Peneira Sub-17 no CT do Palmeiras", summary: "Inscrições abertas até 15/03 para atletas nascidos em 2009. Vagas limitadas.", date: "08 Mar", image: "⚽", category: "Peneira" },
  { id: 2, title: "Copa São Paulo abre fase de seletivas", summary: "Clubes da série A iniciam busca por jovens talentos para a Copinha 2027.", date: "07 Mar", image: "🏆", category: "Torneio" },
  { id: 3, title: "Novo programa de bolsas para atletas", summary: "Instituições esportivas anunciam bolsas integrais para jovens de baixa renda.", date: "06 Mar", image: "🎓", category: "Mercado" },
  { id: 4, title: "Santos FC busca atacantes Sub-15", summary: "Peneira exclusiva na Vila Belmiro com avaliação técnica e física completa.", date: "05 Mar", image: "⚽", category: "Peneira" },
];

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

const EvolutionPanel = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [checkedDays, setCheckedDays] = useState<Set<string>>(new Set());
  const [currentMonth] = useState(new Date());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (!user) return;
    const fetchCheckins = async () => {
      const { data } = await supabase
        .from("training_checkins")
        .select("check_date")
        .eq("user_id", user.id);
      if (data) {
        setCheckedDays(new Set(data.map((d: any) => d.check_date)));
      }
    };
    fetchCheckins();
  }, [user]);

  useEffect(() => {
    // Calculate streak
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (checkedDays.has(key)) count++;
      else break;
    }
    setStreak(count);
  }, [checkedDays]);

  const toggleDay = async (dateStr: string) => {
    if (!user) return;
    const newSet = new Set(checkedDays);
    if (newSet.has(dateStr)) {
      newSet.delete(dateStr);
      await supabase.from("training_checkins").delete().eq("user_id", user.id).eq("check_date", dateStr);
    } else {
      newSet.add(dateStr);
      await supabase.from("training_checkins").insert({ user_id: user.id, check_date: dateStr });
    }
    setCheckedDays(newSet);
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const monthName = currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  const getCategoryColor = (cat: string) => {
    if (cat === "Peneira") return "bg-primary/15 text-primary border-0";
    if (cat === "Torneio") return "bg-secondary/15 text-secondary border-0";
    return "bg-cyan/15 text-cyan border-0";
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-foreground text-lg">Painel de Evolução</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-slide-up">
        {/* Weekly Challenge */}
        <div className="glass-card rounded-xl p-5 border border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-primary text-sm uppercase tracking-wider">Desafio da Semana</span>
            <Badge className="bg-secondary/15 text-secondary border-0 text-[10px] ml-auto">{weeklyChallenge.xp} XP</Badge>
          </div>
          <h2 className="text-xl font-display font-bold text-foreground mb-2">{weeklyChallenge.title}</h2>
          <p className="text-sm text-muted-foreground mb-4">{weeklyChallenge.description}</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Flame className="w-3.5 h-3.5 text-secondary" />
              {weeklyChallenge.difficulty}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              Até {weeklyChallenge.deadline}
            </div>
          </div>
          <Button size="sm" onClick={() => navigate("/talent-studio")} className="w-full">
            <Upload className="w-4 h-4 mr-2" /> Enviar Vídeo do Desafio
          </Button>
        </div>

        {/* Training Check-in Calendar */}
        <div className="glass-card rounded-xl p-5 border border-transparent">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan" />
              <span className="font-display font-bold text-foreground">Check-in de Treino</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-primary" />
              <span className="text-sm font-display font-bold text-primary">{streak} dias seguidos</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-3 capitalize">{monthName}</p>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((d, i) => (
              <div key={i} className="text-center text-[10px] text-muted-foreground font-display py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const isChecked = checkedDays.has(dateStr);
              const isToday = new Date().toISOString().split("T")[0] === dateStr;
              const isFuture = new Date(dateStr) > new Date();

              return (
                <button
                  key={day}
                  onClick={() => !isFuture && toggleDay(dateStr)}
                  disabled={isFuture}
                  className={`aspect-square rounded-lg flex items-center justify-center text-xs font-display transition-all ${
                    isChecked
                      ? "bg-primary/20 text-primary glow-green"
                      : isToday
                      ? "border border-primary/40 text-foreground"
                      : isFuture
                      ? "text-muted-foreground/30"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {isChecked ? <CheckCircle2 className="w-4 h-4" /> : day}
                </button>
              );
            })}
          </div>
        </div>

        {/* News Feed */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Newspaper className="w-5 h-5 text-secondary" />
            <span className="font-display font-bold text-foreground">Notícias & Peneiras</span>
          </div>
          <div className="space-y-3">
            {newsItems.map((item) => (
              <div key={item.id} className="glass-card rounded-xl p-4 border border-transparent hover:border-primary/20 transition-colors cursor-pointer">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
                    {item.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-sm font-display font-bold text-foreground line-clamp-1">{item.title}</h3>
                      <Badge className={`${getCategoryColor(item.category)} text-[9px] shrink-0`}>{item.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-1.5">{item.summary}</p>
                    <span className="text-[10px] text-muted-foreground">{item.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default EvolutionPanel;
