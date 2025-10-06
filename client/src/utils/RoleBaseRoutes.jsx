import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";

const RoleBasedRoutes = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="text-white flex justify-center items-center min-h-screen">Loading...</div>;

    if (!user) return <Navigate to="/login" replace />;

    if (!requiredRole.includes(user.role)) {
        // user role match nathi thay to redirect
        return <Navigate to={user.role === "admin" ? "/admin" : "/home"} replace />;
    }

    return children;
};

export default RoleBasedRoutes;
