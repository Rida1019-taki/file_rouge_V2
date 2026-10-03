import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import voitureService from "../../services/voitureService";
import reservationService from "../../services/reservationService";

const formatPrice = (value) => {
  const numeric = Number(value ?? 0);
  return `${numeric.toLocaleString("fr-FR")} DH`;
};

function ClientDashboard() {
  const [rentalCars, setRentalCars] = useState([]);
  const [saleCars, setSaleCars] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rentalData, saleData, reservationsData] = await Promise.all([
        voitureService.getRentalCars(),
        voitureService.getSaleCars(),
        reservationService.getMyReservations(),
      ]);

      setRentalCars(rentalData);
      setSaleCars(saleData);
      setReservations(reservationsData);
    } catch (error) {
      console.error("Erreur chargement dashboard :", error);
    }
  };

  return (
    <div className="client-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Accueil</p>
          <h1>Dashboard client</h1>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span>Voitures en location</span>
          <strong>{rentalCars.length}</strong>
        </div>

        <div className="stat-card">
          <span>Voitures à vendre</span>
          <strong>{saleCars.length}</strong>
        </div>

        <div className="stat-card">
          <span>Réservations</span>
          <strong>{reservations.length}</strong>
        </div>
      </div>

      <div className="panel-grid">
        <section className="panel-card">
          <h2>Locations récentes</h2>
          {rentalCars.slice(0, 3).map((car) => (
            <div key={car.id} className="mini-list-item">
              <div>
                <strong>{car.marque} {car.modele}</strong>
                <small>{car.ville || "Ville non renseignée"}</small>
              </div>
              <span>{formatPrice(car.prixJour ?? car.prix ?? car.prixParJour)}</span>
            </div>
          ))}
          {rentalCars.length === 0 && <p>Aucune voiture en location.</p>}
          <Link to="/client/cars?type=RENTAL">Voir plus</Link>
        </section>

        <section className="panel-card">
          <h2>Ventes récentes</h2>
          {saleCars.slice(0, 3).map((car) => (
            <div key={car.id} className="mini-list-item">
              <div>
                <strong>{car.marque} {car.modele}</strong>
                <small>{car.ville || "Ville non renseignée"}</small>
              </div>
              <span>{formatPrice(car.prix ?? car.prixVente ?? car.prixParJour)}</span>
            </div>
          ))}
          {saleCars.length === 0 && <p>Aucune voiture à vendre.</p>}
          <Link to="/client/cars?type=SALE">Voir plus</Link>
        </section>

        <section className="panel-card">
          <h2>Réservations récentes</h2>
          {reservations.slice(0, 3).map((reservation) => (
            <div key={reservation.id} className="mini-list-item">
              <div>
                <strong>{reservation.voitureMarque || reservation.voiture?.marque || "Voiture"} {reservation.voitureModele || reservation.voiture?.modele || ""}</strong>
                <small>{reservation.dateDebut} → {reservation.dateFin}</small>
              </div>
              <span>{reservation.statut || "-"}</span>
            </div>
          ))}
          {reservations.length === 0 && <p>Aucune réservation.</p>}
          <Link to="/client/reservations">Voir toutes</Link>
        </section>
      </div>
    </div>
  );
}

export default ClientDashboard;