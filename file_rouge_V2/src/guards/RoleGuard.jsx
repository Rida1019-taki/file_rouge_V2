import { Navigate, Outlet } from "react-router-dom";

export default function RoleGuard({ roles }) {
  const role = localStorage.getItem("role");

  if (!roles.includes(role)) {
    return <Navigate to="/403" replace />;
  }

  return <Outlet />;
}