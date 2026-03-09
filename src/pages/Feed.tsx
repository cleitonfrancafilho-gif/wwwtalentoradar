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
  User, Building2, Eye, UserPlus, Users,
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
  { id: 1, name: "Lucas Silva", age: 16, sport: "Futebol", sportId: "futebol", position: "Atacante", city: "São Paulo, SP", tags: ["#Futebol", "#Sub17", "#Atacante"], likes: 234, comments: 18, score: 95, type: "atleta" as const, posts: 24, followers: 1283, following: 89 },
  { id: 2, name: "Ana Oliveira", age: 17, sport: "Vôlei", sportId: "volei", position: "Levantadora", city: "Rio de Janeiro, RJ", tags: ["#Vôlei", "#Sub18", "#Levantadora"], likes: 189, comments: 12, score: 82, type: "atleta" as const, posts: 18, followers: 945, following: 120 },
  { id: 3, name: "Pedro Santos", age: 15, sport: "Basquete", sportId: "basquete", position: "Pivô", city: "Belo Horizonte, MG", tags: ["#Basquete", "#Sub17", "#Pivô"], likes: 312, comments: 27, score: 91, type: "atleta" as const, posts: 31, followers: 2104, following: 56 },
  { id: 4, name: "Maria Costa", age: 16, sport: "Natação", sportId: "natacao", position: "100m Livre", city: "Curitiba, PR", tags: ["#Natação", "#Sub17"], likes: 145, comments: 8, score: 78, type: "atleta" as const, posts: 12, followers: 534, following: 67 },
  { id: 5, name: "João Ferreira", age: 17, sport: "Tênis", sportId: "tenis", position: "Singulares", city: "Florianópolis, SC", tags: ["#Tênis", "#Sub18"], likes: 98, comments: 5, score: 85, type: "atleta" as const, posts: 9, followers: 312, following: 44 },
];

const mockScouts = [
  { id: 101, name: "Carlos Mendes", org: "Flamengo", sportId: "futebol", sport: "Futebol", city: "Rio de Janeiro, RJ", verified: true, type: "olheiro" as const, posts: 8, followers: 4520, following: 312 },
  { id: 102, name: "Roberto Almeida", org: "CBB", sportId: "basquete", sport: "Basquete", city: "São Paulo, SP", verified: true, type: "olheiro" as const, posts: 15, followers: 2890, following: 187 },
  { id: 103, name: "Fernanda Lima", org: "CBV", sportId: "volei", sport: "Vôlei", city: "Brasília, DF", verified: false, type: "olheiro" as const, posts: 5, followers: 1230, following: 95 },
];

const mockInstitutions = [
  { id: 201, name: "CT Ninho do Urubu", sportId: "futebol", sport: "Futebol", city: "Rio de Janeiro, RJ", categories: "Sub-13 a Sub-20", type: "instituicao" as const, posts: 45, followers: 15400, following: 23 },
  { id: 202, name: "Instituto Bola pra Frente", sportId: "futebol", sport: "Futebol", city: "Rio de Janeiro, RJ", categories: "Sub-11 a Sub-17", type: "instituicao" as const, posts: 32, followers: 8900, following: 56 },
  { id: 203, name: "Arena Carioca Basketball", sportId: "basquete", sport: "Basquete", city: "Rio de Janeiro, RJ", categories: "Sub-15 a Sub-20", type: "instituicao" as const, posts: 19, followers: 3200, following: 12 },
];

const mockEvents = [
  { id: 1, title: "Peneira Sub-17 — Flamengo", sport: "Futebol", sportId: "futebol", date: "15 Mar 2026", location: "CT Ninho do Urubu", distance: "12km" },
  { id: 2, title: "Torneio de Karatê Gratuito", sport: "Artes Marciais", sportId: "artes-marciais", date: "22 Mar 2026", location: "Ginásio Municipal", distance: "5km" },
  { id: 3, title: "Campeonato Amador de Basquete", sport: "Basquete", sportId: "basquete", date: "28 Mar 2026", location: "Arena Carioca 1", distance: "8km" },
  { id: 4, title: "Copa de Natação Juvenil", sport: "Natação", sportId: "natacao", date: "02 Abr 2026", location: "Parque Aquático", distance: "15km" },
];

// Simulate followed users' posts
const mockFollowingPosts = [
  { id: 1, userName: "Lucas Silva", sport: "Futebol", type: "atleta", title: "Treino de finalização", likes: 89, comments: 7, time: "2h atrás" },
  { id: 2, userName: "CT Ninho do Urubu", sport: "Futebol", type: "instituicao", title: "Peneira Sub-17 confirmada!", likes: 234, comments: 45, time: "4h atrás" },
  { id: 3, userName: "Carlos Mendes", sport: "Futebol", type: "olheiro", title: "Análise tática: semifinal Sub-17", likes: 156, comments: 23, time: "6h atrás" },
  { id: 4, userName: "Ana Oliveira", sport: "Vôlei", type: "atleta", title: "Treino de levantamento", likes: 67, comments: 4, time: "8h atrás" },
];

