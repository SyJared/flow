import { useAuth } from "../features/auth/AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" />;

  return children;
}

export default ProtectedRoute;