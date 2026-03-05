import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Radar, Search, Bell, MapPin, Play, Heart, MessageCircle, Calendar, User, Home, Compass, PlusCircle,
} from "lucide-react";

const mockTalents = [
  { id: 1, name: "Lucas Silva", age: 16, sport: "Futebol", position: "Atacante", city: "São Paulo, SP", tags: ["#Futebol", "#Sub17", "#Atacante"], likes: 234, comments: 18 },
  { id: 2, name: "Ana Oliveira", age: 17, sport: "Vôlei", position: "Levantadora", city: "Rio de Janeiro, RJ", tags: ["#Vôlei", "#Sub18", "#Levantadora"], likes: 189, comments: 12 },
  { id: 3, name: "Pedro Santos", age: 15, sport: "Basquete", position: "Pivô", city: "Belo Horizonte, MG", tags: ["#Basquete", "#Sub17", "#Pivô"], likes: 312, comments: 27 },
];

const mockEvents = [
  { id: 1, title: "Peneira Sub-17 — Flamengo", sport: "Futebol", date: "15 Mar 2026", location: "CT Ninho do Urubu", distance: "12km" },
  { id: 2, title: "Torneio de Karatê Gratuito", sport: "Artes Marciais", date: "22 Mar 2026", location: "Ginásio Municipal", distance: "5km" },
  { id: 3, title: "Campeonato Amador de Basquete", sport: "Basquete", date: "28 Mar 2026", location: "Arena Carioca 1", distance: "8km" },
];

const Feed = () => {
  const navigate = useNavigate();
  const [feedTab, setFeedTab] = useState("foco");

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">
              Talent<span className="text-gradient-neon">Radar</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Search className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        <Tabs value={feedTab} onValueChange={setFeedTab}>
          <TabsList className="w-full bg-muted mb-6 h-11">
            <TabsTrigger value="foco" className="flex-1 font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🎯 Meu Foco
            </TabsTrigger>
            <TabsTrigger value="descoberta" className="flex-1 font-display data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              🔍 Descoberta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="foco" className="space-y-4">
            {/* Talent cards */}
            {mockTalents.map((talent) => (
              <div key={talent.id} className="bg-card border border-border rounded-xl overflow-hidden hover:border-primary/30 transition-colors cursor-pointer" onClick={() => navigate("/perfil/1")}>
                {/* Video placeholder */}
                <div className="relative aspect-video bg-muted flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                  <Play className="w-12 h-12 text-primary opacity-70" />
                  <div className="absolute bottom-3 left-3 flex gap-1.5">
                    {talent.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs bg-primary/20 text-primary border-0">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-display font-bold text-foreground">{talent.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {talent.age} anos • {talent.position} • {talent.sport}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" /> {talent.city}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <Heart className="w-4 h-4" /> {talent.likes}
                    </button>
                    <button className="flex items-center gap-1 hover:text-primary transition-colors">
                      <MessageCircle className="w-4 h-4" /> {talent.comments}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="descoberta" className="space-y-4">
            {/* Events */}
            <h3 className="font-display font-bold text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4 text-secondary" /> Eventos Próximos
            </h3>
            {mockEvents.map((event) => (
              <div key={event.id} className="bg-card border border-border rounded-xl p-4 hover:border-secondary/40 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="text-xs mb-2 border-secondary/40 text-secondary">
                      {event.sport}
                    </Badge>
                    <h4 className="font-display font-bold text-foreground">{event.title}</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      📅 {event.date} • 📍 {event.location}
                    </p>
                    <p className="text-xs text-primary mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {event.distance} de você
                    </p>
                  </div>
                </div>
                <Button variant="neon" size="sm" className="mt-3">
                  Tenho Interesse
                </Button>
              </div>
            ))}

            {/* Discovery talents */}
            <h3 className="font-display font-bold text-foreground flex items-center gap-2 mt-6">
              <Compass className="w-4 h-4 text-secondary" /> Talentos de Outros Esportes
            </h3>
            {mockTalents.slice(0, 2).map((talent) => (
              <div key={talent.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:border-secondary/30 transition-colors cursor-pointer" onClick={() => navigate("/perfil/1")}>
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl">
                  {talent.sport === "Futebol" ? "⚽" : talent.sport === "Vôlei" ? "🏐" : "🏀"}
                </div>
                <div className="flex-1">
                  <h4 className="font-display font-bold text-foreground text-sm">{talent.name}</h4>
                  <p className="text-xs text-muted-foreground">{talent.position} • {talent.sport} • {talent.city}</p>
                </div>
                <Button variant="outline" size="sm">Ver</Button>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border">
        <div className="max-w-2xl mx-auto flex justify-around py-2">
          {[
            { icon: Home, label: "Feed", path: "/feed", active: true },
            { icon: Compass, label: "Descobrir", path: "/feed" },
            { icon: PlusCircle, label: "Postar", path: "/feed" },
            { icon: MapPin, label: "Eventos", path: "/feed" },
            { icon: User, label: "Perfil", path: "/perfil/1" },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${
                item.active ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-display">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default Feed;