const formatNumber = (n: number) => {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(".0", "") + "K";
  return n.toString();
};

const Feed = () => {
  const navigate = useNavigate();
  const [feedTab, setFeedTab] = useState("foco");
  const [loading] = useState(false);
  const [selectedSport, setSelectedSport] = useState("todos");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [discoveryFilter, setDiscoveryFilter] = useState<"todos" | "atleta" | "olheiro" | "instituicao">("todos");
  const [followedIds, setFollowedIds] = useState<number[]>([]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-primary";
    if (score >= 70) return "text-cyan";
    return "text-muted-foreground";
  };

  const toggleFollow = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFollowedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
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

  // Discovery: all profiles combined & filtered
  const allProfiles = [
    ...mockTalents.map(t => ({ ...t, profileType: "atleta" as const })),
    ...mockScouts.map(s => ({ ...s, profileType: "olheiro" as const, age: undefined, position: s.org, tags: [] as string[], likes: 0, comments: 0, score: 0 })),
    ...mockInstitutions.map(inst => ({ ...inst, profileType: "instituicao" as const, age: undefined, position: inst.categories, tags: [] as string[], likes: 0, comments: 0, score: 0 })),
  ];

  const filteredProfiles = allProfiles.filter(p => {
    const matchType = discoveryFilter === "todos" || p.profileType === discoveryFilter;
    const matchSport = selectedSport === "todos" || p.sportId === selectedSport;
    const matchSearch = !searchQuery ||
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sport.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSport && matchSearch;
  });

  const getProfileEmoji = (type: string, sport: string) => {
    if (type === "olheiro") return "🔍";
    if (type === "instituicao") return "🏟️";
    const map: Record<string, string> = { Futebol: "⚽", Vôlei: "🏐", Basquete: "🏀", Natação: "🏊", Tênis: "🎾" };
    return map[sport] || "🏅";
  };

  const getTypeLabel = (type: string) => {
    if (type === "olheiro") return { label: "Olheiro", color: "bg-cyan/15 text-cyan" };
    if (type === "instituicao") return { label: "Instituição", color: "bg-secondary/15 text-secondary" };
    return { label: "Atleta", color: "bg-primary/15 text-primary" };
  };

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
            <Button variant="ghost" size="icon" className="relative" onClick={() => navigate("/notificacoes")}>
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />
            </Button>
          </div>
        </div>

        {searchOpen && (
          <div className="max-w-2xl mx-auto mt-3 animate-slide-up">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar atleta, olheiro, instituição, esporte..."
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
            <TabsTrigger value="foco" className="flex-1 font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              🎯 Meu Foco
            </TabsTrigger>
            <TabsTrigger value="descoberta" className="flex-1 font-display text-xs data-[state=active]:bg-cyan data-[state=active]:text-cyan-foreground">
              🔍 Descoberta
            </TabsTrigger>
            <TabsTrigger value="seguindo" className="flex-1 font-display text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              👥 Seguindo
            </TabsTrigger>
          </TabsList>

          {/* Meu Foco */}
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
                <div key={talent.id} className="glass-card rounded-xl overflow-hidden hover:border-primary/30 transition-colors cursor-pointer border border-transparent" onClick={() => navigate(`/perfil/${talent.id}`)}>
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
                      <Button
                        variant={followedIds.includes(talent.id) ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={(e) => toggleFollow(talent.id, e)}
                      >
                        {followedIds.includes(talent.id) ? "Seguindo" : "Seguir"}
                      </Button>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                      <MapPin className="w-3 h-3" /> {talent.city}
                    </div>
                    {/* Social stats */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3 border-t border-border/30 pt-3">
                      <span><strong className="text-foreground font-display">{talent.posts}</strong> Posts</span>
                      <span><strong className="text-foreground font-display">{formatNumber(talent.followers)}</strong> Seguidores</span>
                      <span><strong className="text-foreground font-display">{talent.following}</strong> Seguindo</span>
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

          {/* Descoberta - Full profile search */}
          <TabsContent value="descoberta" className="space-y-4">
            {/* Type filter */}
            <div className="flex gap-2">
              {([
                { key: "todos", label: "Todos", icon: Users },
                { key: "atleta", label: "Atletas", icon: User },
                { key: "olheiro", label: "Olheiros", icon: Eye },
                { key: "instituicao", label: "Instituições", icon: Building2 },
              ] as const).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setDiscoveryFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-display font-semibold transition-all ${
                    discoveryFilter === f.key
                      ? "bg-cyan text-cyan-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <f.icon className="w-3.5 h-3.5" />
                  {f.label}
                </button>
              ))}
            </div>

            {/* Results */}
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-12">
                <Compass className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                <p className="text-muted-foreground text-sm">Nenhum perfil encontrado.</p>
                <Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={() => { setDiscoveryFilter("todos"); setSelectedSport("todos"); setSearchQuery(""); }}>
                  Limpar filtros
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProfiles.map((profile) => {
                  const typeInfo = getTypeLabel(profile.profileType);
                  return (
                    <div
                      key={`${profile.profileType}-${profile.id}`}
                      className="glass-card rounded-xl p-4 hover:border-primary/20 transition-colors cursor-pointer border border-transparent"
                      onClick={() => navigate(`/perfil/${profile.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-2xl shrink-0">
                          {getProfileEmoji(profile.profileType, profile.sport)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className="font-display font-bold text-foreground text-sm truncate">{profile.name}</h4>
                            <Badge className={`${typeInfo.color} border-0 text-[9px] shrink-0`}>{typeInfo.label}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {profile.position || profile.sport} • {profile.city}
                          </p>
                          {/* Social stats row */}
                          <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground">
                            <span><strong className="text-foreground font-display">{profile.posts}</strong> Posts</span>
                            <span><strong className="text-foreground font-display">{formatNumber(profile.followers)}</strong> Seguidores</span>
                            <span><strong className="text-foreground font-display">{profile.following}</strong> Seguindo</span>
                          </div>
                        </div>
                        <Button
                          variant={followedIds.includes(profile.id) ? "default" : "outline"}
                          size="sm"
                          className="text-xs shrink-0"
                          onClick={(e) => toggleFollow(profile.id, e)}
                        >
                          {followedIds.includes(profile.id) ? (
                            "Seguindo"
                          ) : (
                            <><UserPlus className="w-3.5 h-3.5 mr-1" /> Seguir</>
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Events section */}
            <div className="pt-4">
              <h3 className="font-display font-bold text-foreground flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-cyan" /> Eventos Próximos
              </h3>
              <div className="space-y-3">
                {filteredEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">Nenhum evento encontrado.</p>
                ) : (
                  filteredEvents.map((event) => (
                    <div key={event.id} className="glass-card rounded-xl p-4 hover:border-cyan/30 transition-colors border border-transparent">
                      <Badge className="bg-cyan/15 text-cyan border-0 text-xs mb-2">{event.sport}</Badge>
                      <h4 className="font-display font-bold text-foreground">{event.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">📅 {event.date} • 📍 {event.location}</p>
                      <p className="text-xs text-primary mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {event.distance} de você
                      </p>
                      <Button size="sm" className="mt-3" onClick={() => navigate("/eventos")}>Tenho Interesse</Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          {/* Seguindo */}
          <TabsContent value="seguindo" className="space-y-4">
            {followedIds.length === 0 && mockFollowingPosts.length > 0 ? (
              <>
                <div className="text-center py-6">
                  <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <p className="text-muted-foreground text-sm mb-1">Comece a seguir perfis para ver atualizações aqui!</p>
                  <Button variant="ghost" size="sm" className="text-primary" onClick={() => setFeedTab("descoberta")}>
                    Descobrir perfis
                  </Button>
                </div>
                <div className="border-t border-border/30 pt-4">
                  <h3 className="font-display font-bold text-foreground text-sm mb-3">📌 Sugestões de conteúdo</h3>
                  {mockFollowingPosts.map((post) => (
                    <div key={post.id} className="glass-card rounded-xl overflow-hidden mb-3 border border-transparent">
                      <div className="relative aspect-video bg-muted flex items-center justify-center">
                        <Play className="w-10 h-10 text-primary opacity-60" />
                      </div>
                      <div className="p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-display font-bold text-foreground">{post.userName}</span>
                          <Badge className={`border-0 text-[9px] ${post.type === "olheiro" ? "bg-cyan/15 text-cyan" : post.type === "instituicao" ? "bg-secondary/15 text-secondary" : "bg-primary/15 text-primary"}`}>
                            {post.type === "olheiro" ? "Olheiro" : post.type === "instituicao" ? "Instituição" : "Atleta"}
                          </Badge>
                          <span className="text-xs text-muted-foreground ml-auto">{post.time}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{post.title}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                          <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes}</span>
                          <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.comments}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              mockFollowingPosts.map((post) => (
                <div key={post.id} className="glass-card rounded-xl overflow-hidden border border-transparent">
                  <div className="relative aspect-video bg-muted flex items-center justify-center">
                    <Play className="w-10 h-10 text-primary opacity-60" />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-display font-bold text-foreground">{post.userName}</span>
                      <Badge className={`border-0 text-[9px] ${post.type === "olheiro" ? "bg-cyan/15 text-cyan" : post.type === "instituicao" ? "bg-secondary/15 text-secondary" : "bg-primary/15 text-primary"}`}>
                        {post.type === "olheiro" ? "Olheiro" : post.type === "instituicao" ? "Instituição" : "Atleta"}
                      </Badge>
                      <span className="text-xs text-muted-foreground ml-auto">{post.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{post.title}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                      <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {post.likes}</span>
                      <span className="flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {post.comments}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Feed;
