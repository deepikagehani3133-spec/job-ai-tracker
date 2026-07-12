import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FullPageLoader } from "../components/ui";

/**
 * Gate: requires authentication. Pass `requireAdmin` to additionally
 * require the user's role slug to be "admin".
 */
function ProtectedRoute({ children, requireAdmin = false }) {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <FullPageLoader message="Checking your session..." />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && user?.role?.slug !== "admin") {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
}

export default ProtectedRoute;
