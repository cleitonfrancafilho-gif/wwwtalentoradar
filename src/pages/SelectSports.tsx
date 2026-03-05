import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Radar, ArrowLeft, Check } from "lucide-react";

const sports = [
  { id: "futebol", name: "Futebol", emoji: "⚽" },
  { id: "basquete", name: "Basquete", emoji: "🏀" },
  { id: "volei", name: "Vôlei", emoji: "🏐" },
  { id: "tenis", name: "Tênis", emoji: "🎾" },
  { id: "surf", name: "Surf", emoji: "🏄" },
  { id: "artes-marciais", name: "Artes Marciais", emoji: "🥋" },
  { id: "natacao", name: "Natação", emoji: "🏊" },
  { id: "atletismo", name: "Atletismo", emoji: "🏃" },
  { id: "handball", name: "Handebol", emoji: "🤾" },
  { id: "skate", name: "Skate", emoji: "🛹" },
  { id: "boxe", name: "Boxe", emoji: "🥊" },
  { id: "ciclismo", name: "Ciclismo", emoji: "🚴" },
];

const SelectSports = () => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>([]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">
              Talent<span className="text-gradient-neon">Radar</span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-lg animate-slide-up">
          <h1 className="text-3xl font-display font-bold text-center mb-2 text-foreground">
            Quais esportes te interessam?
          </h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">
            Selecione pelo menos 1 esporte para personalizar seu feed
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-8">
            {sports.map((sport) => {
              const isSelected = selected.includes(sport.id);
              return (
                <button
                  key={sport.id}
                  onClick={() => toggle(sport.id)}
                  className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/10 glow-green"
                      : "border-border bg-card hover:border-muted-foreground/30"
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="w-3 h-3 text-primary-foreground" />
                    </div>
                  )}
                  <span className="text-2xl">{sport.emoji}</span>
                  <span className="text-xs font-display font-semibold text-foreground">
                    {sport.name}
                  </span>
                </button>
              );
            })}
          </div>

          <Button
            className="w-full"
            disabled={selected.length === 0}
            onClick={() => navigate("/feed")}
          >
            Continuar ({selected.length} selecionado{selected.length !== 1 ? "s" : ""})
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SelectSports;
