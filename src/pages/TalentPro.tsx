import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Crown, Check, Star, Eye, BarChart3, MapPin, Filter, Shield,
  FileText, Bell, Building2, Download, Zap, Sparkles,
} from "lucide-react";

const TalentPro = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = () => {
    setSubscribing(true);
    setTimeout(() => {
      setSubscribing(false);
      toast({
        title: "🎉 Bem-vindo ao Talent Pro!",
        description: "Sua assinatura foi ativada com sucesso. Aproveite todos os benefícios!",
      });
    }, 2000);
  };

  const athleteBenefits = [
    { icon: Crown, title: 'Selo "Pro Athlete"', desc: "Badge dourado/neon que destaca seu perfil nas buscas e no feed." },
    { icon: BarChart3, title: "Analytics de Olheiros", desc: "Veja o nome e clube de quem visitou seu perfil e assistiu seus vídeos." },
    { icon: Sparkles, title: "Edição Avançada (Talent Studio)", desc: "Camadas de estatísticas sobre o vídeo: gráficos de velocidade, precisão de passes durante highlights." },
    { icon: MapPin, title: "Prioridade no Mapa", desc: "Seu perfil aparece em destaque geolocalizado para olheiros buscando talentos na sua região." },
  ];

  const scoutBenefits = [
    { icon: Filter, title: "Filtros Cirúrgicos", desc: "Busca por idade exata, altura, peso, pé dominante e histórico de clubes." },
    { icon: Eye, title: "Modo Stealth (Invisível)", desc: "Analise atletas sem que saibam da sua visita. Observação neutra antes da abordagem oficial." },
    { icon: FileText, title: 'Dossiê de Talento (PDF)', desc: "Relatório profissional com ranking de elite, dados completos e avaliações técnicas." },
    { icon: Bell, title: "Radar de Alertas", desc: 'Salve uma busca (ex: "Lateral Direito, Sub-17, Canhoto") e receba push quando um atleta compatível postar.' },
  ];

  const institutionBenefits = [
    { icon: Zap, title: "Publicação Ilimitada de Editais", desc: "Poste quantas peneiras e eventos quiser, sem limite mensal." },
    { icon: BarChart3, title: "Dashboard de Inscritos", desc: "Gerencie interessados com filtro de nível técnico e exportação para Excel." },
    { icon: MapPin, title: "Destaque no Mapa", desc: "PIN da sua sede ou evento fica maior e pulsante, atraindo mais atletas." },
    { icon: Shield, title: "Suporte Prioritário", desc: "Canal direto com suporte para validação rápida de documentos e segurança." },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-secondary" />
            <span className="font-display font-bold text-lg text-foreground">Talent Pro</span>
          </div>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-8 animate-slide-up">
        {/* Hero card */}
        <div className="relative overflow-hidden rounded-2xl border border-secondary/30 p-6 text-center"
          style={{ background: "linear-gradient(135deg, hsl(25 95% 55% / 0.1), hsl(110 100% 55% / 0.05))" }}
        >
          <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-secondary/10 -translate-y-1/2 translate-x-1/2 blur-2xl" />
          <Crown className="w-12 h-12 text-secondary mx-auto mb-3" />
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">
            Talent <span className="text-secondary">Pro</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            Desbloqueie todo o potencial do TalentRadar
          </p>
          <div className="flex items-baseline justify-center gap-1 mb-2">
            <span className="text-4xl font-display font-bold text-foreground">R$ 10,90</span>
            <span className="text-muted-foreground text-sm">/mês</span>
          </div>
          <p className="text-xs text-muted-foreground mb-5">Cancele a qualquer momento. Sem fidelidade.</p>
          <Button
            variant="secondary"
            size="lg"
            className="w-full text-base glow-orange"
            onClick={handleSubscribe}
            disabled={subscribing}
          >
            {subscribing ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-secondary-foreground/30 border-t-secondary-foreground rounded-full animate-spin" />
                Processando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Assinar Talent Pro
              </span>
            )}
          </Button>
        </div>

        {/* Free vs Pro comparison */}
        <div className="glass-card rounded-xl p-4">
          <h3 className="font-display font-bold text-foreground text-center mb-4">Grátis vs Pro</h3>
          <div className="space-y-3">
            {[
              { feature: "Perfil básico", free: true, pro: true },
              { feature: "Upload de vídeos", free: "Ilimitado", pro: "Ilimitado" },
              { feature: "Ver quem visitou", free: "Só número", pro: "Nome + Clube" },
              { feature: "Filtros de busca", free: "Básico", pro: "Cirúrgico" },
              { feature: "Modo Stealth", free: false, pro: true },
              { feature: "Dossiê PDF", free: false, pro: true },
              { feature: "Radar de Alertas", free: false, pro: true },
              { feature: "Edição avançada", free: false, pro: true },
              { feature: "Publicação de editais", free: "2/mês", pro: "Ilimitado" },
              { feature: "Suporte prioritário", free: false, pro: true },
            ].map((row) => (
              <div key={row.feature} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                <span className="text-sm text-foreground">{row.feature}</span>
                <div className="flex items-center gap-6">
                  <span className="text-xs text-muted-foreground w-16 text-center">
                    {row.free === true ? <Check className="w-4 h-4 text-primary mx-auto" /> :
                      row.free === false ? <span className="text-muted-foreground/50">—</span> :
                        row.free}
                  </span>
                  <span className="text-xs text-secondary font-bold w-16 text-center">
                    {row.pro === true ? <Check className="w-4 h-4 text-secondary mx-auto" /> : row.pro}
                  </span>
                </div>
              </div>
            ))}
            <div className="flex justify-end gap-6 pt-1">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider w-16 text-center">Grátis</span>
              <span className="text-[10px] text-secondary uppercase tracking-wider font-bold w-16 text-center">Pro</span>
            </div>
          </div>
        </div>

        {/* Athlete benefits */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🏃</span>
            <h2 className="font-display font-bold text-foreground">Para Atletas</h2>
            <Badge className="bg-primary/15 text-primary border-0 text-[10px]">Atleta de Vitrine</Badge>
          </div>
          <div className="space-y-3">
            {athleteBenefits.map((b) => (
              <div key={b.title} className="glass-card rounded-xl p-4 flex gap-3 border border-transparent hover:border-primary/20 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <b.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-foreground">{b.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scout benefits */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🕵️</span>
            <h2 className="font-display font-bold text-foreground">Para Olheiros</h2>
            <Badge className="bg-cyan/15 text-cyan border-0 text-[10px]">Scout de Alta Performance</Badge>
          </div>
          <div className="space-y-3">
            {scoutBenefits.map((b) => (
              <div key={b.title} className="glass-card rounded-xl p-4 flex gap-3 border border-transparent hover:border-cyan/20 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center shrink-0">
                  <b.icon className="w-5 h-5 text-cyan" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-foreground">{b.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institution benefits */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">🏢</span>
            <h2 className="font-display font-bold text-foreground">Para Instituições</h2>
            <Badge className="bg-secondary/15 text-secondary border-0 text-[10px]">Credibilidade e Captação</Badge>
          </div>
          <div className="space-y-3">
            {institutionBenefits.map((b) => (
              <div key={b.title} className="glass-card rounded-xl p-4 flex gap-3 border border-transparent hover:border-secondary/20 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center shrink-0">
                  <b.icon className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-foreground">{b.title}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA bottom */}
        <div className="glass-card rounded-2xl p-6 text-center border border-secondary/20">
          <Star className="w-8 h-8 text-secondary mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-foreground mb-2">Pronto para se destacar?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Assine agora e desbloqueie todos os recursos Pro, independente do seu perfil.
          </p>
          <Button variant="secondary" size="lg" className="w-full glow-orange" onClick={handleSubscribe} disabled={subscribing}>
            <Crown className="w-5 h-5 mr-2" /> Assinar por R$ 10,90/mês
          </Button>
          <p className="text-[10px] text-muted-foreground mt-3">
            Pagamento seguro • Cancele quando quiser • Garantia de 7 dias
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default TalentPro;
