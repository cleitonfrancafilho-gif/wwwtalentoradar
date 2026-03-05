import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import LastCallBanner from "@/components/LastCallBanner";
import { MapPin, Calendar, ArrowLeft, Radar, Navigation } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockEvents = [
  { id: 1, title: "Peneira Sub-17 — Flamengo", sport: "Futebol", date: "15 Mar 2026", location: "CT Ninho do Urubu", distance: "12km", spots: 40 },
  { id: 2, title: "Torneio de Karatê Gratuito", sport: "Artes Marciais", date: "22 Mar 2026", location: "Ginásio Municipal", distance: "5km", spots: 120 },
  { id: 3, title: "Campeonato Amador de Basquete", sport: "Basquete", date: "28 Mar 2026", location: "Arena Carioca 1", distance: "8km", spots: 60 },
  { id: 4, title: "Seletiva de Natação Sub-15", sport: "Natação", date: "02 Abr 2026", location: "Parque Aquático Julio Delamare", distance: "15km", spots: 30 },
];

const EventsMap = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("lista");

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
          <Navigation className="w-5 h-5 text-cyan" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        <LastCallBanner />

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
            {mockEvents.map((event) => (
              <div key={event.id} className="glass-card rounded-xl p-4 hover:border-primary/20 transition-colors border border-transparent">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <Badge className="bg-cyan/15 text-cyan border-0 text-[10px]">{event.sport}</Badge>
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
            ))}
          </TabsContent>

          <TabsContent value="mapa">
            <div className="glass-card rounded-2xl aspect-[4/3] flex flex-col items-center justify-center gap-3 border border-dashed border-border">
              <MapPin className="w-12 h-12 text-cyan opacity-40" />
              <p className="font-display font-bold text-foreground">Mapa Interativo</p>
              <p className="text-xs text-muted-foreground text-center max-w-xs">
                Integração com mapa em breve. Os eventos serão exibidos por proximidade usando geolocalização.
              </p>
              <div className="flex gap-2 mt-2">
                {mockEvents.slice(0, 3).map((e) => (
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
