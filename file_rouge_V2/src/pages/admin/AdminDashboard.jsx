import { useEffect, useState } from "react";
import adminService from "../../services/adminService";

const emptyStats = {
  users: 0,
  cars: 0,
  carsSale: 0,
  carsRental: 0,
  reservations: 0,
};

function AdminDashboard() {
  const [stats, setStats] = useState(emptyStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [nextStats, users] = await Promise.all([
          adminService.getStats(),
          adminService.getUsers(),
        ]);
        setStats({
          ...nextStats,
          clients: users.filter((user) => user.role === "CLIENT").length,
          owners: users.filter((user) => user.role === "OWNER").length,
        });
      } catch (err) {
        console.error("Erreur chargement statistiques admin :", err);
        setError(err.response?.data?.message || "Impossible de charger les statistiques.");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) return <div className="client-page"><h1>Dashboard</h1><p>Chargement...</p></div>;

  return (
    <div className="client-page">
      <div className="page-header">
        <div><p className="eyebrow">Pilotage plateforme</p><h1>Dashboard administrateur</h1></div>
      </div>
      {error && <div className="info-box info-box--error">{error}</div>}
      <div className="stats-grid admin-stats-grid">
        <div className="stat-card"><span>Utilisateurs</span><strong>{stats.users}</strong></div>
        <div className="stat-card"><span>Clients</span><strong>{stats.clients || 0}</strong></div>
        <div className="stat-card"><span>Propriétaires</span><strong>{stats.owners || 0}</strong></div>
        <div className="stat-card"><span>Véhicules</span><strong>{stats.cars}</strong></div>
        <div className="stat-card"><span>Locations</span><strong>{stats.carsRental}</strong></div>
        <div className="stat-card"><span>Ventes</span><strong>{stats.carsSale}</strong></div>
        <div className="stat-card"><span>Réservations</span><strong>{stats.reservations}</strong></div>
      </div>
      <div className="panel-card">
        <h2>Vue d’ensemble</h2>
        <p>Utilisez la section Utilisateurs pour gérer les comptes de la plateforme.</p>
      </div>
    </div>
  );
}

export default AdminDashboard;
