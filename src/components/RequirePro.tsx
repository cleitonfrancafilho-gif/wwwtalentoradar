import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const RequirePro = ({ children }: { children: React.ReactNode }) => {
  const { user, hasPro, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!hasPro) return <Navigate to="/assinatura" replace />;

  return <>{children}</>;
};

export default RequirePro;
