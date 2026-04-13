import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import BottomNav from "@/components/BottomNav";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { toast } from "sonner";
import { ArrowLeft, FileDown, FileText, Sparkles, Loader2, Download } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

type CardTier = "bronze" | "silver" | "gold" | "legendary";

const tierConfig: Record<CardTier, { label: string; bg: string; border: string; text: string; glow: string }> = {
  bronze: { label: "Bronze", bg: "bg-gradient-to-br from-amber-900/80 to-amber-950", border: "border-amber-700/50", text: "text-amber-400", glow: "" },
  silver: { label: "Prata", bg: "bg-gradient-to-br from-slate-400/30 to-slate-600/30", border: "border-slate-400/50", text: "text-slate-300", glow: "" },
  gold: { label: "Ouro", bg: "bg-gradient-to-br from-yellow-600/40 to-yellow-900/40", border: "border-yellow-500/60", text: "text-yellow-400", glow: "shadow-[0_0_30px_hsl(45,100%,50%,0.2)]" },
  legendary: { label: "Lendária", bg: "bg-gradient-to-br from-yellow-400/20 via-black to-yellow-600/20", border: "border-yellow-400/80", text: "text-yellow-300", glow: "shadow-[0_0_40px_hsl(45,100%,55%,0.4)]" },
};

const SPORTS = ["Futebol", "Vôlei", "Basquete", "Futsal", "Handebol", "Natação", "Tênis", "Atletismo"];

