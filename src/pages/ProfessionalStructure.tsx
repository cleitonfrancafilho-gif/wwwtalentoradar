import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import {
  ArrowLeft, Briefcase, Plus, Trash2, Save, Building, Calendar, Trophy, Star,
} from "lucide-react";

interface ClubEntry {
  id?: string;
  club_name: string;
  period_start: string;
  period_end: string;
  achievements: string;
}

const ProfessionalStructure = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [repStatus, setRepStatus] = useState("livre");
  const [clubs, setClubs] = useState<ClubEntry[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setRepStatus((profile as any).representation_status || "livre");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("club_history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (data) setClubs(data.map((d: any) => ({
        id: d.id,
        club_name: d.club_name,
        period_start: d.period_start,
        period_end: d.period_end || "",
        achievements: d.achievements || "",
      })));
    };
    fetch();
  }, [user]);

  const addClub = () => {
    setClubs([...clubs, { club_name: "", period_start: "", period_end: "", achievements: "" }]);
  };

  const removeClub = async (index: number) => {
    const club = clubs[index];
    if (club.id) {
      await supabase.from("club_history").delete().eq("id", club.id);
    }
    setClubs(clubs.filter((_, i) => i !== index));
  };

  const updateClub = (index: number, field: keyof ClubEntry, value: string) => {
    const updated = [...clubs];
    (updated[index] as any)[field] = value;
    setClubs(updated);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    // Save representation status
    await supabase.from("profiles").update({
      representation_status: repStatus,
    } as any).eq("id", user.id);

    // Save clubs
    for (const club of clubs) {
      if (!club.club_name.trim()) continue;
      if (club.id) {
        await supabase.from("club_history").update({
          club_name: club.club_name,
          period_start: club.period_start,
          period_end: club.period_end || null,
          achievements: club.achievements || null,
        }).eq("id", club.id);
      } else {
        await supabase.from("club_history").insert({
          user_id: user.id,
          club_name: club.club_name,
          period_start: club.period_start,
          period_end: club.period_end || null,
          achievements: club.achievements || null,
        });
      }
    }

    setSaving(false);
    toast.success("Dados profissionais salvos!");
    refreshProfile();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-foreground text-lg">Estrutura Profissional</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 animate-slide-up">
        {/* Representation Status */}
        <div className="glass-card rounded-xl p-5 border border-transparent">
          <h2 className="font-display font-bold text-foreground mb-3 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> Status de Representação
          </h2>
          <Select value={repStatus} onValueChange={setRepStatus}>
            <SelectTrigger className="bg-muted/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="livre">🟢 Livre no Mercado</SelectItem>
              <SelectItem value="agente">🔵 Com Agente / Empresário</SelectItem>
              <SelectItem value="contrato">🟡 Sob Contrato</SelectItem>
            </SelectContent>
          </Select>
          {repStatus === "livre" && (
            <div className="mt-3 flex items-center gap-2">
              <Badge className="bg-primary/15 text-primary border-0 text-xs">
                <Star className="w-3 h-3 mr-1" /> Livre no Mercado
              </Badge>
              <span className="text-[10px] text-muted-foreground">Este badge aparecerá no seu perfil</span>
            </div>
          )}
        </div>

        {/* Club Timeline */}
        <div className="glass-card rounded-xl p-5 border border-transparent">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-foreground flex items-center gap-2">
              <Building className="w-5 h-5 text-cyan" /> Histórico de Clubes
            </h2>
            <Button variant="ghost" size="sm" onClick={addClub}>
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </div>

          {clubs.length === 0 ? (
            <div className="text-center py-8">
              <Building className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum clube adicionado</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={addClub}>
                <Plus className="w-4 h-4 mr-1" /> Adicionar Primeiro Clube
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {clubs.map((club, i) => (
                <div key={i} className="relative pl-6 border-l-2 border-primary/30 pb-4 last:pb-0">
                  <div className="absolute left-[-5px] top-0 w-2.5 h-2.5 rounded-full bg-primary glow-green" />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Nome do Clube"
                        value={club.club_name}
                        onChange={(e) => updateClub(i, "club_name", e.target.value)}
                        className="bg-muted/50 text-sm font-display font-bold"
                      />
                      <button onClick={() => removeClub(i)} className="text-destructive hover:text-destructive/80 shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Início</Label>
                        <Input
                          placeholder="Ex: Jan 2024"
                          value={club.period_start}
                          onChange={(e) => updateClub(i, "period_start", e.target.value)}
                          className="bg-muted/50 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Fim</Label>
                        <Input
                          placeholder="Ex: Atual"
                          value={club.period_end}
                          onChange={(e) => updateClub(i, "period_end", e.target.value)}
                          className="bg-muted/50 text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> Conquistas
                      </Label>
                      <Input
                        placeholder="Ex: Artilheiro do campeonato sub-17"
                        value={club.achievements}
                        onChange={(e) => updateClub(i, "achievements", e.target.value)}
                        className="bg-muted/50 text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button className="w-full" onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" /> {saving ? "Salvando..." : "Salvar Tudo"}
        </Button>
      </main>

      <BottomNav />
    </div>
  );
};

export default ProfessionalStructure;
