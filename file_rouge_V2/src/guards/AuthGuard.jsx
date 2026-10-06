import { Navigate, Outlet, useLocation } from "react-router-dom";

export default function AuthGuard() {
  const token = localStorage.getItem("token");
  const location = useLocation();

  if (!token) {
    const target = location.pathname + location.search;
    return <Navigate to={`/login?redirect=${encodeURIComponent(target)}`} replace />;
  }

  return <Outlet />;
}