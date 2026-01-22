import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '../store';

const ProtectedRoute = () => {
    const { isAuthenticated } = useStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
