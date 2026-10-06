import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import voitureService from "../../services/voitureService";
import reservationService from "../../services/reservationService";
import { isCarAvailable } from "../../utils/carAvailability";

function OwnerDashboard() {
  const [cars, setCars] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [carsData, reservationsData] = await Promise.all([
          voitureService.getMyCars(),
          reservationService.getOwnerReservations(),
        ]);

        setCars(Array.isArray(carsData) ? carsData : []);
        setReservations(Array.isArray(reservationsData) ? reservationsData : []);
      } catch (error) {
        console.error("Erreur chargement dashboard owner :", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div className="client-page"><h1>Dashboard</h1><p>Chargement...</p></div>;
  }

  const availableCars = cars.filter((car) => isCarAvailable(car.disponible));
  const rentalCars = cars.filter((car) => {
    const listingType = String(car.listingType || car.type || "").toUpperCase();
    return listingType === "RENTAL";
  });
  const saleCars = cars.filter((car) => {
    const listingType = String(car.listingType || car.type || "").toUpperCase();
    return listingType === "SALE";
  });
  const pending = reservations.filter((reservation) => String(reservation.statut || "").toUpperCase() === "EN_ATTENTE");
  const confirmed = reservations.filter((reservation) => String(reservation.statut || "").toUpperCase() === "CONFIRMEE");

  return (
    <div className="client-page owner-dashboard">
      <div className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard propriétaire</h1>
        </div>
        <Link to="/owner/cars/new" className="secondary-button owner-primary-button">
          + Déposer une annonce
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card owner-stat-card">
          <div className="stat-card__header">
            <span className="stat-card__icon" aria-hidden="true">▣</span>
            <span>Voitures</span>
          </div>
          <strong>{cars.length}</strong>
        </div>
        <div className="stat-card owner-stat-card">
          <div className="stat-card__header">
            <span className="stat-card__icon" aria-hidden="true">✓</span>
            <span>Disponibles</span>
          </div>
          <strong>{availableCars.length}</strong>
        </div>
        <div className="stat-card owner-stat-card">
          <div className="stat-card__header">
            <span className="stat-card__icon" aria-hidden="true">◷</span>
            <span>Location</span>
          </div>
          <strong>{rentalCars.length}</strong>
        </div>
        <div className="stat-card owner-stat-card">
          <div className="stat-card__header">
            <span className="stat-card__icon" aria-hidden="true">◈</span>
            <span>Vente</span>
          </div>
          <strong>{saleCars.length}</strong>
        </div>
        <div className="stat-card owner-stat-card">
          <div className="stat-card__header">
            <span className="stat-card__icon" aria-hidden="true">◌</span>
            <span>En attente</span>
          </div>
          <strong>{pending.length}</strong>
        </div>
        <div className="stat-card owner-stat-card">
          <div className="stat-card__header">
            <span className="stat-card__icon" aria-hidden="true">✓</span>
            <span>Confirmées</span>
          </div>
          <strong>{confirmed.length}</strong>
        </div>
      </div>

      <div className="panel-grid owner-panels">
        <section className="panel-card owner-panel-card">
          <div className="panel-card__header">
            <h2>Mes voitures</h2>
            <span className="panel-card__count">{cars.length}</span>
          </div>
          {cars.slice(0, 3).map((car) => (
            <div key={car.id} className="mini-list-item">
              <div>
                <strong>{car.marque} {car.modele}</strong>
                <small>{car.listingType || "-"}</small>
              </div>
              <span className={`status-pill ${isCarAvailable(car.disponible) ? "status-pill--success" : "status-pill--muted"}`}>
                {isCarAvailable(car.disponible) ? "Disponible" : "Indisponible"}
              </span>
            </div>
          ))}
          {cars.length === 0 && <p>Aucune voiture enregistrée.</p>}
          <Link to="/owner/cars">Voir toutes</Link>
        </section>

        <section className="panel-card owner-panel-card">
          <div className="panel-card__header">
            <h2>Réservations</h2>
            <span className="panel-card__count">{reservations.length}</span>
          </div>
          {reservations.slice(0, 3).map((reservation) => (
            <div key={reservation.id} className="mini-list-item">
              <div>
                <strong>{reservation.clientNom || "Client"}</strong>
                <small>{reservation.statut || "-"}</small>
              </div>
              <span className={`status-pill ${reservation.statut === "CONFIRMEE" ? "status-pill--success" : reservation.statut === "ANNULEE" ? "status-pill--danger" : reservation.statut === "TERMINEE" ? "status-pill--neutral" : "status-pill--warning"}`}>
                {reservation.type || "-"}
              </span>
            </div>
          ))}
          {reservations.length === 0 && <p>Aucune réservation.</p>}
          <Link to="/owner/reservations">Voir toutes</Link>
        </section>
      </div>
    </div>
  );
}

export default OwnerDashboard;
