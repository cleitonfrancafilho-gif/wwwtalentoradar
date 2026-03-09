import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Radar, Upload, Scissors, Circle, Type, Timer, Play, ArrowLeft, Check, Loader2,
  Hash, AtSign, FileText, Music, Paintbrush, ChevronDown, X, Plus, ArrowDown, LetterText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const ARROW_COLORS = ["#EF4444", "#3B82F6", "#22C55E"] as const;

const filters = [
  { id: "none", label: "Original", css: "" },
  { id: "grayscale", label: "P&B", css: "grayscale(100%)" },
  { id: "sepia", label: "Vintage", css: "sepia(80%)" },
  { id: "contrast", label: "Contraste", css: "contrast(130%)" },
  { id: "saturate", label: "Vibrante", css: "saturate(180%)" },
  { id: "brightness", label: "Brilho", css: "brightness(120%)" },
  { id: "hue", label: "Neon", css: "hue-rotate(90deg) saturate(150%)" },
  { id: "cinematic", label: "Cinema", css: "contrast(110%) saturate(85%) brightness(95%)" },
];

const musicTracks = [
  { id: "none", label: "Sem música", artist: "" },
  { id: "epic", label: "Epic Motivation", artist: "Royalty Free" },
  { id: "trap", label: "Trap Beat", artist: "Studio Mix" },
  { id: "cinematic", label: "Cinematic Rise", artist: "Film Score" },
  { id: "edm", label: "EDM Energy", artist: "Club Mix" },
  { id: "lofi", label: "Lo-Fi Chill", artist: "Beats" },
];

const tools = [
  { id: "trim", icon: Scissors, label: "Trim", color: "text-primary" },
  { id: "spotlight", icon: Circle, label: "Spotlight", color: "text-cyan" },
  { id: "overlay", icon: Type, label: "Overlay", color: "text-secondary" },
  { id: "slowmo", icon: Timer, label: "Slow-Mo", color: "text-cyan" },
  { id: "filter", icon: Paintbrush, label: "Filtro", color: "text-secondary" },
  { id: "indicator", icon: ArrowDown, label: "Indicador", color: "text-destructive" },
  { id: "music", icon: Music, label: "Música", color: "text-primary" },
  { id: "text", icon: LetterText, label: "Texto", color: "text-foreground" },
];

