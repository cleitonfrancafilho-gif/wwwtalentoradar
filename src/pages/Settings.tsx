import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bell, Globe, Moon, Shield, Lock, Trash2, LogOut, ChevronRight,
  Crown, HelpCircle, FileText, Info, Smartphone,
} from "lucide-react";

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [locationAccess, setLocationAccess] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(false);

  const settingsSections = [
    {
      title: "Conta",
      items: [
        { icon: Crown, label: "Talent Pro", desc: "Gerencie sua assinatura", action: () => navigate("/assinatura"), badge: "PRO", badgeColor: "bg-secondary/20 text-secondary" },
        { icon: Lock, label: "Alterar Senha", desc: "Atualize sua senha de acesso", action: () => {} },
        { icon: Shield, label: "Privacidade", desc: "Controle quem vê seu perfil", action: () => navigate("/privacidade") },
        { icon: Smartphone, label: "Sessões Ativas", desc: "Gerencie dispositivos conectados", action: () => {} },
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
      title: "Preferências",
      items: [
        { icon: Moon, label: "Modo Escuro", desc: "Tema do aplicativo", toggle: true, value: darkMode, onChange: setDarkMode },
        { icon: Globe, label: "Idioma", desc: "Português (BR)", action: () => {} },
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
                    <Switch checked={item.value} onCheckedChange={item.onChange} />
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
            <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                <LogOut className="w-4.5 h-4.5 text-destructive" />
              </div>
              <p className="text-sm font-medium text-destructive">Sair da Conta</p>
            </button>
            <button className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-4.5 h-4.5 text-destructive" />
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-destructive">Excluir Conta</p>
                <p className="text-xs text-muted-foreground">Ação irreversível</p>
              </div>
            </button>
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
