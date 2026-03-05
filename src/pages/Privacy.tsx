import { ArrowLeft, Radar } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Radar className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-foreground">Política de Privacidade</span>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-4 py-8 prose prose-invert prose-sm">
        <h1 className="font-display text-2xl text-foreground">Política de Privacidade — TalentRadar</h1>
        <p className="text-muted-foreground text-sm">Última atualização: Março 2026</p>

        <h2 className="font-display text-foreground">1. Dados Coletados</h2>
        <p className="text-muted-foreground">Coletamos apenas dados necessários para o funcionamento da plataforma:</p>
        <ul className="text-muted-foreground space-y-1">
          <li>Dados de cadastro: nome, data de nascimento, CPF (criptografado), e-mail</li>
          <li>Dados esportivos: posição, estatísticas, vídeos de highlights</li>
          <li>Dados de localização aproximada (para exibir eventos próximos)</li>
        </ul>

        <h2 className="font-display text-foreground">2. Proteção de Dados de Menores</h2>
        <p className="text-muted-foreground">Em conformidade com a LGPD (Art. 14), o tratamento de dados de crianças e adolescentes é realizado no melhor interesse do menor, com consentimento específico do responsável legal.</p>
        <ul className="text-muted-foreground space-y-1">
          <li>CPFs são armazenados com criptografia AES-256</li>
          <li>Dados de menores nunca são compartilhados com terceiros sem autorização do responsável</li>
          <li>Responsáveis podem solicitar exclusão total dos dados a qualquer momento</li>
          <li>Anonimização automática de dados sensíveis em relatórios</li>
        </ul>

        <h2 className="font-display text-foreground">3. Uso dos Dados</h2>
        <p className="text-muted-foreground">Os dados são utilizados exclusivamente para: personalização do feed, conexão entre atletas e olheiros verificados, exibição de eventos relevantes e geração de estatísticas agregadas.</p>

        <h2 className="font-display text-foreground">4. Compartilhamento</h2>
        <p className="text-muted-foreground">Não vendemos dados pessoais. Dados esportivos públicos (vídeos, estatísticas) são visíveis apenas para usuários autenticados da plataforma.</p>

        <h2 className="font-display text-foreground">5. Direitos do Titular (LGPD)</h2>
        <p className="text-muted-foreground">Você tem direito a: acesso, correção, exclusão, portabilidade e revogação do consentimento. Exercite seus direitos pelo e-mail privacidade@talentradar.com.br.</p>

        <h2 className="font-display text-foreground">6. Retenção</h2>
        <p className="text-muted-foreground">Dados são mantidos enquanto a conta estiver ativa. Após exclusão, dados são removidos em até 30 dias, exceto obrigações legais.</p>
      </main>
    </div>
  );
};

export default Privacy;
