import { useState, useRef, useEffect, useCallback } from "react";
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
  Pin, Trash2, BellOff, Video, Phone, Camera, FileText, MapPin, Check, CheckCheck, X, Paperclip, Mic,
} from "lucide-react";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { t } from "@/i18n/translations";

interface ConversationData {
  id: string;
  participant_1: string;
  participant_2: string;
  accepted: boolean;
  pinned_by_1: boolean;
  pinned_by_2: boolean;
  muted_by_1: boolean;
  muted_by_2: boolean;
  last_message_at: string;
  other_profile?: { full_name: string; avatar_url: string | null; profile_type: string };
  last_message?: string;
  unread_count?: number;
}

interface MessageData {
  id: string;
  conversation_id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: string;
  read_at: string | null;
  created_at: string;
}

const Chat = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang } = useLanguage();
  const [conversations, setConversations] = useState<ConversationData[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [message, setMessage] = useState("");
  const [showAcceptDialog, setShowAcceptDialog] = useState(false);
  const [pendingConvId, setPendingConvId] = useState<string | null>(null);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [callingType, setCallingType] = useState<"video" | "audio" | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);

  const selectedConversation = conversations.find((c) => c.id === selectedChat);
  const isParticipant1 = selectedConversation?.participant_1 === user?.id;

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;
    const { data: convs } = await supabase
      .from("conversations")
      .select("*")
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order("last_message_at", { ascending: false });

    if (!convs) return;

    const enriched = await Promise.all(convs.map(async (conv: any) => {
      const otherId = conv.participant_1 === user.id ? conv.participant_2 : conv.participant_1;
      const { data: profile } = await supabase.from("profiles").select("full_name, avatar_url, profile_type").eq("id", otherId).single();
      
      const { data: lastMsg } = await supabase
        .from("messages")
        .select("content")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      const { count } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("conversation_id", conv.id)
        .eq("receiver_id", user.id)
        .is("read_at", null);

      return {
        ...conv,
        other_profile: profile || { full_name: "Usuário", avatar_url: null, profile_type: "atleta" },
        last_message: lastMsg?.content || "",
        unread_count: count || 0,
      };
    }));

    setConversations(enriched);
  }, [user]);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  // Load messages for selected chat
  useEffect(() => {
    if (!selectedChat || !user) return;

    const loadMessages = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", selectedChat)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as MessageData[]);

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("conversation_id", selectedChat)
        .eq("receiver_id", user.id)
        .is("read_at", null);
    };

    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${selectedChat}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selectedChat}`,
      }, (payload) => {
        const newMsg = payload.new as MessageData;
        setMessages(prev => [...prev, newMsg]);
        // Auto-mark as read if we're the receiver
        if (newMsg.receiver_id === user.id) {
          supabase.from("messages").update({ read_at: new Date().toISOString() }).eq("id", newMsg.id);
        }
      })
      .on("postgres_changes", {
        event: "UPDATE",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${selectedChat}`,
      }, (payload) => {
        const updated = payload.new as MessageData;
        setMessages(prev => prev.map(m => m.id === updated.id ? updated : m));
      })
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState();
        const typing = new Set<string>();
        Object.values(state).forEach((presence: any) => {
          presence.forEach((p: any) => {
            if (p.typing && p.user_id !== user.id) typing.add(p.user_id);
          });
        });
        setTypingUsers(typing);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ user_id: user.id, typing: false });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [selectedChat, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing indicator
  const handleTyping = () => {
    if (channelRef.current && user) {
      if (!isTyping) {
        setIsTyping(true);
        channelRef.current.track({ user_id: user.id, typing: true });
      }
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        channelRef.current?.track({ user_id: user.id, typing: false });
      }, 2000);
    }
  };

  const handleSelectChat = (conv: ConversationData) => {
    if (!conv.accepted) {
      setPendingConvId(conv.id);
      setShowAcceptDialog(true);
      return;
    }
    setSelectedChat(conv.id);
  };

  const acceptConversation = async () => {
    if (pendingConvId) {
      await supabase.from("conversations").update({ accepted: true }).eq("id", pendingConvId);
      setSelectedChat(pendingConvId);
      loadConversations();
      toast.success(t("Conversa aceita! Agora vocês podem trocar mensagens.", lang));
    }
    setShowAcceptDialog(false);
    setPendingConvId(null);
  };

  const rejectConversation = async () => {
    if (pendingConvId) {
      await supabase.from("conversations").delete().eq("id", pendingConvId);
      loadConversations();
      toast(t("Solicitação de conversa recusada.", lang));
    }
    setShowAcceptDialog(false);
    setPendingConvId(null);
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedChat || !user || !selectedConversation) return;
    const receiverId = selectedConversation.participant_1 === user.id
      ? selectedConversation.participant_2
      : selectedConversation.participant_1;

    await supabase.from("messages").insert({
      conversation_id: selectedChat,
      sender_id: user.id,
      receiver_id: receiverId,
      content: message,
      type: "text",
    });
    await supabase.from("conversations").update({ last_message_at: new Date().toISOString() }).eq("id", selectedChat);
    setMessage("");
    setIsTyping(false);
    channelRef.current?.track({ user_id: user.id, typing: false });
  };

  const sendAttachment = async (type: "document" | "location" | "photo") => {
    if (!selectedChat || !user || !selectedConversation) return;
    const labels = { document: "📄 Documento enviado", location: "📍 Localização compartilhada", photo: "📸 Foto enviada" };
    const receiverId = selectedConversation.participant_1 === user.id
      ? selectedConversation.participant_2
      : selectedConversation.participant_1;

    await supabase.from("messages").insert({
      conversation_id: selectedChat,
      sender_id: user.id,
      receiver_id: receiverId,
      content: labels[type],
      type,
    });
    setShowAttachMenu(false);
    toast.success(`${type === "document" ? "Documento" : type === "location" ? "Localização" : "Foto"} enviado(a)`);
  };

  const startCall = (type: "video" | "audio") => {
    setCallingType(type);
    setTimeout(() => setCallingType(null), 3000);
  };

  const getReadStatus = (msg: MessageData) => {
    if (msg.sender_id !== user?.id) return null;
    if (msg.read_at) return "read";
    return "sent";
  };

  const pinnedForMe = (conv: ConversationData) =>
    conv.participant_1 === user?.id ? conv.pinned_by_1 : conv.pinned_by_2;
  const mutedForMe = (conv: ConversationData) =>
    conv.participant_1 === user?.id ? conv.muted_by_1 : conv.muted_by_2;

  const togglePin = async (conv: ConversationData, e: React.MouseEvent) => {
    e.stopPropagation();
    const isP1 = conv.participant_1 === user?.id;
    const updateData = isP1
      ? { pinned_by_1: !pinnedForMe(conv) }
      : { pinned_by_2: !pinnedForMe(conv) };
    await supabase.from("conversations").update(updateData).eq("id", conv.id);
    loadConversations();
  };

  const toggleMute = async (conv: ConversationData, e: React.MouseEvent) => {
    e.stopPropagation();
    const isP1 = conv.participant_1 === user?.id;
    const updateData = isP1
      ? { muted_by_1: !mutedForMe(conv) }
      : { muted_by_2: !mutedForMe(conv) };
    await supabase.from("conversations").update(updateData).eq("id", conv.id);
    loadConversations();
  };

  const deleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await supabase.from("messages").delete().eq("conversation_id", id);
    await supabase.from("conversations").delete().eq("id", id);
    loadConversations();
    toast("Conversa excluída");
  };

  const sortedConversations = [...conversations].sort((a, b) => {
    if (pinnedForMe(a) && !pinnedForMe(b)) return -1;
    if (!pinnedForMe(a) && pinnedForMe(b)) return 1;
    if (!a.accepted && b.accepted) return -1;
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
              {selectedConversation ? selectedConversation.other_profile?.full_name : t("Chat Seguro", lang)}
            </span>
          </div>
          {selectedChat ? (
            <div className="flex items-center gap-1">
              <button onClick={() => startCall("audio")} className="text-muted-foreground hover:text-primary p-1.5"><Phone className="w-4.5 h-4.5" /></button>
              <button onClick={() => startCall("video")} className="text-muted-foreground hover:text-primary p-1.5"><Video className="w-4.5 h-4.5" /></button>
            </div>
          ) : (
            <div className="w-5" />
          )}
        </div>
      </header>

      {/* Safety banner */}
      <div className="bg-secondary/10 border-b border-secondary/20 px-4 py-2">
        <p className="text-[11px] text-secondary text-center font-display max-w-2xl mx-auto">
          🛡 {lang === "en" ? "Never schedule meetings outside Official Headquarters." : "Nunca marque encontros fora de Sedes Oficiais ou CTs. Comunique seus responsáveis."}
        </p>
      </div>

      {/* Call overlay */}
      {callingType && (
        <div className="fixed inset-0 z-[100] bg-background/95 flex flex-col items-center justify-center gap-6 animate-fade-in">
          <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center animate-pulse">
            {callingType === "video" ? <Video className="w-10 h-10 text-primary" /> : <Phone className="w-10 h-10 text-primary" />}
          </div>
          <p className="font-display font-bold text-lg text-foreground">
            {callingType === "video" ? (lang === "en" ? "Video Call" : "Chamada de Vídeo") : (lang === "en" ? "Audio Call" : "Chamada de Áudio")}
          </p>
          <p className="text-sm text-muted-foreground">{lang === "en" ? "Calling" : "Chamando"} {selectedConversation?.other_profile?.full_name}...</p>
          <Button variant="destructive" onClick={() => setCallingType(null)}>{lang === "en" ? "End" : "Encerrar"}</Button>
        </div>
      )}

      <main className="max-w-2xl mx-auto">
        {!selectedChat ? (
          <div className="px-4 py-4 space-y-2">
            <div className="glass-card rounded-xl p-3 flex items-center gap-2 mb-4 border border-cyan/20">
              <Lock className="w-4 h-4 text-cyan shrink-0" />
              <p className="text-xs text-muted-foreground">
                {lang === "en" 
                  ? <>Only <span className="text-cyan font-semibold">Verified Scouts</span> can start conversations.</>
                  : <>Apenas <span className="text-cyan font-semibold">Olheiros Verificados</span> podem iniciar conversas.</>
                }
              </p>
            </div>

            {conversations.filter(c => !c.accepted).length > 0 && (
              <div className="glass-card rounded-xl p-3 flex items-center gap-2 border border-secondary/30 mb-2">
                <Badge className="bg-secondary text-secondary-foreground border-0 text-xs">
                  {conversations.filter(c => !c.accepted).length}
                </Badge>
                <p className="text-xs text-foreground font-display font-semibold">
                  {lang === "en" ? "Pending requests" : "Solicitações pendentes"}
                </p>
              </div>
            )}

            {sortedConversations.length === 0 && (
              <div className="text-center py-16">
                <Radar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">
                  {lang === "en" ? "No conversations yet" : "Nenhuma conversa ainda"}
                </p>
              </div>
            )}

            {sortedConversations.map((conv) => (
              <div key={conv.id} className="relative">
                <button
                  onClick={() => handleSelectChat(conv)}
                  className={`w-full glass-card rounded-xl p-4 flex items-center gap-3 hover:border-primary/20 transition-colors border text-left ${
                    !conv.accepted ? "border-secondary/30" : pinnedForMe(conv) ? "border-primary/20" : "border-transparent"
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 relative">
                    {conv.other_profile?.avatar_url ? (
                      <img src={conv.other_profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-lg font-display font-bold text-primary">
                        {conv.other_profile?.full_name?.charAt(0) || "?"}
                      </span>
                    )}
                    {pinnedForMe(conv) && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                        <Pin className="w-2.5 h-2.5 text-primary-foreground" />
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-sm text-foreground truncate">{conv.other_profile?.full_name}</span>
                      {mutedForMe(conv) && <BellOff className="w-3 h-3 text-muted-foreground shrink-0" />}
                      {!conv.accepted && <Badge className="bg-secondary/20 text-secondary border-0 text-[9px]">{t("Pendente", lang)}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{conv.other_profile?.profile_type}</p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">{conv.last_message || (lang === "en" ? "No messages" : "Sem mensagens")}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(conv.last_message_at).toLocaleTimeString(lang === "en" ? "en-US" : "pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {(conv.unread_count || 0) > 0 && (
                      <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </button>

                {conv.accepted && (
                  <div className="absolute top-2 right-2">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-muted-foreground hover:text-foreground p-1 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => togglePin(conv, e as unknown as React.MouseEvent)}>
                          <Pin className="w-4 h-4 mr-2" /> {pinnedForMe(conv) ? (lang === "en" ? "Unpin" : "Desafixar") : (lang === "en" ? "Pin" : "Fixar")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={(e) => toggleMute(conv, e as unknown as React.MouseEvent)}>
                          <BellOff className="w-4 h-4 mr-2" /> {mutedForMe(conv) ? (lang === "en" ? "Unmute" : "Ativar") : (lang === "en" ? "Mute" : "Silenciar")}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={(e) => deleteConversation(conv.id, e as unknown as React.MouseEvent)}>
                          <Trash2 className="w-4 h-4 mr-2" /> {lang === "en" ? "Delete" : "Excluir"}
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
            {/* Typing indicator */}
            {typingUsers.size > 0 && (
              <div className="px-4 py-1.5 border-b border-border/30">
                <p className="text-xs text-primary animate-pulse font-display">{t("digitando...", lang)}</p>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg) => {
                const readStatus = getReadStatus(msg);
                return (
                  <div key={msg.id} className={`flex ${msg.sender_id === user?.id ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                      msg.sender_id === user?.id
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
                      <p className="text-sm">{msg.content}</p>
                      <div className="flex items-center gap-1 mt-1 justify-end">
                        <p className={`text-[10px] ${msg.sender_id === user?.id ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {new Date(msg.created_at).toLocaleTimeString(lang === "en" ? "en-US" : "pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        {readStatus === "read" && (
                          <CheckCheck className="w-3.5 h-3.5 text-cyan" />
                        )}
                        {readStatus === "sent" && (
                          <Check className="w-3 h-3 text-primary-foreground/60" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Attach menu */}
            {showAttachMenu && (
              <div className="glass border-t border-border/50 px-4 py-3 animate-slide-up">
                <div className="max-w-2xl mx-auto flex justify-around">
                  <button onClick={() => sendAttachment("photo")} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center"><Camera className="w-5 h-5 text-primary" /></div>
                    <span className="text-[10px] text-muted-foreground font-display">{lang === "en" ? "Camera" : "Câmera"}</span>
                  </button>
                  <button onClick={() => sendAttachment("document")} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-cyan/15 flex items-center justify-center"><FileText className="w-5 h-5 text-cyan" /></div>
                    <span className="text-[10px] text-muted-foreground font-display">{lang === "en" ? "Document" : "Documento"}</span>
                  </button>
                  <button onClick={() => sendAttachment("location")} className="flex flex-col items-center gap-1 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-secondary/15 flex items-center justify-center"><MapPin className="w-5 h-5 text-secondary" /></div>
                    <span className="text-[10px] text-muted-foreground font-display">{lang === "en" ? "Location" : "Localização"}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Input */}
            <div className="glass border-t border-border/50 px-4 py-3">
              <div className="max-w-2xl mx-auto flex gap-2 items-center">
                {isRecordingAudio ? (
                  <VoiceRecorder
                    onSend={async (duration) => {
                      if (!selectedChat || !user || !selectedConversation) return;
                      const receiverId = selectedConversation.participant_1 === user.id
                        ? selectedConversation.participant_2 : selectedConversation.participant_1;
                      await supabase.from("messages").insert({
                        conversation_id: selectedChat, sender_id: user.id, receiver_id: receiverId,
                        content: `🎤 Áudio (${duration})`, type: "audio",
                      });
                      setIsRecordingAudio(false);
                      toast.success(lang === "en" ? "Audio sent!" : "Áudio enviado!");
                    }}
                    onCancel={() => setIsRecordingAudio(false)}
                  />
                ) : (
                  <>
                    <button onClick={() => setShowAttachMenu(!showAttachMenu)} className="text-muted-foreground hover:text-primary transition-colors p-1">
                      <Paperclip className="w-5 h-5" />
                    </button>
                    <Input
                      value={message}
                      onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                      onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                      placeholder={t("Digite sua mensagem...", lang)}
                      className="flex-1 bg-muted border-border"
                    />
                    {message.trim() ? (
                      <Button size="icon" onClick={sendMessage}><Send className="w-4 h-4" /></Button>
                    ) : (
                      <button onClick={() => setIsRecordingAudio(true)} className="text-muted-foreground hover:text-primary transition-colors p-2">
                        <Mic className="w-5 h-5" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Dialog open={showAcceptDialog} onOpenChange={setShowAcceptDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">{lang === "en" ? "Conversation Request" : "Solicitação de Conversa"}</DialogTitle>
            <DialogDescription>
              <strong>{pendingConv?.other_profile?.full_name}</strong> {lang === "en" ? "wants to start a conversation with you." : "deseja iniciar uma conversa com você."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2">
            <Button variant="outline" onClick={rejectConversation} className="flex-1">
              <X className="w-4 h-4 mr-1" /> {lang === "en" ? "Decline" : "Recusar"}
            </Button>
            <Button onClick={acceptConversation} className="flex-1">
              <Check className="w-4 h-4 mr-1" /> {lang === "en" ? "Accept" : "Aceitar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!selectedChat && <BottomNav />}
    </div>
  );
};

export default Chat;
