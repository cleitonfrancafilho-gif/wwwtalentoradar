import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import QRCodeModal from "@/components/QRCodeModal";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  Settings, Edit, Grid3X3, Bookmark, Heart, MapPin, Shield, Trophy,
  Users, UserPlus, Play, Eye, Share2, MoreHorizontal, Verified, Link2
} from "lucide-react";

// Mock posts data
const mockPosts = [
  { id: 1, type: "video", thumbnail: "⚽", views: 12500, likes: 890 },
  { id: 2, type: "photo", thumbnail: "🏆", views: 8700, likes: 654 },
  { id: 3, type: "video", thumbnail: "🎯", views: 15200, likes: 1230 },
  { id: 4, type: "photo", thumbnail: "💪", views: 5400, likes: 432 },
  { id: 5, type: "video", thumbnail: "⚡", views: 9800, likes: 756 },
  { id: 6, type: "photo", thumbnail: "🔥", views: 11300, likes: 987 },
];

const savedPosts = [
  { id: 7, type: "video", thumbnail: "🌟", views: 6700, likes: 543 },
  { id: 8, type: "photo", thumbnail: "🏅", views: 4200, likes: 321 },
];

const formatNumber = (n: number) => (n >= 1000 ? (n / 1000).toFixed(1) + "K" : n.toString());

