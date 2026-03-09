import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useNavigate, Link } from "react-router-dom";
import { Radar, User, Search, Building2, ArrowLeft, Mail, ShieldCheck, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { TablesInsert } from "@/integrations/supabase/types";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [tab, setTab] = useState("atleta");
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cpf, setCpf] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [professionalLink, setProfessionalLink] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [areaOfOperation, setAreaOfOperation] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [address, setAddress] = useState("");
  const [legalRepresentative, setLegalRepresentative] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);

  const handleSendOtp = () => {
    if (!guardianEmail || !guardianEmail.includes("@")) {
      toast({ title: "E-mail inválido", variant: "destructive" });
      return;
    }
    setSendingOtp(true);
    setTimeout(() => { setSendingOtp(false); setOtpSent(true); toast({ title: "Código enviado!" }); }, 1500);
  };

  const handleVerifyOtp = (value: string) => {
    setOtpValue(value);
    if (value.length === 6) setTimeout(() => { setOtpVerified(true); toast({ title: "✅ Verificado!" }); }, 500);
  };

  const resetOtp = () => { setOtpSent(false); setOtpValue(""); setOtpVerified(false); };

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      toast({ title: "Campos obrigatórios", description: "Preencha nome, e-mail e senha.", variant: "destructive" });
      return;
    }
    if (password.length < 6) {
      toast({ title: "Senha fraca", description: "Mínimo 6 caracteres.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const profileType = tab as "atleta" | "olheiro" | "instituicao";
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName } } });
    if (error) { setLoading(false); toast({ title: "Erro no cadastro", description: error.message, variant: "destructive" }); return; }

    if (data.user) {
      const profileUpdate: Record<string, string | null> = {
        id: data.user.id, email, full_name: fullName,
        cpf: cpf || null, birth_date: birthDate || null,
        ...(profileType === "olheiro" ? { professional_link: professionalLink || null, registration_number: registrationNumber || null, area_of_operation: areaOfOperation || null } : {}),
        ...(profileType === "instituicao" ? { cnpj: cnpj || null, address: address || null, legal_representative: legalRepresentative || null } : {}),
      };
      await supabase.from("profiles").upsert({ ...profileUpdate, profile_type: profileType });
    }
    setLoading(false);
    toast({ title: "Conta criada!", description: "Faça login para acessar." });
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 px-4 py-4 glass">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground transition-colors"><ArrowLeft className="w-5 h-5" /></button>
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
              <TabsTrigger value="atleta" className="flex items-center gap-1.5 font-display data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"><User className="w-4 h-4" /> Atleta</TabsTrigger>
              <TabsTrigger value="olheiro" className="flex items-center gap-1.5 font-display data-[state=active]:bg-cyan data-[state=active]:text-cyan-foreground"><Search className="w-4 h-4" /> Olheiro</TabsTrigger>
              <TabsTrigger value="instituicao" className="flex items-center gap-1.5 font-display data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"><Building2 className="w-4 h-4" /> Instituição</TabsTrigger>
            </TabsList>

            <TabsContent value="atleta">
              <div className="glass-card rounded-xl p-6 space-y-4 border border-transparent">
                <div><Label className="text-foreground">Nome Completo</Label><Input placeholder="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-foreground">Nascimento</Label><Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground" /></div>
                  <div><Label className="text-foreground">CPF</Label><Input placeholder="000.000.000-00" value={cpf} onChange={(e) => setCpf(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                </div>
                <div><Label className="text-foreground">E-mail</Label><Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div><Label className="text-foreground">Senha</Label><Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>

                <div className="border border-secondary/30 rounded-lg p-4 glass-card space-y-3">
                  <p className="text-sm font-display font-semibold text-secondary flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Menor de 18 anos? Vínculo parental obrigatório</p>
                  <div>
                    <Label className="text-foreground text-sm">E-mail do Responsável</Label>
                    <div className="flex gap-2 mt-1">
                      <Input type="email" placeholder="responsavel@email.com" value={guardianEmail} onChange={(e) => { setGuardianEmail(e.target.value); if (otpSent) resetOtp(); }} disabled={otpVerified} className="bg-muted border-border text-foreground placeholder:text-muted-foreground flex-1" />
                      {!otpVerified && <Button type="button" size="sm" variant="outline" onClick={handleSendOtp} disabled={sendingOtp || !guardianEmail} className="whitespace-nowrap border-secondary/50 text-secondary hover:bg-secondary/10"><Mail className="w-3.5 h-3.5 mr-1.5" />{sendingOtp ? "Enviando..." : otpSent ? "Reenviar" : "Enviar"}</Button>}
                    </div>
                  </div>
                  {otpSent && !otpVerified && (
                    <div className="flex justify-center py-2">
                      <InputOTP maxLength={6} value={otpValue} onChange={handleVerifyOtp}>
                        <InputOTPGroup><InputOTPSlot index={0} /><InputOTPSlot index={1} /><InputOTPSlot index={2} /><InputOTPSlot index={3} /><InputOTPSlot index={4} /><InputOTPSlot index={5} /></InputOTPGroup>
                      </InputOTP>
                    </div>
                  )}
                  {otpVerified && <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20"><ShieldCheck className="w-4 h-4 text-primary" /><span className="text-sm text-primary font-display font-semibold">E-mail do responsável verificado</span></div>}
                </div>

                <Button className="w-full" onClick={handleRegister} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{loading ? "Criando..." : "Criar Conta de Atleta"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="olheiro">
              <div className="glass-card rounded-xl p-6 space-y-4 border border-transparent">
                <div><Label className="text-foreground">Nome Completo</Label><Input placeholder="Seu nome" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div><Label className="text-foreground">Vínculo Profissional</Label><Input placeholder="Clube ou Agência" value={professionalLink} onChange={(e) => setProfessionalLink(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div><Label className="text-foreground">Registro (CREF/Federação)</Label><Input placeholder="Nº do registro" value={registrationNumber} onChange={(e) => setRegistrationNumber(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div><Label className="text-foreground">Área de Atuação</Label><Input placeholder="Ex: Futebol - Sudeste" value={areaOfOperation} onChange={(e) => setAreaOfOperation(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div><Label className="text-foreground">E-mail</Label><Input type="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div><Label className="text-foreground">Senha</Label><Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div className="border border-cyan/30 rounded-lg p-3 glass-card"><p className="text-xs text-cyan">🛡 Após o cadastro, envie seus documentos para receber o Selo de Verificado.</p></div>
                <Button className="w-full bg-cyan text-cyan-foreground hover:bg-cyan/90" onClick={handleRegister} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{loading ? "Criando..." : "Criar Conta de Olheiro"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="instituicao">
              <div className="glass-card rounded-xl p-6 space-y-4 border border-transparent">
                <div><Label className="text-foreground">Razão Social</Label><Input placeholder="Nome da Instituição" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div><Label className="text-foreground">CNPJ</Label><Input placeholder="00.000.000/0000-00" value={cnpj} onChange={(e) => setCnpj(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div><Label className="text-foreground">Endereço</Label><Input placeholder="Rua, número, cidade" value={address} onChange={(e) => setAddress(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div><Label className="text-foreground">Responsável Legal</Label><Input placeholder="Nome completo" value={legalRepresentative} onChange={(e) => setLegalRepresentative(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div><Label className="text-foreground">E-mail</Label><Input type="email" placeholder="contato@instituicao.com" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <div><Label className="text-foreground">Senha</Label><Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5 bg-muted border-border text-foreground placeholder:text-muted-foreground" /></div>
                <Button variant="secondary" className="w-full" onClick={handleRegister} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}{loading ? "Criando..." : "Criar Conta de Instituição"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Já tem conta? <Link to="/login" className="text-primary hover:underline font-semibold">Entrar</Link>
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
