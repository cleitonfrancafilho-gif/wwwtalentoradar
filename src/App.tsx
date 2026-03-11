import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import RequireAdmin from "@/components/RequireAdmin";
import RequirePro from "@/components/RequirePro";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SelectSports from "./pages/SelectSports";
import Feed from "./pages/Feed";
import AthleteProfile from "./pages/AthleteProfile";
import Profile from "./pages/Profile";
import TalentStudio from "./pages/TalentStudio";
import EventsMap from "./pages/EventsMap";
import EvolutionPanel from "./pages/EvolutionPanel";
import CareerCenter from "./pages/CareerCenter";
import PhysicalProfile from "./pages/PhysicalProfile";
import ProfessionalStructure from "./pages/ProfessionalStructure";
import Chat from "./pages/Chat";
import Live from "./pages/Live";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import EditProfile from "./pages/EditProfile";
import FaceCapture from "./pages/FaceCapture";
import HelpCenter from "./pages/HelpCenter";
import AdminDashboard from "./pages/AdminDashboard";
import Settings from "./pages/Settings";
import TalentPro from "./pages/TalentPro";
import Notifications from "./pages/Notifications";
import About from "./pages/About";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Register />} />
            <Route path="/termos" element={<Terms />} />
            <Route path="/privacidade" element={<Privacy />} />
            <Route path="/sobre" element={<About />} />
            <Route path="/assinatura" element={<TalentPro />} />

            {/* Auth-required routes */}
            <Route path="/selecionar-esportes" element={<RequireAuth><SelectSports /></RequireAuth>} />
            <Route path="/feed" element={<RequireAuth><Feed /></RequireAuth>} />
            <Route path="/perfil/:id" element={<RequireAuth><AthleteProfile /></RequireAuth>} />
            <Route path="/perfil" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/talent-studio" element={<RequireAuth><TalentStudio /></RequireAuth>} />
            <Route path="/eventos" element={<RequireAuth><EventsMap /></RequireAuth>} />
            <Route path="/chat" element={<RequirePro><Chat /></RequirePro>} />
            <Route path="/live" element={<RequireAuth><Live /></RequireAuth>} />
            <Route path="/editar-perfil" element={<RequireAuth><EditProfile /></RequireAuth>} />
            <Route path="/captura-facial" element={<RequireAuth><FaceCapture /></RequireAuth>} />
            <Route path="/central-ajuda" element={<RequireAuth><HelpCenter /></RequireAuth>} />
            <Route path="/configuracoes" element={<RequireAuth><Settings /></RequireAuth>} />
            <Route path="/notificacoes" element={<RequireAuth><Notifications /></RequireAuth>} />

            {/* Admin-only route */}
            <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

