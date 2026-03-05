import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate, Link } from "react-router-dom";
import { Radar, User, Search, Building2, ArrowLeft } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState("atleta");

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

                <div className="border border-secondary/30 rounded-lg p-4 glass-card">
                  <p className="text-sm font-display font-semibold text-secondary mb-3">⚠ Menor de 18 anos? Preencha o vínculo parental:</p>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="email-resp" className="text-foreground text-sm">E-mail do Responsável</Label>
                      <Input id="email-resp" type="email" placeholder="responsavel@email.com" className="mt-1 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                    </div>
                    <div>
                      <Label htmlFor="cpf-resp" className="text-foreground text-sm">CPF do Responsável</Label>
                      <Input id="cpf-resp" placeholder="000.000.000-00" className="mt-1 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                    </div>
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
