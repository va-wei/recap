import { Navigate } from "react-router";

interface ProtectedRouteProps {
    authToken: string | null;
    children: React.ReactNode;
}

export function ProtectedRoute({ authToken, children }: ProtectedRouteProps) {
    if (!authToken) {
        return <Navigate to="/login" replace />;
    }

    return children;
}