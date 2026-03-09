import { useState } from "react";
import { X, Camera, Music, Sparkles, RotateCcw, CircleDot, Zap, Type } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const effects = [
  { id: "none", label: "Normal", icon: "○" },
  { id: "vintage", label: "Vintage", icon: "🎞" },
  { id: "neon", label: "Neon", icon: "💡" },
  { id: "blur", label: "Blur", icon: "🌫" },
  { id: "bw", label: "P&B", icon: "⬛" },
  { id: "warm", label: "Quente", icon: "🔥" },
  { id: "cool", label: "Frio", icon: "❄️" },
];

const musicOptions = [
  { id: 1, name: "Energia Total", artist: "DJ Sport" },
  { id: 2, name: "Foco e Força", artist: "Beat Atleta" },
  { id: 3, name: "Vitória", artist: "MC Gol" },
  { id: 4, name: "Treino Pesado", artist: "Fitness Mix" },
  { id: 5, name: "Campeão", artist: "Rock Sports" },
];

type CaptureMode = "photo" | "video" | "boomerang" | "live_photo";

interface StoryCreatorProps {
  onClose: () => void;
  onPublish: (data: {
    type: CaptureMode;
    effect: string;
    music?: { name: string; artist: string };
  }) => void;
}

const StoryCreator = ({ onClose, onPublish }: StoryCreatorProps) => {
  const [captureMode, setCaptureMode] = useState<CaptureMode>("photo");
  const [selectedEffect, setSelectedEffect] = useState("none");
  const [showEffects, setShowEffects] = useState(false);
  const [showMusic, setShowMusic] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState<typeof musicOptions[0] | null>(null);
  const [captured, setCaptured] = useState(false);
  const [recording, setRecording] = useState(false);

  const captureModes: { mode: CaptureMode; label: string; icon: React.ReactNode }[] = [
    { mode: "photo", label: "Foto", icon: <Camera className="w-4 h-4" /> },
    { mode: "video", label: "Vídeo", icon: <CircleDot className="w-4 h-4" /> },
    { mode: "boomerang", label: "Boomerang", icon: <RotateCcw className="w-4 h-4" /> },
    { mode: "live_photo", label: "Live Photo", icon: <Zap className="w-4 h-4" /> },
  ];

  const handleCapture = () => {
    if (captureMode === "video") {
      if (recording) {
        setRecording(false);
        setCaptured(true);
        toast.success("Vídeo gravado!");
      } else {
        setRecording(true);
        toast("Gravando...");
        setTimeout(() => {
          setRecording(false);
          setCaptured(true);
          toast.success("Vídeo gravado!");
        }, 3000);
      }
    } else if (captureMode === "boomerang") {
      toast("Capturando boomerang...");
      setTimeout(() => {
        setCaptured(true);
        toast.success("Boomerang criado!");
      }, 1500);
    } else if (captureMode === "live_photo") {
      toast("Capturando Live Photo...");
      setTimeout(() => {
        setCaptured(true);
        toast.success("Live Photo capturada!");
      }, 1000);
    } else {
      setCaptured(true);
      toast.success("Foto capturada!");
    }
  };

  const handlePublish = () => {
    onPublish({
      type: captureMode,
      effect: selectedEffect,
      music: selectedMusic ? { name: selectedMusic.name, artist: selectedMusic.artist } : undefined,
    });
  };

  const getEffectStyle = (): string => {
    switch (selectedEffect) {
      case "vintage": return "sepia(0.6) contrast(1.1)";
      case "neon": return "saturate(2) brightness(1.2)";
      case "blur": return "blur(1px) brightness(1.1)";
      case "bw": return "grayscale(1)";
      case "warm": return "sepia(0.3) saturate(1.4)";
      case "cool": return "saturate(0.8) hue-rotate(30deg)";
      default: return "none";
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 z-10">
        <button onClick={onClose} className="text-white/80 hover:text-white">
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => { setShowMusic(!showMusic); setShowEffects(false); }} className={`p-2 rounded-full ${selectedMusic ? "bg-primary/30" : "bg-white/10"}`}>
            <Music className="w-5 h-5 text-white" />
          </button>
          <button onClick={() => { setShowEffects(!showEffects); setShowMusic(false); }} className={`p-2 rounded-full ${selectedEffect !== "none" ? "bg-primary/30" : "bg-white/10"}`}>
            <Sparkles className="w-5 h-5 text-white" />
          </button>
          <button className="p-2 rounded-full bg-white/10">
            <Type className="w-5 h-5 text-white" />
          </button>
        </div>
        {captured && (
          <Button size="sm" onClick={handlePublish} className="bg-primary text-primary-foreground font-bold">
            Publicar
          </Button>
        )}
        {!captured && <div className="w-16" />}
      </div>

      {/* Viewfinder */}
      <div className="flex-1 relative flex items-center justify-center mx-4 rounded-2xl overflow-hidden bg-muted/20">
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ filter: getEffectStyle() }}
        >
          {captured ? (
            <div className="text-center">
              <div className="text-6xl mb-4">
                {captureMode === "boomerang" ? "∞" : captureMode === "live_photo" ? "◉" : "📸"}
              </div>
              <p className="text-white/60 text-sm">Preview do Story</p>
              {selectedEffect !== "none" && (
                <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full mt-2 inline-block">
                  ✨ {effects.find(e => e.id === selectedEffect)?.label}
                </span>
              )}
            </div>
          ) : (
            <div className="text-center">
              <Camera className="w-16 h-16 text-white/20 mx-auto mb-2" />
              <p className="text-white/40 text-sm">Câmera</p>
            </div>
          )}
        </div>

        {recording && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white text-xs">Gravando...</span>
          </div>
        )}
      </div>

      {/* Music selector */}
      {showMusic && (
        <div className="px-4 py-3 animate-slide-up">
          <p className="text-white text-sm font-bold mb-2">🎵 Adicionar Música</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {musicOptions.map(m => (
              <button
                key={m.id}
                onClick={() => setSelectedMusic(selectedMusic?.id === m.id ? null : m)}
                className={`shrink-0 px-3 py-2 rounded-xl text-left ${selectedMusic?.id === m.id ? "bg-primary/30 border border-primary/50" : "bg-white/10"}`}
              >
                <p className="text-white text-xs font-bold">{m.name}</p>
                <p className="text-white/60 text-[10px]">{m.artist}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Effects */}
      {showEffects && (
        <div className="px-4 py-3 animate-slide-up">
          <p className="text-white text-sm font-bold mb-2">✨ Efeitos</p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {effects.map(e => (
              <button
                key={e.id}
                onClick={() => setSelectedEffect(e.id)}
                className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 ${selectedEffect === e.id ? "bg-primary/30 border border-primary/50" : "bg-white/10"}`}
              >
                <span className="text-lg">{e.icon}</span>
                <span className="text-white text-[8px]">{e.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected music display */}
      {selectedMusic && !showMusic && (
        <div className="px-4 py-1">
          <div className="bg-white/10 rounded-full px-3 py-1 flex items-center gap-2">
            <span className="text-white text-xs animate-pulse">♪</span>
            <span className="text-white text-xs truncate">{selectedMusic.name} — {selectedMusic.artist}</span>
            <button onClick={() => setSelectedMusic(null)} className="text-white/60 ml-auto"><X className="w-3 h-3" /></button>
          </div>
        </div>
      )}

      {/* Capture modes */}
      <div className="px-4 py-2">
        <div className="flex justify-center gap-4 mb-3">
          {captureModes.map(cm => (
            <button
              key={cm.mode}
              onClick={() => { setCaptureMode(cm.mode); setCaptured(false); }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs ${captureMode === cm.mode ? "bg-primary text-primary-foreground font-bold" : "bg-white/10 text-white/70"}`}
            >
              {cm.icon}
              {cm.label}
            </button>
          ))}
        </div>
      </div>

      {/* Capture button */}
      {!captured && (
        <div className="flex justify-center pb-8">
          <button
            onClick={handleCapture}
            className={`w-16 h-16 rounded-full border-4 border-white flex items-center justify-center transition-all ${recording ? "bg-red-500 scale-90" : "bg-white/20 hover:bg-white/30 active:scale-95"}`}
          >
            {recording ? (
              <div className="w-6 h-6 rounded-sm bg-white" />
            ) : captureMode === "video" ? (
              <div className="w-6 h-6 rounded-full bg-red-500" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-white" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default StoryCreator;
