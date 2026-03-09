import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Radar, ArrowLeft, HelpCircle, MessageSquare, Star, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const faqItems = [
  { q: "Como funciona o TalentRadar?", a: "O TalentRadar conecta atletas, olheiros e instituições esportivas. Atletas publicam vídeos e estatísticas, enquanto olheiros descobrem talentos filtrados por esporte, idade e região." },
  { q: "Preciso pagar para usar?", a: "O cadastro e uso básico são gratuitos. Funcionalidades premium estarão disponíveis em breve." },
  { q: "Como verifico meu perfil de olheiro?", a: "Após o cadastro, envie seus documentos profissionais (CREF, vínculo federativo) pela aba de Edição de Perfil. Nossa equipe analisará e concederá o Selo de Verificado." },
  { q: "O que é o Talent Studio?", a: "É a ferramenta de criação e edição de vídeos da plataforma. Permite gravar, adicionar filtros e publicar highlights diretamente no seu perfil." },
  { q: "Menores de idade podem usar a plataforma?", a: "Sim, com a autorização de um responsável legal. Durante o cadastro, é obrigatório vincular o e-mail e CPF do responsável com verificação por código OTP." },
  { q: "Como protegem meus dados?", a: "Seguimos rigorosamente a LGPD. Dados de menores recebem proteção especial. Consulte nossa Política de Privacidade para mais detalhes." },
  { q: "Posso usar o app offline?", a: "O TalentRadar é um PWA — funcionalidades básicas de visualização podem funcionar offline, mas ações como envio de vídeos e mensagens requerem conexão." },
];

const HelpCenter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Support form state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sendingSupport, setSendingSupport] = useState(false);

  // Feedback state
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [sendingFeedback, setSendingFeedback] = useState(false);

  const handleSupportSubmit = () => {
    if (!subject || !message.trim()) {
      toast({ title: "Preencha todos os campos", description: "Selecione um assunto e escreva sua mensagem.", variant: "destructive" });
      return;
    }
    setSendingSupport(true);
    setTimeout(() => {
      setSendingSupport(false);
      setSubject("");
      setMessage("");
      toast({ title: "✅ Mensagem enviada!", description: "Nossa equipe responderá em até 48h." });
    }, 1500);
  };

  const handleFeedbackSubmit = () => {
    if (rating === 0) {
      toast({ title: "Avalie a plataforma", description: "Selecione de 1 a 5 estrelas.", variant: "destructive" });
      return;
    }
    setSendingFeedback(true);
    setTimeout(() => {
      setSendingFeedback(false);
      setRating(0);
      setFeedbackComment("");
      toast({ title: "✅ Obrigado pelo feedback!", description: "Sua avaliação nos ajuda a melhorar." });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 px-4 py-4 glass">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">
              Central de <span className="text-gradient-neon">Ajuda</span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 pb-24">
        <div className="max-w-2xl mx-auto animate-slide-up">
          <Tabs defaultValue="faq" className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-muted mb-6 h-12">
              <TabsTrigger value="faq" className="flex items-center gap-1.5 font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <HelpCircle className="w-4 h-4" /> FAQ
              </TabsTrigger>
              <TabsTrigger value="suporte" className="flex items-center gap-1.5 font-display data-[state=active]:bg-cyan data-[state=active]:text-cyan-foreground">
                <MessageSquare className="w-4 h-4" /> Suporte
              </TabsTrigger>
              <TabsTrigger value="feedback" className="flex items-center gap-1.5 font-display data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <Star className="w-4 h-4" /> Feedback
              </TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent value="faq">
              <div className="glass-card rounded-xl p-4 border border-border/50">
                <h2 className="text-lg font-display font-bold text-foreground mb-4">Perguntas Frequentes</h2>
                <Accordion type="single" collapsible className="w-full">
                  {faqItems.map((item, i) => (
                    <AccordionItem key={i} value={`faq-${i}`} className="border-border/30">
                      <AccordionTrigger className="text-sm text-foreground hover:no-underline hover:text-primary font-display">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm text-muted-foreground">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="suporte">
              <div className="glass-card rounded-xl p-6 space-y-5 border border-border/50">
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">Canal de Suporte</h2>
                  <p className="text-sm text-muted-foreground mt-1">Envie sua dúvida, sugestão ou reporte um problema.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-foreground text-sm">Assunto</Label>
                    <Select value={subject} onValueChange={setSubject}>
                      <SelectTrigger className="mt-1.5 bg-muted border-border text-foreground">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">🐛 Bug / Problema</SelectItem>
                        <SelectItem value="sugestao">💡 Sugestão</SelectItem>
                        <SelectItem value="duvida">❓ Dúvida</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-foreground text-sm">Mensagem</Label>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Descreva com detalhes..."
                      className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground min-h-[120px]"
                    />
                  </div>

                  <Button onClick={handleSupportSubmit} disabled={sendingSupport} className="w-full gap-2">
                    <Send className="w-4 h-4" />
                    {sendingSupport ? "Enviando..." : "Enviar Mensagem"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Feedback Tab */}
            <TabsContent value="feedback">
              <div className="glass-card rounded-xl p-6 space-y-6 border border-border/50">
                <div>
                  <h2 className="text-lg font-display font-bold text-foreground">Avalie o TalentRadar</h2>
                  <p className="text-sm text-muted-foreground mt-1">Sua opinião é essencial para melhorarmos a plataforma.</p>
                </div>

                {/* Star rating */}
                <div className="space-y-2">
                  <Label className="text-foreground text-sm">Sua avaliação</Label>
                  <div className="flex gap-2 justify-center py-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-10 h-10 transition-colors ${
                            star <= (hoverRating || rating)
                              ? "text-secondary fill-secondary drop-shadow-[0_0_8px_hsl(25,95%,55%,0.5)]"
                              : "text-muted-foreground/30"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-sm font-display font-semibold text-secondary animate-fade-in">
                      {rating === 1 && "😞 Muito ruim"}
                      {rating === 2 && "😕 Ruim"}
                      {rating === 3 && "😐 Regular"}
                      {rating === 4 && "😊 Bom"}
                      {rating === 5 && "🤩 Excelente!"}
                    </p>
                  )}
                </div>

                {/* Optional comment */}
                <div>
                  <Label className="text-foreground text-sm">Comentário (opcional)</Label>
                  <Textarea
                    value={feedbackComment}
                    onChange={(e) => setFeedbackComment(e.target.value)}
                    placeholder="Conte-nos mais sobre sua experiência..."
                    className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <Button
                  onClick={handleFeedbackSubmit}
                  disabled={sendingFeedback}
                  variant="secondary"
                  className="w-full gap-2"
                >
                  <Star className="w-4 h-4" />
                  {sendingFeedback ? "Enviando..." : "Enviar Avaliação"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default HelpCenter;
