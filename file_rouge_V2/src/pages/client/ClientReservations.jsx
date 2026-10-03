import { useEffect, useState } from "react";
import reservationService from "../../services/reservationService";

const formatMoney = (value) => `${Number(value ?? 0).toLocaleString("fr-FR")} DH`;

const canCancel = (status) => {
  const normalized = String(status || "").toUpperCase();
  return !["ANNULEE", "ANNULED", "REFUSEE", "REFUSED", "TERMINEE", "TERMINATED", "PAYE", "PAID"].includes(normalized);
};

function ClientReservations() {
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      const data = await reservationService.getMyReservations();
      setReservations(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCancel = async (id) => {
    try {
      await reservationService.cancelReservation(id);
      await loadReservations();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="client-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Réservations</p>
          <h1>Mes réservations</h1>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="empty-state">Aucune réservation pour le moment.</div>
      ) : (
        <div className="reservation-list">
          {reservations.map((reservation) => (
            <article className="reservation-card" key={reservation.id}>
              <div className="reservation-card__header">
                <div>
                  <h3>
                    {reservation.voitureMarque || reservation.voiture?.marque || "Voiture"}{" "}
                    {reservation.voitureModele || reservation.voiture?.modele || ""}
                  </h3>
                  <p>
                    {reservation.dateDebut || reservation.dateDebutReservation || "-"} • {reservation.dateFin || reservation.dateFinReservation || "-"}
                  </p>
                </div>
                <span className="status-pill">{reservation.statut || "-"}</span>
              </div>

              <div className="reservation-card__meta">
                <div>
                  <span>Montant total</span>
                  <strong>{formatMoney(reservation.montantTotal ?? reservation.montant ?? reservation.prixTotal)}</strong>
                </div>
                <div>
                  <span>Type</span>
                  <strong>{reservation.type || reservation.listingType || "-"}</strong>
                </div>
              </div>

              {canCancel(reservation.statut) && (
                <button type="button" className="danger-button" onClick={() => handleCancel(reservation.id)}>
                  Annuler
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClientReservations;