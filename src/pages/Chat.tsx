import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import BottomNav from "@/components/BottomNav";
import { ArrowLeft, Radar, Shield, Send, Eye, EyeOff, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

const mockConversations = [
  { id: 1, name: "Carlos Mendes", role: "Olheiro", club: "Santos FC", verified: true, anonymous: false, lastMessage: "Parabéns pelo vídeo! Gostaria de conversar.", time: "14:30", unread: 2 },
  { id: 2, name: "Olheiro Anônimo", role: "Olheiro", club: "Clube não revelado", verified: true, anonymous: true, lastMessage: "Vi seu highlight. Impressionante.", time: "Ontem", unread: 0 },
  { id: 3, name: "Maria Costa", role: "Olheira", club: "CBV", verified: true, anonymous: false, lastMessage: "Sua levantada foi excelente.", time: "2 dias", unread: 0 },
];

const mockMessages = [
  { id: 1, sender: "scout", text: "Olá, Lucas! Vi seu vídeo de highlights e fiquei impressionado com sua velocidade.", time: "14:28" },
  { id: 2, sender: "scout", text: "Parabéns pelo vídeo! Gostaria de conversar sobre uma oportunidade.", time: "14:30" },
  { id: 3, sender: "athlete", text: "Obrigado! Fico feliz com o interesse. Pode me contar mais?", time: "14:35" },
];

const Chat = () => {
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  const selectedConversation = mockConversations.find((c) => c.id === selectedChat);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={() => selectedChat ? setSelectedChat(null) : navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">
              {selectedConversation ? selectedConversation.name : "Chat Seguro"}
            </span>
            {selectedConversation?.verified && <Shield className="w-4 h-4 text-primary" />}
          </div>
          <div className="w-5" />
        </div>
      </header>

      {/* Safety banner */}
      <div className="bg-secondary/10 border-b border-secondary/20 px-4 py-2">
        <p className="text-[11px] text-secondary text-center font-display max-w-2xl mx-auto">
          🛡 Nunca marque encontros fora de Sedes Oficiais ou CTs. Comunique seus responsáveis.
        </p>
      </div>

      <main className="max-w-2xl mx-auto">
        {!selectedChat ? (
          <div className="px-4 py-4 space-y-2">
            {/* Rule info */}
            <div className="glass-card rounded-xl p-3 flex items-center gap-2 mb-4 border border-cyan/20">
              <Lock className="w-4 h-4 text-cyan shrink-0" />
              <p className="text-xs text-muted-foreground">
                Apenas <span className="text-cyan font-semibold">Olheiros Verificados</span> podem iniciar conversas.
              </p>
            </div>

            {mockConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedChat(conv.id)}
                className="w-full glass-card rounded-xl p-4 flex items-center gap-3 hover:border-primary/20 transition-colors border border-transparent text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  {conv.anonymous ? (
                    <EyeOff className="w-5 h-5 text-muted-foreground" />
                  ) : (
                    <span className="text-lg">👤</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-sm text-foreground truncate">{conv.name}</span>
                    {conv.verified && <Shield className="w-3 h-3 text-primary shrink-0" />}
                    {conv.anonymous && (
                      <Badge className="bg-muted text-muted-foreground border-0 text-[9px]">
                        <EyeOff className="w-2.5 h-2.5 mr-0.5" /> Anônimo
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{conv.club}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.lastMessage}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] text-muted-foreground">{conv.time}</span>
                  {conv.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                      {conv.unread}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-180px)]">
            {/* Anonymous indicator */}
            {selectedConversation?.anonymous && (
              <div className="glass px-4 py-2 flex items-center gap-2 justify-center border-b border-border/50">
                <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] text-muted-foreground">
                  Olheiro em <span className="text-cyan font-semibold">Modo Anônimo</span> — identidade revelada ao iniciar chat oficial
                </span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {mockMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "athlete" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === "athlete"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "glass-card rounded-bl-md"
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === "athlete" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {msg.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="glass border-t border-border/50 px-4 py-3">
              <div className="max-w-2xl mx-auto flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-muted border-border"
                />
                <Button size="icon" disabled={!message.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {!selectedChat && <BottomNav />}
    </div>
  );
};

export default Chat;
