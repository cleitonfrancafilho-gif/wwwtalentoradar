import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import {
  ArrowLeft, Radio, Users, Heart, MessageCircle, Send, X, Share2,
  Camera, CameraOff, Mic, MicOff, RotateCcw, Zap, Eye, Gift, Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface LiveComment {
  id: number;
  user: string;
  text: string;
  type: "comment" | "join" | "gift" | "system";
}

interface LiveStream {
  id: number;
  userName: string;
  sport: string;
  title: string;
  viewers: number;
  likes: number;
  isLive: boolean;
  thumbnail?: string;
}

const mockLiveStreams: LiveStream[] = [
  { id: 1, userName: "Pedro Gomes", sport: "Futebol", title: "Treino ao vivo - Preparação física", viewers: 234, likes: 89, isLive: true },
  { id: 2, userName: "Julia Santos", sport: "Vôlei", title: "Aquecimento antes do jogo", viewers: 156, likes: 45, isLive: true },
  { id: 3, userName: "Rafael Lima", sport: "Basquete", title: "Arremessos de 3 pontos", viewers: 89, likes: 23, isLive: true },
];

const Live = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"browse" | "watch" | "stream">("browse");
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [comments, setComments] = useState<LiveComment[]>([
    { id: 1, user: "Sistema", text: "Bem-vindo à live!", type: "system" },
  ]);
  const [commentText, setCommentText] = useState("");
  const [likes, setLikes] = useState(0);
  const [viewers, setViewers] = useState(0);
  const [cameraOn, setCameraOn] = useState(true);
  const [micOn, setMicOn] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [showHearts, setShowHearts] = useState<number[]>([]);
  const commentsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  // Simulate viewers/comments when watching
  useEffect(() => {
    if (mode !== "watch" && mode !== "stream") return;
    const interval = setInterval(() => {
      const mockUsers = ["Ana", "Carlos", "Bia", "Pedro", "Julia", "Rafael"];
      const mockComments = [
        "Que treino incrível! 🔥", "Show demais!", "Continua assim! 💪",
        "Impressionante!", "Qual seu treino de pernas?", "Crack! ⚽",
      ];
      const rnd = Math.random();
      if (rnd > 0.6) {
        setComments(prev => [...prev.slice(-50), {
          id: Date.now(),
          user: mockUsers[Math.floor(Math.random() * mockUsers.length)],
          text: mockComments[Math.floor(Math.random() * mockComments.length)],
          type: "comment",
        }]);
      } else if (rnd > 0.4) {
        setViewers(v => v + 1);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [mode]);

  const sendComment = () => {
    if (!commentText.trim()) return;
    setComments(prev => [...prev, { id: Date.now(), user: "Você", text: commentText, type: "comment" }]);
    setCommentText("");
  };

  const sendLike = () => {
    setLikes(l => l + 1);
    const heartId = Date.now();
    setShowHearts(prev => [...prev, heartId]);
    setTimeout(() => setShowHearts(prev => prev.filter(h => h !== heartId)), 1500);
  };

  const startStream = () => {
    if (!streamTitle.trim()) {
      toast.error("Defina um título para a live");
      return;
    }
    setIsStreaming(true);
    setMode("stream");
    setViewers(0);
    setLikes(0);
    setComments([{ id: 1, user: "Sistema", text: "Sua live começou! 🎬", type: "system" }]);
    toast.success("🔴 Você está ao vivo!");
  };

  const endStream = () => {
    setIsStreaming(false);
    setMode("browse");
    toast("Live encerrada. Obrigado!");
  };

  const watchStream = (stream: LiveStream) => {
    setSelectedStream(stream);
    setMode("watch");
    setViewers(stream.viewers);
    setLikes(stream.likes);
    setComments([
      { id: 1, user: "Sistema", text: `Você entrou na live de ${stream.userName}`, type: "system" },
    ]);
  };

  // Browse mode
  if (mode === "browse") {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Radio className="w-5 h-5 text-red-500" />
              <span className="font-display font-bold text-lg text-foreground">Lives</span>
            </div>
            <Button size="sm" onClick={() => setMode("stream")} className="bg-red-500 hover:bg-red-600 text-white gap-1">
              <Radio className="w-3.5 h-3.5" /> Iniciar
            </Button>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-4 space-y-3">
          <div className="glass-card rounded-xl p-3 flex items-center gap-2 border border-red-500/20">
            <Radio className="w-4 h-4 text-red-500 animate-pulse" />
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 font-semibold">{mockLiveStreams.length} lives</span> acontecendo agora
            </p>
          </div>

          {mockLiveStreams.map(stream => (
            <button
              key={stream.id}
              onClick={() => watchStream(stream)}
              className="w-full glass-card rounded-xl overflow-hidden border border-transparent hover:border-primary/20 transition-colors text-left"
            >
              <div className="aspect-video bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center relative">
                <Camera className="w-12 h-12 text-muted-foreground/30" />
                <div className="absolute top-2 left-2 flex items-center gap-1">
                  <Badge className="bg-red-500 text-white border-0 text-[10px] gap-1">
                    <Radio className="w-2.5 h-2.5 animate-pulse" /> AO VIVO
                  </Badge>
                </div>
                <div className="absolute top-2 right-2">
                  <Badge className="bg-black/50 text-white border-0 text-[10px] gap-1">
                    <Eye className="w-2.5 h-2.5" /> {stream.viewers}
                  </Badge>
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">👤</div>
                  <span className="text-sm font-bold text-foreground">{stream.userName}</span>
                  <Badge className="bg-primary/10 text-primary border-0 text-[10px]">{stream.sport}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">{stream.title}</p>
              </div>
            </button>
          ))}
        </main>
        <BottomNav />
      </div>
    );
  }

  // Stream setup (pre-go-live)
  if (mode === "stream" && !isStreaming) {
    return (
      <div className="fixed inset-0 z-[100] bg-background flex flex-col">
        <header className="flex items-center justify-between px-4 py-3">
          <button onClick={() => setMode("browse")} className="text-muted-foreground">
            <X className="w-6 h-6" />
          </button>
          <span className="font-display font-bold text-foreground">Configurar Live</span>
          <div className="w-6" />
        </header>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-6">
          <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
            <Camera className="w-16 h-16 text-muted-foreground/30" />
          </div>
          <Input
            value={streamTitle}
            onChange={e => setStreamTitle(e.target.value)}
            placeholder="Título da live..."
            className="max-w-sm text-center"
          />
          <div className="flex gap-4">
            <button onClick={() => setCameraOn(!cameraOn)} className={`w-12 h-12 rounded-full flex items-center justify-center ${cameraOn ? "bg-primary/20" : "bg-destructive/20"}`}>
              {cameraOn ? <Camera className="w-5 h-5 text-primary" /> : <CameraOff className="w-5 h-5 text-destructive" />}
            </button>
            <button onClick={() => setMicOn(!micOn)} className={`w-12 h-12 rounded-full flex items-center justify-center ${micOn ? "bg-primary/20" : "bg-destructive/20"}`}>
              {micOn ? <Mic className="w-5 h-5 text-primary" /> : <MicOff className="w-5 h-5 text-destructive" />}
            </button>
          </div>
          <Button onClick={startStream} className="bg-red-500 hover:bg-red-600 text-white gap-2 px-8">
            <Radio className="w-4 h-4" /> Iniciar Live
          </Button>
        </div>
      </div>
    );
  }

  // Watching or streaming
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      {/* Video area */}
      <div className="flex-1 relative flex items-center justify-center bg-gradient-to-br from-muted/30 to-background">
        <Camera className="w-20 h-20 text-muted-foreground/20" />

        {/* Top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-4 z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">👤</div>
            <div>
              <p className="text-white text-sm font-bold">{mode === "stream" ? "Você" : selectedStream?.userName}</p>
              <Badge className="bg-red-500 text-white border-0 text-[10px] gap-1">
                <Radio className="w-2 h-2 animate-pulse" /> AO VIVO
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-black/40 rounded-full px-2 py-1">
              <Eye className="w-3 h-3 text-white" />
              <span className="text-white text-xs">{viewers}</span>
            </div>
            <button onClick={() => { mode === "stream" ? endStream() : setMode("browse"); }} className="text-white">
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Floating hearts */}
        {showHearts.map(h => (
          <div key={h} className="absolute bottom-40 right-8 animate-bounce text-red-500 text-2xl" style={{ animationDuration: "1s" }}>
            ❤️
          </div>
        ))}

        {/* Stream controls (streamer) */}
        {mode === "stream" && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 z-10">
            <button onClick={() => setCameraOn(!cameraOn)} className={`w-10 h-10 rounded-full flex items-center justify-center ${cameraOn ? "bg-white/20" : "bg-red-500/50"}`}>
              {cameraOn ? <Camera className="w-5 h-5 text-white" /> : <CameraOff className="w-5 h-5 text-white" />}
            </button>
            <button onClick={() => setMicOn(!micOn)} className={`w-10 h-10 rounded-full flex items-center justify-center ${micOn ? "bg-white/20" : "bg-red-500/50"}`}>
              {micOn ? <Mic className="w-5 h-5 text-white" /> : <MicOff className="w-5 h-5 text-white" />}
            </button>
            <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-white" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </button>
            <button onClick={endStream} className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        )}
      </div>

      {/* Comments + input (watcher) */}
      <div className="bg-black/80 backdrop-blur-sm">
        <div className="max-h-40 overflow-y-auto px-4 py-2 space-y-1">
          {comments.map(c => (
            <div key={c.id} className="flex gap-1.5">
              <span className={`text-xs font-bold ${c.type === "system" ? "text-primary" : "text-white"}`}>{c.user}</span>
              <span className="text-xs text-white/80">{c.text}</span>
            </div>
          ))}
          <div ref={commentsEndRef} />
        </div>
        <div className="px-4 py-2 flex gap-2 items-center border-t border-white/10">
          <Input
            value={commentText}
            onChange={e => setCommentText(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendComment()}
            placeholder="Comentar..."
            className="flex-1 bg-white/10 border-white/20 text-white text-xs placeholder:text-white/40"
          />
          <button onClick={sendLike} className="p-2">
            <Heart className="w-5 h-5 text-red-400 hover:text-red-500" />
          </button>
          <button className="p-2">
            <Gift className="w-5 h-5 text-secondary" />
          </button>
          <button className="p-2">
            <Share2 className="w-5 h-5 text-white/60" />
          </button>
          <Button size="icon" variant="ghost" onClick={sendComment} disabled={!commentText.trim()}>
            <Send className="w-4 h-4 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Live;
