import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Map, Users, Loader2 } from "lucide-react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface AthleteCluster {
  city: string;
  lat: number;
  lng: number;
  count: number;
  sport: string;
}

// Brazilian city coordinates for demo
const cityCoords: Record<string, [number, number]> = {
  "São Paulo": [-23.55, -46.63],
  "Rio de Janeiro": [-22.91, -43.17],
  "Belo Horizonte": [-19.92, -43.94],
  "Curitiba": [-25.43, -49.27],
  "Salvador": [-12.97, -38.51],
  "Brasília": [-15.78, -47.93],
  "Fortaleza": [-3.72, -38.52],
  "Porto Alegre": [-30.03, -51.23],
  "Recife": [-8.05, -34.87],
  "Florianópolis": [-27.59, -48.55],
  "Manaus": [-3.12, -60.02],
  "Goiânia": [-16.68, -49.25],
};

const AthleteMap = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [sportFilter, setSportFilter] = useState("todos");
  const [positionFilter, setPositionFilter] = useState("todos");
  const [clusters, setClusters] = useState<AthleteCluster[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalAthletes, setTotalAthletes] = useState(0);

  const loadData = async () => {
    setLoading(true);
    let query = supabase.from("profiles").select("address, sport, position").eq("profile_type", "atleta");
    if (sportFilter !== "todos") query = query.eq("sport", sportFilter);
    if (positionFilter !== "todos") query = query.eq("position", positionFilter);

    const { data } = await query;
    if (!data) { setLoading(false); return; }

    setTotalAthletes(data.length);

    // Group by city (extract city from address)
    const cityMap: Record<string, { count: number; sport: string }> = {};
    data.forEach(p => {
      const addr = p.address || "";
      // Try to match to known cities
      for (const city of Object.keys(cityCoords)) {
        if (addr.toLowerCase().includes(city.toLowerCase())) {
          if (!cityMap[city]) cityMap[city] = { count: 0, sport: p.sport || "—" };
          cityMap[city].count++;
          break;
        }
      }
    });

    const result: AthleteCluster[] = Object.entries(cityMap).map(([city, info]) => ({
      city,
      lat: cityCoords[city][0],
      lng: cityCoords[city][1],
      count: info.count,
      sport: info.sport,
    }));

    // If no real data, show demo clusters
    if (result.length === 0) {
      const demo: AthleteCluster[] = [
        { city: "São Paulo", lat: -23.55, lng: -46.63, count: 42, sport: "Futebol" },
        { city: "Rio de Janeiro", lat: -22.91, lng: -43.17, count: 35, sport: "Futebol" },
        { city: "Belo Horizonte", lat: -19.92, lng: -43.94, count: 18, sport: "Vôlei" },
        { city: "Curitiba", lat: -25.43, lng: -49.27, count: 12, sport: "Basquete" },
        { city: "Salvador", lat: -12.97, lng: -38.51, count: 22, sport: "Futebol" },
        { city: "Brasília", lat: -15.78, lng: -47.93, count: 9, sport: "Natação" },
        { city: "Porto Alegre", lat: -30.03, lng: -51.23, count: 15, sport: "Futebol" },
        { city: "Fortaleza", lat: -3.72, lng: -38.52, count: 8, sport: "Vôlei" },
      ];
      setClusters(demo);
    } else {
      setClusters(result);
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, [sportFilter, positionFilter]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Map className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg text-foreground">
            {lang === "en" ? "Talent Map" : "Mapa de Talentos"}
          </span>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-3 flex gap-2">
        <Select value={sportFilter} onValueChange={setSportFilter}>
          <SelectTrigger className="bg-muted w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{lang === "en" ? "All Sports" : "Todos Esportes"}</SelectItem>
            {["Futebol", "Vôlei", "Basquete", "Futsal", "Handebol", "Natação"].map(s => (
              <SelectItem key={s} value={s}>{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={positionFilter} onValueChange={setPositionFilter}>
          <SelectTrigger className="bg-muted w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">{lang === "en" ? "All Positions" : "Todas Posições"}</SelectItem>
            {["Goleiro", "Zagueiro", "Lateral", "Meia", "Atacante", "Pivô", "Armador", "Líbero", "Levantador"].map(p => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge className="bg-primary/20 text-primary border-0 flex items-center gap-1">
          <Users className="w-3 h-3" /> {totalAthletes || clusters.reduce((a, c) => a + c.count, 0)}
        </Badge>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-border h-[60vh]">
            <MapContainer
              center={[-14.24, -51.93]}
              zoom={4}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
            >
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              {clusters.map((cluster) => (
                <CircleMarker
                  key={cluster.city}
                  center={[cluster.lat, cluster.lng]}
                  radius={Math.min(cluster.count * 1.5, 30)}
                  pathOptions={{
                    color: "hsl(110, 100%, 55%)",
                    fillColor: "hsl(110, 100%, 55%)",
                    fillOpacity: 0.4,
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>{cluster.city}</strong><br />
                      {cluster.count} {lang === "en" ? "athletes" : "atletas"}<br />
                      <span className="text-xs">{cluster.sport}</span>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default AthleteMap;
