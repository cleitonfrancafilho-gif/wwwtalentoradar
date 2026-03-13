import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ArrowLeft, Calendar, MapPin, Ruler, Users, Plus, Check, X, Flag, Heart, Filter, Loader2, Search,
} from "lucide-react";

interface EventData {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  sport: string;
  position: string | null;
  min_height_cm: number | null;
  max_age: number | null;
  location: string | null;
  event_date: string | null;
  status: string;
  created_at: string;
  applications_count?: number;
}

interface ApplicationData {
  id: string;
  event_id: string;
  athlete_id: string;
  status: string;
  athlete?: { full_name: string; position: string | null; height_cm: number | null; avatar_url: string | null; sport: string | null; representation_status: string | null };
}

const RecruitmentEvents = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const { lang } = useLanguage();
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialog, setCreateDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [applications, setApplications] = useState<ApplicationData[]>([]);
  const [currentAppIndex, setCurrentAppIndex] = useState(0);
  const [searchFilter, setSearchFilter] = useState("");
  const [contractFilter, setContractFilter] = useState("todos");

  // Create form
  const [formTitle, setFormTitle] = useState("");
  const [formSport, setFormSport] = useState("Futebol");
  const [formPosition, setFormPosition] = useState("");
  const [formMinHeight, setFormMinHeight] = useState("");
  const [formMaxAge, setFormMaxAge] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formDate, setFormDate] = useState("");

  const isClub = profile?.profile_type === "instituicao" || profile?.profile_type === "olheiro";

  const loadEvents = async () => {
    setLoading(true);
    const { data } = await supabase.from("recruitment_events").select("*").order("created_at", { ascending: false });
    setEvents((data as EventData[]) || []);
    setLoading(false);
  };

  useEffect(() => { loadEvents(); }, []);

  const handleCreateEvent = async () => {
    if (!user || !formTitle.trim()) return;
    const { error } = await supabase.from("recruitment_events").insert({
      creator_id: user.id,
      title: formTitle,
      sport: formSport,
      position: formPosition || null,
      min_height_cm: formMinHeight ? parseFloat(formMinHeight) : null,
      max_age: formMaxAge ? parseInt(formMaxAge) : null,
      location: formLocation || null,
      event_date: formDate || null,
    });
    if (error) toast.error("Erro: " + error.message);
    else {
      toast.success(lang === "en" ? "Event created!" : "Evento criado!");
      setCreateDialog(false);
      setFormTitle(""); setFormPosition(""); setFormMinHeight(""); setFormMaxAge(""); setFormLocation(""); setFormDate("");
      loadEvents();
    }
  };

  const handleApply = async (eventId: string) => {
    if (!user) return;
    const { error } = await supabase.from("event_applications").insert({ event_id: eventId, athlete_id: user.id });
    if (error) {
      if (error.code === "23505") toast.info(lang === "en" ? "Already applied" : "Já candidatado");
      else toast.error("Erro: " + error.message);
    } else toast.success(lang === "en" ? "Application sent!" : "Candidatura enviada!");
  };

  const handleFavorite = async (athleteId: string) => {
    if (!user) return;
    const { error } = await supabase.from("favorites").insert({ user_id: user.id, athlete_id: athleteId });
    if (error && error.code === "23505") toast.info(lang === "en" ? "Already favorited" : "Já favoritado");
    else if (!error) {
      toast.success("⭐ " + (lang === "en" ? "Favorited!" : "Favoritado!"));
      // Notify athlete
      await supabase.from("notifications").insert({
        user_id: athleteId, type: "favorite", title: "⭐ Perfil Favoritado",
        body: lang === "en" ? "A club favorited your profile!" : "Um clube favoritou seu perfil!",
        action_url: `/perfil/${user.id}`,
      });
    }
  };

  const loadApplications = async (eventId: string) => {
    const { data } = await supabase.from("event_applications").select("*").eq("event_id", eventId);
    if (!data) return;
    const enriched = await Promise.all(data.map(async (app: any) => {
      const { data: prof } = await supabase.from("profiles").select("full_name, position, height_cm, avatar_url, sport, representation_status").eq("id", app.athlete_id).single();
      return { ...app, athlete: prof };
    }));
    setApplications(enriched as ApplicationData[]);
    setCurrentAppIndex(0);
  };

  const handleSwipe = async (appId: string, status: "approved" | "rejected") => {
    await supabase.from("event_applications").update({ status }).eq("id", appId);
    setCurrentAppIndex(prev => prev + 1);
    toast(status === "approved" ? "✅ " + (lang === "en" ? "Approved" : "Aprovado") : "❌ " + (lang === "en" ? "Rejected" : "Rejeitado"));
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    e.sport.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const currentApp = applications[currentAppIndex];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => selectedEvent ? setSelectedEvent(null) : navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-lg text-foreground">{t("Recrutamento", lang)}</span>
          {isClub && (
            <Button size="sm" onClick={() => setCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-1" /> {lang === "en" ? "New" : "Novo"}
            </Button>
          )}
          {!isClub && <div className="w-5" />}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4">
        {selectedEvent ? (
          /* Tinder-style curation view */
          <div className="space-y-6">
            <div className="glass-card rounded-xl p-4 border border-primary/20">
              <h2 className="font-display font-bold text-foreground">{selectedEvent.title}</h2>
              <p className="text-xs text-muted-foreground mt-1">{selectedEvent.sport} • {selectedEvent.position || (lang === "en" ? "Any position" : "Qualquer posição")}</p>
              <p className="text-xs text-muted-foreground">{applications.length} {lang === "en" ? "applications" : "candidaturas"}</p>
            </div>

            {currentApp ? (
              <div className="glass-card rounded-2xl p-6 border border-transparent text-center space-y-4 animate-slide-up">
                <div className="w-20 h-20 rounded-full bg-primary/10 mx-auto flex items-center justify-center">
                  {currentApp.athlete?.avatar_url ? (
                    <img src={currentApp.athlete.avatar_url} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className="text-2xl font-display font-bold text-primary">{currentApp.athlete?.full_name?.charAt(0) || "?"}</span>
                  )}
                </div>
                <div>
                  <h3 className="font-display font-bold text-xl text-foreground">{currentApp.athlete?.full_name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <Badge className="bg-primary/20 text-primary border-0 text-xs">{currentApp.athlete?.sport || "—"}</Badge>
                    <Badge className="bg-muted text-muted-foreground border-0 text-xs">{currentApp.athlete?.position || "—"}</Badge>
                    <Badge className={`border-0 text-xs ${currentApp.athlete?.representation_status === "livre" ? "bg-primary/20 text-primary" : "bg-secondary/20 text-secondary"}`}>
                      {currentApp.athlete?.representation_status === "livre" ? t("Livre", lang) : t("Com Contrato", lang)}
                    </Badge>
                  </div>
                </div>
                {currentApp.athlete?.height_cm && (
                  <p className="text-sm text-muted-foreground"><Ruler className="w-3 h-3 inline mr-1" />{currentApp.athlete.height_cm}cm</p>
                )}
                <div className="flex gap-4 justify-center pt-4">
                  <button onClick={() => handleSwipe(currentApp.id, "rejected")} className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center hover:bg-destructive/20 transition-colors">
                    <X className="w-8 h-8 text-destructive" />
                  </button>
                  <button onClick={() => handleFavorite(currentApp.athlete_id)} className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center hover:bg-secondary/20 transition-colors">
                    <Flag className="w-5 h-5 text-secondary" />
                  </button>
                  <button onClick={() => handleSwipe(currentApp.id, "approved")} className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors">
                    <Check className="w-8 h-8 text-primary" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{currentAppIndex + 1}/{applications.length}</p>
              </div>
            ) : (
              <div className="text-center py-16">
                <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">{lang === "en" ? "No more applications to review" : "Nenhuma candidatura para revisar"}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Search & Filter */}
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder={t("Buscar", lang) + "..."} value={searchFilter} onChange={(e) => setSearchFilter(e.target.value)} className="pl-10 bg-muted border-border" />
              </div>
              <Select value={contractFilter} onValueChange={setContractFilter}>
                <SelectTrigger className="w-36 bg-muted"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">{t("Todos", lang)}</SelectItem>
                  <SelectItem value="livre">{t("Livre", lang)}</SelectItem>
                  <SelectItem value="contrato">{t("Com Contrato", lang)}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">{t("Nenhum resultado", lang)}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredEvents.map((event) => (
                  <div key={event.id} className="glass-card rounded-xl p-4 border border-transparent hover:border-primary/20 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-display font-bold text-foreground">{event.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge className="bg-primary/20 text-primary border-0 text-xs">{event.sport}</Badge>
                          {event.position && <Badge className="bg-muted text-muted-foreground border-0 text-xs">{event.position}</Badge>}
                          <Badge className={`border-0 text-xs ${event.status === "open" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {event.status === "open" ? (lang === "en" ? "Open" : "Aberto") : (lang === "en" ? "Closed" : "Fechado")}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          {event.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{event.location}</span>}
                          {event.min_height_cm && <span className="flex items-center gap-1"><Ruler className="w-3 h-3" />&gt;{event.min_height_cm}cm</span>}
                          {event.event_date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(event.event_date).toLocaleDateString(lang === "en" ? "en-US" : "pt-BR")}</span>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isClub && event.creator_id === user?.id ? (
                          <Button size="sm" variant="outline" onClick={() => { setSelectedEvent(event); loadApplications(event.id); }}>
                            <Users className="w-4 h-4 mr-1" /> {lang === "en" ? "Review" : "Curar"}
                          </Button>
                        ) : event.status === "open" ? (
                          <Button size="sm" onClick={() => handleApply(event.id)}>
                            {t("Candidatar-se", lang)}
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Create Event Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground">{t("Criar Evento", lang)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs text-muted-foreground">{lang === "en" ? "Title" : "Título"}</Label><Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} className="bg-muted border-border mt-1" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground">{lang === "en" ? "Sport" : "Esporte"}</Label>
                <Select value={formSport} onValueChange={setFormSport}><SelectTrigger className="bg-muted mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{["Futebol","Vôlei","Basquete","Futsal","Handebol"].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs text-muted-foreground">{lang === "en" ? "Position" : "Posição"}</Label><Input value={formPosition} onChange={(e) => setFormPosition(e.target.value)} placeholder={lang === "en" ? "e.g. Goalkeeper" : "ex: Goleiro"} className="bg-muted border-border mt-1" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs text-muted-foreground">{lang === "en" ? "Min Height (cm)" : "Altura Mín. (cm)"}</Label><Input type="number" value={formMinHeight} onChange={(e) => setFormMinHeight(e.target.value)} className="bg-muted border-border mt-1" /></div>
              <div><Label className="text-xs text-muted-foreground">{lang === "en" ? "Max Age" : "Idade Máx."}</Label><Input type="number" value={formMaxAge} onChange={(e) => setFormMaxAge(e.target.value)} className="bg-muted border-border mt-1" /></div>
            </div>
            <div><Label className="text-xs text-muted-foreground">{lang === "en" ? "Location" : "Local"}</Label><Input value={formLocation} onChange={(e) => setFormLocation(e.target.value)} className="bg-muted border-border mt-1" /></div>
            <div><Label className="text-xs text-muted-foreground">{lang === "en" ? "Date" : "Data"}</Label><Input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="bg-muted border-border mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setCreateDialog(false)}>{t("Cancelar", lang)}</Button>
            <Button onClick={handleCreateEvent} disabled={!formTitle.trim()}>
              <Plus className="w-4 h-4 mr-1" /> {t("Criar Evento", lang)}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!selectedEvent && <BottomNav />}
    </div>
  );
};

export default RecruitmentEvents;
