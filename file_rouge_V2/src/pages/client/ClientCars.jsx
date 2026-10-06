import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import voitureService from "../../services/voitureService";
import { isCarAvailable } from "../../utils/carAvailability";

const formatPrice = (value) => `${Number(value ?? 0).toLocaleString("fr-FR")} DH`;

const resolvePrice = (car) => {
  const isSale = ["SALE", "ACHAT", "VENTE"].includes(String(car.listingType || car.type || "").toUpperCase());
  if (isSale) {
    return car.prixVente ?? car.prix ?? car.prixJour ?? car.prixParJour ?? 0;
  }
  return car.prixParJour ?? car.prixJour ?? car.prix ?? 0;
};

const resolveImage = (car) => car.image || car.images?.[0] || null;

function ClientCars() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("type") || "ALL"; // ALL, RENTAL, SALE

  const [rentalCars, setRentalCars] = useState([]);
  const [saleCars, setSaleCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const [rentalData, saleData] = await Promise.all([
        voitureService.getRentalCars(),
        voitureService.getSaleCars(),
      ]);

      setRentalCars(Array.isArray(rentalData) ? rentalData : []);
      setSaleCars(Array.isArray(saleData) ? saleData : []);
    } catch (error) {
      console.error("Erreur chargement voitures :", error);
    } finally {
      setLoading(false);
    }
  };

  const displayedCars = useMemo(() => {
    let list = [];
    if (currentTab === "RENTAL") {
      list = rentalCars;
    } else if (currentTab === "SALE") {
      list = saleCars;
    } else {
      // Merge unique by ID
      const map = new Map();
      [...rentalCars, ...saleCars].forEach((c) => {
        if (!map.has(c.id)) map.set(c.id, c);
      });
      list = Array.from(map.values());
    }

    if (!searchTerm.trim()) return list;

    const query = searchTerm.toLowerCase().trim();
    return list.filter((car) => {
      const name = `${car.marque || ""} ${car.modele || ""}`.toLowerCase();
      const city = String(car.ville?.label || car.ville?.nom || car.ville || "").toLowerCase();
      const cat = String(car.category?.label || car.category || car.categorie || "").toLowerCase();
      return name.includes(query) || city.includes(query) || cat.includes(query);
    });
  }, [currentTab, rentalCars, saleCars, searchTerm]);

  const renderCarCard = (car) => {
    const isSale = ["SALE", "ACHAT", "VENTE"].includes(String(car.listingType || car.type || "").toUpperCase());
    const available = isCarAvailable(car.disponible);
    const image = resolveImage(car);
    const carPrice = resolvePrice(car);
    const city = car.ville?.label || car.ville?.nom || car.ville || "Maroc";
    const category = car.category?.label || car.category || car.categorie || "Véhicule";

    return (
      <article className="catalog-card" key={car.id}>
        <div className="catalog-card__media">
          {image ? (
            <img src={image} alt={`${car.marque} ${car.modele}`} loading="lazy" />
          ) : (
            <div className="catalog-card__no-image">
              <span>{car.marque?.slice(0, 3)?.toUpperCase() || "AUTO"}</span>
            </div>
          )}
          <div className="catalog-card__tags">
            <span className={`listing-type-badge ${isSale ? "type--sale" : "type--rental"}`}>
              {isSale ? "Vente" : "Location"}
            </span>
            <span className={`status-badge ${available ? "status--available" : "status--unavailable"}`}>
              {available ? "Disponible" : "Réservé"}
            </span>
          </div>
        </div>

        <div className="catalog-card__content">
          <h3 className="catalog-card__title">
            {car.marque} {car.modele}
          </h3>

          <div className="catalog-card__specs-row">
            <span className="spec-chip">{car.annee || "N/C"}</span>
            <span className="spec-chip">{city}</span>
            <span className="spec-chip">{car.transmission || "Boîte N/C"}</span>
            <span className="spec-chip">{category}</span>
          </div>

          <div className="catalog-card__pricing-row">
            <div className="catalog-card__price">
              <strong>{formatPrice(carPrice)}</strong>
              {!isSale && <span className="price-unit"> / jour</span>}
            </div>

            <Link to={`/client/cars/${car.id}`} className="catalog-card__button">
              Voir détails
            </Link>
          </div>
        </div>
      </article>
    );
  };

  if (loading) {
    return (
      <div className="client-page">
        <div className="page-header">
          <div>
            <p className="eyebrow">Catalogue</p>
            <h1>Voitures disponibles</h1>
          </div>
        </div>
        <p>Chargement des véhicules...</p>
      </div>
    );
  }

  return (
    <div className="client-page">
      <div className="page-header page-header--split">
        <div>
          <p className="eyebrow">Catalogue automobile</p>
          <h1>Voitures disponibles</h1>
        </div>

        <div className="toggle-group" aria-label="Filtrer les annonces">
          <button
            type="button"
            className={currentTab === "ALL" ? "toggle-button is-active" : "toggle-button"}
            onClick={() => setSearchParams({})}
          >
            Toutes ({rentalCars.length + saleCars.length})
          </button>
          <button
            type="button"
            className={currentTab === "RENTAL" ? "toggle-button is-active" : "toggle-button"}
            onClick={() => setSearchParams({ type: "RENTAL" })}
          >
            Location ({rentalCars.length})
          </button>
          <button
            type="button"
            className={currentTab === "SALE" ? "toggle-button is-active" : "toggle-button"}
            onClick={() => setSearchParams({ type: "SALE" })}
          >
            Vente ({saleCars.length})
          </button>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="client-filter-bar">
        <input
          type="text"
          placeholder="Rechercher par marque, modèle ou ville..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="client-search-input"
        />
        <span className="client-results-count">
          {displayedCars.length} véhicule{displayedCars.length > 1 ? "s" : ""} trouvé{displayedCars.length > 1 ? "s" : ""}
        </span>
      </div>

      <section className="listing-section">
        {displayedCars.length === 0 ? (
          <div className="empty-state">
            <p>Aucun véhicule ne correspond à vos critères de recherche.</p>
          </div>
        ) : (
          <div className="car-catalog-grid">
            {displayedCars.map(renderCarCard)}
          </div>
        )}
      </section>
    </div>
  );
}

export default ClientCars;
