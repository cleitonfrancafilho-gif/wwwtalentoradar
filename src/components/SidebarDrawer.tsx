import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { useState } from "react";
import {
  Menu, Trophy, Map, ClipboardList, FileDown, Users, Star, Bell, Shield, ChevronRight, X,
} from "lucide-react";

const SidebarDrawer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, isAdmin } = useAuth();
  const { lang } = useLanguage();
  const [open, setOpen] = useState(false);

  const isClub = profile?.profile_type === "instituicao" || profile?.profile_type === "olheiro";

  const menuItems = [
    { icon: Bell, label: lang === "en" ? "Notifications" : "Notificações", path: "/notificacoes", show: true },
    { icon: Trophy, label: lang === "en" ? "Recruitment Events" : "Eventos de Recrutamento", path: "/recrutamento", show: true },
    { icon: Users, label: lang === "en" ? "Base Management" : "Gestão de Base", path: "/gestao-base", show: isClub },
    { icon: FileDown, label: lang === "en" ? "Export Center" : "Central de Exportação", path: "/exportar", show: true },
    { icon: Star, label: lang === "en" ? "Community Vote" : "Voto da Galera", path: "/voto-galeria", show: true },
    { icon: Map, label: lang === "en" ? "Talent Map" : "Mapa de Talentos", path: "/mapa-talentos", show: true },
    { icon: ClipboardList, label: lang === "en" ? "Scout Evaluation" : "Avaliação Técnica", path: "/avaliacao-tecnica", show: isClub },
    { icon: Shield, label: lang === "en" ? "Admin Panel" : "Painel Admin", path: "/admin", show: isAdmin },
  ];

  const handleNav = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="flex flex-col items-center gap-0.5 px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors">
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-display">Menu</span>
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="bg-sidebar border-sidebar-border w-72 p-0">
        <SheetHeader className="p-4 pb-2 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="font-display text-sidebar-foreground text-lg">
              {lang === "en" ? "Features" : "Funcionalidades"}
            </SheetTitle>
          </div>
          {profile && (
            <p className="text-xs text-muted-foreground truncate">{profile.full_name}</p>
          )}
        </SheetHeader>

        <nav className="flex flex-col py-2">
          {menuItems.filter(i => i.show).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                  isActive
                    ? "bg-sidebar-accent text-primary font-medium"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-primary drop-shadow-[0_0_6px_hsl(110,100%,55%,0.5)]" : ""}`} />
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="glass-card rounded-lg p-3 text-center">
            <p className="text-[10px] text-muted-foreground font-display">TALENTO RADAR</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SidebarDrawer;
