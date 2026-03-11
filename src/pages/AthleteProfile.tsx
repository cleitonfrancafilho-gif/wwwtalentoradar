import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import QRCodeModal from "@/components/QRCodeModal";
import {
  ArrowLeft, Play, MapPin, Trophy, Ruler, Weight, Star, MessageCircle, Share2, Shield, Flame, UserPlus, UserCheck,
} from "lucide-react";

const formatNumber = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return n.toString();
};

const AthleteProfile = () => {
  const navigate = useNavigate();
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(1283);

  const toggleFollow = () => {
    setIsFollowing(prev => !prev);
    setFollowerCount(prev => isFollowing ? prev - 1 : prev + 1);
  };

  const stats = [
    { label: "Altura", value: "1.78m", icon: Ruler },
    { label: "Peso", value: "72kg", icon: Weight },
    { label: "Posição", value: "Atacante", icon: Star },
    { label: "Gols", value: "23", icon: Trophy },
  ];

  const socialStats = [
    { label: "Posts", value: 24 },
    { label: "Seguidores", value: followerCount },
    { label: "Seguindo", value: 89 },
  ];

  const achievements = [
    "🏆 Artilheiro Copa Sub-17 SP — 2025",
    "🥇 Seleção Paulista Sub-16 — 2024",
    "⚽ MVP Torneio de Verão — 2024",
  ];

  const highlights = [
    { title: "Gol de Cobertura vs Santos Sub-17", views: "1.2K", tags: ["#Futebol", "#Sub17", "#Gol"] },
    { title: "Dribles e Assistências — Compilado 2025", views: "3.4K", tags: ["#Highlights", "#Atacante"] },
    { title: "Hat-trick Copa Paulista", views: "2.1K", tags: ["#Futebol", "#Artilheiro"] },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-foreground">DVD Digital</span>
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              import("sonner").then(({ toast }) => toast.success("Link copiado!"));
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-slide-up">
        {/* Profile header */}
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-3xl glow-green">⚽</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold text-foreground">Lucas Silva</h1>
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">16 anos • Atacante • Futebol</p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" /> São Paulo, SP
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="text-xs font-display font-bold text-primary">Score: 95</span>
              <Badge className="bg-primary/15 text-primary border-0 text-[9px]">Top Ativo</Badge>
            </div>
          </div>
        </div>

        {/* Social stats */}
        <div className="grid grid-cols-3 gap-3">
          {socialStats.map((s) => (
            <div key={s.label} className="glass-card rounded-xl p-3 text-center border border-transparent">
              <p className="text-xl font-display font-bold text-foreground">{formatNumber(s.value)}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button size="sm" className="flex-1" onClick={() => navigate("/chat")}>
            <MessageCircle className="w-4 h-4 mr-1" /> Contatar
          </Button>
          <Button
            variant={isFollowing ? "default" : "outline"}
            size="sm"
            className="flex-1"
            onClick={toggleFollow}
          >
            {isFollowing ? (
              <><UserCheck className="w-4 h-4 mr-1" /> Seguindo</>
            ) : (
              <><UserPlus className="w-4 h-4 mr-1" /> Seguir</>
            )}
          </Button>
          <QRCodeModal athleteName="Lucas Silva" profileUrl={window.location.href} />
        </div>

        {/* Physical Stats */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-3 text-center border border-transparent">
              <stat.icon className="w-4 h-4 text-cyan mx-auto mb-1" />
              <p className="text-lg font-display font-bold text-foreground">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Representation Badge */}
        <div className="flex items-center gap-2">
          <Badge className="bg-primary/15 text-primary border-0 text-xs">
            <Star className="w-3 h-3 mr-1" /> Livre no Mercado
          </Badge>
        </div>

        {/* Achievements */}
        <div>
          <h2 className="font-display font-bold text-foreground mb-3">Conquistas</h2>
          <div className="glass-card rounded-xl p-4 space-y-2 border border-transparent">
            {achievements.map((a, i) => (
              <p key={i} className="text-sm text-foreground">{a}</p>
            ))}
          </div>
        </div>

        {/* Club Timeline */}
        <div>
          <h2 className="font-display font-bold text-foreground mb-3">Histórico de Clubes</h2>
          <div className="glass-card rounded-xl p-4 border border-transparent">
            {[
              { club: "EC Juventude SP", period: "Jan 2024 — Atual", achievement: "Artilheiro Sub-17" },
              { club: "AA São Bento", period: "Mar 2023 — Dez 2023", achievement: "Seleção do campeonato" },
            ].map((c, i) => (
              <div key={i} className="relative pl-5 border-l-2 border-primary/30 pb-4 last:pb-0">
                <div className="absolute left-[-5px] top-0.5 w-2.5 h-2.5 rounded-full bg-primary glow-green" />
                <p className="text-sm font-display font-bold text-foreground">{c.club}</p>
                <p className="text-[11px] text-muted-foreground">{c.period}</p>
                <p className="text-xs text-primary mt-0.5">🏆 {c.achievement}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div>
          <h2 className="font-display font-bold text-foreground mb-3">Highlights</h2>
          <div className="space-y-3">
            {highlights.map((h, i) => (
              <div key={i} className="glass-card rounded-xl overflow-hidden hover:border-primary/30 transition-colors border border-transparent">
                <div className="aspect-video bg-muted flex items-center justify-center relative">
                  <Play className="w-10 h-10 text-primary opacity-70" />
                  <span className="absolute bottom-2 right-2 text-xs text-muted-foreground glass px-2 py-0.5 rounded">
                    {h.views} views
                  </span>
                </div>
                <div className="p-3">
                  <h4 className="text-sm font-display font-bold text-foreground">{h.title}</h4>
                  <div className="flex gap-1.5 mt-2">
                    {h.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-[10px] bg-primary/15 text-primary border-0">{tag}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety notice */}
        <div className="border border-secondary/30 rounded-xl p-4 glass-card">
          <p className="text-xs text-secondary font-display text-center">
            ⚠ Nunca marque encontros fora de Sedes Oficiais ou CTs. Comunique seus responsáveis.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default AthleteProfile;
