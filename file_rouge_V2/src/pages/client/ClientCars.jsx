import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import voitureService from "../../services/voitureService";
import { isCarAvailable } from "../../utils/carAvailability";

const formatPrice = (value) => {
  const numeric = Number(value ?? 0);
  return `${numeric.toLocaleString("fr-FR")} DH`;
};

const resolvePrice = (car) => {
  if (car.listingType === "SALE") {
    return car.prix ?? car.prixVente ?? car.prixJour ?? car.prixParJour;
  }

  return car.prixJour ?? car.prix ?? car.prixParJour;
};

const resolveImage = (car) => car.image || car.images?.[0] || null;

function ClientCars() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeType = searchParams.get("type") === "SALE" ? "SALE" : "RENTAL";

  const [rentalCars, setRentalCars] = useState([]);
  const [saleCars, setSaleCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const [rentalData, saleData] = await Promise.all([
        voitureService.getRentalCars(),
        voitureService.getSaleCars(),
      ]);

      setRentalCars(rentalData);
      setSaleCars(saleData);
    } catch (error) {
      console.error("Erreur chargement voitures :", error);
    } finally {
      setLoading(false);
    }
  };

  const visibleRentalCars = activeType === "SALE" ? [] : rentalCars;
  const visibleSaleCars = activeType === "RENTAL" ? [] : saleCars;

  const renderCarCard = (car) => (
    <article className="car-card" key={car.id}>
      <div className="car-card__image">
        {resolveImage(car) ? (
          <img src={resolveImage(car)} alt={`${car.marque} ${car.modele}`} />
        ) : (
          <div className="car-card__placeholder">{car.marque?.slice(0, 2).toUpperCase() || "VO"}</div>
        )}
      </div>

      <div className="car-card__body">
        <div className="car-card__topline">
          <span className="badge badge--soft">{car.listingType || (activeType === "SALE" ? "SALE" : "RENTAL")}</span>
          <span className={`status-pill ${isCarAvailable(car.disponible) ? "status-pill--success" : "status-pill--muted"}`}>
            {isCarAvailable(car.disponible) ? "Disponible" : "Indisponible"}
          </span>
        </div>

        <h3>{car.marque} {car.modele}</h3>
        <p className="car-meta">{car.annee || "-"} • {car.ville || "Ville non renseignée"}</p>
        <p className="car-meta">Catégorie : {car.category || car.categorie || "-"}</p>
        <p className="car-price">{formatPrice(resolvePrice(car))}</p>

        <div className="car-card__actions">
          <Link to={`/client/cars/${car.id}`} className="secondary-button">
            Voir détails
          </Link>
        </div>
      </div>
    </article>
  );

  if (loading) {
    return <div className="client-page"><h1>Voitures</h1><p>Chargement...</p></div>;
  }

  return (
    <div className="client-page">
      <div className="page-header page-header--split">
        <div>
          <p className="eyebrow">Acheter & louer</p>
          <h1>Voitures disponibles</h1>
        </div>

        <div className="toggle-group" aria-label="Type de voiture">
          <button
            type="button"
            className={activeType === "RENTAL" ? "toggle-button is-active" : "toggle-button"}
            onClick={() => setSearchParams({ type: "RENTAL" })}
          >
            Louer
          </button>
          <button
            type="button"
            className={activeType === "SALE" ? "toggle-button is-active" : "toggle-button"}
            onClick={() => setSearchParams({ type: "SALE" })}
          >
            Acheter
          </button>
        </div>
      </div>

      {activeType === "RENTAL" && (
        <section className="listing-section">
          <div className="section-heading">
            <h2>Voitures en location</h2>
            <span>{visibleRentalCars.length} disponible(s)</span>
          </div>

          {visibleRentalCars.length === 0 ? (
            <div className="empty-state">Aucune voiture en location pour le moment.</div>
          ) : (
            <div className="car-grid">{visibleRentalCars.map(renderCarCard)}</div>
          )}
        </section>
      )}

      {activeType === "SALE" && (
        <section className="listing-section">
          <div className="section-heading">
            <h2>Voitures à vendre</h2>
            <span>{visibleSaleCars.length} disponible(s)</span>
          </div>

          {visibleSaleCars.length === 0 ? (
            <div className="empty-state">Aucune voiture à vendre pour le moment.</div>
          ) : (
            <div className="car-grid">{visibleSaleCars.map(renderCarCard)}</div>
          )}
        </section>
      )}
    </div>
  );
}

export default ClientCars;
