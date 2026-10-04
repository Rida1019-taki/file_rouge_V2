import { NavLink, Outlet, useNavigate } from "react-router-dom";
import authService from "../services/authService";

const navItems = [
  { label: "Dashboard", to: "/client" },
  { label: "Acheter une voiture", to: "/client/cars?type=SALE" },
  { label: "Louer une voiture", to: "/client/cars?type=RENTAL" },
  { label: "Mes réservations", to: "/client/reservations" },
  { label: "Mon profil", to: "/client/profile" },
  { label: "Retour à l’accueil", to: "/" },
];

function ClientLayout() {
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
            <small>Client</small>
          </div>
        </div>

        <nav className="client-nav" aria-label="Navigation client">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/client" || item.to === "/"}
              className={({ isActive }) =>
                `client-nav__link ${isActive ? "is-active" : ""}`
              }
            >
              {item.label}
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

export default ClientLayout;
