import { useState, useEffect, useRef } from "react";
import { X, Heart, Send, ChevronLeft, ChevronRight, MessageCircle, Share2, Volume2, VolumeX, Pause, Play } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface Story {
  id: number;
  userId: number;
  userName: string;
  userAvatar?: string;
  slides: StorySlide[];
  time: string;
  isOwn?: boolean;
}

export interface StorySlide {
  id: number;
  type: "photo" | "video" | "boomerang" | "live_photo";
  url: string;
  duration: number; // seconds
  music?: { name: string; artist: string };
  effect?: string;
  likes: number;
  comments: StoryComment[];
  liked?: boolean;
}

export interface StoryComment {
  id: number;
  user: string;
  text: string;
  time: string;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onRepost?: (story: Story, slideIndex: number) => void;
}

const StoryViewer = ({ stories, initialIndex, onClose, onRepost }: StoryViewerProps) => {
  const [storyIndex, setStoryIndex] = useState(initialIndex);
  const [slideIndex, setSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [localStories, setLocalStories] = useState(stories);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(Date.now());

  const story = localStories[storyIndex];
  const slide = story?.slides[slideIndex];

  useEffect(() => {
    if (!slide || paused) return;
    const duration = slide.duration * 1000;
    startTimeRef.current = Date.now() - (progress * duration);

    const tick = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const p = Math.min(elapsed / duration, 1);
      setProgress(p);
      if (p >= 1) {
        nextSlide();
      } else {
        timerRef.current = setTimeout(tick, 30);
      }
    };
    timerRef.current = setTimeout(tick, 30);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [slideIndex, storyIndex, paused]);

  const nextSlide = () => {
    if (slideIndex < story.slides.length - 1) {
      setSlideIndex(s => s + 1);
      setProgress(0);
    } else if (storyIndex < localStories.length - 1) {
      setStoryIndex(s => s + 1);
      setSlideIndex(0);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const prevSlide = () => {
    if (slideIndex > 0) {
      setSlideIndex(s => s - 1);
      setProgress(0);
    } else if (storyIndex > 0) {
      setStoryIndex(s => s - 1);
      setSlideIndex(0);
      setProgress(0);
    }
  };

  const toggleLike = () => {
    setLocalStories(prev => prev.map((s, si) =>
      si === storyIndex ? {
        ...s,
        slides: s.slides.map((sl, sli) =>
          sli === slideIndex ? { ...sl, liked: !sl.liked, likes: sl.liked ? sl.likes - 1 : sl.likes + 1 } : sl
        )
      } : s
    ));
    if (!slide?.liked) toast("❤️ Curtido!");
  };

  const addComment = () => {
    if (!commentText.trim()) return;
    const newComment: StoryComment = {
      id: Date.now(),
      user: "Você",
      text: commentText,
      time: "Agora",
    };
    setLocalStories(prev => prev.map((s, si) =>
      si === storyIndex ? {
        ...s,
        slides: s.slides.map((sl, sli) =>
          sli === slideIndex ? { ...sl, comments: [...sl.comments, newComment] } : sl
        )
      } : s
    ));
    setCommentText("");
    toast.success("Comentário enviado!");
  };

  const handleRepost = () => {
    onRepost?.(story, slideIndex);
    toast.success("Story repostado!");
  };

  if (!story || !slide) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center">
      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 px-2 pt-2">
        {story.slides.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className="h-full bg-white rounded-full transition-all"
              style={{
                width: `${i < slideIndex ? 100 : i === slideIndex ? progress * 100 : 0}%`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute top-4 left-0 right-0 z-10 flex items-center justify-between px-4 pt-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm">
            {story.userAvatar ? <img src={story.userAvatar} className="w-full h-full rounded-full object-cover" /> : "👤"}
          </div>
          <div>
            <p className="text-white text-sm font-bold">{story.userName}</p>
            <p className="text-white/60 text-[10px]">{story.time}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setPaused(!paused)} className="text-white/80 hover:text-white">
            {paused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          <button onClick={() => setMuted(!muted)} className="text-white/80 hover:text-white">
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div
        className="w-full h-full flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, hsl(${slide.id * 40 % 360}, 60%, 20%), hsl(${(slide.id * 40 + 60) % 360}, 60%, 10%))`,
        }}
      >
        {slide.type === "boomerang" && (
          <div className="absolute top-20 left-4 z-10">
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">∞ Boomerang</span>
          </div>
        )}
        {slide.type === "live_photo" && (
          <div className="absolute top-20 left-4 z-10">
            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">◉ Live Photo</span>
          </div>
        )}
        {slide.effect && (
          <div className="absolute top-20 right-4 z-10">
            <span className="bg-primary/30 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">✨ {slide.effect}</span>
          </div>
        )}
        <div className="text-white/40 text-6xl">📸</div>
      </div>

      {/* Music bar */}
      {slide.music && (
        <div className="absolute bottom-28 left-4 right-4 z-10">
          <div className="bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-2">
            <span className="text-white text-xs animate-pulse">♪</span>
            <p className="text-white text-xs truncate">{slide.music.name} — {slide.music.artist}</p>
          </div>
        </div>
      )}

      {/* Navigation zones */}
      <button className="absolute left-0 top-20 bottom-28 w-1/3 z-10" onClick={prevSlide} />
      <button className="absolute right-0 top-20 bottom-28 w-1/3 z-10" onClick={nextSlide} />

      {/* Actions */}
      <div className="absolute bottom-4 left-0 right-0 z-10 px-4">
        {showComments ? (
          <div className="bg-black/70 backdrop-blur-md rounded-2xl p-3 max-h-60 flex flex-col">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white text-sm font-bold">Comentários</span>
              <button onClick={() => setShowComments(false)} className="text-white/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 mb-2">
              {slide.comments.length === 0 && <p className="text-white/40 text-xs text-center py-4">Nenhum comentário ainda</p>}
              {slide.comments.map(c => (
                <div key={c.id} className="flex gap-2">
                  <span className="text-white text-xs font-bold">{c.user}</span>
                  <span className="text-white/80 text-xs">{c.text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addComment()}
                placeholder="Comentar..."
                className="flex-1 bg-white/10 border-white/20 text-white text-xs placeholder:text-white/40"
              />
              <Button size="icon" variant="ghost" onClick={addComment} disabled={!commentText.trim()}>
                <Send className="w-4 h-4 text-white" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 justify-center">
            <button onClick={toggleLike} className="flex flex-col items-center gap-0.5">
              <Heart className={`w-6 h-6 ${slide.liked ? "text-red-500 fill-red-500" : "text-white"}`} />
              <span className="text-white text-[10px]">{slide.likes}</span>
            </button>
            <button onClick={() => { setPaused(true); setShowComments(true); }} className="flex flex-col items-center gap-0.5">
              <MessageCircle className="w-6 h-6 text-white" />
              <span className="text-white text-[10px]">{slide.comments.length}</span>
            </button>
            <button onClick={handleRepost} className="flex flex-col items-center gap-0.5">
              <Share2 className="w-6 h-6 text-white" />
              <span className="text-white text-[10px]">Repostar</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
