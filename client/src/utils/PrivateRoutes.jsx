import { useAuth } from "../context/authContext";
import { Navigate } from "react-router-dom";

const PrivateRoutes = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div className="text-white flex justify-center items-center min-h-screen">Loading...</div>;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default PrivateRoutes;
