import { NavLink, Outlet, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const navItems = [
  { label: "Dashboard", to: "/owner", icon: "⌂" },
  { label: "Mes voitures", to: "/owner/cars", icon: "▣" },
  { label: "Ajouter une voiture", to: "/owner/cars/new", icon: "+" },
  { label: "Réservations", to: "/owner/reservations", icon: "✓" },
  { label: "Mon profil", to: "/owner/profile", icon: "◌" },
  { label: "Retour à l’accueil", to: "/", icon: "↩" },
];

function OwnerLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    authService.logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="client-shell">
      <aside className="client-sidebar">
        <div className="client-brand">
          <span className="client-brand__mark">T</span>
          <div>
            <strong>Tomobilty</strong>
            <small>Propriétaire</small>
          </div>
        </div>

        <nav className="client-nav" aria-label="Navigation propriétaire">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/owner" || item.to === "/"}
              className={({ isActive }) =>
                `client-nav__link ${isActive ? "is-active" : ""}`
              }
            >
              <span className="client-nav__icon" aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}

          <button type="button" className="client-logout" onClick={handleLogout}>
            Déconnexion
          </button>
        </nav>
      </aside>

      <main className="client-main">
        <Outlet />
      </main>
    </div>
  );
}

export default OwnerLayout;
