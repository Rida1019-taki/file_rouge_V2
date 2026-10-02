import { useEffect, useState } from "react";
import reservationService from "../../services/reservationService";

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
    <div>
      <h1>Mes réservations</h1>

      {reservations.length === 0 && (
        <p>Aucune réservation.</p>
      )}

      {reservations.map((reservation) => (
        <div key={reservation.id}>
          <h2>
            {reservation.voitureMarque}{" "}
            {reservation.voitureModele}
          </h2>

          <p>
            Du {reservation.dateDebut} au{" "}
            {reservation.dateFin}
          </p>

          <p>
            Montant : {reservation.montantTotal} DH
          </p>

          <p>
            Statut : {reservation.statut}
          </p>

          {reservation.statut === "EN_ATTENTE" && (
            <button
              onClick={() => handleCancel(reservation.id)}
            >
              Annuler
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default ClientReservations;