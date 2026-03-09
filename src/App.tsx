import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Register from "./pages/Register";
import SelectSports from "./pages/SelectSports";
import Feed from "./pages/Feed";
import AthleteProfile from "./pages/AthleteProfile";
import TalentStudio from "./pages/TalentStudio";
import EventsMap from "./pages/EventsMap";
import Chat from "./pages/Chat";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import EditProfile from "./pages/EditProfile";
import FaceCapture from "./pages/FaceCapture";
import HelpCenter from "./pages/HelpCenter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/cadastro" element={<Register />} />
          <Route path="/selecionar-esportes" element={<SelectSports />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/perfil/:id" element={<AthleteProfile />} />
          <Route path="/talent-studio" element={<TalentStudio />} />
          <Route path="/eventos" element={<EventsMap />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/termos" element={<Terms />} />
          <Route path="/privacidade" element={<Privacy />} />
          <Route path="/editar-perfil" element={<EditProfile />} />
          <Route path="/captura-facial" element={<FaceCapture />} />
          <Route path="/central-ajuda" element={<HelpCenter />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
