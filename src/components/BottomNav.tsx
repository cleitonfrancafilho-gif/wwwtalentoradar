import { useNavigate, useLocation } from "react-router-dom";
import { Home, MessageCircle, PlusCircle, MapPin, Settings } from "lucide-react";

const navItems = [
  { icon: Home, label: "Home", path: "/feed" },
  { icon: MessageCircle, label: "Messages", path: "/chat" },
  { icon: PlusCircle, label: "Studio", path: "/talent-studio" },
  { icon: MapPin, label: "News/Map", path: "/eventos" },
  { icon: Settings, label: "Config", path: "/configuracoes" },
];

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50">
      <div className="max-w-2xl mx-auto flex justify-around py-2 safe-area-pb">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path === "/feed" && location.pathname === "/feed" && !location.search);
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_6px_hsl(110,100%,55%,0.5)]" : ""}`} />
              <span className="text-[10px] font-display">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
