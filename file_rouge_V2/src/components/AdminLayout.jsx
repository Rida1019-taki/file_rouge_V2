import { NavLink, Outlet, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const navigation = [
  { to: "/admin", label: "Dashboard", icon: "◫", end: true },
  { to: "/admin/users", label: "Utilisateurs", icon: "♙" },
  { to: "/admin/annonces", label: "Annonces", icon: "▤" },
  { to: "/admin/profile", label: "Mon profil", icon: "◎" },
  { to: "/", label: "Retour à l’accueil", icon: "↩", end: true },
];

function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="client-shell admin-shell">
      <aside className="client-sidebar admin-sidebar">
        <div className="client-brand admin-brand">
          <span className="client-brand__mark" aria-hidden="true">T</span>
          <div><strong>Tomobilty</strong><small>Administration</small></div>
        </div>

        <nav className="client-nav admin-nav" aria-label="Navigation administration">
          <span className="admin-nav__label">Espace de travail</span>
          {navigation.map(({ to, label, icon, end }) => (
            <NavLink key={to} to={to} end={end} className={({ isActive }) => `client-nav__link ${isActive ? "is-active" : ""}`}>
              <span className="client-nav__icon" aria-hidden="true">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
          <button type="button" className="client-logout" onClick={handleLogout}>
            <span className="client-nav__icon" aria-hidden="true">↪</span>
            <span>Déconnexion</span>
          </button>
        </nav>

        <div className="admin-sidebar__footer">
          <span className="admin-sidebar__status"><span aria-hidden="true" />Espace sécurisé</span>
        </div>
      </aside>
      <main className="client-main"><Outlet /></main>
    </div>
  );
}

export default AdminLayout;
