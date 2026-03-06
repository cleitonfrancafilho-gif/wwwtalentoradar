import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import {
  ArrowLeft, User, Search, Building2, Camera, MapPin, Trophy, Ruler, Weight,
  Star, Shield, Eye, EyeOff, Upload, Save, Plus, X, Radar,
} from "lucide-react";

// ─── ATHLETE EDIT ───
const AthleteEdit = () => {
  const [sports, setSports] = useState(["Futebol"]);
  const [newTag, setNewTag] = useState("");
  const [tags, setTags] = useState(["#Sub17", "#Atacante", "#VelocidadeAlta"]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.startsWith("#") ? newTag.trim() : `#${newTag.trim()}`]);
      setNewTag("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center text-4xl glow-green">⚽</div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Toque para alterar foto</p>
      </div>

      {/* Basic Info */}
      <div className="glass-card rounded-xl p-5 space-y-4 border border-transparent">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <User className="w-4 h-4 text-primary" /> Informações Pessoais
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground text-sm">Nome</Label>
            <Input defaultValue="Lucas Silva" className="mt-1 bg-muted border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground text-sm">Idade</Label>
            <Input defaultValue="16" type="number" className="mt-1 bg-muted border-border text-foreground" />
          </div>
        </div>
        <div>
          <Label className="text-foreground text-sm">Cidade</Label>
          <div className="relative mt-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input defaultValue="São Paulo, SP" className="pl-10 bg-muted border-border text-foreground" />
          </div>
        </div>
        <div>
          <Label className="text-foreground text-sm">Bio / Sobre mim</Label>
          <Textarea
            defaultValue="Atacante veloz com visão de jogo. Busco oportunidades em clubes de série A."
            className="mt-1 bg-muted border-border text-foreground resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Physical & Sport Stats */}
      <div className="glass-card rounded-xl p-5 space-y-4 border border-transparent">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Trophy className="w-4 h-4 text-cyan" /> Dados Esportivos
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground text-sm flex items-center gap-1"><Ruler className="w-3 h-3" /> Altura</Label>
            <Input defaultValue="1.78m" className="mt-1 bg-muted border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground text-sm flex items-center gap-1"><Weight className="w-3 h-3" /> Peso</Label>
            <Input defaultValue="72kg" className="mt-1 bg-muted border-border text-foreground" />
          </div>
        </div>
        <div>
          <Label className="text-foreground text-sm flex items-center gap-1"><Star className="w-3 h-3" /> Posição</Label>
          <Input defaultValue="Atacante" className="mt-1 bg-muted border-border text-foreground" />
        </div>
        <div>
          <Label className="text-foreground text-sm">Pé Dominante</Label>
          <div className="flex gap-2 mt-1">
            {["Direito", "Esquerdo", "Ambos"].map((p) => (
              <button key={p} className="px-3 py-1.5 rounded-full text-xs font-display font-semibold bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all first:bg-primary/20 first:text-primary">
                {p}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-foreground text-sm">Esportes</Label>
          <div className="flex gap-2 mt-1 flex-wrap">
            {sports.map((s) => (
              <Badge key={s} className="bg-primary/15 text-primary border-0 gap-1">
                {s} <X className="w-3 h-3 cursor-pointer" onClick={() => setSports(sports.filter(sp => sp !== s))} />
              </Badge>
            ))}
            <button className="px-2 py-1 rounded-full text-xs border border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center gap-1">
              <Plus className="w-3 h-3" /> Adicionar
            </button>
          </div>
        </div>
      </div>

      {/* Tags */}
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
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Nova tag..."
            className="bg-muted border-border text-foreground placeholder:text-muted-foreground"
            onKeyDown={(e) => e.key === "Enter" && addTag()}
          />
          <Button size="sm" variant="outline" onClick={addTag}><Plus className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* Highlights upload */}
      <div className="glass-card rounded-xl p-5 space-y-3 border border-transparent">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Upload className="w-4 h-4 text-primary" /> Meus Highlights
        </h3>
        <p className="text-xs text-muted-foreground">Envie vídeos dos seus melhores momentos. Use o Talent Studio para editar.</p>
        <Button variant="outline" className="w-full border-dashed border-primary/30 text-primary hover:bg-primary/10">
          <Upload className="w-4 h-4 mr-2" /> Upload de Vídeo
        </Button>
      </div>
    </div>
  );
};

// ─── SCOUT EDIT ───
const ScoutEdit = () => {
  const [anonymous, setAnonymous] = useState(false);

  return (
    <div className="space-y-6">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-cyan/20 border-2 border-cyan flex items-center justify-center text-4xl">🔍</div>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-cyan flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-cyan-foreground" />
          </button>
        </div>
        <Badge className="bg-cyan/15 text-cyan border-0 text-xs">
          <Shield className="w-3 h-3 mr-1" /> Olheiro Verificado
        </Badge>
      </div>

      {/* Professional Info */}
      <div className="glass-card rounded-xl p-5 space-y-4 border border-cyan/10">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Search className="w-4 h-4 text-cyan" /> Informações Profissionais
        </h3>
        <div>
          <Label className="text-foreground text-sm">Nome Completo</Label>
          <Input defaultValue="Carlos Mendes" className="mt-1 bg-muted border-border text-foreground" />
        </div>
        <div>
          <Label className="text-foreground text-sm">Vínculo Profissional</Label>
          <Input defaultValue="Flamengo — Dept. de Base" className="mt-1 bg-muted border-border text-foreground" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground text-sm">Registro (CREF)</Label>
            <Input defaultValue="CREF 012345-G/RJ" className="mt-1 bg-muted border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground text-sm">Experiência</Label>
            <Input defaultValue="12 anos" className="mt-1 bg-muted border-border text-foreground" />
          </div>
        </div>
        <div>
          <Label className="text-foreground text-sm">Área de Atuação</Label>
          <Input defaultValue="Futebol — Sudeste e Sul" className="mt-1 bg-muted border-border text-foreground" />
        </div>
        <div>
          <Label className="text-foreground text-sm">Bio Profissional</Label>
          <Textarea
            defaultValue="Especialista em scouting de atacantes e meias-ofensivos Sub-17 e Sub-20. Foco em velocidade e tomada de decisão."
            className="mt-1 bg-muted border-border text-foreground resize-none"
            rows={3}
          />
        </div>
      </div>

      {/* Anonymous Mode */}
      <div className="glass-card rounded-xl p-5 space-y-3 border border-cyan/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {anonymous ? <EyeOff className="w-5 h-5 text-cyan" /> : <Eye className="w-5 h-5 text-cyan" />}
            <div>
              <h3 className="font-display font-bold text-foreground text-sm">Modo Anônimo</h3>
              <p className="text-xs text-muted-foreground">Navegue sem que atletas vejam suas visitas</p>
            </div>
          </div>
          <Switch checked={anonymous} onCheckedChange={setAnonymous} />
        </div>
        {anonymous && (
          <div className="bg-cyan/5 border border-cyan/20 rounded-lg p-3 animate-slide-up">
            <p className="text-xs text-cyan">👁‍🗨 Modo ativo — seu perfil está oculto nas visualizações de atletas. Ao iniciar uma conversa, sua identidade será revelada.</p>
          </div>
        )}
      </div>

      {/* Scouting preferences */}
      <div className="glass-card rounded-xl p-5 space-y-4 border border-cyan/10">
        <h3 className="font-display font-bold text-foreground flex items-center gap-2">
          <Star className="w-4 h-4 text-cyan" /> Preferências de Scouting
        </h3>
        <div>
          <Label className="text-foreground text-sm">Esportes de Interesse</Label>
          <div className="flex gap-2 mt-2 flex-wrap">
            {["⚽ Futebol", "🏀 Basquete", "🏐 Vôlei"].map((s) => (
              <Badge key={s} className="bg-cyan/15 text-cyan border-0">{s}</Badge>
            ))}
            <button className="px-2 py-1 rounded-full text-xs border border-dashed border-border text-muted-foreground hover:border-cyan hover:text-cyan transition-all flex items-center gap-1">
              <Plus className="w-3 h-3" /> Adicionar
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-foreground text-sm">Faixa Etária</Label>
            <Input defaultValue="14-18 anos" className="mt-1 bg-muted border-border text-foreground" />
          </div>
          <div>
            <Label className="text-foreground text-sm">Posições Preferidas</Label>
            <Input defaultValue="Atacante, Meia" className="mt-1 bg-muted border-border text-foreground" />
          </div>
        </div>
      </div>

      {/* Verification */}
      <div className="border border-cyan/30 rounded-xl p-4 glass-card">
        <p className="text-xs text-cyan text-center">
          🛡 Para obter ou manter o Selo Verificado, mantenha seus documentos atualizados em Configurações → Documentos.
        </p>
      </div>
    </div>
  );
};

// ─── INSTITUTION EDIT ───
const InstitutionEdit = () => (
  <div className="space-y-6">
    {/* Logo */}
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className="w-24 h-24 rounded-2xl bg-secondary/20 border-2 border-secondary flex items-center justify-center text-4xl">🏟</div>
        <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center shadow-lg">
          <Camera className="w-4 h-4 text-secondary-foreground" />
        </button>
      </div>
      <p className="text-xs text-muted-foreground">Logo / Escudo da Instituição</p>
    </div>

    {/* Institutional Info */}
    <div className="glass-card rounded-xl p-5 space-y-4 border border-secondary/10">
      <h3 className="font-display font-bold text-foreground flex items-center gap-2">
        <Building2 className="w-4 h-4 text-secondary" /> Dados Institucionais
      </h3>
      <div>
        <Label className="text-foreground text-sm">Razão Social</Label>
        <Input defaultValue="Clube Atlético Mineiro" className="mt-1 bg-muted border-border text-foreground" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="text-foreground text-sm">CNPJ</Label>
          <Input defaultValue="12.345.678/0001-90" className="mt-1 bg-muted border-border text-foreground" />
        </div>
        <div>
          <Label className="text-foreground text-sm">Fundação</Label>
          <Input defaultValue="1908" className="mt-1 bg-muted border-border text-foreground" />
        </div>
      </div>
      <div>
        <Label className="text-foreground text-sm">Endereço da Sede / CT</Label>
        <div className="relative mt-1">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input defaultValue="Av. Engenheiro Carlos Goulart, 1000 — BH/MG" className="pl-10 bg-muted border-border text-foreground" />
        </div>
      </div>
      <div>
        <Label className="text-foreground text-sm">Responsável Legal</Label>
        <Input defaultValue="José Roberto Silva" className="mt-1 bg-muted border-border text-foreground" />
      </div>
    </div>

    {/* About */}
    <div className="glass-card rounded-xl p-5 space-y-4 border border-secondary/10">
      <h3 className="font-display font-bold text-foreground">Sobre a Instituição</h3>
      <Textarea
        defaultValue="Centro de formação de atletas com foco em categorias de base. Infraestrutura completa com campos, academia e alojamento."
        className="bg-muted border-border text-foreground resize-none"
        rows={3}
      />
    </div>

    {/* Sports & Categories */}
    <div className="glass-card rounded-xl p-5 space-y-4 border border-secondary/10">
      <h3 className="font-display font-bold text-foreground flex items-center gap-2">
        <Trophy className="w-4 h-4 text-secondary" /> Esportes & Categorias
      </h3>
      <div>
        <Label className="text-foreground text-sm">Modalidades</Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {["⚽ Futebol", "🏐 Vôlei", "🏀 Basquete"].map((s) => (
            <Badge key={s} className="bg-secondary/15 text-secondary border-0">{s}</Badge>
          ))}
          <button className="px-2 py-1 rounded-full text-xs border border-dashed border-border text-muted-foreground hover:border-secondary hover:text-secondary transition-all flex items-center gap-1">
            <Plus className="w-3 h-3" /> Adicionar
          </button>
        </div>
      </div>
      <div>
        <Label className="text-foreground text-sm">Categorias Ativas</Label>
        <div className="flex gap-2 mt-2 flex-wrap">
          {["Sub-13", "Sub-15", "Sub-17", "Sub-20"].map((c) => (
            <Badge key={c} variant="outline" className="border-secondary/30 text-foreground text-xs">{c}</Badge>
          ))}
        </div>
      </div>
    </div>

    {/* Events & Tryouts */}
    <div className="glass-card rounded-xl p-5 space-y-3 border border-secondary/10">
      <h3 className="font-display font-bold text-foreground flex items-center gap-2">
        <Star className="w-4 h-4 text-secondary" /> Peneiras & Eventos
      </h3>
      <p className="text-xs text-muted-foreground">Crie peneiras e eventos para encontrar talentos.</p>
      <Button variant="outline" className="w-full border-dashed border-secondary/30 text-secondary hover:bg-secondary/10">
        <Plus className="w-4 h-4 mr-2" /> Criar Peneira / Evento
      </Button>
    </div>
  </div>
);

// ─── MAIN PAGE ───
const EditProfile = () => {
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState("atleta");

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
          <Button size="sm" className="gap-1.5">
            <Save className="w-3.5 h-3.5" /> Salvar
          </Button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile type selector */}
        <Tabs value={profileType} onValueChange={setProfileType} className="mb-6">
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
            <AthleteEdit />
          </TabsContent>
          <TabsContent value="olheiro" className="animate-slide-up">
            <ScoutEdit />
          </TabsContent>
          <TabsContent value="instituicao" className="animate-slide-up">
            <InstitutionEdit />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default EditProfile;
