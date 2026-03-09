import { useState } from "react";
import { ArrowLeft, Radar, ShieldCheck, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Terms = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accepted, setAccepted] = useState<boolean | null>(null);

  const handleAccept = () => {
    setAccepted(true);
    toast({ title: "✅ Termos aceitos!", description: "Prosseguindo para validação biométrica..." });
    setTimeout(() => navigate("/captura-facial"), 1500);
  };

  const handleDecline = () => {
    setAccepted(false);
    toast({ title: "Termos não aceitos", description: "Não é possível concluir o cadastro sem aceitar os termos.", variant: "destructive" });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Radar className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-foreground">Termos de Uso e Política de Privacidade</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Termos de Uso e Política de Privacidade</h1>
          <p className="text-muted-foreground text-sm mt-1">TalentRadar — Última atualização: Março 2026</p>
        </div>

        <div className="glass-card rounded-xl p-6 border border-primary/10 space-y-6 text-sm leading-relaxed">
          {/* 1 */}
          <section>
            <h2 className="font-display text-lg font-bold text-foreground mb-2">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground">
              Ao utilizar o <strong className="text-foreground">TalentRadar</strong>, você declara ter lido, compreendido e concordado integralmente com estes Termos de Uso e Política de Privacidade. Caso seja <strong className="text-foreground">menor de 18 anos</strong>, o uso está condicionado à autorização verificada de um responsável legal.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="font-display text-lg font-bold text-foreground mb-2">2. Dados Coletados</h2>
            <p className="text-muted-foreground mb-2">Para funcionamento da plataforma, coletamos:</p>
            <ul className="text-muted-foreground space-y-1 list-disc pl-5">
              <li><strong className="text-foreground">Dados pessoais:</strong> Nome completo, CPF, data de nascimento, e-mail e telefone.</li>
              <li><strong className="text-foreground">Dados biométricos (dado sensível):</strong> Imagem facial capturada durante o cadastro, utilizada <strong className="text-foreground">exclusivamente para autenticação e prevenção à fraude</strong>.</li>
              <li><strong className="text-foreground">Dados esportivos:</strong> Modalidades, estatísticas, vídeos e conquistas.</li>
              <li><strong className="text-foreground">Dados de navegação:</strong> Logs de acesso, IP e dispositivo utilizado.</li>
            </ul>
          </section>

          {/* 3 - Biometria */}
          <section className="border border-secondary/30 rounded-lg p-4 bg-secondary/5">
            <h2 className="font-display text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-secondary" />
              3. Biometria Facial — Dado Pessoal Sensível
            </h2>
            <p className="text-muted-foreground mb-2">
              A <strong className="text-foreground">biometria facial</strong> é classificada pela LGPD (Art. 5º, II) como <strong className="text-foreground">dado pessoal sensível</strong>. Sua coleta é realizada com as seguintes garantias:
            </p>
            <ul className="text-muted-foreground space-y-1 list-disc pl-5">
              <li><strong className="text-foreground">Finalidade restrita:</strong> Verificação de identidade, autenticação segura e prevenção à fraude.</li>
              <li><strong className="text-foreground">Base legal:</strong> Art. 11, II, "g" da LGPD — garantia da prevenção à fraude e segurança do titular.</li>
              <li><strong className="text-foreground">Criptografia:</strong> Os dados biométricos são criptografados em trânsito (TLS) e em repouso (AES-256).</li>
              <li><strong className="text-foreground">Sem compartilhamento publicitário:</strong> Jamais compartilhamos dados biométricos com terceiros para fins de marketing ou publicidade.</li>
              <li><strong className="text-foreground">Compartilhamento restrito:</strong> Apenas com bureaus de verificação de identidade, quando estritamente necessário.</li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="font-display text-lg font-bold text-foreground mb-2">4. Proteção de Menores (LGPD + ECA)</h2>
            <p className="text-muted-foreground mb-2">Em conformidade com a LGPD (Art. 14) e o Estatuto da Criança e do Adolescente:</p>
            <ul className="text-muted-foreground space-y-1 list-disc pl-5">
              <li>Vínculo parental <strong className="text-foreground">obrigatório</strong> para menores de 18 anos</li>
              <li>Verificação do responsável via <strong className="text-foreground">código OTP por e-mail</strong></li>
              <li>Notificações espelhadas para o responsável sobre interações</li>
              <li>Bloqueio automático de palavras sensíveis em conversas</li>
              <li>Proibição de compartilhamento de localização precisa de menores</li>
            </ul>
          </section>

          {/* 5 */}
          <section>
            <h2 className="font-display text-lg font-bold text-foreground mb-2">5. Base Legal para Tratamento de Dados</h2>
            <p className="text-muted-foreground">O tratamento dos seus dados pessoais fundamenta-se nas seguintes bases legais da LGPD:</p>
            <ul className="text-muted-foreground space-y-1 list-disc pl-5 mt-2">
              <li><strong className="text-foreground">Execução de contrato</strong> (Art. 7º, V) — para prestação dos serviços da plataforma.</li>
              <li><strong className="text-foreground">Legítimo interesse</strong> (Art. 7º, IX) — para melhoria dos serviços e segurança.</li>
              <li><strong className="text-foreground">Prevenção à fraude</strong> (Art. 11, II, "g") — para biometria facial e verificação de identidade.</li>
              <li><strong className="text-foreground">Consentimento</strong> (Art. 7º, I) — quando aplicável, obtido de forma livre e informada.</li>
            </ul>
          </section>

          {/* 6 */}
          <section>
            <h2 className="font-display text-lg font-bold text-foreground mb-2">6. Tipos de Conta</h2>
            <p className="text-muted-foreground"><strong className="text-foreground">Atleta:</strong> Perfil com DVD Digital. Dados sensíveis protegidos por criptografia.</p>
            <p className="text-muted-foreground"><strong className="text-foreground">Olheiro:</strong> Acesso mediante vínculo profissional verificado e Selo de Verificação.</p>
            <p className="text-muted-foreground"><strong className="text-foreground">Instituição:</strong> Cadastro via CNPJ com responsável legal identificado.</p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="font-display text-lg font-bold text-foreground mb-2">7. Segurança dos Dados</h2>
            <ul className="text-muted-foreground space-y-1 list-disc pl-5">
              <li>Criptografia ponta a ponta em todas as transmissões</li>
              <li>Armazenamento em servidores com certificação ISO 27001</li>
              <li>Acesso restrito por autenticação multifator (2FA) para equipe interna</li>
              <li>Auditorias de segurança periódicas</li>
            </ul>
          </section>

          {/* 8 */}
          <section>
            <h2 className="font-display text-lg font-bold text-foreground mb-2">8. Protocolo de Encontro Seguro</h2>
            <p className="text-muted-foreground">Todos os encontros devem ocorrer <strong className="text-foreground">exclusivamente em sedes oficiais, centros de treinamento ou locais públicos</strong> registrados na plataforma. O descumprimento resulta em banimento permanente.</p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="font-display text-lg font-bold text-foreground mb-2">9. Direitos do Titular</h2>
            <p className="text-muted-foreground mb-2">Conforme a LGPD (Art. 18), você tem direito a:</p>
            <ul className="text-muted-foreground space-y-1 list-disc pl-5">
              <li><strong className="text-foreground">Acesso</strong> — solicitar cópia de todos os seus dados pessoais</li>
              <li><strong className="text-foreground">Correção</strong> — atualizar dados incompletos ou incorretos</li>
              <li><strong className="text-foreground">Exclusão</strong> — solicitar a eliminação dos seus dados (incluindo biometria)</li>
              <li><strong className="text-foreground">Portabilidade</strong> — transferir seus dados para outra plataforma</li>
              <li><strong className="text-foreground">Revogação</strong> — revogar o consentimento a qualquer momento</li>
              <li><strong className="text-foreground">Informação</strong> — saber com quem seus dados foram compartilhados</li>
            </ul>
          </section>

          {/* 10 */}
          <section>
            <h2 className="font-display text-lg font-bold text-foreground mb-2">10. Retenção e Exclusão</h2>
            <p className="text-muted-foreground">
              Seus dados são mantidos enquanto a conta estiver ativa. Após solicitação de exclusão, os dados pessoais são removidos em até <strong className="text-foreground">15 dias úteis</strong>. Dados biométricos são excluídos <strong className="text-foreground">imediatamente</strong> após a solicitação. Dados anonimizados para fins estatísticos podem ser retidos.
            </p>
          </section>

          {/* 11 */}
          <section>
            <h2 className="font-display text-lg font-bold text-foreground mb-2">11. Contato e DPO</h2>
            <p className="text-muted-foreground">
              <strong className="text-foreground">Encarregado de Dados (DPO):</strong> dpo@talentradar.com.br<br />
              <strong className="text-foreground">Suporte Geral:</strong> contato@talentradar.com.br<br />
              <strong className="text-foreground">Central de Ajuda:</strong> Disponível no aplicativo
            </p>
          </section>
        </div>

        {/* Consent Section */}
        <div className="glass-card rounded-xl p-6 border border-primary/20 space-y-4">
          <h2 className="font-display text-lg font-bold text-foreground text-center">Consentimento</h2>
          <p className="text-muted-foreground text-sm text-center">
            Ao clicar em "Aceito", você declara estar ciente da coleta de dados pessoais, incluindo <strong className="text-foreground">biometria facial</strong> para fins de autenticação e prevenção à fraude, conforme descrito neste documento.
          </p>

          {accepted === false && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 animate-slide-up">
              <XCircle className="w-5 h-5 text-destructive" />
              <p className="text-sm text-destructive">
                Por questões de segurança e compliance, o cadastro não pode ser concluído sem o aceite dos termos. O fluxo será encerrado.
              </p>
            </div>
          )}

          {accepted === true && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20 animate-slide-up">
              <ShieldCheck className="w-5 h-5 text-primary" />
              <p className="text-sm text-primary font-display font-semibold">Termos aceitos! Redirecionando para validação biométrica...</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex-1" onClick={handleAccept} disabled={accepted === true}>
              <ShieldCheck className="w-4 h-4 mr-2" />
              Aceito os Termos e Desejo Prosseguir
            </Button>
            <Button variant="outline" className="flex-1 border-destructive/50 text-destructive hover:bg-destructive/10" onClick={handleDecline} disabled={accepted === true}>
              <XCircle className="w-4 h-4 mr-2" />
              Não Aceito os Termos
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Terms;
