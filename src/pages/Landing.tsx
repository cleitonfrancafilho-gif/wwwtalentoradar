import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { Radar, Users, Shield, MapPin, LogIn, UserPlus } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    { icon: Radar, title: "DVD Digital", desc: "Crie seu portfólio esportivo com vídeos, estatísticas e conquistas." },
    { icon: Users, title: "Marketplace 3 Lados", desc: "Conecte Atletas, Olheiros e Instituições em um só lugar." },
    { icon: Shield, title: "Segurança Total", desc: "Verificação parental, selos de confiança e chat protegido." },
    { icon: MapPin, title: "Eventos Próximos", desc: "Descubra peneiras, torneios e campeonatos perto de você." },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-30" style={{ backgroundImage: `url(${heroBg})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-slide-up">
          <div className="inline-flex items-center gap-2 border border-primary/30 rounded-full px-4 py-1.5 mb-8 glass">
            <Radar className="w-4 h-4 text-primary animate-pulse-neon" />
            <span className="text-sm text-primary font-display tracking-wider uppercase">Plataforma Multiesportiva</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold font-display leading-tight mb-4">
            <span className="text-foreground">Talent</span>
            <span className="text-gradient-neon">Radar</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground font-display mb-10 tracking-wide">
            Onde o talento encontra a oportunidade
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="hero" onClick={() => navigate("/cadastro")}>
              <UserPlus className="w-5 h-5 mr-2" />
              Criar uma Conta
            </Button>
            <Button variant="hero-outline" onClick={() => navigate("/login")}>
              <LogIn className="w-5 h-5 mr-2" />
              Já Tenho uma Conta
            </Button>
          </div>
        </div>
      </section>

      <section className="py-24 px-4 bg-gradient-radar">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-16">
            Descubra o <span className="text-gradient-neon">futuro do esporte</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={i} className="glass-card rounded-xl p-6 hover:border-primary/40 transition-all duration-300 group hover:glow-green border border-transparent">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-display font-bold mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-4 text-center">
        <h2 className="text-2xl md:text-3xl font-display font-bold mb-4 text-foreground">Pronto para ser descoberto?</h2>
        <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Junte-se a milhares de atletas, olheiros e instituições que já usam o TalentRadar.</p>
        <Button variant="hero" onClick={() => navigate("/cadastro")}>Começar Agora</Button>
      </section>

      <footer className="border-t border-border py-8 px-4 text-center text-muted-foreground text-sm space-y-2">
        <p>© 2026 TalentRadar — Onde o talento encontra a oportunidade</p>
        <div className="flex justify-center gap-4">
          <Link to="/termos" className="hover:text-foreground transition-colors">Termos de Uso</Link>
          <Link to="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
