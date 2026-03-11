import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import {
  ArrowLeft, Video, Brain, MessageSquare, CheckCircle2, XCircle, BookOpen, ChevronDown, ChevronUp,
} from "lucide-react";

const trainingTips = [
  { title: "Como gravar lances com o celular", desc: "Posicione a câmera na lateral do campo, a 1.5m do chão. Use modo paisagem e estabilize com tripé.", icon: "📱" },
  { title: "Editando no Talent Studio", desc: "Use o Trim para cortar tempos mortos, o Spotlight para destacar sua posição e Slow-Mo nos lances decisivos.", icon: "🎬" },
  { title: "Iluminação ideal para vídeos", desc: "Prefira gravar durante o dia. Evite contraluz. A melhor hora é entre 7h-9h ou 15h-17h.", icon: "💡" },
  { title: "Áudio e trilha sonora", desc: "Remova áudio ambiente com ruído. Adicione uma música motivacional de fundo para engajar olheiros.", icon: "🎵" },
];

const mentalityContent = [
  { title: "Controlando a ansiedade em testes", desc: "Técnicas de respiração 4-7-8: inspire 4s, segure 7s, expire 8s. Pratique visualização positiva na noite anterior.", icon: "🧘", type: "Artigo" },
  { title: "Resiliência após lesões", desc: "A recuperação mental é tão importante quanto a física. Estabeleça micro-metas semanais e celebre cada progresso.", icon: "💪", type: "Vídeo" },
  { title: "Foco sob pressão", desc: "Desenvolva rotinas pré-jogo. Use palavras-gatilho positivas. Concentre-se no processo, não no resultado.", icon: "🎯", type: "Artigo" },
  { title: "Lidando com rejeição", desc: "Cada 'não' é um aprendizado. Peça feedback, ajuste seu jogo e volte mais preparado na próxima oportunidade.", icon: "🔄", type: "Artigo" },
];

const interviewDo = [
  "Chegue 15 minutos antes",
  "Vista-se de forma profissional",
  "Mantenha contato visual",
  "Fale sobre suas conquistas com dados",
  "Demonstre humildade e vontade de aprender",
  "Pesquise sobre o clube antes",
];

const interviewDont = [
  "Não fale mal de clubes anteriores",
  "Não exagere suas habilidades",
  "Não use gírias excessivas",
  "Não demonstre desinteresse",
  "Não interrompa o entrevistador",
  "Não esqueça de agradecer ao final",
];

const commonQuestions = [
  "Qual é a sua maior qualidade como atleta?",
  "Conte sobre um momento difícil e como superou.",
  "Por que você quer jogar neste clube?",
  "Como você lida com críticas do treinador?",
  "Quais são seus objetivos para os próximos 2 anos?",
];

type Tab = "dicas" | "mentalidade" | "entrevista";

const CareerCenter = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>("dicas");
  const [expandedQ, setExpandedQ] = useState<number | null>(null);

  const tabs: { key: Tab; label: string; icon: any }[] = [
    { key: "dicas", label: "Treinamento", icon: Video },
    { key: "mentalidade", label: "Mentalidade", icon: Brain },
    { key: "entrevista", label: "Entrevista", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="font-display font-bold text-foreground text-lg">Central de Carreira</h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="sticky top-[53px] z-40 glass border-b border-border/50">
        <div className="max-w-2xl mx-auto flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-display font-bold uppercase tracking-wider transition-colors border-b-2 ${
                activeTab === tab.key ? "text-primary border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-4 animate-slide-up">
        {activeTab === "dicas" && (
          <>
            <p className="text-sm text-muted-foreground">Aprenda a gravar e editar seus melhores lances para impressionar olheiros.</p>
            {trainingTips.map((tip, i) => (
              <div key={i} className="glass-card rounded-xl p-4 border border-transparent hover:border-primary/20 transition-colors">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl shrink-0">{tip.icon}</div>
                  <div>
                    <h3 className="text-sm font-display font-bold text-foreground mb-1">{tip.title}</h3>
                    <p className="text-xs text-muted-foreground">{tip.desc}</p>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full" onClick={() => navigate("/talent-studio")}>
              <Video className="w-4 h-4 mr-2" /> Abrir Talent Studio
            </Button>
          </>
        )}

        {activeTab === "mentalidade" && (
          <>
            <p className="text-sm text-muted-foreground">Fortaleça sua mente para performar no mais alto nível.</p>
            {mentalityContent.map((item, i) => (
              <div key={i} className="glass-card rounded-xl p-4 border border-transparent hover:border-cyan/20 transition-colors">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-cyan/10 flex items-center justify-center text-xl shrink-0">{item.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-display font-bold text-foreground">{item.title}</h3>
                      <Badge className="bg-cyan/15 text-cyan border-0 text-[9px]">{item.type}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </>
        )}

        {activeTab === "entrevista" && (
          <>
            <p className="text-sm text-muted-foreground">Prepare-se para impressionar recrutadores e dirigentes.</p>

            {/* Do and Don't */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass-card rounded-xl p-4 border border-primary/20">
                <h3 className="text-xs font-display font-bold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> O que fazer
                </h3>
                <div className="space-y-2">
                  {interviewDo.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <span className="text-[11px] text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-xl p-4 border border-destructive/20">
                <h3 className="text-xs font-display font-bold text-destructive uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" /> O que não fazer
                </h3>
                <div className="space-y-2">
                  {interviewDont.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <XCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                      <span className="text-[11px] text-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Common Questions */}
            <div className="glass-card rounded-xl p-4 border border-transparent">
              <h3 className="text-xs font-display font-bold text-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-secondary" /> Perguntas Comuns
              </h3>
              <div className="space-y-2">
                {commonQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                    className="w-full text-left glass-card rounded-lg p-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-display">{q}</span>
                      {expandedQ === i ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                    {expandedQ === i && (
                      <p className="text-[11px] text-muted-foreground mt-2 pt-2 border-t border-border/50">
                        💡 Dica: Seja específico, use exemplos reais da sua trajetória e mostre autoconhecimento.
                      </p>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default CareerCenter;
