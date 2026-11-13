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

  if (role) {
    const isElevated = user.role === "admin" || user.role === "superadmin";
    const hasAccess = user.role === role || (role === "admin" && isElevated);

    if (!hasAccess) {
      return (
        <Navigate to={isElevated ? "/admin" : "/dashboard"} replace />
      );
    }
  }

  return children;
}

export default ProtectedRoute;
