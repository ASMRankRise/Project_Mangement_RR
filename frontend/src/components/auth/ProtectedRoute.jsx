import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Loading from "../common/Loading";

function ProtectedRoute({ role, children }) {
  const { user, authChecking } = useAuth();

  if (authChecking) {
    return <Loading message="Checking your session..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return (
      <Navigate to={user.role === "admin" ? "/admin" : "/dashboard"} replace />
    );
  }

  return children;
}

export default ProtectedRoute;
