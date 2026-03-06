import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import LastCallBanner from "@/components/LastCallBanner";
import SkeletonCard from "@/components/SkeletonCard";
import {
  Radar, Search, Bell, MapPin, Play, Heart, MessageCircle, Calendar, Compass, Flame, TrendingUp, X,
} from "lucide-react";

const allSports = [
  { id: "todos", name: "Todos", emoji: "🌐" },
  { id: "futebol", name: "Futebol", emoji: "⚽" },
  { id: "basquete", name: "Basquete", emoji: "🏀" },
  { id: "volei", name: "Vôlei", emoji: "🏐" },
  { id: "tenis", name: "Tênis", emoji: "🎾" },
  { id: "surf", name: "Surf", emoji: "🏄" },
  { id: "artes-marciais", name: "Artes Marciais", emoji: "🥋" },
  { id: "natacao", name: "Natação", emoji: "🏊" },
  { id: "atletismo", name: "Atletismo", emoji: "🏃" },
  { id: "handball", name: "Handebol", emoji: "🤾" },
  { id: "skate", name: "Skate", emoji: "🛹" },
  { id: "boxe", name: "Boxe", emoji: "🥊" },
  { id: "ciclismo", name: "Ciclismo", emoji: "🚴" },
];

const mockTalents = [
  { id: 1, name: "Lucas Silva", age: 16, sport: "Futebol", sportId: "futebol", position: "Atacante", city: "São Paulo, SP", tags: ["#Futebol", "#Sub17", "#Atacante"], likes: 234, comments: 18, score: 95 },
  { id: 2, name: "Ana Oliveira", age: 17, sport: "Vôlei", sportId: "volei", position: "Levantadora", city: "Rio de Janeiro, RJ", tags: ["#Vôlei", "#Sub18", "#Levantadora"], likes: 189, comments: 12, score: 82 },
  { id: 3, name: "Pedro Santos", age: 15, sport: "Basquete", sportId: "basquete", position: "Pivô", city: "Belo Horizonte, MG", tags: ["#Basquete", "#Sub17", "#Pivô"], likes: 312, comments: 27, score: 91 },
  { id: 4, name: "Maria Costa", age: 16, sport: "Natação", sportId: "natacao", position: "100m Livre", city: "Curitiba, PR", tags: ["#Natação", "#Sub17"], likes: 145, comments: 8, score: 78 },
  { id: 5, name: "João Ferreira", age: 17, sport: "Tênis", sportId: "tenis", position: "Singulares", city: "Florianópolis, SC", tags: ["#Tênis", "#Sub18"], likes: 98, comments: 5, score: 85 },
];

const mockEvents = [
  { id: 1, title: "Peneira Sub-17 — Flamengo", sport: "Futebol", sportId: "futebol", date: "15 Mar 2026", location: "CT Ninho do Urubu", distance: "12km" },
  { id: 2, title: "Torneio de Karatê Gratuito", sport: "Artes Marciais", sportId: "artes-marciais", date: "22 Mar 2026", location: "Ginásio Municipal", distance: "5km" },
  { id: 3, title: "Campeonato Amador de Basquete", sport: "Basquete", sportId: "basquete", date: "28 Mar 2026", location: "Arena Carioca 1", distance: "8km" },
  { id: 4, title: "Copa de Natação Juvenil", sport: "Natação", sportId: "natacao", date: "02 Abr 2026", location: "Parque Aquático", distance: "15km" },
];

