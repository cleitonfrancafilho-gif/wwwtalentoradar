import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, Link } from "react-router-dom";
import { Radar, ArrowLeft, Mail, Smartphone, ScanFace, KeyRound, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type RecoveryMethod = "email" | "sms" | "facial" | null;

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryMethod, setRecoveryMethod] = useState<RecoveryMethod>(null);
  const [recoveryInput, setRecoveryInput] = useState("");
  const [recoverySent, setRecoverySent] = useState(false);

  const handleLogin = async () => {
    if (!loginId || !password) {
      toast({ title: "Campos obrigatórios", description: "Preencha e-mail e senha.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginId,
      password,
    });
    setLoading(false);

    if (error) {
      toast({ title: "Erro ao entrar", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Bem-vindo!", description: "Login realizado com sucesso." });
    navigate("/feed");
  };

  const handleRecovery = async () => {
    if (recoveryMethod === "facial") {
      navigate("/captura-facial");
      return;
    }
    if (!recoveryInput) {
      toast({ title: "Campo obrigatório", description: `Informe seu ${recoveryMethod === "email" ? "e-mail" : "telefone"}.`, variant: "destructive" });
      return;
    }
    if (recoveryMethod === "email") {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryInput, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) {
        toast({ title: "Erro", description: error.message, variant: "destructive" });
        return;
      }
    }
    setRecoverySent(true);
    toast({ title: "Enviado!", description: `Instruções de recuperação enviadas via ${recoveryMethod === "email" ? "e-mail" : "SMS"}.` });
  };

  if (showRecovery) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <header className="border-b border-border/50 px-4 py-4 glass">
          <div className="max-w-lg mx-auto flex items-center gap-3">
            <button onClick={() => { setShowRecovery(false); setRecoveryMethod(null); setRecoverySent(false); }} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">Recuperar Senha</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md animate-slide-up">
            {!recoveryMethod ? (
              <div className="space-y-4">
                <h1 className="text-2xl font-display font-bold text-center text-foreground mb-2">Como deseja recuperar?</h1>
                <p className="text-muted-foreground text-center text-sm mb-6">Escolha um método de recuperação de senha</p>
                <button onClick={() => setRecoveryMethod("email")} className="w-full glass-card rounded-xl p-5 border border-transparent hover:border-primary/40 transition-all flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-display font-bold text-foreground">Via E-mail</p>
                    <p className="text-sm text-muted-foreground">Receba um link de recuperação no seu e-mail</p>
                  </div>
                </button>
                <button onClick={() => setRecoveryMethod("sms")} className="w-full glass-card rounded-xl p-5 border border-transparent hover:border-secondary/40 transition-all flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                    <Smartphone className="w-6 h-6 text-secondary" />
                  </div>
                  <div className="text-left">
                    <p className="font-display font-bold text-foreground">Via SMS</p>
                    <p className="text-sm text-muted-foreground">Receba um código por mensagem de texto</p>
                  </div>
                </button>
                <button onClick={() => setRecoveryMethod("facial")} className="w-full glass-card rounded-xl p-5 border border-transparent hover:border-cyan/40 transition-all flex items-center gap-4 group">
                  <div className="w-12 h-12 rounded-lg bg-cyan/10 flex items-center justify-center group-hover:bg-cyan/20 transition-colors">
                    <ScanFace className="w-6 h-6 text-cyan" />
                  </div>
                  <div className="text-left">
                    <p className="font-display font-bold text-foreground">Via Biometria Facial</p>
                    <p className="text-sm text-muted-foreground">Recupere através do reconhecimento facial</p>
                  </div>
                </button>
              </div>
            ) : recoverySent ? (
              <div className="glass-card rounded-xl p-8 text-center space-y-4 border border-primary/20">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-xl font-display font-bold text-foreground">Verifique sua caixa</h2>
                <p className="text-muted-foreground text-sm">
                  Enviamos as instruções de recuperação para <span className="text-primary font-semibold">{recoveryInput}</span>
                </p>
                <Button className="w-full" onClick={() => { setShowRecovery(false); setRecoveryMethod(null); setRecoverySent(false); }}>
                  Voltar ao Login
                </Button>
              </div>
            ) : (
              <div className="glass-card rounded-xl p-6 space-y-4 border border-transparent">
                <h2 className="text-xl font-display font-bold text-foreground">
                  Recuperar via {recoveryMethod === "email" ? "E-mail" : "SMS"}
                </h2>
                <div>
                  <Label className="text-foreground">
                    {recoveryMethod === "email" ? "E-mail cadastrado" : "Telefone cadastrado"}
                  </Label>
                  <Input
                    type={recoveryMethod === "email" ? "email" : "tel"}
                    placeholder={recoveryMethod === "email" ? "seu@email.com" : "(00) 00000-0000"}
                    value={recoveryInput}
                    onChange={(e) => setRecoveryInput(e.target.value)}
                    className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>
                <Button className="w-full" onClick={handleRecovery}>Enviar Instruções</Button>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 px-4 py-4 glass">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <Radar className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg text-foreground">Talent<span className="text-gradient-neon">Radar</span></span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slide-up">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-display font-bold text-foreground">Entrar</h1>
            <p className="text-muted-foreground text-sm mt-1">Acesse sua conta TalentRadar</p>
          </div>

          <div className="glass-card rounded-xl p-6 space-y-4 border border-transparent">
            <div>
              <Label htmlFor="login-id" className="text-foreground">E-mail</Label>
              <Input
                id="login-id"
                type="email"
                placeholder="seu@email.com"
                value={loginId}
                onChange={(e) => setLoginId(e.target.value)}
                className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <div>
              <Label htmlFor="login-pass" className="text-foreground">Senha</Label>
              <Input
                id="login-pass"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
              />
            </div>
            <Button className="w-full" onClick={handleLogin} disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <button
              onClick={() => setShowRecovery(true)}
              className="w-full text-center text-sm text-primary hover:underline font-display font-semibold pt-1"
            >
              Esqueci minha senha
            </button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Não tem conta?{" "}
            <Link to="/cadastro" className="text-primary hover:underline font-semibold">Criar uma conta</Link>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Ao entrar, você concorda com os{" "}
            <Link to="/termos" className="text-cyan hover:underline">Termos de Uso</Link> e{" "}
            <Link to="/privacidade" className="text-cyan hover:underline">Política de Privacidade</Link>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Login;
