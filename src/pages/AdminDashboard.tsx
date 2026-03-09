import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { Radar, Shield, Users, Activity, AlertTriangle, Search, RotateCcw, Bell, Settings, ArrowLeft, Server, TrendingUp, UserCog, Crown, Check, X, Loader2, RefreshCw } from "lucide-react";
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
    const { data, error } = await supabase.from("profiles").select("id, full_name, email, profile_type, created_at").order("created_at", { ascending: false }).limit(100);
    if (error) { toast.error("Erro: " + error.message); setLoadingUsers(false); return; }
    const userIds = (data || []).map((u) => u.id);
    const { data: subs } = await supabase.from("subscriptions").select("user_id, status, plan").in("user_id", userIds);
    const subsMap: Record<string, { status: string; plan: string }> = {};
    (subs || []).forEach((s) => { subsMap[s.user_id] = { status: s.status, plan: s.plan }; });
    const enriched = (data || []).map((u) => ({ ...u, subscription: subsMap[u.id] || null }));
    setUsers(enriched);
    setTotalUsers(enriched.length);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    setNewToday(enriched.filter((u) => new Date(u.created_at) >= today).length);
    setActiveSubscriptions(enriched.filter((u) => u.subscription?.status === "active").length);
    setLoadingUsers(false);
  };

  useEffect(() => { fetchUsers(); }, []);

  const filteredUsers = users.filter((u) =>
    u.full_name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const handleGrantSubscription = async () => {
    if (!selectedUser) return;
    setGrantLoading(true);
    const days = parseInt(grantDays) || 30;
    const periodEnd = new Date(); periodEnd.setDate(periodEnd.getDate() + days);
    const { data: existing } = await supabase.from("subscriptions").select("id").eq("user_id", selectedUser.id).maybeSingle();
    const payload = { user_id: selectedUser.id, status: "active" as const, plan: "pro", granted_by: user?.id, granted_at: new Date().toISOString(), current_period_start: new Date().toISOString(), current_period_end: periodEnd.toISOString(), updated_at: new Date().toISOString() };
    const result = existing?.id ? await supabase.from("subscriptions").update(payload).eq("id", existing.id) : await supabase.from("subscriptions").insert(payload);
    if (result.error) { toast.error("Erro: " + result.error.message); } else { toast.success(`✅ Talent Pro concedido para ${selectedUser.full_name} por ${days} dias`); setGrantDialog(false); setSelectedUser(null); await fetchUsers(); }
    setGrantLoading(false);
  };

  const handleRevokeSubscription = async () => {
    if (!selectedUser) return;
    setGrantLoading(true);
    const { error } = await supabase.from("subscriptions").update({ status: "canceled", updated_at: new Date().toISOString() }).eq("user_id", selectedUser.id);
    if (error) { toast.error("Erro: " + error.message); } else { toast.success(`Assinatura de ${selectedUser.full_name} revogada.`); setRevokeDialog(false); setSelectedUser(null); await fetchUsers(); }
    setGrantLoading(false);
  };

  const handleResetPassword = async (userEmail: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, { redirectTo: `${window.location.origin}/login` });
    if (error) toast.error("Erro: " + error.message); else toast.success(`Link de reset enviado para ${userEmail}`);
  };

  const getSubBadge = (sub: UserRow["subscription"]) => {
    if (!sub || sub.status === "inactive") return <Badge className="text-xs bg-muted text-muted-foreground border-0">Free</Badge>;
    if (sub.status === "active") return <Badge className="text-xs bg-primary/20 text-primary border-primary/30">PRO</Badge>;
    return <Badge className="text-xs bg-destructive/20 text-destructive border-destructive/30">{sub.status}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Dialog open={grantDialog} onOpenChange={setGrantDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground flex items-center gap-2"><Crown className="w-5 h-5 text-primary" /> Conceder Talent Pro</DialogTitle>
            <DialogDescription className="text-muted-foreground">Para: <strong className="text-foreground">{selectedUser?.full_name}</strong></DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label className="text-foreground text-sm">Duração (dias)</Label>
            <Input type="number" min="1" value={grantDays} onChange={(e) => setGrantDays(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground" />
            <p className="text-xs text-muted-foreground mt-1">Expira: {new Date(Date.now() + parseInt(grantDays || "30") * 86400000).toLocaleDateString("pt-BR")}</p>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setGrantDialog(false)}>Cancelar</Button>
            <Button onClick={handleGrantSubscription} disabled={grantLoading}>
              {grantLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Crown className="w-4 h-4 mr-2" />} Conceder Pro
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={revokeDialog} onOpenChange={setRevokeDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">Revogar Assinatura</DialogTitle>
            <DialogDescription className="text-muted-foreground">Revogar Pro de <strong className="text-foreground">{selectedUser?.full_name}</strong>?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRevokeDialog(false)}>Cancelar</Button>
            <Button variant="destructive" onClick={handleRevokeSubscription} disabled={grantLoading}>{grantLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}Revogar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="w-5 h-5" /></button>
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">Admin<span className="text-gradient-neon">Panel</span></span>
            <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-xs">SUPER ADMIN</Badge>
          </div>
          {maintenanceMode && <Badge className="bg-secondary/20 text-secondary border-secondary/30 animate-pulse text-xs"><AlertTriangle className="w-3 h-3 mr-1" /> MANUTENÇÃO</Badge>}
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
              <div className="flex items-center gap-2 mb-1"><stat.icon className={`w-4 h-4 ${stat.color}`} /><span className="text-xs text-muted-foreground">{stat.label}</span></div>
              <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid grid-cols-5 w-full bg-muted mb-6 h-11">
            <TabsTrigger value="users" className="font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><Users className="w-3.5 h-3.5 mr-1" /> Usuários</TabsTrigger>
            <TabsTrigger value="subscriptions" className="font-display text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"><Crown className="w-3.5 h-3.5 mr-1" /> Assinaturas</TabsTrigger>
            <TabsTrigger value="tools" className="font-display text-xs data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground"><AlertTriangle className="w-3.5 h-3.5 mr-1" /> Pânico</TabsTrigger>
            <TabsTrigger value="health" className="font-display text-xs data-[state=active]:bg-cyan data-[state=active]:text-primary-foreground"><Activity className="w-3.5 h-3.5 mr-1" /> Saúde</TabsTrigger>
            <TabsTrigger value="settings" className="font-display text-xs data-[state=active]:bg-muted-foreground data-[state=active]:text-foreground"><Settings className="w-3.5 h-3.5 mr-1" /> Config</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Buscar por nome ou e-mail..." value={searchUser} onChange={(e) => setSearchUser(e.target.value)} className="pl-10 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <Button variant="outline" size="icon" onClick={fetchUsers}><RefreshCw className="w-4 h-4" /></Button>
            </div>
            {loadingUsers ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhum usuário encontrado.</p>}
                {filteredUsers.map((u) => (
                  <div key={u.id} className="glass-card rounded-xl p-4 border border-transparent flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-display font-bold text-foreground truncate">{u.full_name || "(Sem nome)"}</span>
                        <Badge className="text-xs bg-muted text-muted-foreground border-0">{u.profile_type}</Badge>
                        {getSubBadge(u.subscription)}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="icon" variant="ghost" className="h-8 w-8" title="Conceder Pro" onClick={() => { setSelectedUser(u); setGrantDialog(true); }}><Crown className="w-4 h-4 text-secondary" /></Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8" title="Resetar senha" onClick={() => handleResetPassword(u.email)}><RotateCcw className="w-4 h-4 text-muted-foreground" /></Button>
                      {u.subscription?.status === "active" && <Button size="icon" variant="ghost" className="h-8 w-8" title="Revogar Pro" onClick={() => { setSelectedUser(u); setRevokeDialog(true); }}><X className="w-4 h-4 text-destructive" /></Button>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="subscriptions" className="space-y-4">
            <div className="glass-card rounded-xl p-6 border border-secondary/20 space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2"><Crown className="w-5 h-5 text-secondary" /> Assinantes Pro Ativos</h3>
              <div className="divide-y divide-border/30">
                {users.filter((u) => u.subscription?.status === "active").map((u) => (
                  <div key={u.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-display font-semibold text-foreground text-sm">{u.full_name}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="text-destructive h-7 text-xs" onClick={() => { setSelectedUser(u); setRevokeDialog(true); }}>Revogar</Button>
                  </div>
                ))}
                {users.filter((u) => u.subscription?.status === "active").length === 0 && <p className="text-muted-foreground text-sm py-4 text-center">Nenhum assinante Pro ativo.</p>}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4">
            <div className="glass-card rounded-xl p-6 border border-destructive/30 space-y-3">
              <h3 className="font-display font-bold text-destructive flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Kill Switch — Modo de Manutenção</h3>
              <div className="flex items-center gap-3">
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
                <span className={`text-sm font-display font-semibold ${maintenanceMode ? "text-destructive" : "text-primary"}`}>{maintenanceMode ? "ATIVADO" : "DESATIVADO"}</span>
              </div>
            </div>
            <div className="glass-card rounded-xl p-6 border border-primary/30 space-y-3">
              <h3 className="font-display font-bold text-primary flex items-center gap-2"><Bell className="w-5 h-5" /> Notificações Push em Massa</h3>
              <Input placeholder="Mensagem para todos os usuários..." className="bg-muted border-border text-foreground placeholder:text-muted-foreground" />
              <Button size="sm"><Bell className="w-3.5 h-3.5 mr-1.5" /> Enviar para Todos</Button>
            </div>
          </TabsContent>

          <TabsContent value="health" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[{ label: "API", status: "Online", ok: true }, { label: "Banco de Dados", status: "Online", ok: true }, { label: "Storage", status: "Online", ok: true }].map((s, i) => (
                <div key={i} className="glass-card rounded-xl p-4 border border-transparent">
                  <div className="flex items-center gap-2 mb-2"><div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" /><span className="font-display font-bold text-foreground text-sm">{s.label}</span></div>
                  <p className="text-lg font-display font-bold text-primary">{s.status}</p>
                </div>
              ))}
            </div>
            <div className="glass-card rounded-xl p-6 border border-primary/20">
              <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Métricas</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                {[{ label: "Usuários", value: totalUsers.toString() }, { label: "Novos Hoje", value: `+${newToday}` }, { label: "Pro Ativos", value: activeSubscriptions.toString() }].map((m, i) => (
                  <div key={i}><p className="text-xs text-muted-foreground">{m.label}</p><p className="text-xl font-display font-bold text-primary">{m.value}</p></div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="glass-card rounded-xl p-6 border border-transparent space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2"><UserCog className="w-4 h-4 text-secondary" /> Segurança do Sistema</h3>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Check className="w-4 h-4 text-primary" /><span className="text-sm text-primary font-display font-semibold">Painel protegido por RequireAdmin + RLS</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                <Shield className="w-4 h-4 text-primary" /><span className="text-sm text-primary font-display font-semibold">E-mail confirmado automaticamente</span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