const ExportCenter = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { lang } = useLanguage();
  const [exporting, setExporting] = useState(false);
  const [selectedSport, setSelectedSport] = useState(profile?.sport || "Futebol");
  const cardRef = useRef<HTMLDivElement>(null);

  const getProfileCompleteness = (): number => {
    if (!profile) return 0;
    const fields = ["full_name", "bio", "sport", "position", "height_cm", "weight_kg", "birth_date", "address", "avatar_url", "dominant_foot", "wingspan_cm"];
    const filled = fields.filter(f => (profile as any)[f]);
    return Math.round((filled.length / fields.length) * 100);
  };

  const getTier = (): CardTier => {
    const pct = getProfileCompleteness();
    if (pct >= 90) return "legendary";
    if (pct >= 70) return "gold";
    if (pct >= 50) return "silver";
    return "bronze";
  };

  const tier = getTier();
  const completeness = getProfileCompleteness();
  const config = tierConfig[tier];

  const age = profile?.birth_date
    ? Math.floor((Date.now() - new Date(profile.birth_date).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const exportPDF = async () => {
    if (!profile) return;
    setExporting(true);
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const w = doc.internal.pageSize.getWidth();
      const h = doc.internal.pageSize.getHeight();

      // === BACKGROUND ===
      doc.setFillColor(8, 8, 12);
      doc.rect(0, 0, w, h, "F");

      // === TOP ACCENT BAR ===
      doc.setFillColor(80, 200, 80);
      doc.rect(0, 0, w, 3, "F");

      // === HEADER SECTION ===
      doc.setFillColor(12, 12, 18);
      doc.rect(0, 3, w, 42, "F");

      // Logo text
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(80, 200, 80);
      doc.text("TALENTO", 15, 22);
      doc.setTextColor(255, 255, 255);
      doc.text("RADAR", 68, 22);

      // Subtitle
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 140);
      doc.text(lang === "en" ? "Professional Athlete Report" : "Ficha Profissional do Atleta", 15, 30);

      // Date & sport badge
      doc.setFontSize(8);
      doc.text(new Date().toLocaleDateString(lang === "en" ? "en-US" : "pt-BR", { year: "numeric", month: "long", day: "numeric" }), 15, 37);
      
      // Sport badge on right
      doc.setFillColor(80, 200, 80);
      doc.roundedRect(w - 55, 25, 40, 10, 3, 3, "F");
      doc.setFontSize(9);
      doc.setTextColor(8, 8, 12);
      doc.setFont("helvetica", "bold");
      doc.text(selectedSport.toUpperCase(), w - 35, 31.5, { align: "center" });

      // === DIVIDER ===
      doc.setDrawColor(80, 200, 80);
      doc.setLineWidth(0.3);
      doc.line(15, 48, w - 15, 48);

      // === ATHLETE NAME ===
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.text((profile.full_name || "—").toUpperCase(), 15, 60);

      // Position & Status
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(80, 200, 80);
      doc.text(profile.position || "—", 15, 68);
      doc.setTextColor(120, 120, 140);
      doc.text(`  |  ${profile.representation_status === "com_contrato" ? (lang === "en" ? "Under Contract" : "Com Contrato") : (lang === "en" ? "Free Agent" : "Livre")}`, 15 + doc.getTextWidth(profile.position || "—"), 68);

      // === PROFILE COMPLETENESS BAR ===
      const barY = 75;
      doc.setFillColor(30, 30, 40);
      doc.roundedRect(15, barY, w - 30, 6, 2, 2, "F");
      doc.setFillColor(80, 200, 80);
      doc.roundedRect(15, barY, (w - 30) * completeness / 100, 6, 2, 2, "F");
      doc.setFontSize(7);
      doc.setTextColor(200, 200, 200);
      doc.text(`${completeness}% ${lang === "en" ? "profile complete" : "perfil completo"} — ${config.label}`, 15, barY + 12);

      // === SECTION: PHYSICAL METRICS ===
      let y = 96;
      doc.setFillColor(15, 15, 22);
      doc.roundedRect(15, y - 4, w - 30, 50, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(80, 200, 80);
      doc.text(lang === "en" ? "PHYSICAL METRICS" : "MÉTRICAS FÍSICAS", 22, y + 4);

      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const metrics = [
        [lang === "en" ? "Height" : "Altura", profile.height_cm ? `${profile.height_cm} cm` : "—"],
        [lang === "en" ? "Weight" : "Peso", profile.weight_kg ? `${profile.weight_kg} kg` : "—"],
        [lang === "en" ? "Wingspan" : "Envergadura", profile.wingspan_cm ? `${profile.wingspan_cm} cm` : "—"],
        [lang === "en" ? "Dominant Foot" : "Pé Dominante", profile.dominant_foot || "—"],
        [lang === "en" ? "Age" : "Idade", age ? `${age} ${lang === "en" ? "years" : "anos"}` : "—"],
        [lang === "en" ? "Birth Date" : "Nascimento", profile.birth_date ? new Date(profile.birth_date).toLocaleDateString(lang === "en" ? "en-US" : "pt-BR") : "—"],
      ];

      const colW = (w - 44) / 3;
      metrics.forEach(([label, value], i) => {
        const col = i % 3;
        const row = Math.floor(i / 3);
        const x = 22 + col * colW;
        const my = y + row * 16;

        doc.setTextColor(120, 120, 140);
        doc.setFontSize(8);
        doc.text(label, x, my);
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(value, x, my + 6);
        doc.setFont("helvetica", "normal");
      });

      // === SECTION: PERSONAL INFO ===
      y = 156;
      doc.setFillColor(15, 15, 22);
      doc.roundedRect(15, y - 4, w - 30, 30, 3, 3, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(80, 200, 80);
      doc.text(lang === "en" ? "PERSONAL INFO" : "INFORMAÇÕES PESSOAIS", 22, y + 4);

      y += 14;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      doc.setTextColor(120, 120, 140);
      doc.setFontSize(8);
      doc.text(lang === "en" ? "Location" : "Localização", 22, y);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(profile.address || "—", 22, y + 6);

      doc.setTextColor(120, 120, 140);
      doc.setFontSize(8);
      doc.text("Email", w / 2, y);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.text(profile.email || "—", w / 2, y + 6);

      // === SECTION: BIO ===
      if (profile.bio) {
        y = 196;
        doc.setFillColor(15, 15, 22);
        const bioLines = doc.splitTextToSize(profile.bio, w - 44);
        const bioH = Math.max(30, bioLines.length * 5 + 20);
        doc.roundedRect(15, y - 4, w - 30, bioH, 3, 3, "F");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(12);
        doc.setTextColor(80, 200, 80);
        doc.text("BIO", 22, y + 4);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(200, 200, 200);
        doc.text(bioLines, 22, y + 14);
      }

      // === FOOTER ===
      doc.setFillColor(12, 12, 18);
      doc.rect(0, h - 18, w, 18, "F");
      doc.setFillColor(80, 200, 80);
      doc.rect(0, h - 18, w, 0.5, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(80, 200, 80);
      doc.text("TALENTO RADAR", 15, h - 8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 140);
      doc.text(lang === "en" ? "Generated automatically — All rights reserved" : "Gerado automaticamente — Todos os direitos reservados", 15, h - 4);
      doc.setFontSize(7);
      doc.text("www.talentoradar.com", w - 15, h - 6, { align: "right" });

      doc.save(`${profile.full_name || "atleta"}_ficha_${selectedSport}.pdf`);
      toast.success(lang === "en" ? "PDF exported!" : "PDF exportado!");
    } catch (e) {
      toast.error("Erro ao exportar");
    }
    setExporting(false);
  };

  const exportCard = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#000", scale: 2 });
      const link = document.createElement("a");
      link.download = `${profile?.full_name || "atleta"}_card.png`;
      link.href = canvas.toDataURL();
      link.click();
      toast.success(lang === "en" ? "Card exported!" : "Carta exportada!");
    } catch {
      toast.error("Erro ao exportar");
    }
    setExporting(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 glass border-b border-border/50 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <FileDown className="w-5 h-5 text-primary" />
          <span className="font-display font-bold text-lg text-foreground">
            {lang === "en" ? "Export Center" : "Central de Exportação"}
          </span>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-6">
        {/* Sport Selector */}
        <div className="glass-card rounded-xl p-4 border border-border">
          <p className="text-sm font-display font-bold text-foreground mb-2">
            {lang === "en" ? "Sport Category" : "Modalidade Esportiva"}
          </p>
          <Select value={selectedSport} onValueChange={setSelectedSport}>
            <SelectTrigger className="bg-muted">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SPORTS.map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* PDF Export */}
        <div className="glass-card rounded-xl p-5 border border-border space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground">{lang === "en" ? "Professional Report" : "Relatório Profissional"}</h3>
              <p className="text-xs text-muted-foreground">{lang === "en" ? "Complete PDF with metrics and resume" : "PDF completo com métricas e currículo"}</p>
            </div>
          </div>
          <Button onClick={exportPDF} disabled={exporting} className="w-full">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            {lang === "en" ? "Export PDF" : "Exportar PDF"} — {selectedSport}
          </Button>
        </div>

        {/* FIFA Card */}
        <div className="glass-card rounded-xl p-5 border border-border space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground">{lang === "en" ? "Digital Card" : "Carta Digital"}</h3>
              <p className="text-xs text-muted-foreground">Ultimate Team Style • {config.label}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Badge className={`${config.text} border-0 bg-black/50 text-xs`}>
              {completeness}% {lang === "en" ? "complete" : "completo"} → {config.label}
            </Badge>
          </div>

          {/* Card Preview */}
          <div className="flex justify-center">
            <div
              ref={cardRef}
              className={`w-64 rounded-2xl p-5 border-2 ${config.bg} ${config.border} ${config.glow} relative overflow-hidden`}
              style={{ aspectRatio: "2/3" }}
            >
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
              </div>

              <div className="relative z-10 h-full flex flex-col items-center justify-between">
                <div className="text-center">
                  <span className={`font-display text-4xl font-bold ${config.text}`}>{completeness}</span>
                  <p className="text-[10px] text-yellow-200/60 font-display uppercase tracking-wider">{config.label}</p>
                </div>
                <div className="w-20 h-20 rounded-full bg-black/40 border-2 border-yellow-500/30 flex items-center justify-center">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span className={`font-display text-2xl font-bold ${config.text}`}>{profile?.full_name?.charAt(0)}</span>
                  )}
                </div>
                <div className="text-center">
                  <p className="font-display font-bold text-white text-sm truncate max-w-full">{profile?.full_name}</p>
                  <p className="text-[10px] text-yellow-200/60">{profile?.position || "—"}</p>
                </div>
                <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-center w-full">
                  <div><p className="text-yellow-200/40 text-[8px]">ALT</p><p className="text-white text-xs font-bold">{profile?.height_cm || "—"}</p></div>
                  <div><p className="text-yellow-200/40 text-[8px]">PES</p><p className="text-white text-xs font-bold">{profile?.weight_kg || "—"}</p></div>
                  <div><p className="text-yellow-200/40 text-[8px]">IDA</p><p className="text-white text-xs font-bold">{age || "—"}</p></div>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-[10px]">
                  {selectedSport}
                </Badge>
              </div>
            </div>
          </div>

          <Button onClick={exportCard} disabled={exporting} variant="outline" className="w-full border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            {lang === "en" ? "Export Card" : "Exportar Carta"}
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default ExportCenter;
