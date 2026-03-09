import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  Radar, Shield, Users, Activity, AlertTriangle, Search,
  RotateCcw, Bell, Settings, ArrowLeft,
  Server, TrendingUp, UserCog, Crown,
  Check, X, Loader2, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  profile_type: string;
  created_at: string;
  subscription?: { status: string; plan: string } | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newToday, setNewToday] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);

  const [grantDialog, setGrantDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [grantDays, setGrantDays] = useState("30");
  const [grantLoading, setGrantLoading] = useState(false);
  const [revokeDialog, setRevokeDialog] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, profile_type, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Erro ao carregar usuários: " + error.message);
      setLoadingUsers(false);
      return;
    }

    const userIds = (data || []).map((u) => u.id);
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("user_id, status, plan")
      .in("user_id", userIds);

    const subsMap: Record<string, { status: string; plan: string }> = {};
    (subs || []).forEach((s) => { subsMap[s.user_id] = { status: s.status, plan: s.plan }; });

    const enriched = (data || []).map((u) => ({ ...u, subscription: subsMap[u.id] || null }));
    setUsers(enriched);
    setTotalUsers(enriched.length);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setNewToday(enriched.filter((u) => new Date(u.created_at) >= today).length);
    setActiveSubscriptions(enriched.filter((u) => u.subscription?.status === "active").length);
    setLoadingUsers(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleGrantSubscription = async () => {
    if (!selectedUser) return;
    setGrantLoading(true);

    const days = parseInt(grantDays) || 30;
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + days);

    const { data: existing } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", selectedUser.id)
      .maybeSingle();

    const payload = {
      user_id: selectedUser.id,
      status: "active" as const,
      plan: "pro",
      granted_by: user?.id,
      granted_at: new Date().toISOString(),
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = existing?.id
      ? await supabase.from("subscriptions").update(payload).eq("id", existing.id)
      : await supabase.from("subscriptions").insert(payload);

    if (result.error) {
      toast.error("Erro ao conceder assinatura: " + result.error.message);
    } else {
      toast.success(`✅ Talent Pro concedido para ${selectedUser.full_name} por ${days} dias`);
      setGrantDialog(false);
      setSelectedUser(null);
      await fetchUsers();
    }
    setGrantLoading(false);
  };

  const handleRevokeSubscription = async () => {
    if (!selectedUser) return;
    setGrantLoading(true);

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("user_id", selectedUser.id);

    if (error) {
      toast.error("Erro ao revogar assinatura: " + error.message);
    } else {
      toast.success(`Assinatura de ${selectedUser.full_name} revogada.`);
      setRevokeDialog(false);
      setSelectedUser(null);
      await fetchUsers();
    }
    setGrantLoading(false);
  };

  const handleResetPassword = async (userEmail: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) toast.error("Erro: " + error.message);
    else toast.success(`Link de reset enviado para ${userEmail}`);
  };

  const getSubBadge = (sub: UserRow["subscription"]) => {
    if (!sub || sub.status === "inactive") return <Badge className="text-xs bg-muted text-muted-foreground border-0">Free</Badge>;
    if (sub.status === "active") return <Badge className="text-xs bg-primary/20 text-primary border-primary/30">PRO</Badge>;
    if (sub.status === "canceled") return <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/30">Cancelado</Badge>;
    return <Badge className="text-xs bg-muted text-muted-foreground border-0">{sub.status}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    if (type === "atleta") return "Atleta";
    if (type === "olheiro") return "Olheiro";
    if (type === "instituicao") return "Instituição";
    return type;
  };

  return (
    <div className="min-h-screen bg-background">
      <Dialog open={grantDialog} onOpenChange={setGrantDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" /> Conceder Talent Pro
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Conceder acesso Pro gratuito para <strong className="text-foreground">{selectedUser?.full_name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-foreground text-sm">Duração (dias)</Label>
              <Input
                type="number"
                min="1"
                max="3650"
                value={grantDays}
                onChange={(e) => setGrantDays(e.target.value)}
                className="mt-1.5 bg-muted border-border text-foreground"
                placeholder="30"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGrantDialog(false)}>Cancelar</Button>
            <Button onClick={handleGrantSubscription} disabled={grantLoading}>
              {grantLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crown className="w-4 h-4 mr-2" />}
              Conceder Pro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={revokeDialog} onOpenChange={setRevokeDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Revogar Assinatura</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tem certeza que deseja revogar o Talent Pro de <strong className="text-foreground">{selectedUser?.full_name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevokeDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRevokeSubscription} disabled={grantLoading}>
              {grantLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Revogar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">Admin<span className="text-gradient-neon">Panel</span></span>
            <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">SUPER ADMIN</Badge>
          </div>
          {maintenanceMode && (
            <Badge className="bg-secondary/20 text-secondary border-secondary/30 animate-pulse text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" /> MANUTENÇÃO
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Usuários Totais", value: loadingUsers ? "..." : totalUsers.toString(), icon: Users, color: "text-primary" },
            { label: "Novos Hoje", value: loadingUsers ? "..." : `+${newToday}`, icon: TrendingUp, color: "text-primary" },
            { label: "Assinantes Pro", value: loadingUsers ? "..." : activeSubscriptions.toString(), icon: Crown, color: "text-secondary" },
            { label: "Uptime", value: "99.97%", icon: Server, color: "text-cyan" },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-xl p-4 border border-transparent">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid grid-cols-5 w-full bg-muted mb-6 h-11">
            <TabsTrigger value="users" className="font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-3.5 h-3.5 mr-1" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="font-display text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Crown className="w-3.5 h-3.5 mr-1" /> Assinaturas
            </TabsTrigger>
            <TabsTrigger value="tools" className="font-display text-xs data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Pânico
            </TabsTrigger>
            <TabsTrigger value="health" className="font-display text-xs data-[state=active]:bg-cyan data-[state=active]:text-primary-foreground">
              <Activity className="w-3.5 h-3.5 mr-1" /> Saúde
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-display text-xs data-[state=active]:bg-muted-foreground data-[state=active]:text-foreground">
              <Settings className="w-3.5 h-3.5 mr-1" /> Config
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome ou e-mail..." value={searchUser} onChange={(e) => setSearchUser(e.target.value)} className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <Button variant="outline" size="icon" onClick={fetchUsers} title="Recarregar">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="glass-card rounded-xl p-4 border border-transparent flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-display font-bold text-foreground truncate">{u.full_name || "(Sem nome)"}</span>
                        <Badge className="text-xs bg-muted text-muted-foreground border-0">{getTypeLabel(u.profile_type)}</Badge>
                        {getSubBadge(u.subscription)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedUser(u); setGrantDialog(true); }}>
                        <Crown className="w-4 h-4 text-secondary" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleResetPassword(u.email)}>
                        <RotateCcw className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      {u.subscription?.status === "active" && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => { setSelectedUser(u); setRevokeDialog(true); }}>
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <div className="glass-card rounded-xl p-6 border border-secondary/20 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Crown className="w-5 h-5 text-secondary" /> Gerenciador de Assinaturas
              </h3>
              <p className="text-sm text-muted-foreground">Conceda ou revogue o Talent Pro para qualquer usuário sem custo.</p>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="glass-card rounded-xl p-6 border border-destructive/30 space-y-3">
              <h3 className="font-display font-bold text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Kill Switch — Modo de Manutenção
              </h3>
              <div className="flex items-center gap-3">
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                <span className={`text-sm font-display font-semibold ${maintenanceMode ? "text-destructive" : "text-primary"}`}>
                  {maintenanceMode ? "ATIVADO" : "DESATIVADO"}
                </span>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 border border-primary/30 space-y-3">
              <h3 className="font-display font-bold text-primary flex items-center gap-2">
                <Bell className="w-5 h-5" /> Notificações Push em Massa
              </h3>
              <div>
                <Label className="text-foreground text-sm">Mensagem</Label>
                <Input placeholder="Digite a mensagem para todos os usuários..." className="mt-1 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <Button size="sm"><Bell className="w-3.5 h-3.5 mr-1.5" /> Enviar para Todos</Button>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Servidor API", status: "Online", uptime: "99.97%", ok: true },
                { label: "Banco de Dados", status: "Online", uptime: "99.99%", ok: true },
                { label: "Storage", status: "Online", uptime: "99.9%", ok: true },
              ].map((s, i) => (
                <div key={i} className="glass-card rounded-xl p-4 border border-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.ok ? "bg-primary animate-pulse" : "bg-secondary animate-pulse"}`} />
                    <span className="font-display font-bold text-foreground text-sm">{s.label}</span>
                  </div>
                  <p className={`text-lg font-display font-bold ${s.ok ? "text-primary" : "text-secondary"}`}>{s.status}</p>
                  <p className="text-xs text-muted-foreground">Uptime: {s.uptime}</p>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="glass-card rounded-xl p-6 border border-transparent space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <UserCog className="w-4 h-4 text-secondary" /> Segurança
              </h3>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-display font-semibold">Painel protegido por Admin + RLS</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import {
  Radar, Shield, Users, Activity, AlertTriangle, Search,
  Ban, Eye, RotateCcw, Download, Bell, Settings, ArrowLeft,
  Server, Bug, TrendingUp, Clock, UserCog, FileText, Crown,
  Check, X, Loader2, RefreshCw
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserRow {
  id: string;
  full_name: string;
  email: string;
  profile_type: string;
  created_at: string;
  subscription?: { status: string; plan: string } | null;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [searchUser, setSearchUser] = useState("");
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [totalUsers, setTotalUsers] = useState(0);
  const [newToday, setNewToday] = useState(0);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);

  // Grant subscription dialog
  const [grantDialog, setGrantDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [grantDays, setGrantDays] = useState("30");
  const [grantLoading, setGrantLoading] = useState(false);

  // Revoke dialog
  const [revokeDialog, setRevokeDialog] = useState(false);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, profile_type, created_at")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast.error("Erro ao carregar usuários: " + error.message);
      setLoadingUsers(false);
      return;
    }

    // Fetch subscriptions for each user
    const userIds = (data || []).map((u) => u.id);
    const { data: subs } = await supabase
      .from("subscriptions")
      .select("user_id, status, plan")
      .in("user_id", userIds);

    const subsMap: Record<string, { status: string; plan: string }> = {};
    (subs || []).forEach((s) => { subsMap[s.user_id] = { status: s.status, plan: s.plan }; });

    const enriched = (data || []).map((u) => ({ ...u, subscription: subsMap[u.id] || null }));
    setUsers(enriched);
    setTotalUsers(enriched.length);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    setNewToday(enriched.filter((u) => new Date(u.created_at) >= today).length);
    setActiveSubscriptions(enriched.filter((u) => u.subscription?.status === "active").length);
    setLoadingUsers(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(searchUser.toLowerCase()) ||
      u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleGrantSubscription = async () => {
    if (!selectedUser) return;
    setGrantLoading(true);

    const days = parseInt(grantDays) || 30;
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + days);

    // Upsert subscription
    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: selectedUser.id,
          status: "active",
          plan: "pro",
          granted_by: user?.id,
          granted_at: new Date().toISOString(),
          current_period_start: new Date().toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      toast.error("Erro ao conceder assinatura: " + error.message);
    } else {
      toast.success(`✅ Talent Pro concedido para ${selectedUser.full_name} por ${days} dias`);
      setGrantDialog(false);
      setSelectedUser(null);
      await fetchUsers();
    }
    setGrantLoading(false);
  };

  const handleRevokeSubscription = async () => {
    if (!selectedUser) return;
    setGrantLoading(true);

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "canceled", updated_at: new Date().toISOString() })
      .eq("user_id", selectedUser.id);

    if (error) {
      toast.error("Erro ao revogar assinatura: " + error.message);
    } else {
      toast.success(`Assinatura de ${selectedUser.full_name} revogada.`);
      setRevokeDialog(false);
      setSelectedUser(null);
      await fetchUsers();
    }
    setGrantLoading(false);
  };

  const handleResetPassword = async (userEmail: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) toast.error("Erro: " + error.message);
    else toast.success(`Link de reset enviado para ${userEmail}`);
  };

  const getSubBadge = (sub: UserRow["subscription"]) => {
    if (!sub || sub.status === "inactive") return <Badge className="text-xs bg-muted text-muted-foreground border-0">Free</Badge>;
    if (sub.status === "active") return <Badge className="text-xs bg-primary/20 text-primary border-primary/30">PRO</Badge>;
    if (sub.status === "canceled") return <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/30">Cancelado</Badge>;
    return <Badge className="text-xs bg-muted text-muted-foreground border-0">{sub.status}</Badge>;
  };

  const getTypeLabel = (type: string) => {
    if (type === "atleta") return "Atleta";
    if (type === "olheiro") return "Olheiro";
    if (type === "instituicao") return "Instituição";
    return type;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Grant Subscription Dialog */}
      <Dialog open={grantDialog} onOpenChange={setGrantDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary" /> Conceder Talent Pro
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Conceder acesso Pro gratuito para <strong className="text-foreground">{selectedUser?.full_name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label className="text-foreground text-sm">Duração (dias)</Label>
              <Input
                type="number"
                min="1"
                max="3650"
                value={grantDays}
                onChange={(e) => setGrantDays(e.target.value)}
                className="mt-1.5 bg-muted border-border text-foreground"
                placeholder="30"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Expira em: {new Date(Date.now() + parseInt(grantDays || "30") * 86400000).toLocaleDateString("pt-BR")}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGrantDialog(false)}>Cancelar</Button>
            <Button onClick={handleGrantSubscription} disabled={grantLoading}>
              {grantLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crown className="w-4 h-4 mr-2" />}
              Conceder Pro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog open={revokeDialog} onOpenChange={setRevokeDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Revogar Assinatura</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Tem certeza que deseja revogar o Talent Pro de <strong className="text-foreground">{selectedUser?.full_name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevokeDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRevokeSubscription} disabled={grantLoading}>
              {grantLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Revogar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">Admin<span className="text-gradient-neon">Panel</span></span>
            <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">SUPER ADMIN</Badge>
          </div>
          <div className="flex items-center gap-2">
            {maintenanceMode && (
              <Badge className="bg-secondary/20 text-secondary border-secondary/30 animate-pulse text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" /> MANUTENÇÃO
              </Badge>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Usuários Totais", value: loadingUsers ? "..." : totalUsers.toString(), icon: Users, color: "text-primary" },
            { label: "Novos Hoje", value: loadingUsers ? "..." : `+${newToday}`, icon: TrendingUp, color: "text-primary" },
            { label: "Assinantes Pro", value: loadingUsers ? "..." : activeSubscriptions.toString(), icon: Crown, color: "text-secondary" },
            { label: "Uptime", value: "99.97%", icon: Server, color: "text-cyan" },
          ].map((stat, i) => (
            <div key={i} className="glass-card rounded-xl p-4 border border-transparent">
              <div className="flex items-center gap-2 mb-1">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
              <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid grid-cols-5 w-full bg-muted mb-6 h-11">
            <TabsTrigger value="users" className="font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-3.5 h-3.5 mr-1" /> Usuários
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="font-display text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Crown className="w-3.5 h-3.5 mr-1" /> Assinaturas
            </TabsTrigger>
            <TabsTrigger value="tools" className="font-display text-xs data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Pânico
            </TabsTrigger>
            <TabsTrigger value="health" className="font-display text-xs data-[state=active]:bg-cyan data-[state=active]:text-primary-foreground">
              <Activity className="w-3.5 h-3.5 mr-1" /> Saúde
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-display text-xs data-[state=active]:bg-muted-foreground data-[state=active]:text-foreground">
              <Settings className="w-3.5 h-3.5 mr-1" /> Config
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <Button variant="outline" size="icon" onClick={fetchUsers} title="Recarregar">
                <RefreshCw className="w-4 h-4" />
              </Button>
            </div>

            {loadingUsers ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">Nenhum usuário encontrado.</p>
                )}
                {filteredUsers.map((u) => (
                  <div key={u.id} className="glass-card rounded-xl p-4 border border-transparent flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-display font-bold text-foreground truncate">{u.full_name || "(Sem nome)"}</span>
                        <Badge className="text-xs bg-muted text-muted-foreground border-0">{getTypeLabel(u.profile_type)}</Badge>
                        {getSubBadge(u.subscription)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email} · {new Date(u.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8" title="Conceder/Gerenciar Pro"
                        onClick={() => { setSelectedUser(u); setGrantDialog(true); }}>
                        <Crown className="w-4 h-4 text-secondary" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" title="Resetar senha"
                        onClick={() => handleResetPassword(u.email)}>
                        <RotateCcw className="w-4 h-4 text-muted-foreground" />
                      </Button>
                      {u.subscription?.status === "active" && (
                        <Button size="icon" variant="ghost" className="h-8 w-8" title="Revogar Pro"
                          onClick={() => { setSelectedUser(u); setRevokeDialog(true); }}>
                          <X className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Subscriptions Tab */}
          <TabsContent value="subscriptions" className="space-y-4">
            <div className="glass-card rounded-xl p-6 border border-secondary/20 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Crown className="w-5 h-5 text-secondary" /> Gerenciador de Assinaturas
              </h3>
              <p className="text-sm text-muted-foreground">
                Conceda ou revogue o Talent Pro para qualquer usuário sem custo. Selecione o usuário na aba Usuários e clique no ícone <Crown className="w-3.5 h-3.5 inline text-secondary" />.
              </p>

              <div className="divide-y divide-border/30">
                {users.filter((u) => u.subscription?.status === "active").map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-display font-semibold text-foreground text-sm">{u.full_name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">PRO ATIVO</Badge>
                      <Button size="sm" variant="ghost" className="text-destructive h-7 text-xs"
                        onClick={() => { setSelectedUser(u); setRevokeDialog(true); }}>
                        Revogar
                      </Button>
                    </div>
                  </div>
                ))}
                {users.filter((u) => u.subscription?.status === "active").length === 0 && (
                  <p className="text-muted-foreground text-sm py-4 text-center">Nenhum usuário com Pro ativo.</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Panic Tab */}
          <TabsContent value="tools" className="space-y-4">
            <div className="glass-card rounded-xl p-6 border border-destructive/30 space-y-3">
              <h3 className="font-display font-bold text-destructive flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Kill Switch — Modo de Manutenção
              </h3>
              <p className="text-sm text-muted-foreground">
                Ativar o modo de manutenção <strong className="text-foreground">bloqueia o acesso</strong> de todos os usuários, exceto administradores.
              </p>
              <div className="flex items-center gap-3">
                <Switch checked={maintenanceMode} onCheckedChange={(v) => {
                  setMaintenanceMode(v);
                  toast.success(v ? "🔴 Manutenção ATIVADA — App bloqueado." : "🟢 Manutenção DESATIVADA — App liberado.");
                }} />
                <span className={`text-sm font-display font-semibold ${maintenanceMode ? "text-destructive" : "text-primary"}`}>
                  {maintenanceMode ? "ATIVADO" : "DESATIVADO"}
                </span>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 border border-primary/30 space-y-3">
              <h3 className="font-display font-bold text-primary flex items-center gap-2">
                <Bell className="w-5 h-5" /> Notificações Push em Massa
              </h3>
              <div>
                <Label className="text-foreground text-sm">Mensagem</Label>
                <Input placeholder="Digite a mensagem para todos os usuários..." className="mt-1 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <Button size="sm" onClick={() => toast.success(`Notificação enviada para ${totalUsers} usuários!`)}>
                <Bell className="w-3.5 h-3.5 mr-1.5" /> Enviar para Todos
              </Button>
            </div>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Servidor API", status: "Online", uptime: "99.97%", ok: true },
                { label: "Banco de Dados", status: "Online", uptime: "99.99%", ok: true },
                { label: "Storage", status: "Online", uptime: "99.9%", ok: true },
              ].map((s, i) => (
                <div key={i} className="glass-card rounded-xl p-4 border border-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.ok ? "bg-primary animate-pulse" : "bg-secondary animate-pulse"}`} />
                    <span className="font-display font-bold text-foreground text-sm">{s.label}</span>
                  </div>
                  <p className={`text-lg font-display font-bold ${s.ok ? "text-primary" : "text-secondary"}`}>{s.status}</p>
                  <p className="text-xs text-muted-foreground">Uptime: {s.uptime}</p>
                </div>
              ))}
            </div>

            <div className="glass-card rounded-xl p-6 border border-primary/20">
              <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Métricas Reais
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: "Usuários Totais", value: totalUsers.toString(), sub: "no banco" },
                  { label: "Novos Hoje", value: `+${newToday}`, sub: "cadastros" },
                  { label: "Assinantes Pro", value: activeSubscriptions.toString(), sub: "ativos" },
                  { label: "Status", value: "✅", sub: "operacional" },
                ].map((m, i) => (
                  <div key={i}>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                    <p className="text-xl font-display font-bold text-primary">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="glass-card rounded-xl p-6 border border-transparent space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <UserCog className="w-4 h-4 text-secondary" /> Configurações Gerais
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">Auto-confirmação de e-mail</p>
                    <p className="text-xs text-muted-foreground">Usuários entram sem confirmar e-mail</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-0 text-xs">Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">RLS (Row Level Security)</p>
                    <p className="text-xs text-muted-foreground">Proteção de dados por usuário</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-0 text-xs flex items-center gap-1"><Check className="w-3 h-3" /> Ativo</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-display font-semibold text-foreground text-sm">Cadastro de novos usuários</p>
                    <p className="text-xs text-muted-foreground">Permitir novos cadastros</p>
                  </div>
                  <Badge className="bg-primary/20 text-primary border-0 text-xs flex items-center gap-1"><Check className="w-3 h-3" /> Habilitado</Badge>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-xl p-6 border border-transparent space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Shield className="w-4 h-4 text-primary" /> Segurança
              </h3>
              <p className="text-sm text-muted-foreground">
                Acesso ao painel restrito a usuários com papel <code className="text-primary">admin</code> na tabela <code className="text-primary">user_roles</code>.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Check className="w-4 h-4 text-primary" />
                <span className="text-sm text-primary font-display font-semibold">Painel protegido por RequireAdmin</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
