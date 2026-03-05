import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import {
  Radar, Upload, Scissors, Circle, Type, Timer, Play, ArrowLeft, Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const tools = [
  { id: "trim", icon: Scissors, label: "Trim", color: "text-primary" },
  { id: "spotlight", icon: Circle, label: "Spotlight", color: "text-cyan" },
  { id: "overlay", icon: Type, label: "Overlay", color: "text-secondary" },
  { id: "slowmo", icon: Timer, label: "Slow-Mo", color: "text-cyan" },
];

const TalentStudio = () => {
  const navigate = useNavigate();
  const [uploaded, setUploaded] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [trimRange, setTrimRange] = useState([10, 80]);
  const [slowMoSpeed, setSlowMoSpeed] = useState([50]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-cyan" />
            <span className="font-display font-bold text-lg text-foreground">Talent Studio</span>
          </div>
          <Button size="sm" disabled={!uploaded}>
            <Check className="w-4 h-4 mr-1" /> Publicar
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {!uploaded ? (
          <div
            onClick={() => setUploaded(true)}
            className="glass-card rounded-2xl aspect-video flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/30 transition-colors border border-dashed border-border"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-display font-bold text-foreground">Upload de Vídeo</p>
              <p className="text-sm text-muted-foreground mt-1">MP4, MOV • Máx 200MB</p>
            </div>
          </div>
        ) : (
          <>
            {/* Video preview */}
            <div className="relative glass-card rounded-2xl aspect-video overflow-hidden">
              <div className="absolute inset-0 bg-muted flex items-center justify-center">
                <Play className="w-14 h-14 text-primary opacity-60" />
              </div>
              {/* Overlay preview */}
              {activeTool === "overlay" && (
                <div className="absolute bottom-4 left-4 glass rounded-lg px-3 py-2 text-xs space-y-0.5">
                  <p className="font-display font-bold text-foreground">Lucas Silva</p>
                  <p className="text-muted-foreground">16 anos • Atacante • São Paulo</p>
                </div>
              )}
              {/* Spotlight preview */}
              {activeTool === "spotlight" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-cyan animate-pulse-neon" />
              )}
            </div>

            {/* Tools */}
            <div className="flex gap-2 justify-center">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                  className={`flex flex-col items-center gap-1 px-4 py-3 rounded-xl transition-all ${
                    activeTool === tool.id
                      ? "glass border border-primary/30 glow-green"
                      : "glass-card hover:border-border/50"
                  }`}
                >
                  <tool.icon className={`w-5 h-5 ${tool.color}`} />
                  <span className="text-[10px] font-display text-foreground">{tool.label}</span>
                </button>
              ))}
            </div>

            {/* Tool controls */}
            {activeTool === "trim" && (
              <div className="glass-card rounded-xl p-4 space-y-3">
                <p className="font-display font-bold text-sm text-foreground">✂️ Cortar Vídeo</p>
                <Slider value={trimRange} onValueChange={setTrimRange} min={0} max={100} step={1} className="w-full" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Início: {trimRange[0]}%</span>
                  <span>Fim: {trimRange[1]}%</span>
                </div>
              </div>
            )}
            {activeTool === "spotlight" && (
              <div className="glass-card rounded-xl p-4 space-y-2">
                <p className="font-display font-bold text-sm text-foreground">🔵 Spotlight Tool</p>
                <p className="text-xs text-muted-foreground">
                  Arraste o círculo sobre sua posição no campo. O destaque segue o jogador automaticamente.
                </p>
                <Badge className="bg-cyan/20 text-cyan border-0 text-xs">Arrastar para posicionar</Badge>
              </div>
            )}
            {activeTool === "overlay" && (
              <div className="glass-card rounded-xl p-4 space-y-2">
                <p className="font-display font-bold text-sm text-foreground">📝 Overlay Automático</p>
                <p className="text-xs text-muted-foreground">
                  Marca d'água com seus dados será aplicada: Nome, Idade, Posição, Cidade.
                </p>
                <Badge className="bg-secondary/20 text-secondary border-0 text-xs">Ativo ✓</Badge>
              </div>
            )}
            {activeTool === "slowmo" && (
              <div className="glass-card rounded-xl p-4 space-y-3">
                <p className="font-display font-bold text-sm text-foreground">🐢 Câmera Lenta</p>
                <Slider value={slowMoSpeed} onValueChange={setSlowMoSpeed} min={10} max={100} step={5} />
                <p className="text-xs text-muted-foreground text-center">{slowMoSpeed[0]}% velocidade</p>
              </div>
            )}

            {/* Tags */}
            <div className="glass-card rounded-xl p-4 space-y-3">
              <p className="font-display font-bold text-sm text-foreground">🏷 Tags</p>
              <div className="flex flex-wrap gap-2">
                {["#Futebol", "#Sub17", "#Atacante", "#Highlights", "#SãoPaulo"].map((tag) => (
                  <Badge key={tag} className="bg-primary/15 text-primary border-0 text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default TalentStudio;
