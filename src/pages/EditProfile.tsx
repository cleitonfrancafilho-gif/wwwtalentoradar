import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import BottomNav from "@/components/BottomNav";
import {
  ArrowLeft, User, Search, Building2, Camera, MapPin, Trophy, Ruler, Weight,
  Star, Shield, Eye, EyeOff, Upload, Save, Plus, X, Radar, HelpCircle, Loader2,
} from "lucide-react";

interface ProfileForm {
  full_name: string;
  bio: string;
  address: string;
  sport: string;
  position: string;
  dominant_foot: string;
  height_cm: number | null;
  weight_kg: number | null;
  professional_link: string;
  registration_number: string;
  area_of_operation: string;
  anonymous_mode: boolean;
  cnpj: string;
  legal_representative: string;
  profile_type: "atleta" | "olheiro" | "instituicao";
}

// ─── ATHLETE EDIT ───
const AthleteEdit = ({ form, setForm }: { form: ProfileForm; setForm: (f: ProfileForm) => void }) => {
  const [tags, setTags] = useState(["#Sub17", "#Atacante", "#VelocidadeAlta"]);
  const [newTag, setNewTag] = useState("");

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.startsWith("#") ? newTag.trim() : `#${newTag.trim()}`]);
      setNewTag("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-4xl glow-green">⚽</div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Toque para alterar foto</p>
      </div>

      <div className="glass-card rounded-xl p-5 space-y-4 border border-transparent">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Informações Pessoais
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground text-sm">Nome</Label>
            <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1 bg-muted border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground text-sm">Cidade</Label>
            <div className="relative mt-1">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="pl-10 bg-muted border-border text-foreground" />
            </div>
          </div>
        </div>
        <div>
          <Label className="text-foreground text-sm">Bio / Sobre mim</Label>
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1 bg-muted border-border text-foreground resize-none" rows={3} />
        </div>
      </div>

      <div className="glass-card rounded-xl p-5 space-y-4 border border-transparent">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-cyan" /> Dados Esportivos
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground text-sm flex items-center gap-1"><Ruler className="w-3 h-3" /> Altura (cm)</Label>
            <Input type="number" value={form.height_cm ?? ""} onChange={(e) => setForm({ ...form, height_cm: e.target.value ? Number(e.target.value) : null })} className="mt-1 bg-muted border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground text-sm flex items-center gap-1"><Weight className="w-3 h-3" /> Peso (kg)</Label>
            <Input type="number" value={form.weight_kg ?? ""} onChange={(e) => setForm({ ...form, weight_kg: e.target.value ? Number(e.target.value) : null })} className="mt-1 bg-muted border-border text-foreground" />
          </div>
        </div>
        <div>
          <Label className="text-foreground text-sm flex items-center gap-1"><Star className="w-3 h-3" /> Posição</Label>
          <Input value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="mt-1 bg-muted border-border text-foreground" />
        </div>
        <div>
          <Label className="text-foreground text-sm">Pé Dominante</Label>
          <div className="flex gap-2 mt-1">
            {["Direito", "Esquerdo", "Ambos"].map((p) => (
              <button key={p} onClick={() => setForm({ ...form, dominant_foot: p })} className={`px-3 py-1.5 rounded-full text-xs font-display font-semibold transition-all ${form.dominant_foot === p ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}>
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-foreground text-sm">Esporte</Label>
          <Input value={form.sport} onChange={(e) => setForm({ ...form, sport: e.target.value })} className="mt-1 bg-muted border-border text-foreground" />
        </div>
      </div>

      <div className="glass-card rounded-xl p-5 space-y-3 border border-transparent">
        <h3 className="font-display font-bold text-foreground">Tags do Perfil</h3>
        <div className="flex gap-2 flex-wrap">
          {tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="bg-primary/10 text-primary border-0 gap-1">
              {tag} <X className="w-3 h-3 cursor-pointer" onClick={() => setTags(tags.filter(t => t !== tag))} />
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input value={newTag} onChange={(e) => setNewTag(e.target.value)} placeholder="Nova tag..." className="bg-muted border-border text-foreground placeholder:text-muted-foreground" onKeyDown={(e) => e.key === "Enter" && addTag()} />
          <Button size="sm" variant="outline" onClick={addTag}><Plus className="w-4 h-4" /></Button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-5 space-y-3 border border-transparent">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" /> Meus Highlights
        </h3>
        <p className="text-xs text-muted-foreground">Envie vídeos dos seus melhores momentos.</p>
        <Button variant="outline" className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/10">
          <Upload className="w-4 h-4 mr-2" /> Upload de Vídeo
        </Button>
      </div>
    </div>
  );
};

// ─── SCOUT EDIT ───
const ScoutEdit = ({ form, setForm }: { form: ProfileForm; setForm: (f: ProfileForm) => void }) => (
  <div className="space-y-6">
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-full bg-cyan/20 border-2 border-cyan flex items-center justify-center text-4xl">🔍</div>
        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-cyan flex items-center justify-center shadow-lg">
          <Camera className="w-4 h-4 text-cyan-foreground" />
        </button>
      </div>
      <Badge className="bg-cyan/15 text-cyan border-0 text-xs"><Shield className="w-3 h-3 mr-1" /> Olheiro Verificado</Badge>
    </div>

    <div className="glass-card rounded-xl p-5 space-y-4 border border-cyan/10">
      <h3 className="font-display font-bold text-foreground flex items-center gap-2">
        <Search className="w-4 h-4 text-cyan" /> Informações Profissionais
      </h3>
      <div>
        <Label className="text-foreground text-sm">Nome Completo</Label>
        <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1 bg-muted border-border text-foreground" />
      </div>
      <div>
        <Label className="text-foreground text-sm">Vínculo Profissional</Label>
        <Input value={form.professional_link} onChange={(e) => setForm({ ...form, professional_link: e.target.value })} className="mt-1 bg-muted border-border text-foreground" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-foreground text-sm">Registro (CREF)</Label>
          <Input value={form.registration_number} onChange={(e) => setForm({ ...form, registration_number: e.target.value })} className="mt-1 bg-muted border-border text-foreground" />
        </div>
        <div>
          <Label className="text-foreground text-sm">Área de Atuação</Label>
          <Input value={form.area_of_operation} onChange={(e) => setForm({ ...form, area_of_operation: e.target.value })} className="mt-1 bg-muted border-border text-foreground" />
        </div>
      </div>
      <div>
        <Label className="text-foreground text-sm">Bio Profissional</Label>
        <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1 bg-muted border-border text-foreground resize-none" rows={3} />
      </div>
    </div>

    <div className="glass-card rounded-xl p-5 space-y-3 border border-cyan/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {form.anonymous_mode ? <EyeOff className="w-5 h-5 text-cyan" /> : <Eye className="w-5 h-5 text-cyan" />}
          <div>
            <h3 className="font-display font-bold text-foreground text-sm">Modo Anônimo</h3>
            <p className="text-xs text-muted-foreground">Navegue sem que atletas vejam suas visitas</p>
          </div>
        </div>
        <Switch checked={form.anonymous_mode} onCheckedChange={(v) => setForm({ ...form, anonymous_mode: v })} />
      </div>
    </div>
  </div>
);

// ─── INSTITUTION EDIT ───
const InstitutionEdit = ({ form, setForm }: { form: ProfileForm; setForm: (f: ProfileForm) => void }) => (
  <div className="space-y-6">
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-secondary/20 border-2 border-secondary flex items-center justify-center text-4xl">🏟</div>
        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-lg">
          <Camera className="w-4 h-4 text-secondary-foreground" />
        </button>
      </div>
    </div>

    <div className="glass-card rounded-xl p-5 space-y-4 border border-secondary/10">
      <h3 className="font-display font-bold text-foreground flex items-center gap-2">
        <Building2 className="w-4 h-4 text-secondary" /> Dados Institucionais
      </h3>
      <div>
        <Label className="text-foreground text-sm">Razão Social</Label>
        <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="mt-1 bg-muted border-border text-foreground" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-foreground text-sm">CNPJ</Label>
          <Input value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} className="mt-1 bg-muted border-border text-foreground" />
        </div>
        <div>
          <Label className="text-foreground text-sm">Responsável Legal</Label>
          <Input value={form.legal_representative} onChange={(e) => setForm({ ...form, legal_representative: e.target.value })} className="mt-1 bg-muted border-border text-foreground" />
        </div>
      </div>
      <div>
        <Label className="text-foreground text-sm">Endereço</Label>
        <div className="relative mt-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="pl-10 bg-muted border-border text-foreground" />
        </div>
      </div>
      <div>
        <Label className="text-foreground text-sm">Sobre a Instituição</Label>
        <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="mt-1 bg-muted border-border text-foreground resize-none" rows={3} />
      </div>
    </div>
  </div>
);

// ─── MAIN PAGE ───
const EditProfile = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    bio: "",
    address: "",
    sport: "",
    position: "",
    dominant_foot: "Direito",
    height_cm: null,
    weight_kg: null,
    professional_link: "",
    registration_number: "",
    area_of_operation: "",
    anonymous_mode: false,
    cnpj: "",
    legal_representative: "",
    profile_type: "atleta",
  });

  // Load profile data
  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || "",
        bio: profile.bio || "",
        address: profile.address || "",
        sport: profile.sport || "",
        position: profile.position || "",
        dominant_foot: profile.dominant_foot || "Direito",
        height_cm: profile.height_cm,
        weight_kg: profile.weight_kg,
        professional_link: profile.professional_link || "",
        registration_number: profile.registration_number || "",
        area_of_operation: profile.area_of_operation || "",
        anonymous_mode: profile.anonymous_mode || false,
        cnpj: profile.cnpj || "",
        legal_representative: profile.legal_representative || "",
        profile_type: profile.profile_type || "atleta",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name,
        bio: form.bio,
        address: form.address,
        sport: form.sport,
        position: form.position,
        dominant_foot: form.dominant_foot,
        height_cm: form.height_cm,
        weight_kg: form.weight_kg,
        professional_link: form.professional_link,
        registration_number: form.registration_number,
        area_of_operation: form.area_of_operation,
        anonymous_mode: form.anonymous_mode,
        cnpj: form.cnpj,
        legal_representative: form.legal_representative,
        profile_type: form.profile_type,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    setSaving(false);
    if (error) {
      toast.error("Erro ao salvar perfil: " + error.message);
    } else {
      toast.success("Perfil salvo com sucesso!");
      await refreshProfile();
      navigate("/perfil");
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-foreground">Editar Perfil</span>
          </div>
          <Button size="sm" className="gap-1.5" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <Tabs value={form.profile_type} onValueChange={(v) => setForm({ ...form, profile_type: v as ProfileForm["profile_type"] })} className="mb-6">
          <TabsList className="grid grid-cols-3 w-full bg-muted h-11">
            <TabsTrigger value="atleta" className="flex items-center gap-1.5 font-display text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <User className="w-3.5 h-3.5" /> Atleta
            </TabsTrigger>
            <TabsTrigger value="olheiro" className="flex items-center gap-1.5 font-display text-xs data-[state=active]:bg-cyan data-[state=active]:text-cyan-foreground">
              <Search className="w-3.5 h-3.5" /> Olheiro
            </TabsTrigger>
            <TabsTrigger value="instituicao" className="flex items-center gap-1.5 font-display text-xs data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
              <Building2 className="w-3.5 h-3.5" /> Instituição
            </TabsTrigger>
          </TabsList>

          <TabsContent value="atleta" className="animate-slide-up">
            <AthleteEdit form={form} setForm={setForm} />
          </TabsContent>
          <TabsContent value="olheiro" className="animate-slide-up">
            <ScoutEdit form={form} setForm={setForm} />
          </TabsContent>
          <TabsContent value="instituicao" className="animate-slide-up">
            <InstitutionEdit form={form} setForm={setForm} />
          </TabsContent>
        </Tabs>

        <div className="mt-8 mb-4">
          <button onClick={() => navigate("/central-ajuda")} className="w-full glass-card rounded-xl p-4 flex items-center gap-3 border border-border/50 hover:border-primary/30 transition-colors text-left">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-display font-semibold text-foreground">Central de Ajuda</p>
              <p className="text-xs text-muted-foreground">FAQ, Suporte e Feedback</p>
            </div>
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default EditProfile;
