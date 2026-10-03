import { useEffect, useState } from "react";
import reservationService from "../../services/reservationService";
import clientService from "../../services/clientService";

const formatMoney = (value) => `${Number(value ?? 0).toLocaleString("fr-FR")} DH`;
const getReservationTypeLabel = (reservation) => {
  const type = String(
    reservation.type || reservation.listingType || reservation.voiture?.listingType || reservation.voiture?.type || ""
  ).toUpperCase();
  if (["ACHAT", "SALE", "VENTE"].includes(type)) return "Achat";
  if (["LOCATION", "RENTAL"].includes(type)) return "Location";
  return type || "Non précisé";
};
const getClientPhone = (reservation) =>
  reservation.clientTelephone || reservation.telephoneClient || reservation.clientPhone ||
  reservation.client?.telephone || reservation.client?.phone || "";

const statusOptions = ["EN_ATTENTE", "CONFIRMEE", "ANNULEE", "TERMINEE"];

function OwnerReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReservations = async () => {
    try {
      setLoading(true);
      const data = await reservationService.getOwnerReservations();
      const rows = Array.isArray(data) ? data : [];
      const enrichedRows = await Promise.all(rows.map(async (reservation) => {
        if (getClientPhone(reservation)) return reservation;

        const clientId = reservation.clientId || reservation.idClient || reservation.client_id || reservation.client?.id;
        if (!clientId) return reservation;

        try {
          const client = await clientService.getClient(clientId);
          return {
            ...reservation,
            client: { ...reservation.client, ...client },
            clientTelephone: client.telephone || client.phone || "",
          };
        } catch (error) {
          console.error(`Erreur chargement téléphone du client ${clientId} :`, error);
          return reservation;
        }
      }));
      setReservations(enrichedRows);
    } catch (error) {
      console.error("Erreur chargement réservations owner :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      await reservationService.updateReservationStatus(id, status);
      await loadReservations();
    } catch (error) {
      console.error("Erreur changement statut :", error);
      alert(error.response?.data?.message || "Impossible de changer le statut.");
    }
  };

  const getStatusClass = (status) => {
    const normalized = String(status || "").toUpperCase();

    if (normalized === "CONFIRMEE") return "status-pill--success";
    if (normalized === "ANNULEE") return "status-pill--danger";
    if (normalized === "TERMINEE") return "status-pill--neutral";
    return "status-pill--warning";
  };

  if (loading) {
    return <div className="client-page"><h1>Réservations</h1><p>Chargement...</p></div>;
  }

  return (
    <div className="client-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Gestion</p>
          <h1>Réservations</h1>
        </div>
      </div>

      {reservations.length === 0 ? (
        <div className="empty-state">Aucune réservation pour le moment.</div>
      ) : (
        <div className="reservation-list">
          {reservations.map((reservation) => {
            const phone = getClientPhone(reservation);
            return (
            <article className="reservation-card" key={reservation.id}>
              <div className="reservation-card__header">
                <div>
                  <h3>
                    {reservation.clientNom || reservation.client?.nom || "Client"} {reservation.clientPrenom || reservation.client?.prenom || ""}
                  </h3>
                  <p>
                    {reservation.voitureMarque || reservation.voiture?.marque || "Voiture"} {reservation.voitureModele || reservation.voiture?.modele || ""}
                  </p>
                </div>
                <span className={`status-pill ${getStatusClass(reservation.statut)}`}>
                  {reservation.statut || "-"}
                </span>
              </div>

              <div className="reservation-card__meta">
                <div>
                  <span>Téléphone du client</span>
                  {phone ? <a className="reservation-phone" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>{phone}</a> : <strong>Non renseigné</strong>}
                </div>
                <div>
                  <span>Type de demande</span>
                  <strong>{getReservationTypeLabel(reservation)}</strong>
                </div>
                <div>
                  <span>Période</span>
                  <strong>{reservation.dateDebut || "-"} → {reservation.dateFin || "-"}</strong>
                </div>
                <div>
                  <span>Montant</span>
                  <strong>{formatMoney(reservation.montantTotal ?? reservation.montant ?? reservation.prixTotal)}</strong>
                </div>
              </div>

              <div className="reservation-actions">
                {statusOptions
                  .filter((status) => status !== (reservation.statut || "").toUpperCase())
                  .map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => handleStatusChange(reservation.id, status)}
                      className="secondary-button small-button"
                    >
                      {status}
                    </button>
                  ))}
              </div>
            </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OwnerReservations;
