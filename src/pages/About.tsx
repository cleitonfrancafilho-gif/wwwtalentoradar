import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Radar, Shield, Heart, Globe, Mail, ExternalLink,
} from "lucide-react";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <span className="font-display font-bold text-lg text-foreground">Sobre</span>
          <div className="w-5" />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 space-y-8 animate-slide-up">
        {/* Logo & version */}
        <div className="text-center">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto mb-4 glow-green">
            <Radar className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground">
            Talent<span className="text-gradient-neon">Radar</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-1">Versão 1.0.0</p>
        </div>

        {/* Mission */}
        <div className="glass-card rounded-xl p-5 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            O TalentRadar conecta jovens atletas a olheiros e instituições esportivas de forma segura, 
            transparente e acessível. Nossa missão é democratizar a descoberta de talentos no esporte brasileiro.
          </p>
        </div>

        {/* Values */}
        <div className="space-y-3">
          {[
            { icon: Shield, title: "Segurança em Primeiro Lugar", desc: "Proteção total para menores de idade com verificação parental e biometria facial." },
            { icon: Heart, title: "Inclusão e Diversidade", desc: "Todos os esportes, todas as regiões, oportunidades iguais para todos." },
            { icon: Globe, title: "Transparência LGPD", desc: "Seus dados são tratados com total conformidade à Lei Geral de Proteção de Dados." },
          ].map((v) => (
            <div key={v.title} className="glass-card rounded-xl p-4 flex gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <v.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-foreground">{v.title}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Links */}
        <div className="glass-card rounded-xl overflow-hidden divide-y divide-border/30">
          {[
            { label: "Termos de Uso", action: () => navigate("/termos") },
            { label: "Política de Privacidade", action: () => navigate("/privacidade") },
            { label: "Central de Ajuda", action: () => navigate("/central-ajuda") },
          ].map((link) => (
            <button key={link.label} onClick={link.action} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
              <span className="text-sm text-foreground">{link.label}</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>

        {/* Contact */}
        <div className="text-center space-y-2">
          <Button variant="outline" size="sm" className="gap-2">
            <Mail className="w-4 h-4" /> contato@talentradar.com.br
          </Button>
          <p className="text-[10px] text-muted-foreground">
            © 2026 TalentRadar. Todos os direitos reservados.
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default About;
