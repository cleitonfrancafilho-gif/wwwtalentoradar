import { ArrowLeft, Radar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Radar className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-foreground">Termos de Uso</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 prose prose-invert prose-sm">
        <h1 className="font-display text-2xl text-foreground">Termos de Uso — TalentRadar</h1>
        <p className="text-muted-foreground text-sm">Última atualização: Março 2026</p>

        <h2 className="font-display text-foreground">1. Aceitação dos Termos</h2>
        <p className="text-muted-foreground">Ao utilizar o TalentRadar, você concorda com estes termos. Caso seja menor de 18 anos, o uso está condicionado à autorização de um responsável legal.</p>

        <h2 className="font-display text-foreground">2. Proteção de Menores (LGPD)</h2>
        <p className="text-muted-foreground">Em conformidade com a Lei Geral de Proteção de Dados (Lei 13.709/2018) e o Estatuto da Criança e do Adolescente (ECA), o TalentRadar implementa:</p>
        <ul className="text-muted-foreground space-y-1">
          <li>Vínculo parental obrigatório para menores de 18 anos</li>
          <li>Verificação de identidade do responsável via código OTP</li>
          <li>Notificações espelhadas para responsáveis sobre todas as interações</li>
          <li>Bloqueio automático de palavras sensíveis em conversas</li>
          <li>Proibição de compartilhamento de dados de localização precisa de menores</li>
        </ul>

        <h2 className="font-display text-foreground">3. Tipos de Conta</h2>
        <p className="text-muted-foreground"><strong>Atleta:</strong> Perfil para jovens talentos com DVD Digital. Dados sensíveis protegidos por criptografia.</p>
        <p className="text-muted-foreground"><strong>Olheiro:</strong> Acesso mediante vínculo profissional verificado. Sujeito a Selo de Verificação.</p>
        <p className="text-muted-foreground"><strong>Instituição:</strong> Cadastro via CNPJ com responsável legal identificado.</p>

        <h2 className="font-display text-foreground">4. Protocolo de Encontro Seguro</h2>
        <p className="text-muted-foreground">Todos os encontros devem ocorrer exclusivamente em sedes oficiais, centros de treinamento ou locais públicos registrados na plataforma. O descumprimento resulta em banimento permanente.</p>

        <h2 className="font-display text-foreground">5. Conteúdo e Propriedade</h2>
        <p className="text-muted-foreground">Os vídeos e dados enviados permanecem de propriedade do usuário. O TalentRadar possui licença não exclusiva para exibição na plataforma.</p>

        <h2 className="font-display text-foreground">6. Contato</h2>
        <p className="text-muted-foreground">Dúvidas: contato@talentradar.com.br</p>
      </main>
    </div>
  );
};

export default Terms;
