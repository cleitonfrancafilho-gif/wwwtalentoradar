import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Radar, Camera, RotateCcw, CheckCircle2, ArrowLeft, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const FaceCapture = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const startCamera = useCallback(async () => {
    try {
      setCameraError(false);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 640 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch {
      setCameraError(true);
      toast({
        title: "Câmera indisponível",
        description: "Permita o acesso à câmera para continuar.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    startCamera();
    return () => {
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    setCapturedImage(dataUrl);
    stream?.getTracks().forEach((t) => t.stop());
  };

  const retake = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleSubmit = () => {
    if (!capturedImage) return;
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setUploading(false);
      toast({
        title: "✅ Biometria registrada!",
        description: "Sua foto foi vinculada ao seu cadastro com sucesso.",
      });
      navigate("/selecionar-esportes");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border/50 px-4 py-4 glass">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Radar className="w-5 h-5 text-primary" />
            <span className="font-display font-bold text-lg text-foreground">
              Talent<span className="text-gradient-neon">Radar</span>
            </span>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm animate-slide-up text-center space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              <ShieldCheck className="w-4 h-4 text-primary" />
              <span className="text-xs font-display font-semibold text-primary">Verificação Biométrica</span>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">Registro Facial</h1>
            <p className="text-sm text-muted-foreground">
              Posicione seu rosto dentro do círculo e capture a foto para finalizar seu cadastro.
            </p>
          </div>

          {/* Circular camera frame */}
          <div className="relative mx-auto w-64 h-64">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-full border-2 border-primary/40 glow-green" />
            {/* Scanning animation ring */}
            {!capturedImage && !cameraError && (
              <div className="absolute inset-[-4px] rounded-full border-2 border-transparent border-t-primary animate-radar-sweep" />
            )}
            {/* Camera view / captured image */}
            <div className="absolute inset-2 rounded-full overflow-hidden bg-muted flex items-center justify-center">
              {capturedImage ? (
                <img src={capturedImage} alt="Foto capturada" className="w-full h-full object-cover" />
              ) : cameraError ? (
                <div className="text-center p-4 space-y-2">
                  <Camera className="w-8 h-8 text-muted-foreground mx-auto" />
                  <p className="text-xs text-muted-foreground">Câmera indisponível</p>
                  <Button size="sm" variant="outline" onClick={startCamera} className="text-xs">
                    Tentar novamente
                  </Button>
                </div>
              ) : (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              )}
            </div>
            {/* Success overlay */}
            {capturedImage && (
              <div className="absolute inset-0 rounded-full border-2 border-primary glow-green flex items-center justify-center">
                <div className="absolute bottom-1 right-1 bg-primary rounded-full p-1">
                  <CheckCircle2 className="w-5 h-5 text-primary-foreground" />
                </div>
              </div>
            )}
          </div>

          <canvas ref={canvasRef} className="hidden" />

          {/* Action buttons */}
          <div className="space-y-3">
            {!capturedImage ? (
              <Button
                onClick={capturePhoto}
                disabled={cameraError}
                className="w-full gap-2"
                size="lg"
              >
                <Camera className="w-5 h-5" />
                Capturar Foto
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full gap-2"
                  size="lg"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-radar-sweep" />
                      Enviando...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirmar e Continuar
                    </>
                  )}
                </Button>
                <Button onClick={retake} variant="outline" className="w-full gap-2">
                  <RotateCcw className="w-4 h-4" />
                  Tirar Novamente
                </Button>
              </>
            )}
          </div>

          <p className="text-xs text-muted-foreground">
            Sua imagem será armazenada com segurança e vinculada ao seu perfil para fins de verificação de identidade.
          </p>
        </div>
      </main>
    </div>
  );
};

export default FaceCapture;
