import { QRCodeSVG } from "qrcode.react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QrCode, Download } from "lucide-react";

interface QRCodeModalProps {
  athleteName: string;
  profileUrl: string;
}

const QRCodeModal = ({ athleteName, profileUrl }: QRCodeModalProps) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button variant="outline" size="sm" className="gap-1.5">
        <QrCode className="w-4 h-4" /> QR Code
      </Button>
    </DialogTrigger>
    <DialogContent className="glass-card bg-card max-w-xs text-center">
      <DialogHeader>
        <DialogTitle className="font-display text-foreground">
          Perfil de {athleteName}
        </DialogTitle>
      </DialogHeader>
      <div className="flex justify-center py-4">
        <div className="bg-foreground p-3 rounded-xl">
          <QRCodeSVG
            value={profileUrl}
            size={180}
            bgColor="hsl(0, 0%, 95%)"
            fgColor="hsl(0, 0%, 4%)"
            level="H"
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Escaneie para ver o DVD Digital
      </p>
      <Button variant="outline" size="sm" className="gap-1.5 mx-auto">
        <Download className="w-4 h-4" /> Salvar Imagem
      </Button>
    </DialogContent>
  </Dialog>
);

export default QRCodeModal;
