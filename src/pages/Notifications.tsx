import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bell, Heart, UserPlus, Eye, MessageCircle, Calendar, Trophy, CheckCheck, Trash2, Filter,
} from "lucide-react";
import { toast } from "sonner";

type NotificationType = "follow" | "like" | "view" | "comment" | "event" | "achievement";

interface Notification {
  id: number;
  type: NotificationType;
  icon: typeof Bell;
  text: string;
  time: string;
  read: boolean;
  color: string;
  actionUrl?: string;
}

const mockNotifications: Notification[] = [
  { id: 1, type: "follow", icon: UserPlus, text: "Carlos Mendes começou a te seguir", time: "2min", read: false, color: "text-primary", actionUrl: "/perfil/101" },
  { id: 2, type: "like", icon: Heart, text: "Ana Oliveira curtiu seu highlight", time: "15min", read: false, color: "text-destructive", actionUrl: "/perfil/2" },
  { id: 3, type: "view", icon: Eye, text: "Um olheiro visualizou seu perfil", time: "1h", read: false, color: "text-cyan" },
  { id: 4, type: "comment", icon: MessageCircle, text: 'Pedro Santos comentou: "Jogada incrível! 🔥"', time: "2h", read: false, color: "text-secondary", actionUrl: "/perfil/3" },
  { id: 5, type: "event", icon: Calendar, text: "Peneira Sub-17 Flamengo começa em 3 dias", time: "5h", read: true, color: "text-primary", actionUrl: "/eventos" },
  { id: 6, type: "achievement", icon: Trophy, text: 'Você alcançou o badge "Top Ativo"!', time: "1d", read: true, color: "text-secondary" },
  { id: 7, type: "follow", icon: UserPlus, text: "CT Ninho do Urubu começou a te seguir", time: "1d", read: true, color: "text-primary", actionUrl: "/perfil/201" },
  { id: 8, type: "like", icon: Heart, text: "12 pessoas curtiram seu novo vídeo", time: "2d", read: true, color: "text-destructive" },
  { id: 9, type: "view", icon: Eye, text: "Seu vídeo atingiu 1K visualizações 🎉", time: "3d", read: true, color: "text-cyan" },
  { id: 10, type: "event", icon: Calendar, text: "Lembrete: Torneio de Karatê amanhã!", time: "3d", read: true, color: "text-primary", actionUrl: "/eventos" },
  { id: 11, type: "comment", icon: MessageCircle, text: 'Maria Costa comentou: "Treino top!"', time: "4d", read: true, color: "text-secondary", actionUrl: "/perfil/4" },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(mockNotifications);
  const [tab, setTab] = useState<"todas" | "nao-lidas">("todas");
  const [filterType, setFilterType] = useState<NotificationType | "todas">("todas");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("Todas as notificações marcadas como lidas");
  };

  const markRead = (id: number) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast("Notificação removida");
  };

  const handleNotificationClick = (n: Notification) => {
    markRead(n.id);
    if (n.actionUrl) navigate(n.actionUrl);
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("Todas as notificações foram removidas");
  };

  const displayedNotifications = notifications.filter((n) => {
    const matchTab = tab === "todas" || !n.read;
    const matchFilter = filterType === "todas" || n.type === filterType;
    return matchTab && matchFilter;
  });

  const filterOptions: { key: NotificationType | "todas"; label: string; icon: typeof Bell }[] = [
    { key: "todas", label: "Todas", icon: Bell },
    { key: "follow", label: "Seguidores", icon: UserPlus },
    { key: "like", label: "Curtidas", icon: Heart },
    { key: "view", label: "Visualizações", icon: Eye },
    { key: "comment", label: "Comentários", icon: MessageCircle },
    { key: "event", label: "Eventos", icon: Calendar },
    { key: "achievement", label: "Conquistas", icon: Trophy },
  ];

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
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="text-primary p-1" title="Marcar todas como lidas">
                <CheckCheck className="w-4 h-4" />
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearAll} className="text-muted-foreground hover:text-destructive p-1" title="Limpar todas">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Filter chips */}
      <div className="sticky top-[57px] z-40 glass border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {filterOptions.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilterType(f.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all whitespace-nowrap ${
                  filterType === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <f.icon className="w-3 h-3" />
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="w-full bg-muted mb-4 h-10">
            <TabsTrigger value="todas" className="flex-1 font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Todas ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="nao-lidas" className="flex-1 font-display text-xs data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
              Não lidas ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="space-y-1 animate-slide-up">
            {displayedNotifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {tab === "nao-lidas" ? "Nenhuma notificação não lida." : "Nenhuma notificação."}
                </p>
              </div>
            ) : (
              displayedNotifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left group ${
                    n.read ? "opacity-60 hover:opacity-80" : "glass-card hover:bg-muted/30"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.read ? "bg-muted" : "bg-primary/10"}`}>
                    <n.icon className={`w-4 h-4 ${n.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-2" />}
                    <button
                      onClick={(e) => deleteNotification(n.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 transition-opacity"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </button>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Notifications;