const Feed = () => {
  const navigate = useNavigate();
  const [feedTab, setFeedTab] = useState("foco");
  const [loading, setLoading] = useState(false);
  const [selectedSport, setSelectedSport] = useState("todos");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-primary";
    if (score >= 70) return "text-cyan";
    return "text-muted-foreground";
  };

  const filteredTalents = mockTalents.filter((t) => {
    const matchSport = selectedSport === "todos" || t.sportId === selectedSport;
    const matchSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.sport.toLowerCase().includes(searchQuery.toLowerCase()) || t.position.toLowerCase().includes(searchQuery.toLowerCase()) || t.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSport && matchSearch;
  });

  const filteredEvents = mockEvents.filter((e) => {
    const matchSport = selectedSport === "todos" || e.sportId === selectedSport;
    const matchSearch = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase()) || e.sport.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSport && matchSearch;
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">
              Talent<span className="text-gradient-neon">Radar</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)}>
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </Button>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            </Button>
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="max-w-2xl mx-auto mt-3 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar atleta, esporte, cidade..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>

      {/* Sport filter chips */}
      <div className="sticky top-[57px] z-40 glass border-b border-border/30">
        <div className="max-w-2xl mx-auto px-4 py-2.5 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {allSports.map((sport) => (
              <button
                key={sport.id}
                onClick={() => setSelectedSport(sport.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all whitespace-nowrap ${
                  selectedSport === sport.id
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <span>{sport.emoji}</span>
                <span>{sport.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-4">
        <Tabs value={feedTab} onValueChange={setFeedTab}>
          <TabsList className="w-full bg-muted mb-6 h-11">
            <TabsTrigger value="foco" className="flex-1 font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🎯 Meu Foco
            </TabsTrigger>
            <TabsTrigger value="descoberta" className="flex-1 font-display data-[state=active]:bg-cyan data-[state=active]:text-cyan-foreground">
              🔍 Descoberta
            </TabsTrigger>
          </TabsList>

          <TabsContent value="foco" className="space-y-4">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : filteredTalents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">Nenhum talento encontrado para este filtro.</p>
                <Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={() => { setSelectedSport("todos"); setSearchQuery(""); }}>
                  Limpar filtros
                </Button>
              </div>
            ) : (
              filteredTalents.map((talent) => (
                <div key={talent.id} className="glass-card rounded-xl overflow-hidden hover:border-primary/30 transition-colors cursor-pointer border border-transparent" onClick={() => navigate("/perfil/1")}>
                  <div className="relative aspect-video bg-muted flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                    <Play className="w-12 h-12 text-primary opacity-70" />
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                      {talent.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-primary/20 text-primary border-0">{tag}</Badge>
                      ))}
                    </div>
                    <div className="absolute top-3 right-3 glass rounded-lg px-2 py-1 flex items-center gap-1">
                      <Flame className={`w-3 h-3 ${getScoreColor(talent.score)}`} />
                      <span className={`text-xs font-display font-bold ${getScoreColor(talent.score)}`}>{talent.score}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-bold text-foreground">{talent.name}</h3>
                          {talent.score >= 90 && (
                            <Badge className="bg-primary/15 text-primary border-0 text-[9px] gap-0.5">
                              <TrendingUp className="w-2.5 h-2.5" /> Top
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{talent.age} anos • {talent.position} • {talent.sport}</p>
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
              ))
            )}
          </TabsContent>

          <TabsContent value="descoberta" className="space-y-6">
            <LastCallBanner />

            <div>
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan" /> Eventos Próximos
              </h3>
              <div className="space-y-3 mt-3">
                {filteredEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum evento encontrado para este esporte.</p>
                ) : (
                  filteredEvents.map((event) => (
                    <div key={event.id} className="glass-card rounded-xl p-4 hover:border-cyan/30 transition-colors border border-transparent">
                      <Badge className="bg-cyan/15 text-cyan border-0 text-xs mb-2">{event.sport}</Badge>
                      <h4 className="font-display font-bold text-foreground">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">📅 {event.date} • 📍 {event.location}</p>
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {event.distance} de você
                      </p>
                      <Button size="sm" className="mt-3">Tenho Interesse</Button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-foreground flex items-center gap-2">
                <Compass className="w-4 h-4 text-cyan" /> Talentos de Outros Esportes
              </h3>
              <div className="space-y-3 mt-3">
                {filteredTalents.slice(0, 2).map((talent) => (
                  <div key={talent.id} className="glass-card rounded-xl p-4 flex items-center gap-4 hover:border-primary/20 transition-colors cursor-pointer border border-transparent" onClick={() => navigate("/perfil/1")}>
                    <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl">
                      {talent.sport === "Futebol" ? "⚽" : talent.sport === "Vôlei" ? "🏐" : talent.sport === "Basquete" ? "🏀" : talent.sport === "Natação" ? "🏊" : "🎾"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display font-bold text-foreground text-sm">{talent.name}</h4>
                      <p className="text-xs text-muted-foreground">{talent.position} • {talent.sport} • {talent.city}</p>
                    </div>
                    <Button variant="outline" size="sm">Ver</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Feed;
