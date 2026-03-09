import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import BottomNav from "@/components/BottomNav";
import {
  ArrowLeft, Radar, Shield, Send, Eye, EyeOff, Lock, MoreVertical,
  Pin, Trash2, BellOff, Video, Phone, Camera, FileText, MapPin, Check, X, Paperclip, Mic,
} from "lucide-react";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface Conversation {
  id: number;
  name: string;
  role: string;
  club: string;
  verified: boolean;
  anonymous: boolean;
  lastMessage: string;
  time: string;
  unread: number;
  pinned: boolean;
  muted: boolean;
  accepted: boolean;
  pendingMessage?: string;
}

interface Message {
  id: number;
  sender: "scout" | "athlete";
  text: string;
  time: string;
  type: "text" | "document" | "location" | "photo";
}

const initialConversations: Conversation[] = [
  { id: 1, name: "Carlos Mendes", role: "Olheiro", club: "Santos FC", verified: true, anonymous: false, lastMessage: "Parabéns pelo vídeo! Gostaria de conversar.", time: "14:30", unread: 2, pinned: false, muted: false, accepted: true },
  { id: 2, name: "Olheiro Anônimo", role: "Olheiro", club: "Clube não revelado", verified: true, anonymous: true, lastMessage: "Vi seu highlight. Impressionante.", time: "Ontem", unread: 0, pinned: false, muted: false, accepted: true },
  { id: 3, name: "Maria Costa", role: "Olheira", club: "CBV", verified: true, anonymous: false, lastMessage: "Sua levantada foi excelente.", time: "2 dias", unread: 0, pinned: false, muted: false, accepted: true },
  { id: 4, name: "Roberto Almeida", role: "Olheiro", club: "CBB", verified: true, anonymous: false, lastMessage: "Gostaria de avaliar seu desempenho.", time: "3 dias", unread: 1, pinned: false, muted: false, accepted: false, pendingMessage: "Gostaria de avaliar seu desempenho no torneio sub-17." },
];

const mockMessages: Message[] = [
  { id: 1, sender: "scout", text: "Olá! Vi seu vídeo de highlights e fiquei impressionado com sua velocidade.", time: "14:28", type: "text" },
  { id: 2, sender: "scout", text: "Parabéns pelo vídeo! Gostaria de conversar sobre uma oportunidade.", time: "14:30", type: "text" },
  { id: 3, sender: "athlete", text: "Obrigado! Fico feliz com o interesse. Pode me contar mais?", time: "14:35", type: "text" },
];

