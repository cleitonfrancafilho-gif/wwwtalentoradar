import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bell, Heart, UserPlus, Eye, MessageCircle, Calendar, Trophy, CheckCheck, Trash2, Star, Flag,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

interface NotificationData {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  action_url: string | null;
  created_at: string;
}

const typeIcons: Record<string, typeof Bell> = {
  follow: UserPlus, like: Heart, view: Eye, comment: MessageCircle,
  event: Calendar, achievement: Trophy, top5: Star, favorite: Flag,
  recruitment: Calendar, admin_broadcast: Bell,
};

const typeColors: Record<string, string> = {
  follow: "text-primary", like: "text-destructive", view: "text-cyan",
  comment: "text-secondary", event: "text-primary", achievement: "text-secondary",
  top5: "text-secondary", favorite: "text-primary", recruitment: "text-cyan",
  admin_broadcast: "text-destructive",
};

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [tab, setTab] = useState<"todas" | "nao-lidas">("todas");
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);
    setNotifications((data as NotificationData[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadNotifications(); }, [user]);

  // Subscribe to new notifications
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("notif-realtime")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `user_id=eq.${user.id}`,
      }, (payload) => {
        setNotifications(prev => [payload.new as NotificationData, ...prev]);
        toast(payload.new.title, { description: payload.new.body });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = async () => {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast.success(lang === "en" ? "All marked as read" : "Todas as notificações marcadas como lidas");
  };

  const markRead = async (id: string) => {
    await supabase.from("notifications").update({ read: true }).eq("id", id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("notifications").delete().eq("id", id);
    setNotifications(prev => prev.filter(n => n.id !== id));
    toast(lang === "en" ? "Notification removed" : "Notificação removida");
  };

  const handleClick = (n: NotificationData) => {
    markRead(n.id);
    if (n.action_url) navigate(n.action_url);
  };

  const clearAll = async () => {
    if (!user) return;
    await supabase.from("notifications").delete().eq("user_id", user.id);
    setNotifications([]);
    toast.success(lang === "en" ? "All notifications cleared" : "Todas as notificações foram removidas");
  };

  const displayedNotifications = notifications.filter((n) => tab === "todas" || !n.read);

  const getRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return lang === "en" ? "now" : "agora";
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    const days = Math.floor(hrs / 24);
    return `${days}d`;
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
            <span className="font-display font-bold text-lg text-foreground">{t("Notificações", lang)}</span>
            {unreadCount > 0 && <Badge className="bg-destructive text-destructive-foreground border-0 text-[10px]">{unreadCount}</Badge>}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && <button onClick={markAllRead} className="text-primary p-1" title="Marcar todas como lidas"><CheckCheck className="w-4 h-4" /></button>}
            {notifications.length > 0 && <button onClick={clearAll} className="text-muted-foreground hover:text-destructive p-1" title="Limpar todas"><Trash2 className="w-4 h-4" /></button>}
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="w-full bg-muted mb-4 h-10">
            <TabsTrigger value="todas" className="flex-1 font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              {lang === "en" ? "All" : "Todas"} ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="nao-lidas" className="flex-1 font-display text-xs data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
              {lang === "en" ? "Unread" : "Não lidas"} ({unreadCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="space-y-1 animate-slide-up">
            {loading ? (
              <div className="flex justify-center py-16"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : displayedNotifications.length === 0 ? (
              <div className="text-center py-16">
                <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {tab === "nao-lidas"
                    ? (lang === "en" ? "No unread notifications." : "Nenhuma notificação não lida.")
                    : (lang === "en" ? "No notifications." : "Nenhuma notificação.")
                  }
                </p>
              </div>
            ) : (
              displayedNotifications.map((n) => {
                const Icon = typeIcons[n.type] || Bell;
                const color = typeColors[n.type] || "text-primary";
                return (
                  <button
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl transition-colors text-left group ${
                      n.read ? "opacity-60 hover:opacity-80" : "glass-card hover:bg-muted/30"
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${n.read ? "bg-muted" : "bg-primary/10"}`}>
                      <Icon className={`w-4 h-4 ${color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${n.read ? "text-muted-foreground" : "text-foreground font-medium"}`}>{n.body}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{getRelativeTime(n.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {!n.read && <span className="w-2 h-2 rounded-full bg-primary mt-2" />}
                      <button onClick={(e) => deleteNotification(n.id, e)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive p-1 transition-opacity">
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </button>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Notifications;
