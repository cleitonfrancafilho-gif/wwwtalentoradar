import { useState, useRef, useEffect } from "react";
import { Mic, Square, Send, X, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VoiceRecorderProps {
  onSend: (duration: string) => void;
  onCancel: () => void;
}

const VoiceRecorder = ({ onSend, onCancel }: VoiceRecorderProps) => {
  const [recording, setRecording] = useState(true);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [recorded, setRecorded] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (recording && !paused) {
      intervalRef.current = setInterval(() => {
        setElapsed(e => e + 1);
      }, 1000);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [recording, paused]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const stopRecording = () => {
    setRecording(false);
    setRecorded(true);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const togglePause = () => {
    setPaused(!paused);
  };

  const handleSend = () => {
    onSend(formatTime(elapsed));
  };

  return (
    <div className="flex items-center gap-2 w-full animate-fade-in">
      {/* Cancel */}
      <button onClick={onCancel} className="text-destructive hover:text-destructive/80 p-1">
        <X className="w-5 h-5" />
      </button>

      {/* Waveform visual */}
      <div className="flex-1 flex items-center gap-1 bg-muted rounded-full px-3 py-2">
        {recording && !paused && (
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
        )}
        {recorded && (
          <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
        )}

        {/* Fake waveform */}
        <div className="flex-1 flex items-center gap-[2px] h-6 overflow-hidden">
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className={`w-[3px] rounded-full ${recording && !paused ? "bg-red-400" : "bg-primary/60"}`}
              style={{
                height: `${Math.random() * 80 + 20}%`,
                opacity: recorded || (recording && i < Math.floor((elapsed % 30))) ? 1 : 0.3,
                transition: "all 0.2s",
              }}
            />
          ))}
        </div>

        <span className="text-xs text-muted-foreground font-mono shrink-0">{formatTime(elapsed)}</span>
      </div>

      {/* Controls */}
      {recording ? (
        <div className="flex items-center gap-1">
          <button onClick={togglePause} className="p-1.5 rounded-full bg-muted hover:bg-muted/80">
            {paused ? <Play className="w-4 h-4 text-primary" /> : <Pause className="w-4 h-4 text-muted-foreground" />}
          </button>
          <button onClick={stopRecording} className="p-1.5 rounded-full bg-red-500/20 hover:bg-red-500/30">
            <Square className="w-4 h-4 text-red-500" />
          </button>
        </div>
      ) : (
        <Button size="icon" onClick={handleSend} className="shrink-0">
          <Send className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};

export default VoiceRecorder;