const TalentStudio = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Video state
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);

  // Tool state
  const [trimRange, setTrimRange] = useState([10, 80]);
  const [slowMoSpeed, setSlowMoSpeed] = useState([50]);
  const [activeFilter, setActiveFilter] = useState("none");

  // Publish metadata
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>(["#Futebol", "#Sub17", "#Atacante"]);
  const [newTag, setNewTag] = useState("");
  const [taggedProfiles, setTaggedProfiles] = useState<string[]>([]);
  const [newProfileTag, setNewProfileTag] = useState("");
  const [selectedMusic, setSelectedMusic] = useState("none");

  // Player indicator
  const [indicatorEnabled, setIndicatorEnabled] = useState(false);
  const [indicatorColor] = useState(() => ARROW_COLORS[Math.floor(Math.random() * ARROW_COLORS.length)]);
  const [indicatorShowName, setIndicatorShowName] = useState(true);
  const [indicatorPosition, setIndicatorPosition] = useState({ x: 50, y: 35 });

  // Text overlay
  const [textOverlay, setTextOverlay] = useState("");

  const playerName = profile?.full_name || "Jogador";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) { toast.error("Máximo 200MB."); return; }
    if (!file.type.startsWith("video/")) { toast.error("Selecione um vídeo."); return; }
    setVideoFile(file);
    setVideoUrl(URL.createObjectURL(file));
  };

  const addTag = () => {
    const t = newTag.trim();
    if (t && !tags.includes(t.startsWith("#") ? t : `#${t}`)) {
      setTags([...tags, t.startsWith("#") ? t : `#${t}`]);
      setNewTag("");
    }
  };

  const addProfileTag = () => {
    const p = newProfileTag.trim();
    if (p && !taggedProfiles.includes(p.startsWith("@") ? p : `@${p}`)) {
      setTaggedProfiles([...taggedProfiles, p.startsWith("@") ? p : `@${p}`]);
      setNewProfileTag("");
    }
  };

  const handlePublish = async () => {
    if (!videoFile || !user) return;
    setPublishing(true);
    try {
      const fileExt = videoFile.name.split(".").pop();
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from("videos").upload(filePath, videoFile, { cacheControl: "3600", upsert: false });
      if (uploadError) throw uploadError;
      toast.success("Vídeo publicado com sucesso!");
      setVideoFile(null); setVideoUrl(null); setActiveTool(null);
      setDescription(""); setTags(["#Futebol", "#Sub17", "#Atacante"]);
      setTaggedProfiles([]); setSelectedMusic("none"); setIndicatorEnabled(false);
      navigate("/perfil");
    } catch (err: any) {
      toast.error("Erro: " + (err.message || "Tente novamente."));
    } finally { setPublishing(false); }
  };

  const uploaded = !!videoFile;
  const currentFilter = filters.find(f => f.id === activeFilter)?.css || "";

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
          <Button size="sm" disabled={!uploaded || publishing} onClick={handlePublish}>
            {publishing ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Check className="w-4 h-4 mr-1" />}
            {publishing ? "Enviando..." : "Publicar"}
          </Button>
        </div>
      </header>

      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileSelect} />

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-5">
        {!uploaded ? (
          <div onClick={() => fileInputRef.current?.click()} className="glass-card rounded-2xl aspect-video flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-primary/30 transition-colors border border-dashed border-border">
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
            {/* Video preview with overlays */}
            <div className="relative glass-card rounded-2xl aspect-video overflow-hidden" style={{ filter: currentFilter }}>
              {videoUrl ? (
                <video src={videoUrl} controls className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  <Play className="w-14 h-14 text-primary opacity-60" />
                </div>
              )}

              {/* Overlay watermark */}
              {activeTool === "overlay" && (
                <div className="absolute bottom-4 left-4 glass rounded-lg px-3 py-2 text-xs space-y-0.5 pointer-events-none">
                  <p className="font-display font-bold text-foreground">{playerName}</p>
                  <p className="text-muted-foreground">{profile?.position || "Atacante"} • {profile?.sport || "Futebol"}</p>
                </div>
              )}

              {/* Spotlight */}
              {activeTool === "spotlight" && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-cyan animate-pulse-neon pointer-events-none" />
              )}

              {/* Player indicator arrow */}
              {indicatorEnabled && (
                <div
                  className="absolute flex flex-col items-center pointer-events-none"
                  style={{ left: `${indicatorPosition.x}%`, top: `${indicatorPosition.y}%`, transform: "translate(-50%, -100%)" }}
                >
                  {indicatorShowName && (
                    <span className="font-display font-black text-sm tracking-wider mb-0.5 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]" style={{ color: indicatorColor }}>
                      {playerName.toUpperCase()}
                    </span>
                  )}
                  <svg width="28" height="32" viewBox="0 0 28 32" fill="none">
                    <path d="M14 32L0 8L14 16L28 8L14 32Z" fill={indicatorColor} />
                    <path d="M14 0L0 8L14 16L28 8L14 0Z" fill={indicatorColor} opacity="0.6" />
                  </svg>
                </div>
              )}

              {/* Text overlay */}
              {textOverlay && (
                <div className="absolute top-4 left-0 right-0 text-center pointer-events-none">
                  <span className="font-display font-bold text-lg text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] bg-black/30 px-4 py-1 rounded-lg">
                    {textOverlay}
                  </span>
                </div>
              )}

              {/* Music indicator */}
              {selectedMusic !== "none" && (
                <div className="absolute top-3 right-3 glass rounded-full px-2.5 py-1 flex items-center gap-1.5 pointer-events-none">
                  <Music className="w-3 h-3 text-primary animate-pulse" />
                  <span className="text-[10px] font-display text-foreground">{musicTracks.find(m => m.id === selectedMusic)?.label}</span>
                </div>
              )}
            </div>

            <button onClick={() => fileInputRef.current?.click()} className="text-xs text-muted-foreground hover:text-primary transition-colors text-center w-full">
              Trocar vídeo
            </button>

            {/* Tools grid */}
            <div className="flex gap-2 justify-center flex-wrap">
              {tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
                  className={`flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all ${
                    activeTool === tool.id ? "glass border border-primary/30 glow-green" : "glass-card hover:border-border/50"
                  }`}
                >
                  <tool.icon className={`w-4 h-4 ${tool.color}`} />
                  <span className="text-[9px] font-display text-foreground">{tool.label}</span>
                </button>
              ))}
            </div>

            {/* ── Tool panels ── */}

            {activeTool === "trim" && (
              <div className="glass-card rounded-xl p-4 space-y-3 animate-slide-up">
                <p className="font-display font-bold text-sm text-foreground">✂️ Cortar Vídeo</p>
                <Slider value={trimRange} onValueChange={setTrimRange} min={0} max={100} step={1} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Início: {trimRange[0]}%</span><span>Fim: {trimRange[1]}%</span>
                </div>
              </div>
            )}

            {activeTool === "spotlight" && (
              <div className="glass-card rounded-xl p-4 space-y-2 animate-slide-up">
                <p className="font-display font-bold text-sm text-foreground">🔵 Spotlight Tool</p>
                <p className="text-xs text-muted-foreground">Arraste o círculo sobre sua posição no campo.</p>
                <Badge className="bg-cyan/20 text-cyan border-0 text-xs">Arrastar para posicionar</Badge>
              </div>
            )}

            {activeTool === "overlay" && (
              <div className="glass-card rounded-xl p-4 space-y-2 animate-slide-up">
                <p className="font-display font-bold text-sm text-foreground">📝 Overlay Automático</p>
                <p className="text-xs text-muted-foreground">Marca d'água com seus dados: Nome, Posição, Cidade.</p>
                <Badge className="bg-secondary/20 text-secondary border-0 text-xs">Ativo ✓</Badge>
              </div>
            )}

            {activeTool === "slowmo" && (
              <div className="glass-card rounded-xl p-4 space-y-3 animate-slide-up">
                <p className="font-display font-bold text-sm text-foreground">🐢 Câmera Lenta</p>
                <Slider value={slowMoSpeed} onValueChange={setSlowMoSpeed} min={10} max={100} step={5} />
                <p className="text-xs text-muted-foreground text-center">{slowMoSpeed[0]}% velocidade</p>
              </div>
            )}

            {activeTool === "filter" && (
              <div className="glass-card rounded-xl p-4 space-y-3 animate-slide-up">
                <p className="font-display font-bold text-sm text-foreground">🎨 Filtros</p>
                <div className="flex gap-2 flex-wrap">
                  {filters.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setActiveFilter(f.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${
                        activeFilter === f.id ? "bg-primary/20 text-primary ring-1 ring-primary/30" : "bg-muted text-muted-foreground hover:bg-primary/10"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTool === "indicator" && (
              <div className="glass-card rounded-xl p-4 space-y-4 animate-slide-up">
                <p className="font-display font-bold text-sm text-foreground">🔻 Indicador de Jogador</p>
                <p className="text-xs text-muted-foreground">Fixa uma seta colorida sobre o jogador principal do vídeo.</p>
                <div className="flex items-center justify-between">
                  <Label className="text-foreground text-sm">Ativar indicador</Label>
                  <Switch checked={indicatorEnabled} onCheckedChange={setIndicatorEnabled} />
                </div>
                {indicatorEnabled && (
                  <>
                    <div className="flex items-center justify-between">
                      <Label className="text-foreground text-sm">Mostrar nome acima</Label>
                      <Switch checked={indicatorShowName} onCheckedChange={setIndicatorShowName} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Cor da seta:</span>
                      <div className="w-5 h-5 rounded-full border border-border" style={{ backgroundColor: indicatorColor }} />
                      <span className="text-xs text-muted-foreground">(aleatória)</span>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground text-xs">Posição horizontal</Label>
                      <Slider value={[indicatorPosition.x]} onValueChange={([v]) => setIndicatorPosition(p => ({ ...p, x: v }))} min={5} max={95} step={1} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground text-xs">Posição vertical</Label>
                      <Slider value={[indicatorPosition.y]} onValueChange={([v]) => setIndicatorPosition(p => ({ ...p, y: v }))} min={5} max={90} step={1} />
                    </div>
                  </>
                )}
              </div>
            )}

            {activeTool === "music" && (
              <div className="glass-card rounded-xl p-4 space-y-3 animate-slide-up">
                <p className="font-display font-bold text-sm text-foreground">🎵 Música</p>
                <div className="space-y-1.5">
                  {musicTracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => setSelectedMusic(track.id)}
                      className={`w-full flex items-center gap-3 p-2.5 rounded-lg text-left transition-all ${
                        selectedMusic === track.id ? "bg-primary/15 border border-primary/30" : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <Music className={`w-4 h-4 ${selectedMusic === track.id ? "text-primary" : "text-muted-foreground"}`} />
                      <div>
                        <p className={`text-xs font-display font-semibold ${selectedMusic === track.id ? "text-primary" : "text-foreground"}`}>{track.label}</p>
                        {track.artist && <p className="text-[10px] text-muted-foreground">{track.artist}</p>}
                      </div>
                      {selectedMusic === track.id && <Check className="w-4 h-4 text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {activeTool === "text" && (
              <div className="glass-card rounded-xl p-4 space-y-3 animate-slide-up">
                <p className="font-display font-bold text-sm text-foreground">✏️ Texto no Vídeo</p>
                <Input
                  value={textOverlay}
                  onChange={(e) => setTextOverlay(e.target.value)}
                  placeholder="Digite o texto..."
                  className="bg-muted border-border text-foreground"
                  maxLength={50}
                />
                <p className="text-[10px] text-muted-foreground">{textOverlay.length}/50 caracteres</p>
              </div>
            )}

            {/* ── Publish metadata ── */}
            <div className="glass-card rounded-xl p-4 space-y-4">
              <div>
                <Label className="text-foreground text-sm flex items-center gap-1.5 mb-2">
                  <FileText className="w-3.5 h-3.5 text-primary" /> Descrição
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva seu vídeo..."
                  className="bg-muted border-border text-foreground resize-none"
                  rows={2}
                  maxLength={300}
                />
                <p className="text-[10px] text-muted-foreground mt-1">{description.length}/300</p>
              </div>

              {/* Tags */}
              <div>
                <Label className="text-foreground text-sm flex items-center gap-1.5 mb-2">
                  <Hash className="w-3.5 h-3.5 text-primary" /> Tags
                </Label>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {tags.map((tag) => (
                    <Badge key={tag} className="bg-primary/15 text-primary border-0 text-xs gap-1">
                      {tag} <X className="w-3 h-3 cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="#novatag" className="bg-muted border-border text-foreground text-xs" onKeyDown={(e) => e.key === "Enter" && addTag()} />
                  <Button size="sm" variant="outline" onClick={addTag}><Plus className="w-3.5 h-3.5" /></Button>
                </div>
              </div>

              {/* Tag profiles */}
              <div>
                <Label className="text-foreground text-sm flex items-center gap-1.5 mb-2">
                  <AtSign className="w-3.5 h-3.5 text-cyan" /> Marcar perfis
                </Label>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {taggedProfiles.map((p) => (
                    <Badge key={p} className="bg-cyan/15 text-cyan border-0 text-xs gap-1">
                      {p} <X className="w-3 h-3 cursor-pointer" onClick={() => setTaggedProfiles(taggedProfiles.filter(t => t !== p))} />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input value={newProfileTag} onChange={(e) => setNewProfileTag(e.target.value)} placeholder="@usuario" className="bg-muted border-border text-foreground text-xs" onKeyDown={(e) => e.key === "Enter" && addProfileTag()} />
                  <Button size="sm" variant="outline" onClick={addProfileTag}><Plus className="w-3.5 h-3.5" /></Button>
                </div>
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
