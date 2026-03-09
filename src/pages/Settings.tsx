import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowLeft, Bell, Globe, Moon, Sun, Shield, Lock, Trash2, LogOut, ChevronRight,
  Crown, HelpCircle, FileText, Info, Smartphone, Loader2,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);

  const isDark = theme === "dark";

  const handleSignOut = async () => {
    await signOut();
    toast.success("Você saiu da conta");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    // Delete profile data first
    if (user) {
      await supabase.from("profiles").delete().eq("id", user.id);
    }
    await signOut();
    setDeletingAccount(false);
    toast.success("Conta excluída com sucesso");
    navigate("/");
  };

  const settingsSections = [
    {
      title: "Conta",
      items: [
        { icon: Crown, label: "Talent Pro", desc: "Gerencie sua assinatura", action: () => navigate("/assinatura"), badge: "PRO", badgeColor: "bg-secondary/20 text-secondary" },
        ...(isAdmin ? [{ icon: Shield, label: "Painel Admin", desc: "Acesso ao painel de administração", action: () => navigate("/admin"), badge: "ADMIN", badgeColor: "bg-destructive/20 text-destructive" }] : []),
        { icon: Lock, label: "Alterar Senha", desc: "Atualize sua senha de acesso", action: async () => {
          if (user?.email) {
            await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/login` });
            toast.success("Link de redefinição enviado para seu e-mail!");
          }
        }},
        { icon: Shield, label: "Privacidade", desc: "Controle quem vê seu perfil", action: () => navigate("/privacidade") },
        { icon: Smartphone, label: "Sessões Ativas", desc: "Gerencie dispositivos conectados", action: () => toast.info("Funcionalidade disponível em breve") },
      ],
    },
    {
      title: "Notificações",
      items: [
        { icon: Bell, label: "Notificações In-App", desc: "Receba alertas dentro do app", toggle: true, value: notifications, onChange: setNotifications },
        { icon: Bell, label: "Push Notifications", desc: "Alertas no celular", toggle: true, value: pushNotifications, onChange: setPushNotifications },
      ],
    },
    {
      title: "Aparência",
      items: [
        {
          icon: isDark ? Moon : Sun,
          label: "Tema",
          desc: isDark ? "Modo Escuro ativo" : "Modo Claro ativo",
          toggle: true,
          value: isDark,
          onChange: (val: boolean) => {
            setTheme(val ? "dark" : "light");
            toast.success(val ? "Modo escuro ativado" : "Modo claro ativado");
          },
        },
      ],
    },
    {
      title: "Preferências",
      items: [
        { icon: Globe, label: "Idioma", desc: "Português (BR)", action: () => toast.info("Funcionalidade disponível em breve") },
        { icon: Globe, label: "Localização", desc: "Acesso à geolocalização", toggle: true, value: locationAccess, onChange: setLocationAccess },
        { icon: Shield, label: "Login Biométrico", desc: "Use impressão digital ou rosto", toggle: true, value: biometricLogin, onChange: setBiometricLogin },
      ],
    },
    {
      title: "Sobre",
      items: [
        { icon: Info, label: "Sobre o TalentRadar", desc: "Versão 1.0.0", action: () => navigate("/sobre") },
        { icon: FileText, label: "Termos de Uso", desc: "Leia nossos termos", action: () => navigate("/termos") },
        { icon: Shield, label: "Política de Privacidade", desc: "Como tratamos seus dados", action: () => navigate("/privacidade") },
        { icon: HelpCircle, label: "Central de Ajuda", desc: "Dúvidas e suporte", action: () => navigate("/central-ajuda") },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-lg text-foreground">Configurações</span>
          <div className="w-5" />
        </div>
      </header>

      {user && (
        <div className="max-w-2xl mx-auto px-4 pt-4">
          <div className="glass-card rounded-xl p-4 border border-primary/20 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-display font-bold text-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground">Conta verificada</p>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-slide-up">
        {settingsSections.map((section) => (
          <div key={section.title}>
            <h2 className="font-display font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3 px-1">
              {section.title}
            </h2>
            <div className="glass-card rounded-xl overflow-hidden divide-y divide-border/30">
              {section.items.map((item) => (
                <div
                  key={item.label}
                  onClick={item.action}
                  className={`flex items-center justify-between p-4 ${item.action ? "cursor-pointer hover:bg-muted/30" : ""} transition-colors`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <item.icon className="w-4.5 h-4.5 text-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{item.label}</p>
                        {item.badge && (
                          <Badge className={`${item.badgeColor} border-0 text-[9px]`}>{item.badge}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  {item.toggle ? (
                    <Switch checked={item.value} onCheckedChange={item.onChange} onClick={(e) => e.stopPropagation()} />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger zone */}
        <div>
          <h2 className="font-display font-bold text-sm text-destructive uppercase tracking-wider mb-3 px-1">
            Zona de Risco
          </h2>
          <div className="glass-card rounded-xl overflow-hidden divide-y divide-border/30">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <LogOut className="w-4.5 h-4.5 text-destructive" />
                  </div>
                  <p className="text-sm font-medium text-destructive">Sair da Conta</p>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Sair da Conta</AlertDialogTitle>
                  <AlertDialogDescription>Tem certeza que deseja sair da sua conta?</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>Sair</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Trash2 className="w-4.5 h-4.5 text-destructive" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium text-destructive">Excluir Conta</p>
                    <p className="text-xs text-muted-foreground">Ação irreversível</p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Excluir Conta</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação é irreversível. Todos os seus dados, vídeos e conexões serão permanentemente excluídos.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount}
                  >
                    {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Excluir Permanentemente
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-4">
          TalentRadar v1.0.0 • © 2026
        </p>
      </main>

      <BottomNav />
    </div>
  );
};

export default Settings;
