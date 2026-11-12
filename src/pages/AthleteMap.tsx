import { Input } from "@/components/ui/input";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { LatLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Check } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, ChevronDown, Filter, Loader2, Map as MapIcon, MapPin, RotateCcw, Ruler, Users, Weight } from "lucide-react";

interface AthleteLocation {
  id: string;
  full_name: string;
  avatar_url: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  sport: string | null;
  position: string | null;
  dominant_foot: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  wingspan_cm: number | null;
}

interface LocationCluster {
  key: string;
  country: string;
  state: string;
  city: string;
  latitude: number;
  longitude: number;
  athletes: AthleteLocation[];
}

const ALL = "__all__";

function FitMap({ clusters }: { clusters: LocationCluster[] }) {
  const map = useMap();
  useEffect(() => {
    if (!clusters.length) {
      map.setView([18, 0], 2);
      return;
    }
    if (clusters.length === 1) {
      map.setView([clusters[0].latitude, clusters[0].longitude], 8);
      return;
    }
    map.fitBounds(new LatLngBounds(clusters.map((cluster) => [cluster.latitude, cluster.longitude])), { padding: [48, 48], maxZoom: 8 });
  }, [clusters, map]);
  return null;
}

const unique = (items: Array<string | null>) => [...new Set(items.filter((item): item is string => Boolean(item?.trim())))].sort((a, b) => a.localeCompare(b));

