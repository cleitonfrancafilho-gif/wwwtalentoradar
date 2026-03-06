import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate, Link } from "react-router-dom";
import { Radar, User, Search, Building2, ArrowLeft, Mail, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState("atleta");

  // Guardian OTP state
  const [guardianEmail, setGuardianEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOtp = () => {
    if (!guardianEmail || !guardianEmail.includes("@")) {
      toast({ title: "E-mail inválido", description: "Informe um e-mail válido do responsável.", variant: "destructive" });
      return;
    }
    setSendingOtp(true);
    // Simulate sending OTP
    setTimeout(() => {
      setSendingOtp(false);
      setOtpSent(true);
      toast({ title: "Código enviado!", description: `Um código de 6 dígitos foi enviado para ${guardianEmail}` });
    }, 1500);
  };

  const handleVerifyOtp = (value: string) => {
    setOtpValue(value);
    if (value.length === 6) {
      // Simulate verification (accept any 6-digit code for now)
      setTimeout(() => {
        setOtpVerified(true);
        toast({ title: "✅ Verificado!", description: "E-mail do responsável confirmado com sucesso." });
      }, 500);
    }
  };

  const resetOtp = () => {
    setOtpSent(false);
    setOtpValue("");
    setOtpVerified(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 px-4 py-4 glass">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">Talent<span className="text-gradient-neon">Radar</span></span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg animate-slide-up">
          <h1 className="text-3xl font-display font-bold text-center mb-2 text-foreground">Criar Conta</h1>
          <p className="text-muted-foreground text-center mb-8 text-sm">Selecione seu perfil e preencha os dados</p>

          <Tabs value={tab} onValueChange={setTab} className="w-full">
            <TabsList className="grid grid-cols-3 w-full bg-muted mb-6 h-12">
              <TabsTrigger value="atleta" className="flex items-center gap-1.5 font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                <User className="w-4 h-4" /> Atleta
              </TabsTrigger>
              <TabsTrigger value="olheiro" className="flex items-center gap-1.5 font-display data-[state=active]:bg-cyan data-[state=active]:text-cyan-foreground">
                <Search className="w-4 h-4" /> Olheiro
              </TabsTrigger>
              <TabsTrigger value="instituicao" className="flex items-center gap-1.5 font-display data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground">
                <Building2 className="w-4 h-4" /> Instituição
              </TabsTrigger>
            </TabsList>

            <TabsContent value="atleta" className="space-y-4">
              <div className="glass-card rounded-xl p-6 space-y-4 border border-transparent">
                <div>
                  <Label htmlFor="nome" className="text-foreground">Nome Completo</Label>
                  <Input id="nome" placeholder="Seu nome" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="nascimento" className="text-foreground">Data de Nascimento</Label>
                    <Input id="nascimento" type="date" className="mt-1.5 bg-muted border-border text-foreground" />
                  </div>
                  <div>
                    <Label htmlFor="cpf" className="text-foreground">CPF</Label>
                    <Input id="cpf" placeholder="000.000.000-00" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email-atleta" className="text-foreground">E-mail</Label>
                  <Input id="email-atleta" type="email" placeholder="seu@email.com" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="senha-atleta" className="text-foreground">Senha</Label>
                  <Input id="senha-atleta" type="password" placeholder="••••••••" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>

                {/* Guardian verification with OTP */}
                <div className="border border-secondary/30 rounded-lg p-4 glass-card space-y-3">
                  <p className="text-sm font-display font-semibold text-secondary flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Menor de 18 anos? Vínculo parental obrigatório
                  </p>

                  <div>
                    <Label htmlFor="email-resp" className="text-foreground text-sm">E-mail do Responsável</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="email-resp"
                        type="email"
                        placeholder="responsavel@email.com"
                        value={guardianEmail}
                        onChange={(e) => { setGuardianEmail(e.target.value); if (otpSent) resetOtp(); }}
                        disabled={otpVerified}
                        className="bg-muted border-border text-foreground placeholder:text-muted-foreground flex-1"
                      />
                      {!otpVerified && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={handleSendOtp}
                          disabled={sendingOtp || !guardianEmail}
                          className="whitespace-nowrap border-secondary/50 text-secondary hover:bg-secondary/10"
                        >
                          <Mail className="w-3.5 h-3.5 mr-1.5" />
                          {sendingOtp ? "Enviando..." : otpSent ? "Reenviar" : "Enviar Código"}
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* OTP Input */}
                  {otpSent && !otpVerified && (
                    <div className="space-y-2 animate-slide-up">
                      <Label className="text-foreground text-sm">Código de Verificação (6 dígitos)</Label>
                      <p className="text-xs text-muted-foreground">
                        Digite o código enviado para <span className="text-cyan font-semibold">{guardianEmail}</span>
                      </p>
                      <div className="flex justify-center py-2">
                        <InputOTP maxLength={6} value={otpValue} onChange={handleVerifyOtp}>
                          <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                          </InputOTPGroup>
                        </InputOTP>
                      </div>
                      <p className="text-xs text-muted-foreground text-center">
                        Não recebeu? <button onClick={handleSendOtp} className="text-primary hover:underline font-semibold">Reenviar código</button>
                      </p>
                    </div>
                  )}

                  {/* Verified state */}
                  {otpVerified && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20 animate-slide-up">
                      <ShieldCheck className="w-4 h-4 text-primary" />
                      <span className="text-sm text-primary font-display font-semibold">E-mail do responsável verificado</span>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="cpf-resp" className="text-foreground text-sm">CPF do Responsável</Label>
                    <Input id="cpf-resp" placeholder="000.000.000-00" className="mt-1 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                  </div>
                </div>

                <Button className="w-full" onClick={() => navigate("/selecionar-esportes")}>Criar Conta de Atleta</Button>
              </div>
            </TabsContent>

            <TabsContent value="olheiro" className="space-y-4">
              <div className="glass-card rounded-xl p-6 space-y-4 border border-transparent">
                <div>
                  <Label htmlFor="nome-olh" className="text-foreground">Nome Completo</Label>
                  <Input id="nome-olh" placeholder="Seu nome" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="vinculo" className="text-foreground">Vínculo Profissional</Label>
                  <Input id="vinculo" placeholder="Clube ou Agência" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="registro" className="text-foreground">Registro Profissional (CREF/Federação)</Label>
                  <Input id="registro" placeholder="Nº do registro" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="area" className="text-foreground">Área de Atuação</Label>
                  <Input id="area" placeholder="Ex: Futebol - Região Sudeste" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="email-olh" className="text-foreground">E-mail</Label>
                  <Input id="email-olh" type="email" placeholder="seu@email.com" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="senha-olh" className="text-foreground">Senha</Label>
                  <Input id="senha-olh" type="password" placeholder="••••••••" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div className="border border-cyan/30 rounded-lg p-3 glass-card">
                  <p className="text-xs text-cyan">🛡 Após o cadastro, envie seus documentos para receber o Selo de Verificado.</p>
                </div>
                <Button className="w-full bg-cyan text-cyan-foreground hover:bg-cyan/90" onClick={() => navigate("/selecionar-esportes")}>
                  Criar Conta de Olheiro
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="instituicao" className="space-y-4">
              <div className="glass-card rounded-xl p-6 space-y-4 border border-transparent">
                <div>
                  <Label htmlFor="razao" className="text-foreground">Razão Social</Label>
                  <Input id="razao" placeholder="Nome da Instituição" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="cnpj" className="text-foreground">CNPJ</Label>
                  <Input id="cnpj" placeholder="00.000.000/0000-00" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="endereco" className="text-foreground">Endereço da Sede / CT</Label>
                  <Input id="endereco" placeholder="Rua, número, cidade" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="responsavel" className="text-foreground">Nome do Responsável Legal</Label>
                  <Input id="responsavel" placeholder="Nome completo" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="email-inst" className="text-foreground">E-mail</Label>
                  <Input id="email-inst" type="email" placeholder="contato@instituicao.com" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <div>
                  <Label htmlFor="senha-inst" className="text-foreground">Senha</Label>
                  <Input id="senha-inst" type="password" placeholder="••••••••" className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <Button variant="secondary" className="w-full" onClick={() => navigate("/selecionar-esportes")}>Criar Conta de Instituição</Button>
              </div>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta? <button className="text-primary hover:underline font-semibold">Entrar</button>
          </p>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Ao criar sua conta, você concorda com os{" "}
            <Link to="/termos" className="text-cyan hover:underline">Termos de Uso</Link>{" "}e{" "}
            <Link to="/privacidade" className="text-cyan hover:underline">Política de Privacidade</Link>.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Register;
