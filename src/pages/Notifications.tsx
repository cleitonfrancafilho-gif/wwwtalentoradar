import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bell, Heart, UserPlus, Eye, MessageCircle, Calendar, Trophy, Check, CheckCheck,
} from "lucide-react";

const mockNotifications = [
  { id: 1, type: "follow", icon: UserPlus, text: "Carlos Mendes começou a te seguir", time: "2min", read: false, color: "text-primary" },
  { id: 2, type: "like", icon: Heart, text: "Ana Oliveira curtiu seu highlight", time: "15min", read: false, color: "text-destructive" },
  { id: 3, type: "view", icon: Eye, text: "Um olheiro visualizou seu perfil", time: "1h", read: false, color: "text-cyan" },
  { id: 4, type: "comment", icon: MessageCircle, text: 'Pedro Santos comentou: "Jogada incrível! 🔥"', time: "2h", read: false, color: "text-secondary" },
  { id: 5, type: "event", icon: Calendar, text: "Peneira Sub-17 Flamengo começa em 3 dias", time: "5h", read: true, color: "text-primary" },
  { id: 6, type: "achievement", icon: Trophy, text: 'Você alcançou o badge "Top Ativo"!', time: "1d", read: true, color: "text-secondary" },
  { id: 7, type: "follow", icon: UserPlus, text: "CT Ninho do Urubu começou a te seguir", time: "1d", read: true, color: "text-primary" },
  { id: 8, type: "like", icon: Heart, text: "12 pessoas curtiram seu novo vídeo", time: "2d", read: true, color: "text-destructive" },
  { id: 9, type: "view", icon: Eye, text: "Seu vídeo atingiu 1K visualizações 🎉", time: "3d", read: true, color: "text-cyan" },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">Notificações</span>
            {unreadCount > 0 && (
              <Badge className="bg-destructive text-destructive-foreground border-0 text-[10px]">{unreadCount}</Badge>
            )}
          </div>
          {unreadCount > 0 ? (
            <button onClick={markAllRead} className="text-xs text-primary font-display font-semibold">
              <CheckCheck className="w-4 h-4" />
            </button>
          ) : <div className="w-4" />}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-1 animate-slide-up">
        {notifications.length === 0 ? (
          <div className="text-center py-16">
            <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhuma notificação ainda.</p>
          </div>
        ) : (
          notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left ${
                n.read ? "opacity-60" : "glass-card hover:bg-muted/30"
              }`}
            >
              <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.read ? "bg-muted" : "bg-muted"}`}>
                <n.icon className={`w-4 h-4 ${n.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${n.read ? "text-muted-foreground" : "text-foreground"}`}>{n.text}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
              </div>
              {!n.read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />}
            </button>
          ))
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default Notifications;
