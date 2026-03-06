import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import LastCallBanner from "@/components/LastCallBanner";
import { MapPin, Calendar, ArrowLeft, Radar, Navigation, Search, X, Filter } from "lucide-react";
import { useNavigate } from "react-router-dom";

const sportFilters = [
  { id: "todos", name: "Todos", emoji: "🌐" },
  { id: "futebol", name: "Futebol", emoji: "⚽" },
  { id: "basquete", name: "Basquete", emoji: "🏀" },
  { id: "volei", name: "Vôlei", emoji: "🏐" },
  { id: "artes-marciais", name: "Artes Marciais", emoji: "🥋" },
  { id: "natacao", name: "Natação", emoji: "🏊" },
  { id: "atletismo", name: "Atletismo", emoji: "🏃" },
  { id: "tenis", name: "Tênis", emoji: "🎾" },
];

const typeFilters = [
  { id: "todos", label: "Todos" },
  { id: "peneira", label: "Peneiras" },
  { id: "torneio", label: "Torneios" },
  { id: "campeonato", label: "Campeonatos" },
  { id: "seletiva", label: "Seletivas" },
];

const mockEvents = [
  { id: 1, title: "Peneira Sub-17 — Flamengo", sport: "Futebol", sportId: "futebol", type: "peneira", date: "15 Mar 2026", location: "CT Ninho do Urubu", distance: "12km", spots: 40 },
  { id: 2, title: "Torneio de Karatê Gratuito", sport: "Artes Marciais", sportId: "artes-marciais", type: "torneio", date: "22 Mar 2026", location: "Ginásio Municipal", distance: "5km", spots: 120 },
  { id: 3, title: "Campeonato Amador de Basquete", sport: "Basquete", sportId: "basquete", type: "campeonato", date: "28 Mar 2026", location: "Arena Carioca 1", distance: "8km", spots: 60 },
  { id: 4, title: "Seletiva de Natação Sub-15", sport: "Natação", sportId: "natacao", type: "seletiva", date: "02 Abr 2026", location: "Parque Aquático Julio Delamare", distance: "15km", spots: 30 },
  { id: 5, title: "Peneira Vasco Sub-20", sport: "Futebol", sportId: "futebol", type: "peneira", date: "05 Abr 2026", location: "CT de São Januário", distance: "18km", spots: 50 },
  { id: 6, title: "Copa Municipal de Tênis Juvenil", sport: "Tênis", sportId: "tenis", type: "torneio", date: "10 Abr 2026", location: "Clube Atlético", distance: "7km", spots: 32 },
];

const EventsMap = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("lista");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("todos");
  const [selectedType, setSelectedType] = useState("todos");

  const filteredEvents = mockEvents.filter((e) => {
    const matchSport = selectedSport === "todos" || e.sportId === selectedSport;
    const matchType = selectedType === "todos" || e.type === selectedType;
    const matchSearch = !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSport && matchType && matchSearch;
  });

  const clearFilters = () => {
    setSelectedSport("todos");
    setSelectedType("todos");
    setSearchQuery("");
  };

  const hasActiveFilters = selectedSport !== "todos" || selectedType !== "todos" || searchQuery !== "";

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">News / Map</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(!searchOpen)}>
              {searchOpen ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
            </Button>
            <Navigation className="w-5 h-5 text-cyan" />
          </div>
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div className="max-w-2xl mx-auto mt-3 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar peneira, torneio, local..."
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
        <div className="max-w-2xl mx-auto px-4 py-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            {sportFilters.map((sport) => (
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
        {/* Type filter row */}
        <div className="max-w-2xl mx-auto px-4 pb-2 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 min-w-max">
            <Filter className="w-3.5 h-3.5 text-muted-foreground mt-0.5 mr-1 flex-shrink-0" />
            {typeFilters.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-1 rounded-full text-xs font-display font-semibold transition-all whitespace-nowrap ${
                  selectedType === type.id
                    ? "bg-cyan text-cyan-foreground"
                    : "bg-muted/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        <LastCallBanner />

        {/* Active filters indicator */}
        {hasActiveFilters && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {filteredEvents.length} resultado{filteredEvents.length !== 1 ? "s" : ""} encontrado{filteredEvents.length !== 1 ? "s" : ""}
            </p>
            <button onClick={clearFilters} className="text-xs text-primary hover:underline font-semibold flex items-center gap-1">
              <X className="w-3 h-3" /> Limpar filtros
            </button>
          </div>
        )}

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="w-full bg-muted mb-4 h-11">
            <TabsTrigger value="lista" className="flex-1 font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              📋 Lista
            </TabsTrigger>
            <TabsTrigger value="mapa" className="flex-1 font-display data-[state=active]:bg-cyan data-[state=active]:text-cyan-foreground">
              🗺 Mapa
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lista" className="space-y-3">
            {filteredEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-sm">Nenhum evento encontrado.</p>
                <Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={clearFilters}>
                  Limpar filtros
                </Button>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div key={event.id} className="glass-card rounded-xl p-4 hover:border-primary/20 transition-colors border border-transparent">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex gap-2 mb-2">
                        <Badge className="bg-cyan/15 text-cyan border-0 text-[10px]">{event.sport}</Badge>
                        <Badge variant="outline" className="text-[10px] border-primary/30 text-primary capitalize">{event.type}</Badge>
                        <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">{event.spots} vagas</Badge>
                      </div>
                      <h4 className="font-display font-bold text-foreground">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {event.date}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {event.location}
                      </p>
                      <p className="text-xs text-primary mt-1.5 font-display font-semibold">
                        📍 {event.distance} de você
                      </p>
                    </div>
                  </div>
                  <Button size="sm" className="mt-3 w-full">
                    Tenho Interesse
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="mapa">
            <div className="glass-card rounded-2xl aspect-[4/3] flex flex-col items-center justify-center gap-3 border border-dashed border-border">
              <MapPin className="w-12 h-12 text-cyan opacity-40" />
              <p className="font-display font-bold text-foreground">Mapa Interativo</p>
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Integração com mapa em breve. Os eventos serão exibidos por proximidade usando geolocalização.
              </p>
              <div className="flex gap-2 mt-2">
                {filteredEvents.slice(0, 3).map((e) => (
                  <Badge key={e.id} className="bg-primary/15 text-primary border-0 text-[10px]">
                    {e.distance}
                  </Badge>
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

export default EventsMap;
