import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import BottomNav from "@/components/BottomNav";
import LastCallBanner from "@/components/LastCallBanner";
import { MapPin, Calendar, ArrowLeft, Radar, Navigation, Search, X, Filter, Clock, Users, CheckCircle, Bell, Trophy, Ruler, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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

interface EventData {
  id: number;
  title: string;
  sport: string;
  sportId: string;
  type: string;
  date: string;
  time: string;
  location: string;
  address: string;
  distance: string;
  spots: number;
  description: string;
  organizer: string;
  requirements: string[];
  ageRange: string;
  fee: string;
  contact: string;
}

const mockEvents: EventData[] = [
  { id: 1, title: "Peneira Sub-17 — Flamengo", sport: "Futebol", sportId: "futebol", type: "peneira", date: "15 Mar 2026", time: "08:00 - 12:00", location: "CT Ninho do Urubu", address: "Av. Menezes Cortes, s/n - Vargem Grande, RJ", distance: "12km", spots: 40, description: "Peneira oficial do Clube de Regatas do Flamengo para seleção de jovens talentos na categoria Sub-17. Venha mostrar seu futebol!", organizer: "Flamengo - Departamento de Base", requirements: ["Idade: 15 a 17 anos", "Documento de identidade com foto", "Autorização dos pais/responsáveis (menores)", "Atestado médico válido (últimos 6 meses)", "Chuteiras e caneleiras", "Levar água e lanche"], ageRange: "15-17 anos", fee: "Gratuito", contact: "base@flamengo.com.br" },
  { id: 2, title: "Torneio de Karatê Gratuito", sport: "Artes Marciais", sportId: "artes-marciais", type: "torneio", date: "22 Mar 2026", time: "09:00 - 17:00", location: "Ginásio Municipal", address: "Rua do Ginásio, 100 - Centro, RJ", distance: "5km", spots: 120, description: "Torneio aberto de Karatê com categorias infantil, juvenil e adulto. Arbitragem profissional e premiação para os primeiros colocados.", organizer: "Federação de Karatê do RJ", requirements: ["Faixa mínima: amarela", "Kimono oficial", "Registro na federação (ou realizar no dia)", "Documento de identidade", "Autorização parental para menores de 18 anos"], ageRange: "10-35 anos", fee: "Gratuito", contact: "contato@fkrj.com.br" },
  { id: 3, title: "Campeonato Amador de Basquete", sport: "Basquete", sportId: "basquete", type: "campeonato", date: "28 Mar 2026", time: "14:00 - 20:00", location: "Arena Carioca 1", address: "Av. Salvador Allende, s/n - Barra da Tijuca, RJ", distance: "8km", spots: 60, description: "Campeonato amador 3x3 de basquete de rua. Equipes de 3 a 5 jogadores. Prêmios em dinheiro e equipamentos.", organizer: "Liga Carioca de Basquete", requirements: ["Equipe de 3 a 5 jogadores", "Idade mínima: 14 anos", "Tênis de basquete obrigatório", "Inscrição online prévia", "Autorização parental para menores"], ageRange: "14+ anos", fee: "R$ 30/equipe", contact: "liga@basqueterj.com" },
  { id: 4, title: "Seletiva de Natação Sub-15", sport: "Natação", sportId: "natacao", type: "seletiva", date: "02 Abr 2026", time: "07:00 - 11:00", location: "Parque Aquático Julio Delamare", address: "Rua Prof. Eurico Rabelo - Maracanã, RJ", distance: "15km", spots: 30, description: "Seletiva oficial para composição da equipe estadual de natação Sub-15. Provas de 50m e 100m livre, costas e peito.", organizer: "Federação Aquática do RJ", requirements: ["Idade: 13 a 15 anos", "Registro na federação de natação", "Maiô/sunga oficial de competição", "Óculos e touca", "Atestado médico esportivo", "Tempo mínimo classificatório"], ageRange: "13-15 anos", fee: "Gratuito", contact: "seletiva@farj.org.br" },
  { id: 5, title: "Peneira Vasco Sub-20", sport: "Futebol", sportId: "futebol", type: "peneira", date: "05 Abr 2026", time: "08:00 - 13:00", location: "CT de São Januário", address: "Rua General Almério de Moura, 131 - São Cristóvão, RJ", distance: "18km", spots: 50, description: "Avaliação técnica e física para categoria Sub-20 do Club de Regatas Vasco da Gama.", organizer: "Vasco da Gama - Categorias de Base", requirements: ["Idade: 17 a 20 anos", "RG e CPF", "Autorização dos pais (menores de 18)", "Atestado médico", "Material esportivo completo", "Currículo esportivo (opcional)"], ageRange: "17-20 anos", fee: "Gratuito", contact: "base@vasco.com.br" },
  { id: 6, title: "Copa Municipal de Tênis Juvenil", sport: "Tênis", sportId: "tenis", type: "torneio", date: "10 Abr 2026", time: "08:00 - 18:00", location: "Clube Atlético", address: "Rua do Clube, 250 - Botafogo, RJ", distance: "7km", spots: 32, description: "Torneio juvenil com chaves masculina e feminina. Simples e duplas. Ranking oficial.", organizer: "Federação de Tênis do RJ", requirements: ["Idade: 12 a 18 anos", "Raquete própria", "Registro na federação", "Uniforme branco", "Autorização parental para menores"], ageRange: "12-18 anos", fee: "R$ 25/atleta", contact: "torneio@ftrj.com.br" },
];

const EventsMap = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("lista");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSport, setSelectedSport] = useState("todos");
  const [selectedType, setSelectedType] = useState("todos");
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [interestedEvents, setInterestedEvents] = useState<number[]>([]);

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

  const handleInterest = (event: EventData) => {
    setSelectedEvent(event);
  };

  const confirmInterest = () => {
    if (selectedEvent) {
      setInterestedEvents(prev => [...prev, selectedEvent.id]);
      toast.success(
        `Você demonstrou interesse em "${selectedEvent.title}"! Você será notificado no dia anterior ao evento.`,
        { duration: 5000 }
      );
      setSelectedEvent(null);
    }
  };

  const removeInterest = (eventId: number) => {
    setInterestedEvents(prev => prev.filter(id => id !== eventId));
    toast("Interesse removido.");
  };

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
              filteredEvents.map((event) => {
                const isInterested = interestedEvents.includes(event.id);
                return (
                  <div key={event.id} className="glass-card rounded-xl p-4 hover:border-primary/20 transition-colors border border-transparent">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex gap-2 mb-2 flex-wrap">
                          <Badge className="bg-cyan/15 text-cyan border-0 text-[10px]">{event.sport}</Badge>
                          <Badge variant="outline" className="text-[10px] border-primary/30 text-primary capitalize">{event.type}</Badge>
                          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">{event.spots} vagas</Badge>
                          {isInterested && (
                            <Badge className="bg-primary/15 text-primary border-0 text-[10px]">
                              <CheckCircle className="w-3 h-3 mr-0.5" /> Interessado
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-display font-bold text-foreground">{event.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {event.date} • {event.time}
                        </p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> {event.location}
                        </p>
                        <p className="text-xs text-primary mt-1.5 font-display font-semibold">
                          📍 {event.distance} de você
                        </p>
                      </div>
                    </div>
                    {isInterested ? (
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleInterest(event)}>
                          <Info className="w-3.5 h-3.5 mr-1" /> Ver Detalhes
                        </Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => removeInterest(event.id)}>
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <Button size="sm" className="mt-3 w-full" onClick={() => handleInterest(event)}>
                        Tenho Interesse
                      </Button>
                    )}
                  </div>
                );
              })
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

      {/* Event Detail Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex gap-2 mb-2 flex-wrap">
                  <Badge className="bg-cyan/15 text-cyan border-0 text-xs">{selectedEvent.sport}</Badge>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary capitalize">{selectedEvent.type}</Badge>
                </div>
                <DialogTitle className="font-display text-xl">{selectedEvent.title}</DialogTitle>
                <DialogDescription className="text-sm">{selectedEvent.description}</DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                {/* Event details grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="glass-card rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Calendar className="w-3.5 h-3.5" /> Data
                    </div>
                    <p className="text-sm font-display font-bold text-foreground">{selectedEvent.date}</p>
                  </div>
                  <div className="glass-card rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Clock className="w-3.5 h-3.5" /> Horário
                    </div>
                    <p className="text-sm font-display font-bold text-foreground">{selectedEvent.time}</p>
                  </div>
                  <div className="glass-card rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Users className="w-3.5 h-3.5" /> Vagas
                    </div>
                    <p className="text-sm font-display font-bold text-foreground">{selectedEvent.spots} vagas</p>
                  </div>
                  <div className="glass-card rounded-lg p-3">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Ruler className="w-3.5 h-3.5" /> Faixa Etária
                    </div>
                    <p className="text-sm font-display font-bold text-foreground">{selectedEvent.ageRange}</p>
                  </div>
                </div>

                {/* Location */}
                <div className="glass-card rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <MapPin className="w-3.5 h-3.5" /> Local
                  </div>
                  <p className="text-sm font-display font-bold text-foreground">{selectedEvent.location}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{selectedEvent.address}</p>
                  <p className="text-xs text-primary mt-1 font-semibold">📍 {selectedEvent.distance} de você</p>
                </div>

                {/* Organizer & fee */}
                <div className="glass-card rounded-lg p-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Trophy className="w-3.5 h-3.5" /> Organizador
                  </div>
                  <p className="text-sm font-display font-bold text-foreground">{selectedEvent.organizer}</p>
                  <p className="text-xs text-muted-foreground mt-1">💰 {selectedEvent.fee}</p>
                  <p className="text-xs text-muted-foreground">📧 {selectedEvent.contact}</p>
                </div>

                {/* Requirements */}
                <div>
                  <h4 className="font-display font-bold text-foreground text-sm mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-primary" /> Requisitos para Participar
                  </h4>
                  <div className="space-y-1.5">
                    {selectedEvent.requirements.map((req, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{req}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notification reminder */}
                <div className="glass-card rounded-lg p-3 border border-secondary/30">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-secondary" />
                    <p className="text-xs text-foreground font-display font-semibold">Lembrete Automático</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ao confirmar interesse, você será notificado <strong className="text-foreground">no dia anterior</strong> ao evento para não perder o horário.
                  </p>
                </div>
              </div>

              <DialogFooter>
                {interestedEvents.includes(selectedEvent.id) ? (
                  <div className="w-full flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setSelectedEvent(null)}>
                      Fechar
                    </Button>
                    <Button variant="ghost" className="text-destructive" onClick={() => { removeInterest(selectedEvent.id); setSelectedEvent(null); }}>
                      Cancelar Interesse
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" onClick={confirmInterest}>
                    <CheckCircle className="w-4 h-4 mr-2" /> Confirmar Interesse
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <BottomNav />
    </div>
  );
};

export default EventsMap;
