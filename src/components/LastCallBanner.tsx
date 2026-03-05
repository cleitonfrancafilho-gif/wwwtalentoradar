import { Badge } from "@/components/ui/badge";
import { Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LastCallEvent {
  id: number;
  title: string;
  sport: string;
  hoursLeft: number;
  location: string;
}

const mockLastCall: LastCallEvent[] = [
  { id: 10, title: "Peneira Sub-15 — Palmeiras", sport: "Futebol", hoursLeft: 12, location: "Academia de Futebol" },
  { id: 11, title: "Seletiva de Vôlei Feminino", sport: "Vôlei", hoursLeft: 36, location: "Ginásio Ibirapuera" },
];

const LastCallBanner = () => (
  <div className="space-y-3">
    <h3 className="font-display font-bold text-foreground flex items-center gap-2">
      <Clock className="w-4 h-4 text-destructive animate-pulse-neon" />
      Last Call — Expira em breve!
    </h3>
    {mockLastCall.map((event) => (
      <div key={event.id} className="glass-card rounded-xl p-4 border-destructive/30 border">
        <div className="flex items-start justify-between">
          <div>
            <Badge className="bg-destructive/20 text-destructive border-0 text-[10px] mb-1.5">
              ⏳ {event.hoursLeft}h restantes
            </Badge>
            <h4 className="font-display font-bold text-foreground text-sm">{event.title}</h4>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="w-3 h-3" /> {event.location}
            </p>
          </div>
          <Button size="sm" className="text-xs shrink-0">
            Inscrever
          </Button>
        </div>
      </div>
    ))}
  </div>
);

export default LastCallBanner;