const AthleteMap = () => {
  const navigate = useNavigate();
  const { lang } = useLanguage();
  const [athletes, setAthletes] = useState<AthleteLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [country, setCountry] = useState(ALL);
  const [state, setState] = useState(ALL);
  const [city, setCity] = useState(ALL);
  const [sport, setSport] = useState(ALL);
  const [position, setPosition] = useState(ALL);
  const [foot, setFoot] = useState(ALL);
  const [height, setHeight] = useState([120, 230]);
  const [weight, setWeight] = useState([35, 180]);
  const [wingspan, setWingspan] = useState([120, 250]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, full_name, avatar_url, country, state, city, latitude, longitude, sport, position, dominant_foot, height_cm, weight_kg, wingspan_cm")
        .eq("profile_type", "atleta").eq("banned", false);
      setAthletes((data ?? []) as AthleteLocation[]);
      setLoading(false);
    };
    load();
  }, []);

  const countries = useMemo(() => unique(athletes.map((item) => item.country)), [athletes]);
  const states = useMemo(() => unique(athletes.filter((item) => country === ALL || item.country === country).map((item) => item.state)), [athletes, country]);
  const cities = useMemo(() => unique(athletes.filter((item) => (country === ALL || item.country === country) && (state === ALL || item.state === state)).map((item) => item.city)), [athletes, country, state]);
  const sports = useMemo(() => unique([...["Futebol", "Basquete", "Vôlei", "Futsal", "Handebol", "Tênis", "Atletismo", "Natação"], ...athletes.map((item) => item.sport)]), [athletes]);
  const positions = useMemo(() => unique(athletes.filter((item) => sport === ALL || item.sport === sport).map((item) => item.position)), [athletes, sport]);

  const visibleAthletes = useMemo(() => athletes.filter((item) => {
    const inRange = (value: number | null, range: number[], min: number, max: number) => {
      const untouched = range[0] === min && range[1] === max;
      if (value === null || value === undefined) return untouched;
      return untouched || (Number(value) >= range[0] && Number(value) <= range[1]);
    };
    const q = search.trim().toLowerCase();
    return (!q || item.full_name?.toLowerCase().includes(q) || item.city?.toLowerCase().includes(q))
      && (country === ALL || item.country === country)
      && (state === ALL || item.state === state)
      && (city === ALL || item.city === city)
      && (sport === ALL || item.sport === sport)
      && (position === ALL || item.position === position)
      && (foot === ALL || item.dominant_foot?.toLowerCase() === foot.toLowerCase())
      && inRange(item.height_cm, height, 120, 230)
      && inRange(item.weight_kg, weight, 35, 180)
      && inRange(item.wingspan_cm, wingspan, 120, 250);
  }), [athletes, country, state, city, sport, position, foot, height, weight, wingspan, search]);

  const clusters = useMemo(() => {
    const grouped = new globalThis.Map<string, LocationCluster>();
    visibleAthletes.forEach((athlete) => {
      if (athlete.latitude === null || athlete.longitude === null || !athlete.country || !athlete.city) return;
      const key = `${athlete.country}|${athlete.state ?? ""}|${athlete.city}|${athlete.latitude.toFixed(3)}|${athlete.longitude.toFixed(3)}`;
      const current = grouped.get(key);
      if (current) current.athletes.push(athlete);
      else grouped.set(key, {
        key,
        country: athlete.country,
        state: athlete.state ?? "",
        city: athlete.city,
        latitude: athlete.latitude,
        longitude: athlete.longitude,
        athletes: [athlete],
      });
    });
    return [...grouped.values()];
  }, [visibleAthletes]);

  const resetFilters = () => {
    setCountry(ALL); setState(ALL); setCity(ALL); setSport(ALL); setPosition(ALL); setFoot(ALL);
    setHeight([120, 230]); setWeight([35, 180]); setWingspan([120, 250]); setSearch("");
  };

  const selectClass = "bg-muted h-9";
  const label = (pt: string, en: string) => lang === "en" ? en : pt;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" size="icon" onClick={() => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/feed"))} aria-label={label("Voltar", "Back")}><ArrowLeft className="w-5 h-5" /></Button>
            <MapIcon className="w-5 h-5 text-primary shrink-0" />
            <div className="min-w-0">
              <h1 className="font-display font-bold text-lg text-foreground truncate">{label("Mapa Mundial de Talentos", "World Talent Map")}</h1>
              <p className="text-xs text-muted-foreground">{label("Atletas localizados por cidade", "Athletes located by city")}</p>
            </div>
          </div>
          <Badge className="bg-primary/15 text-primary border-primary/20 gap-1 shrink-0"><Users className="w-3.5 h-3.5" /> {visibleAthletes.length}</Badge>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-3 space-y-3">
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen} className="border border-border bg-card rounded-md">
          <div className="flex items-center justify-between px-3 py-2">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="gap-2 px-1"><Filter className="w-4 h-4 text-primary" /> {label("Filtros do mapa", "Map filters")} <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} /></Button>
            </CollapsibleTrigger>
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1 text-muted-foreground"><RotateCcw className="w-3.5 h-3.5" /> {label("Limpar", "Reset")}</Button>
          </div>
          <CollapsibleContent className="border-t border-border px-3 py-3 space-y-4">
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={label("Buscar atleta por nome ou cidade...", "Search athlete by name or city...")} className="bg-muted h-9" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
              <SearchSelect value={country} onChange={(value) => { setCountry(value); setState(ALL); setCity(ALL); }} options={countries} placeholder={label("País", "Country")} allLabel={label("Todos os países", "All countries")} searchLabel={label("Pesquisar...", "Search...")} />
              <SearchSelect value={state} onChange={(value) => { setState(value); setCity(ALL); }} options={states} placeholder={label("Estado", "State")} allLabel={label("Todos os estados", "All states")} searchLabel={label("Pesquisar...", "Search...")} />
              <SearchSelect value={city} onChange={(value) => { setCity(value); }} options={cities} placeholder={label("Cidade", "City")} allLabel={label("Todas as cidades", "All cities")} searchLabel={label("Pesquisar...", "Search...")} />
              <SearchSelect value={sport} onChange={(value) => { setSport(value); setPosition(ALL); }} options={sports} placeholder={label("Modalidade", "Sport")} allLabel={label("Todas modalidades", "All sports")} searchLabel={label("Pesquisar...", "Search...")} />
              <Select value={position} onValueChange={setPosition}><SelectTrigger className={selectClass}><SelectValue placeholder={label("Posição", "Position")} /></SelectTrigger><SelectContent><SelectItem value={ALL}>{label("Todas posições", "All positions")}</SelectItem>{positions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
              <Select value={foot} onValueChange={setFoot}><SelectTrigger className={selectClass}><SelectValue placeholder={label("Pé dominante", "Dominant foot")} /></SelectTrigger><SelectContent><SelectItem value={ALL}>{label("Qualquer pé", "Any foot")}</SelectItem>{["Direito", "Esquerdo", "Ambos"].map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select>
            </div>
            <div className="grid md:grid-cols-3 gap-5 px-1">
              <RangeFilter icon={<Ruler className="w-3.5 h-3.5" />} label={label("Altura", "Height")} value={height} setValue={setHeight} min={120} max={230} unit="cm" />
              <RangeFilter icon={<Weight className="w-3.5 h-3.5" />} label={label("Peso", "Weight")} value={weight} setValue={setWeight} min={35} max={180} unit="kg" />
              <RangeFilter icon={<Ruler className="w-3.5 h-3.5" />} label={label("Envergadura", "Wingspan")} value={wingspan} setValue={setWingspan} min={120} max={250} unit="cm" />
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="relative h-[58vh] min-h-[390px] overflow-hidden rounded-md border border-border bg-muted">
          {loading && <div className="absolute inset-0 z-20 bg-background/70 flex items-center justify-center"><Loader2 className="w-7 h-7 animate-spin text-primary" /></div>}
          <MapContainer center={[18, 0]} zoom={2} minZoom={2} maxZoom={18} scrollWheelZoom className="h-full w-full z-0">
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
            <FitMap clusters={clusters} />
            {clusters.map((cluster) => (
              <CircleMarker key={cluster.key} center={[cluster.latitude, cluster.longitude]} radius={Math.min(10 + Math.sqrt(cluster.athletes.length) * 5, 32)} pathOptions={{ color: "hsl(110, 100%, 42%)", fillColor: "hsl(110, 100%, 42%)", fillOpacity: 0.65, weight: 3 }}>
                <Popup minWidth={220}>
                  <div className="space-y-2">
                    <div><strong>{cluster.city}</strong><div className="text-xs text-muted-foreground">{[cluster.state, cluster.country].filter(Boolean).join(", ")}</div></div>
                    <div className="text-sm font-semibold">{cluster.athletes.length} {label("atleta(s)", "athlete(s)")}</div>
                    <div className="max-h-36 overflow-y-auto space-y-1">{cluster.athletes.slice(0, 8).map((athlete) => <button key={athlete.id} onClick={() => navigate(`/perfil/${athlete.id}`)} className="block w-full text-left text-sm hover:underline">{athlete.full_name || label("Atleta", "Athlete")} · {athlete.sport || "—"}</button>)}</div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
          {!loading && clusters.length === 0 && <div className="pointer-events-none absolute left-1/2 top-4 z-10 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md rounded-md border border-border bg-card/95 px-4 py-3 text-center shadow-lg"><MapPin className="w-5 h-5 text-primary mx-auto mb-1" /><p className="text-sm font-semibold text-foreground">{label("Nenhum atleta localizado", "No located athletes")}</p><p className="text-xs text-muted-foreground">{label("Ajuste os filtros ou peça aos atletas para preencher país, estado e cidade no perfil.", "Adjust filters or ask athletes to complete country, state and city in their profile.")}</p></div>}
        </div>

        <section className="space-y-2">
          <h2 className="font-display font-bold text-foreground text-sm">{label("Atletas encontrados", "Athletes found")} ({visibleAthletes.length})</h2>
          {!loading && visibleAthletes.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">{label("Nenhum atleta corresponde aos filtros.", "No athletes match the filters.")}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {visibleAthletes.map((a) => (
              <button key={a.id} onClick={() => navigate(`/perfil/${a.id}`)} className="flex items-center gap-3 rounded-md border border-border bg-card p-3 text-left hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center shrink-0">
                  {a.avatar_url ? <img src={a.avatar_url} alt={a.full_name} className="w-full h-full object-cover" /> : <span className="font-display font-bold text-primary">{a.full_name?.charAt(0) || "?"}</span>}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground truncate">{a.full_name || label("Atleta", "Athlete")}</p>
                  <p className="text-xs text-muted-foreground truncate">{[a.sport, a.position].filter(Boolean).join(" · ") || "—"}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{[a.city, a.state, a.country].filter(Boolean).join(", ") || label("Local não informado", "No location")}{a.height_cm ? ` · ${a.height_cm}cm` : ""}</p>
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
      <BottomNav />
    </div>
  );
};

const SearchSelect = ({ value, onChange, options, placeholder, allLabel, searchLabel }: { value: string; onChange: (v: string) => void; options: string[]; placeholder: string; allLabel: string; searchLabel: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-muted h-9 justify-between font-normal px-3"><span className="truncate">{value === ALL ? placeholder : value}</span><ChevronDown className="w-4 h-4 opacity-50 shrink-0" /></Button>
      </PopoverTrigger>
      <PopoverContent className="p-0 w-56" align="start">
        <Command>
          <CommandInput placeholder={searchLabel} />
          <CommandList>
            <CommandEmpty>—</CommandEmpty>
            <CommandGroup>
              {[ALL, ...options].map((opt) => (
                <CommandItem key={opt} value={opt === ALL ? allLabel : opt} onSelect={() => { onChange(opt); setOpen(false); }}>
                  <Check className={`w-4 h-4 mr-2 ${value === opt ? "opacity-100" : "opacity-0"}`} />{opt === ALL ? allLabel : opt}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const RangeFilter = ({ icon, label, value, setValue, min, max, unit }: { icon: React.ReactNode; label: string; value: number[]; setValue: (value: number[]) => void; min: number; max: number; unit: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs"><span className="flex items-center gap-1 text-muted-foreground">{icon}{label}</span><span className="font-medium text-foreground">{value[0]}–{value[1]} {unit}</span></div>
    <Slider min={min} max={max} step={1} value={value} onValueChange={setValue} />
  </div>
);

export default AthleteMap;