const Profile = () => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");

  // Determine profile type from database or default
  const profileType = profile?.profile_type || "atleta";
  const fullName = profile?.full_name || "Usuário";
  const bio = profile?.bio || "Adicione uma bio no seu perfil";
  const avatarUrl = profile?.avatar_url;
  const sport = profile?.sport || "Futebol";
  const position = profile?.position || "";
  const address = profile?.address || "Brasil";

  // Mock stats - in real app would come from database
  const stats = {
    posts: mockPosts.length,
    followers: 1283,
    following: 456
  };

  const getProfileEmoji = () => {
    if (profileType === "olheiro") return "🔍";
    if (profileType === "instituicao") return "🏟";
    return "⚽";
  };

  const getProfileBadge = () => {
    if (profileType === "olheiro") return { label: "Olheiro Verificado", icon: Shield, color: "bg-cyan/15 text-cyan" };
    if (profileType === "instituicao") return { label: "Instituição", icon: Trophy, color: "bg-secondary/15 text-secondary" };
    return { label: "Atleta", icon: Trophy, color: "bg-primary/15 text-primary" };
  };

  const badge = getProfileBadge();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <span className="font-display font-bold text-foreground">
            {fullName.split(" ")[0].toLowerCase()}
          </span>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/configuracoes")} className="text-muted-foreground hover:text-foreground transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Profile Header */}
        <div className="flex items-start gap-5 mb-6">
          {/* Avatar */}
          <div className="relative">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl border-2 ${
              profileType === "olheiro" ? "bg-cyan/20 border-cyan" : 
              profileType === "instituicao" ? "bg-secondary/20 border-secondary" : 
              "bg-primary/20 border-primary glow-green"
            }`}>
              {avatarUrl ? (
                <img src={avatarUrl} alt={fullName} className="w-full h-full rounded-full object-cover" />
              ) : (
                getProfileEmoji()
              )}
            </div>
            {/* Verified badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
              <Verified className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1 flex justify-around text-center">
            <div>
              <p className="font-display font-bold text-foreground text-lg">{stats.posts}</p>
              <p className="text-xs text-muted-foreground">Posts</p>
            </div>
            <button className="hover:opacity-80 transition-opacity">
              <p className="font-display font-bold text-foreground text-lg">{formatNumber(stats.followers)}</p>
              <p className="text-xs text-muted-foreground">Seguidores</p>
            </button>
            <button className="hover:opacity-80 transition-opacity">
              <p className="font-display font-bold text-foreground text-lg">{stats.following}</p>
              <p className="text-xs text-muted-foreground">Seguindo</p>
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display font-bold text-foreground">{fullName}</h1>
            <Badge className={`${badge.color} border-0 text-xs`}>
              <badge.icon className="w-3 h-3 mr-1" />
              {badge.label}
            </Badge>
          </div>
          
          {profileType === "atleta" && position && (
            <p className="text-sm text-muted-foreground mb-1">{position} • {sport}</p>
          )}
          
          {profileType === "olheiro" && profile?.professional_link && (
            <p className="text-sm text-muted-foreground mb-1">{profile.professional_link}</p>
          )}
          
          <p className="text-sm text-foreground mb-2">{bio}</p>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3" />
            <span>{address}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Button 
            onClick={() => navigate("/editar-perfil")}
            className="flex-1 bg-muted hover:bg-muted/80 text-foreground"
            variant="secondary"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar perfil
          </Button>
          <Button
            variant="secondary"
            className="bg-muted hover:bg-muted/80 text-foreground"
            onClick={() => {
              const profileUrl = `${window.location.origin}/perfil/${user?.id || ""}`;
              navigator.clipboard.writeText(profileUrl);
              toast.success("Link do perfil copiado!");
            }}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <QRCodeModal athleteName={fullName} profileUrl={window.location.href} />
        </div>

        {/* Profile Type Specific Info */}
        {profileType === "atleta" && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="glass-card rounded-xl p-3 text-center border border-primary/10">
              <p className="text-lg font-bold text-primary">{profile?.height_cm ? `${(profile.height_cm / 100).toFixed(2)}m` : "1.78m"}</p>
              <p className="text-xs text-muted-foreground">Altura</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center border border-primary/10">
              <p className="text-lg font-bold text-primary">{profile?.weight_kg ? `${profile.weight_kg}kg` : "72kg"}</p>
              <p className="text-xs text-muted-foreground">Peso</p>
            </div>
            <div className="glass-card rounded-xl p-3 text-center border border-primary/10">
              <p className="text-lg font-bold text-primary">{profile?.dominant_foot || "Direito"}</p>
              <p className="text-xs text-muted-foreground">Pé</p>
            </div>
          </div>
        )}

        {profileType === "olheiro" && (
          <div className="glass-card rounded-xl p-4 mb-6 border border-cyan/10">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-4 h-4 text-cyan" />
              <span className="text-sm font-display font-semibold text-foreground">Área de Atuação</span>
            </div>
            <p className="text-sm text-muted-foreground">{profile?.area_of_operation || "Futebol — Sudeste e Sul"}</p>
            {profile?.registration_number && (
              <p className="text-xs text-muted-foreground mt-1">CREF: {profile.registration_number}</p>
            )}
          </div>
        )}

        {profileType === "instituicao" && (
          <div className="glass-card rounded-xl p-4 mb-6 border border-secondary/10">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-4 h-4 text-secondary" />
              <span className="text-sm font-display font-semibold text-foreground">Categorias</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {["Sub-13", "Sub-15", "Sub-17", "Sub-20"].map((cat) => (
                <Badge key={cat} variant="outline" className="border-secondary/30 text-foreground text-xs">{cat}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full bg-muted h-10 mb-4">
            <TabsTrigger value="posts" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Grid3X3 className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="saved" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Bookmark className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="tagged" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="grid grid-cols-3 gap-1">
              {mockPosts.map((post) => (
                <div key={post.id} className="aspect-square bg-muted rounded-md flex items-center justify-center text-3xl relative group cursor-pointer hover:opacity-90 transition-opacity">
                  {post.thumbnail}
                  {post.type === "video" && (
                    <div className="absolute top-2 right-2">
                      <Play className="w-4 h-4 text-white drop-shadow-lg" fill="white" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <div className="flex items-center gap-1 text-white text-xs">
                      <Heart className="w-3 h-3" fill="white" />
                      {formatNumber(post.likes)}
                    </div>
                    <div className="flex items-center gap-1 text-white text-xs">
                      <Eye className="w-3 h-3" />
                      {formatNumber(post.views)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="saved">
            <div className="grid grid-cols-3 gap-1">
              {savedPosts.map((post) => (
                <div key={post.id} className="aspect-square bg-muted rounded-md flex items-center justify-center text-3xl relative group cursor-pointer hover:opacity-90 transition-opacity">
                  {post.thumbnail}
                  {post.type === "video" && (
                    <div className="absolute top-2 right-2">
                      <Play className="w-4 h-4 text-white drop-shadow-lg" fill="white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tagged">
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">Nenhuma marcação ainda</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <BottomNav />
    </div>
  );
};

export default Profile;