const Chat = () => {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState(initialConversations);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [message, setMessage] = useState("");
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [pendingConvId, setPendingConvId] = useState<number | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [callingType, setCallingType] = useState<"video" | "audio" | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConversation = conversations.find((c) => c.id === selectedChat);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectChat = (conv: Conversation) => {
    if (!conv.accepted) {
      setPendingConvId(conv.id);
      setShowAcceptDialog(true);
      return;
    }
    setSelectedChat(conv.id);
    // Mark as read
    setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: 0 } : c));
  };

  const acceptConversation = () => {
    if (pendingConvId) {
      setConversations(prev => prev.map(c => c.id === pendingConvId ? { ...c, accepted: true, unread: 0 } : c));
      setSelectedChat(pendingConvId);
      toast.success("Conversa aceita! Agora vocês podem trocar mensagens.");
    }
    setShowAcceptDialog(false);
    setPendingConvId(null);
  };

  const rejectConversation = () => {
    if (pendingConvId) {
      setConversations(prev => prev.filter(c => c.id !== pendingConvId));
      toast("Solicitação de conversa recusada.");
    }
    setShowAcceptDialog(false);
    setPendingConvId(null);
  };

  const sendMessage = () => {
    if (!message.trim()) return;
    const newMsg: Message = {
      id: messages.length + 1,
      sender: "athlete",
      text: message,
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };
    setMessages([...messages, newMsg]);
    setMessage("");
    // Update last message in conversation list
    if (selectedChat) {
      setConversations(prev => prev.map(c => c.id === selectedChat ? { ...c, lastMessage: message, time: "Agora" } : c));
    }
  };

  const togglePin = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.map(c => c.id === id ? { ...c, pinned: !c.pinned } : c));
    toast(conversations.find(c => c.id === id)?.pinned ? "Conversa desafixada" : "Conversa fixada");
  };

  const toggleMute = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.map(c => c.id === id ? { ...c, muted: !c.muted } : c));
    toast(conversations.find(c => c.id === id)?.muted ? "Notificações ativadas" : "Conversa silenciada");
  };

  const deleteConversation = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations(prev => prev.filter(c => c.id !== id));
    toast("Conversa excluída");
  };

  const sendAttachment = (type: "document" | "location" | "photo") => {
    const labels = { document: "📄 Documento enviado", location: "📍 Localização compartilhada", photo: "📸 Foto enviada" };
    const newMsg: Message = {
      id: messages.length + 1,
      sender: "athlete",
      text: labels[type],
      time: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      type,
    };
    setMessages([...messages, newMsg]);
    setShowAttachMenu(false);
    toast.success(`${type === "document" ? "Documento" : type === "location" ? "Localização" : "Foto"} enviado(a)`);
  };

  const startCall = (type: "video" | "audio") => {
    setCallingType(type);
    setTimeout(() => setCallingType(null), 3000);
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    if (!a.accepted && b.accepted) return -1;
    if (a.accepted && !b.accepted) return 1;
    return 0;
  });

  const pendingConv = conversations.find(c => c.id === pendingConvId);

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
          {selectedChat ? (
            <div className="flex items-center gap-1">
              <button onClick={() => startCall("audio")} className="text-muted-foreground hover:text-primary p-1.5">
                <Phone className="w-4.5 h-4.5" />
              </button>
              <button onClick={() => startCall("video")} className="text-muted-foreground hover:text-primary p-1.5">
                <Video className="w-4.5 h-4.5" />
              </button>
            </div>
          ) : (
            <div className="w-5" />
          )}
        </div>
      </header>

      {/* Safety banner */}
      <div className="bg-secondary/10 border-b border-secondary/20 px-4 py-2">
        <p className="text-[11px] text-secondary text-center font-display max-w-2xl mx-auto">
          🛡 Nunca marque encontros fora de Sedes Oficiais ou CTs. Comunique seus responsáveis.
        </p>
      </div>

      {/* Call overlay */}
      {callingType && (
        <div className="fixed inset-0 z-[100] bg-background/95 flex flex-col items-center justify-center gap-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            {callingType === "video" ? <Video className="w-10 h-10 text-primary" /> : <Phone className="w-10 h-10 text-primary" />}
          </div>
          <p className="font-display font-bold text-lg text-foreground">
            {callingType === "video" ? "Chamada de Vídeo" : "Chamada de Áudio"}
          </p>
          <p className="text-sm text-muted-foreground">Chamando {selectedConversation?.name}...</p>
          <Button variant="destructive" onClick={() => setCallingType(null)}>
            Encerrar
          </Button>
        </div>
      )}

      <main className="max-w-2xl mx-auto">
        {!selectedChat ? (
          <div className="px-4 py-4 space-y-2">
            {/* Rule info */}
            <div className="glass-card rounded-xl p-3 flex items-center gap-2 mb-4 border border-cyan/20">
              <Lock className="w-4 h-4 text-cyan shrink-0" />
              <p className="text-xs text-muted-foreground">
                Apenas <span className="text-cyan font-semibold">Olheiros Verificados</span> podem iniciar conversas. Você escolhe se aceita ou não.
              </p>
            </div>

            {/* Pending requests count */}
            {conversations.filter(c => !c.accepted).length > 0 && (
              <div className="glass-card rounded-xl p-3 flex items-center gap-2 border border-secondary/30 mb-2">
                <Badge className="bg-secondary text-secondary-foreground border-0 text-xs">
                  {conversations.filter(c => !c.accepted).length}
                </Badge>
                <p className="text-xs text-foreground font-display font-semibold">Solicitações pendentes</p>
              </div>
            )}

            {sortedConversations.map((conv) => (
              <div key={conv.id} className="relative">
                <button
                  onClick={() => handleSelectChat(conv)}
                  className={`w-full glass-card rounded-xl p-4 flex items-center gap-3 hover:border-primary/20 transition-colors border text-left ${
                    !conv.accepted ? "border-secondary/30" : conv.pinned ? "border-primary/20" : "border-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative">
                    {conv.anonymous ? (
                      <EyeOff className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <span className="text-lg">👤</span>
                    )}
                    {conv.pinned && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Pin className="w-2.5 h-2.5 text-primary-foreground" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-foreground truncate">{conv.name}</span>
                      {conv.verified && <Shield className="w-3 h-3 text-primary shrink-0" />}
                      {conv.muted && <BellOff className="w-3 h-3 text-muted-foreground shrink-0" />}
                      {conv.anonymous && (
                        <Badge className="bg-muted text-muted-foreground border-0 text-[9px]">
                          <EyeOff className="w-2.5 h-2.5 mr-0.5" /> Anônimo
                        </Badge>
                      )}
                      {!conv.accepted && (
                        <Badge className="bg-secondary/20 text-secondary border-0 text-[9px]">Pendente</Badge>
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

                {/* Context menu */}
                {conv.accepted && (
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground p-1 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => togglePin(conv.id, e as unknown as React.MouseEvent)}>
                          <Pin className="w-4 h-4 mr-2" /> {conv.pinned ? "Desafixar" : "Fixar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => toggleMute(conv.id, e as unknown as React.MouseEvent)}>
                          <BellOff className="w-4 h-4 mr-2" /> {conv.muted ? "Ativar notificações" : "Silenciar"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => deleteConversation(conv.id, e as unknown as React.MouseEvent)}>
                          <Trash2 className="w-4 h-4 mr-2" /> Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}
              </div>
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
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "athlete" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === "athlete"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "glass-card rounded-bl-md"
                  }`}>
                    {msg.type !== "text" && (
                      <div className="flex items-center gap-1.5 mb-1">
                        {msg.type === "document" && <FileText className="w-4 h-4" />}
                        {msg.type === "location" && <MapPin className="w-4 h-4" />}
                        {msg.type === "photo" && <Camera className="w-4 h-4" />}
                      </div>
                    )}
                    <p className="text-sm">{msg.text}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <p className={`text-[10px] ${msg.sender === "athlete" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {msg.time}
                      </p>
                      {msg.sender === "athlete" && <Check className="w-3 h-3 text-primary-foreground/60" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Attach menu */}
            {showAttachMenu && (
              <div className="glass border-t border-border/50 px-4 py-3 animate-slide-up">
                <div className="max-w-2xl mx-auto flex justify-around">
                  <button onClick={() => sendAttachment("photo")} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center">
                      <Camera className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-display">Câmera</span>
                  </button>
                  <button onClick={() => sendAttachment("document")} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-cyan/15 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-cyan" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-display">Documento</span>
                  </button>
                  <button onClick={() => sendAttachment("location")} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-secondary" />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-display">Localização</span>
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="glass border-t border-border/50 px-4 py-3">
              <div className="max-w-2xl mx-auto flex gap-2 items-center">
                <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="text-muted-foreground hover:text-primary transition-colors p-1">
                  <Paperclip className="w-5 h-5" />
                </button>
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Digite sua mensagem..."
                  className="flex-1 bg-muted border-border"
                />
                <Button size="icon" disabled={!message.trim()} onClick={sendMessage}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Accept conversation dialog */}
      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Solicitação de Conversa</DialogTitle>
            <DialogDescription>
              <strong>{pendingConv?.name}</strong> ({pendingConv?.club}) deseja iniciar uma conversa com você.
            </DialogDescription>
          </DialogHeader>
          {pendingConv?.pendingMessage && (
            <div className="glass-card rounded-xl p-3 my-2">
              <p className="text-sm text-foreground italic">"{pendingConv.pendingMessage}"</p>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Ao aceitar, vocês poderão trocar mensagens livremente. Ao recusar, a solicitação será removida.
          </p>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={rejectConversation} className="flex-1">
              <X className="w-4 h-4 mr-1" /> Recusar
            </Button>
            <Button onClick={acceptConversation} className="flex-1">
              <Check className="w-4 h-4 mr-1" /> Aceitar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!selectedChat && <BottomNav />}
    </div>
  );
};

export default Chat;
