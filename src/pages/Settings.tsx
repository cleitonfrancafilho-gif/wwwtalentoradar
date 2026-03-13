import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import {
  ArrowLeft, Bell, Globe, Moon, Sun, Shield, Lock, Trash2, LogOut, ChevronRight,
  Crown, HelpCircle, FileText, Info, Smartphone, Loader2, Languages,
} from "lucide-react";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { user, signOut, isAdmin } = useAuth();
  const { lang, setLang } = useLanguage();
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showLangDialog, setShowLangDialog] = useState(false);

  const isDark = theme === "dark";

  const handleSignOut = async () => {
    await signOut();
    toast.success(lang === "en" ? "Signed out" : "Você saiu da conta");
    navigate("/");
  };

  const handleDeleteAccount = async () => {
    setDeletingAccount(true);
    if (user) {
      await supabase.from("profiles").delete().eq("id", user.id);
    }
    await signOut();
    setDeletingAccount(false);
    toast.success(lang === "en" ? "Account deleted" : "Conta excluída com sucesso");
    navigate("/");
  };

  const settingsSections = [
    {
      title: t("Conta", lang),
      items: [
        { icon: Crown, label: t("Talent Pro", lang), desc: t("Gerencie sua assinatura", lang), action: () => navigate("/assinatura"), badge: "PRO", badgeColor: "bg-secondary/20 text-secondary" },
        ...(isAdmin ? [{ icon: Shield, label: t("Painel Admin", lang), desc: t("Acesso ao painel de administração", lang), action: () => navigate("/admin"), badge: "ADMIN", badgeColor: "bg-destructive/20 text-destructive" }] : []),
        { icon: Lock, label: t("Alterar Senha", lang), desc: t("Atualize sua senha de acesso", lang), action: async () => {
          if (user?.email) {
            await supabase.auth.resetPasswordForEmail(user.email, { redirectTo: `${window.location.origin}/login` });
            toast.success(lang === "en" ? "Reset link sent to your email!" : "Link de redefinição enviado para seu e-mail!");
          }
        }},
        { icon: Shield, label: t("Privacidade", lang), desc: t("Controle quem vê seu perfil", lang), action: () => navigate("/privacidade") },
        { icon: Smartphone, label: t("Sessões Ativas", lang), desc: t("Gerencie dispositivos conectados", lang), action: () => toast.info(t("Funcionalidade disponível em breve", lang)) },
      ],
    },
    {
      title: t("Notificações", lang) || "Notificações",
      items: [
        { icon: Bell, label: t("Notificações In-App", lang), desc: t("Receba alertas dentro do app", lang), toggle: true, value: notifications, onChange: setNotifications },
        { icon: Bell, label: t("Push Notifications", lang), desc: t("Alertas no celular", lang), toggle: true, value: pushNotifications, onChange: setPushNotifications },
      ],
    },
    {
      title: t("Aparência", lang),
      items: [
        {
          icon: isDark ? Moon : Sun,
          label: t("Tema", lang),
          desc: isDark ? t("Modo Escuro ativo", lang) : t("Modo Claro ativo", lang),
          toggle: true,
          value: isDark,
          onChange: (val: boolean) => {
            setTheme(val ? "dark" : "light");
            toast.success(val ? (lang === "en" ? "Dark mode enabled" : "Modo escuro ativado") : (lang === "en" ? "Light mode enabled" : "Modo claro ativado"));
          },
        },
      ],
    },
    {
      title: t("Preferências", lang),
      items: [
        { icon: Languages, label: t("Idioma", lang), desc: lang === "en" ? "English" : "Português (BR)", action: () => setShowLangDialog(true) },
        { icon: Globe, label: t("Localização", lang), desc: t("Acesso à geolocalização", lang), toggle: true, value: locationAccess, onChange: setLocationAccess },
        { icon: Shield, label: t("Login Biométrico", lang), desc: t("Use impressão digital ou rosto", lang), toggle: true, value: biometricLogin, onChange: setBiometricLogin },
      ],
    },
    {
      title: t("Sobre", lang),
      items: [
        { icon: Info, label: t("Sobre o TalentRadar", lang), desc: "v1.0.0", action: () => navigate("/sobre") },
        { icon: FileText, label: t("Termos de Uso", lang), desc: t("Leia nossos termos", lang), action: () => navigate("/termos") },
        { icon: Shield, label: t("Política de Privacidade", lang), desc: t("Como tratamos seus dados", lang), action: () => navigate("/privacidade") },
        { icon: HelpCircle, label: t("Central de Ajuda", lang), desc: t("Dúvidas e suporte", lang), action: () => navigate("/central-ajuda") },
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
          <span className="font-display font-bold text-lg text-foreground">{t("Configurações", lang)}</span>
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
              <p className="text-xs text-muted-foreground">{t("Conta verificada", lang)}</p>
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
                        {item.badge && <Badge className={`${item.badgeColor} border-0 text-[9px]`}>{item.badge}</Badge>}
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
            {t("Zona de Risco", lang)}
          </h2>
          <div className="glass-card rounded-xl overflow-hidden divide-y divide-border/30">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
                  <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <LogOut className="w-4.5 h-4.5 text-destructive" />
                  </div>
                  <p className="text-sm font-medium text-destructive">{t("Sair da Conta", lang)}</p>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("Sair da Conta", lang)}</AlertDialogTitle>
                  <AlertDialogDescription>{t("Tem certeza que deseja sair da sua conta?", lang)}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("Cancelar", lang)}</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSignOut}>{t("Sair", lang)}</AlertDialogAction>
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
                    <p className="text-sm font-medium text-destructive">{t("Excluir Conta", lang)}</p>
                    <p className="text-xs text-muted-foreground">{t("Ação irreversível", lang)}</p>
                  </div>
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("Excluir Conta", lang)}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {lang === "en" 
                      ? "This action is irreversible. All your data, videos, and connections will be permanently deleted."
                      : "Esta ação é irreversível. Todos os seus dados, vídeos e conexões serão permanentemente excluídos."
                    }
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t("Cancelar", lang)}</AlertDialogCancel>
                  <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleDeleteAccount} disabled={deletingAccount}>
                    {deletingAccount ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {t("Excluir Permanentemente", lang)}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-4">TalentRadar v1.0.0 • © 2026</p>
      </main>

      {/* Language Dialog */}
      <Dialog open={showLangDialog} onOpenChange={setShowLangDialog}>
        <DialogContent className="bg-card border-border max-w-xs">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground flex items-center gap-2">
              <Languages className="w-5 h-5 text-primary" /> {t("Idioma", lang)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            {[
              { code: "pt" as const, label: "🇧🇷 Português (BR)" },
              { code: "en" as const, label: "🇺🇸 English" },
            ].map((option) => (
              <button
                key={option.code}
                onClick={() => { setLang(option.code); setShowLangDialog(false); toast.success(option.code === "en" ? "Language changed to English" : "Idioma alterado para Português"); }}
                className={`w-full p-3 rounded-xl text-left font-display font-semibold text-sm transition-colors ${
                  lang === option.code ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default Settings;
