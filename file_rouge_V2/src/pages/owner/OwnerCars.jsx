import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import voitureService from "../../services/voitureService";

const formatPrice = (value) => {
  const numeric = Number(value ?? 0);
  return `${numeric.toLocaleString("fr-FR")} DH`;
};

function OwnerCars() {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCars = async () => {
    try {
      setLoading(true);
      const data = await voitureService.getMyCars();
      setCars(Array.isArray(data) ? data : []);
      setError("");
    } catch (err) {
      console.error("Erreur chargement voitures owner :", err);
      setError(err.response?.data?.message || "Impossible de charger vos voitures.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCars();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette voiture ?")) return;

    try {
      await voitureService.deleteCar(id);
      await loadCars();
    } catch (err) {
      console.error("Erreur suppression voiture :", err);
      alert(err.response?.data?.message || "Suppression impossible.");
    }
  };

  if (loading) {
    return <div className="client-page"><h1>Mes voitures</h1><p>Chargement...</p></div>;
  }

  return (
    <div className="client-page">
      <div className="page-header page-header--split">
        <div>
          <p className="eyebrow">Véhicules</p>
          <h1>Mes voitures</h1>
        </div>
        <button type="button" onClick={() => navigate("/owner/cars/new")}>Ajouter une voiture</button>
      </div>

      {error && <div className="info-box info-box--error">{error}</div>}

      {cars.length === 0 ? (
        <div className="empty-state">Aucune voiture enregistrée.</div>
      ) : (
        <div className="car-grid owner-car-grid">
          {cars.map((car) => (
            <article className="car-card owner-car-card" key={car.id}>
              <div className="car-card__image">
                {car.image || car.images?.[0] ? (
                  <img src={car.image || car.images?.[0]} alt={`${car.marque} ${car.modele}`} />
                ) : (
                  <div className="car-card__placeholder">{car.marque?.slice(0, 2).toUpperCase() || "VO"}</div>
                )}
              </div>

              <div className="car-card__body">
                <div className="car-card__topline">
                  <span className="badge badge--soft">{car.listingType || "RENTAL"}</span>
                  <span className={`status-pill ${car.disponible === false ? "status-pill--muted" : "status-pill--success"}`}>
                    {car.disponible === false ? "Indisponible" : "Disponible"}
                  </span>
                </div>

                <h3>{car.marque} {car.modele}</h3>

                <ul className="owner-car-specs">
                  <li><span>Année</span><strong>{car.annee || "-"}</strong></li>
                  <li><span>Places</span><strong>{car.nombrePlaces ?? "-"}</strong></li>
                  <li><span>Transmission</span><strong>{car.transmission || "-"}</strong></li>
                  <li><span>Prix / jour</span><strong>{formatPrice(car.prixParJour ?? car.prixJour ?? car.prix ?? 0)}</strong></li>
                  <li><span>Prix vente</span><strong>{formatPrice(car.prixVente ?? car.prix ?? 0)}</strong></li>
                  <li><span>Catégorie</span><strong>{car.category || car.categorie || "-"}</strong></li>
                  <li><span>Ville</span><strong>{car.ville || "-"}</strong></li>
                </ul>

                <div className="owner-card-actions">
                  <Link to={`/owner/cars/${car.id}`} className="secondary-button">Voir</Link>
                  <Link to={`/owner/cars/${car.id}/edit`} className="secondary-button">Modifier</Link>
                  <button type="button" className="danger-button" onClick={() => handleDelete(car.id)}>Supprimer</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export default OwnerCars;
