import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import {
  Radar, Shield, Users, Activity, AlertTriangle, Search,
  Ban, Eye, RotateCcw, Download, Bell, Settings, ArrowLeft,
  Server, Bug, TrendingUp, Clock, UserCog, FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [searchUser, setSearchUser] = useState("");

  const mockUsers = [
    { id: "1", name: "João Silva", email: "joao@email.com", type: "Atleta", status: "Ativo", lastLogin: "Hoje, 14:30" },
    { id: "2", name: "Maria Santos", email: "maria@email.com", type: "Olheiro", status: "Ativo", lastLogin: "Ontem, 09:15" },
    { id: "3", name: "CT Furacão", email: "ct@furacao.com", type: "Instituição", status: "Suspenso", lastLogin: "3 dias atrás" },
    { id: "4", name: "Pedro Costa", email: "pedro@email.com", type: "Atleta", status: "Banido", lastLogin: "1 semana atrás" },
  ];

  const mockAuditLogs = [
    { time: "14:32:01", user: "admin", action: "Login no painel", ip: "189.40.xx.xx" },
    { time: "14:28:15", user: "admin", action: "Alterou permissão de Maria Santos", ip: "189.40.xx.xx" },
    { time: "13:55:44", user: "suporte01", action: "Visualizou ticket #482", ip: "200.18.xx.xx" },
    { time: "13:10:22", user: "admin", action: "Baniu usuário Pedro Costa (CPF)", ip: "189.40.xx.xx" },
    { time: "12:45:00", user: "financeiro01", action: "Exportou relatório de faturamento", ip: "177.92.xx.xx" },
  ];

  const mockErrors = [
    { time: "14:20", level: "error", message: "Timeout na conexão com storage (upload de vídeo)", count: 3 },
    { time: "13:45", level: "warning", message: "Rate limit atingido para IP 200.xx.xx.xx", count: 12 },
    { time: "12:30", level: "error", message: "Falha no envio de OTP para responsável", count: 1 },
  ];

  const filteredUsers = mockUsers.filter(u =>
    u.name.toLowerCase().includes(searchUser.toLowerCase()) ||
    u.email.toLowerCase().includes(searchUser.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo": return "bg-primary/20 text-primary border-primary/30";
      case "Suspenso": return "bg-secondary/20 text-secondary border-secondary/30";
      case "Banido": return "bg-destructive/20 text-destructive border-destructive/30";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
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
            { label: "Usuários Totais", value: "12.847", icon: Users, color: "text-primary" },
            { label: "Novos Hoje", value: "+84", icon: TrendingUp, color: "text-primary" },
            { label: "Tickets Abertos", value: "23", icon: FileText, color: "text-secondary" },
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
            <TabsTrigger value="audit" className="font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Clock className="w-3.5 h-3.5 mr-1" /> Auditoria
            </TabsTrigger>
            <TabsTrigger value="tools" className="font-display text-xs data-[state=active]:bg-destructive data-[state=active]:text-destructive-foreground">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" /> Pânico
            </TabsTrigger>
            <TabsTrigger value="health" className="font-display text-xs data-[state=active]:bg-cyan data-[state=active]:text-primary-foreground">
              <Activity className="w-3.5 h-3.5 mr-1" /> Saúde
            </TabsTrigger>
            <TabsTrigger value="settings" className="font-display text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
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
            </div>

            <div className="space-y-2">
              {filteredUsers.map((user) => (
                <div key={user.id} className="glass-card rounded-xl p-4 border border-transparent flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-bold text-foreground">{user.name}</span>
                      <Badge className="text-xs bg-muted text-muted-foreground">{user.type}</Badge>
                      <Badge className={`text-xs ${getStatusColor(user.status)}`}>{user.status}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email} · Último acesso: {user.lastLogin}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Impersonar"
                      onClick={() => toast({ title: "Impersonation", description: `Entrando como ${user.name}...` })}>
                      <Eye className="w-4 h-4 text-cyan" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Resetar senha"
                      onClick={() => toast({ title: "Senha resetada", description: `Link de reset enviado para ${user.email}` })}>
                      <RotateCcw className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8" title="Banir"
                      onClick={() => toast({ title: "Usuário banido", description: `${user.name} foi banido.`, variant: "destructive" })}>
                      <Ban className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Audit Tab */}
          <TabsContent value="audit" className="space-y-2">
            <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" /> Log de Auditoria em Tempo Real
            </h3>
            {mockAuditLogs.map((log, i) => (
              <div key={i} className="glass-card rounded-lg p-3 border border-transparent flex items-center gap-3 text-sm">
                <span className="text-xs text-muted-foreground font-mono min-w-[70px]">{log.time}</span>
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{log.user}</Badge>
                <span className="text-foreground flex-1">{log.action}</span>
                <span className="text-xs text-muted-foreground font-mono">{log.ip}</span>
              </div>
            ))}
          </TabsContent>

          {/* Panic Tab */}
          <TabsContent value="tools" className="space-y-4">
            {/* Kill Switch */}
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
                  toast({ title: v ? "🔴 Manutenção ATIVADA" : "🟢 Manutenção DESATIVADA", description: v ? "App travado para todos os usuários." : "App liberado." });
                }} />
                <span className={`text-sm font-display font-semibold ${maintenanceMode ? "text-destructive" : "text-primary"}`}>
                  {maintenanceMode ? "ATIVADO" : "DESATIVADO"}
                </span>
              </div>
            </div>

            {/* Soft Delete */}
            <div className="glass-card rounded-xl p-6 border border-secondary/30 space-y-3">
              <h3 className="font-display font-bold text-secondary flex items-center gap-2">
                <Shield className="w-5 h-5" /> Soft Delete — Lixeira de Segurança
              </h3>
              <p className="text-sm text-muted-foreground">Itens excluídos ficam ocultos por <strong className="text-foreground">30 dias</strong> antes da exclusão permanente. Apenas o Super Admin pode aprovar exclusões definitivas.</p>
              <Button variant="outline" size="sm" className="border-secondary/50 text-secondary hover:bg-secondary/10">
                Ver Itens na Lixeira (7)
              </Button>
            </div>

            {/* Backup */}
            <div className="glass-card rounded-xl p-6 border border-cyan/30 space-y-3">
              <h3 className="font-display font-bold text-cyan flex items-center gap-2">
                <Download className="w-5 h-5" /> Backup On-Demand
              </h3>
              <p className="text-sm text-muted-foreground">Baixe uma cópia completa do banco de dados a qualquer momento.</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="border-cyan/50 text-cyan hover:bg-cyan/10"
                  onClick={() => toast({ title: "Backup iniciado", description: "O download começará em instantes..." })}>
                  <Download className="w-3.5 h-3.5 mr-1.5" /> Baixar Backup Completo
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Último backup automático: Hoje, 03:00</p>
            </div>

            {/* Push Notifications */}
            <div className="glass-card rounded-xl p-6 border border-primary/30 space-y-3">
              <h3 className="font-display font-bold text-primary flex items-center gap-2">
                <Bell className="w-5 h-5" /> Notificações Push em Massa
              </h3>
              <div>
                <Label className="text-foreground text-sm">Mensagem</Label>
                <Input placeholder="Digite a mensagem para todos os usuários..." className="mt-1 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
              </div>
              <Button size="sm" onClick={() => toast({ title: "Notificação enviada!", description: "Todos os 12.847 usuários foram notificados." })}>
                <Bell className="w-3.5 h-3.5 mr-1.5" /> Enviar para Todos
              </Button>
            </div>
          </TabsContent>

          {/* Health Tab */}
          <TabsContent value="health" className="space-y-4">
            {/* Server Status */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: "Servidor API", status: "Online", uptime: "99.97%", color: "text-primary" },
                { label: "Banco de Dados", status: "Online", uptime: "99.99%", color: "text-primary" },
                { label: "Storage (S3)", status: "Degradado", uptime: "98.2%", color: "text-secondary" },
              ].map((s, i) => (
                <div key={i} className="glass-card rounded-xl p-4 border border-transparent">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${s.status === "Online" ? "bg-primary animate-pulse" : "bg-secondary animate-pulse"}`} />
                    <span className="font-display font-bold text-foreground text-sm">{s.label}</span>
                  </div>
                  <p className={`text-lg font-display font-bold ${s.color}`}>{s.status}</p>
                  <p className="text-xs text-muted-foreground">Uptime: {s.uptime}</p>
                </div>
              ))}
            </div>

            {/* Error Logs */}
            <div>
              <h3 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <Bug className="w-4 h-4 text-destructive" /> Logs de Erros Recentes
              </h3>
              <div className="space-y-2">
                {mockErrors.map((err, i) => (
                  <div key={i} className={`glass-card rounded-lg p-3 border ${err.level === "error" ? "border-destructive/20" : "border-secondary/20"} flex items-center gap-3 text-sm`}>
                    <Badge className={`text-xs ${err.level === "error" ? "bg-destructive/20 text-destructive border-destructive/30" : "bg-secondary/20 text-secondary border-secondary/30"}`}>
                      {err.level.toUpperCase()}
                    </Badge>
                    <span className="text-foreground flex-1">{err.message}</span>
                    <span className="text-xs text-muted-foreground">×{err.count}</span>
                    <span className="text-xs text-muted-foreground font-mono">{err.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Metrics */}
            <div className="glass-card rounded-xl p-6 border border-primary/20">
              <h3 className="font-display font-bold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" /> Métricas de Crescimento
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                {[
                  { label: "Esta semana", value: "+584", sub: "novos usuários" },
                  { label: "Este mês", value: "+2.341", sub: "novos usuários" },
                  { label: "Retenção", value: "78%", sub: "30 dias" },
                  { label: "MRR", value: "R$ 45.2k", sub: "receita mensal" },
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
                <UserCog className="w-4 h-4 text-secondary" /> Gestão de Staff
              </h3>
              <p className="text-sm text-muted-foreground">Gerencie as permissões de acesso dos funcionários.</p>
              <div className="space-y-2">
                {[
                  { name: "suporte01", role: "Suporte", perms: "Tickets, Chat" },
                  { name: "financeiro01", role: "Financeiro", perms: "Faturas, Relatórios" },
                  { name: "mod01", role: "Moderador", perms: "Conteúdo, Denúncias" },
                ].map((staff, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <span className="font-display font-semibold text-foreground text-sm">{staff.name}</span>
                      <span className="text-muted-foreground text-xs ml-2">({staff.role})</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{staff.perms}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm">
                <UserCog className="w-3.5 h-3.5 mr-1.5" /> Adicionar Staff
              </Button>
            </div>

            <div className="glass-card rounded-xl p-6 border border-transparent space-y-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Settings className="w-4 h-4 text-primary" /> Variáveis Globais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground text-sm">Banner Principal</Label>
                  <Input placeholder="Texto do banner..." className="mt-1 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <Label className="text-foreground text-sm">Taxa de Serviço (%)</Label>
                  <Input type="number" placeholder="5" className="mt-1 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
              </div>
              <Button size="sm" onClick={() => toast({ title: "Configurações salvas!", description: "Variáveis globais atualizadas com sucesso." })}>
                Salvar Configurações
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
