import { useState } from "react";
import { Plus } from "lucide-react";
import StoryViewer, { Story, StorySlide } from "./StoryViewer";
import StoryCreator from "./StoryCreator";
import { toast } from "sonner";

const mockStories: Story[] = [
  {
    id: 1, userId: 1, userName: "Lucas Silva", time: "2h",
    slides: [
      { id: 1, type: "photo", url: "", duration: 5, likes: 24, comments: [{ id: 1, user: "Maria", text: "Show! 🔥", time: "1h" }], liked: false, music: { name: "Energia Total", artist: "DJ Sport" }, effect: "neon" },
      { id: 2, type: "boomerang", url: "", duration: 3, likes: 18, comments: [], liked: false },
    ],
  },
  {
    id: 2, userId: 2, userName: "Ana Costa", time: "4h",
    slides: [
      { id: 3, type: "video", url: "", duration: 8, likes: 45, comments: [{ id: 2, user: "Pedro", text: "Que jogada!", time: "3h" }], liked: false, effect: "vintage" },
    ],
  },
  {
    id: 3, userId: 3, userName: "Carlos M.", time: "6h",
    slides: [
      { id: 4, type: "live_photo", url: "", duration: 4, likes: 12, comments: [], liked: false, music: { name: "Foco e Força", artist: "Beat Atleta" } },
      { id: 5, type: "photo", url: "", duration: 5, likes: 8, comments: [], liked: false },
    ],
  },
  {
    id: 4, userId: 4, userName: "Bia Santos", time: "8h",
    slides: [
      { id: 6, type: "photo", url: "", duration: 5, likes: 33, comments: [{ id: 3, user: "João", text: "Craque demais!", time: "7h" }], liked: false },
    ],
  },
];

interface StoriesBarProps {
  className?: string;
}

const StoriesBar = ({ className }: StoriesBarProps) => {
  const [viewingIndex, setViewingIndex] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [stories, setStories] = useState(mockStories);
  const [viewedIds, setViewedIds] = useState<Set<number>>(new Set());

  const handleView = (index: number) => {
    setViewedIds(prev => new Set([...prev, stories[index].id]));
    setViewingIndex(index);
  };

  const handlePublish = (data: { type: string; effect: string; music?: { name: string; artist: string } }) => {
    const newSlide: StorySlide = {
      id: Date.now(),
      type: data.type as any,
      url: "",
      duration: data.type === "video" ? 8 : data.type === "boomerang" ? 3 : 5,
      likes: 0,
      comments: [],
      liked: false,
      music: data.music,
      effect: data.effect !== "none" ? data.effect : undefined,
    };
    const myStory: Story = {
      id: Date.now(),
      userId: 0,
      userName: "Meu Story",
      time: "Agora",
      isOwn: true,
      slides: [newSlide],
    };
    setStories(prev => [myStory, ...prev]);
    setCreating(false);
    toast.success("Story publicado!");
  };

  const handleRepost = (story: Story, slideIdx: number) => {
    const repostedSlide = { ...story.slides[slideIdx], id: Date.now(), likes: 0, comments: [], liked: false };
    const repost: Story = {
      id: Date.now(),
      userId: 0,
      userName: "Meu Story",
      time: "Agora",
      isOwn: true,
      slides: [repostedSlide],
    };
    setStories(prev => [repost, ...prev]);
    toast.success("Story repostado no seu perfil!");
  };

  return (
    <>
      <div className={`flex gap-3 overflow-x-auto px-4 py-3 scrollbar-none ${className}`}>
        {/* Add story */}
        <button
          onClick={() => setCreating(true)}
          className="shrink-0 flex flex-col items-center gap-1"
        >
          <div className="w-16 h-16 rounded-full bg-muted border-2 border-dashed border-primary/40 flex items-center justify-center">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <span className="text-[10px] text-muted-foreground font-display">Criar</span>
        </button>

        {/* Stories */}
        {stories.map((story, i) => {
          const viewed = viewedIds.has(story.id);
          return (
            <button
              key={story.id}
              onClick={() => handleView(i)}
              className="shrink-0 flex flex-col items-center gap-1"
            >
              <div className={`w-16 h-16 rounded-full p-0.5 ${viewed ? "bg-muted-foreground/30" : "bg-gradient-to-br from-primary via-secondary to-cyan"}`}>
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center text-lg">
                  {story.isOwn ? "📱" : "👤"}
                </div>
              </div>
              <span className="text-[10px] text-muted-foreground font-display w-16 truncate text-center">
                {story.userName}
              </span>
            </button>
          );
        })}
      </div>

      {viewingIndex !== null && (
        <StoryViewer
          stories={stories}
          initialIndex={viewingIndex}
          onClose={() => setViewingIndex(null)}
          onRepost={handleRepost}
        />
      )}

      {creating && (
        <StoryCreator onClose={() => setCreating(false)} onPublish={handlePublish} />
      )}
    </>
  );
};

export default StoriesBar;
