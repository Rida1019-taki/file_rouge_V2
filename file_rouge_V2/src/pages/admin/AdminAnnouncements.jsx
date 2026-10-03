import { useEffect, useState } from "react";
import voitureService from "../../services/voitureService";

const formatPrice = (value) => value == null ? "-" : `${Number(value).toLocaleString("fr-FR")} DH`;

function AdminAnnouncements() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCars = async () => {
    try {
      setLoading(true);
      const data = await voitureService.getAllCars();
      setCars(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de charger les annonces.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCars(); }, []);

  const handleDelete = async (car) => {
    if (!window.confirm(`Supprimer l’annonce ${car.marque || ""} ${car.modele || ""} ?`)) return;
    try {
      await voitureService.deleteCar(car.id);
      setCars((current) => current.filter((item) => item.id !== car.id));
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de supprimer cette annonce.");
    }
  };

  if (loading) return <div className="client-page"><h1>Annonces</h1><p>Chargement...</p></div>;

  return (
    <div className="client-page">
      <div className="page-header"><div><p className="eyebrow">Administration</p><h1>Gestion des annonces</h1></div></div>
      {error && <div className="info-box info-box--error">{error}</div>}
      {cars.length === 0 ? <div className="empty-state">Aucune annonce trouvée.</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Véhicule</th><th>Type</th><th>Ville</th><th>Prix</th><th>Propriétaire</th><th>État</th><th>Action</th></tr></thead>
            <tbody>{cars.map((car) => (
              <tr key={car.id}>
                <td><strong>{car.marque} {car.modele}</strong></td>
                <td>{car.listingType === "SALE" ? "Vente" : "Location"}</td>
                <td>{car.ville?.nom || car.ville || "-"}</td>
                <td>{formatPrice(car.prixVente ?? car.prixParJour ?? car.prixJour ?? car.prix)}</td>
                <td>{car.owner?.prenom || car.proprietaire?.prenom || "-"} {car.owner?.nom || car.proprietaire?.nom || ""}</td>
                <td><span className={`status-pill ${car.disponible === false ? "status-pill--muted" : "status-pill--success"}`}>{car.disponible === false ? "Indisponible" : "Disponible"}</span></td>
                <td><button type="button" className="danger-button small-button" onClick={() => handleDelete(car)}>Supprimer</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminAnnouncements;
