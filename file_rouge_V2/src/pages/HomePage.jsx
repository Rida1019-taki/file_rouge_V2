import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import voitureService from "../services/voitureService";
import referenceService from "../services/referenceService";
import { isCarAvailable } from "../utils/carAvailability";

const emptyFilters = { category: "", minPrice: "", maxPrice: "", city: "", brand: "", listingType: "" };

const asArray = (value) => {
  if (Array.isArray(value)) return value;
  const rows = value?.content ?? value?.data ?? value?.items ?? [];
  return Array.isArray(rows) ? rows : [];
};

const normalizeType = (car) => {
  const type = String(car.listingType || car.type || "RENTAL").toUpperCase();
  return ["SALE", "ACHAT", "VENTE"].includes(type) ? "SALE" : "RENTAL";
};

const getPrice = (car) => normalizeType(car) === "SALE"
  ? car.prixVente ?? car.prix ?? car.prixJour ?? car.prixParJour
  : car.prixParJour ?? car.prixJour ?? car.prix;

const getLabel = (value) => typeof value === "object" && value !== null
  ? value.label ?? value.nom ?? value.name ?? value.libelle ?? ""
  : value ?? "";

const getReferenceValue = (car, field) => {
  if (field === "category") return car.categorieId ?? car.categoryId ?? car.categorie?.id ?? car.category?.id ?? getLabel(car.categorie || car.category);
  return car.villeId ?? car.cityId ?? car.ville?.id ?? car.city?.id ?? getLabel(car.ville || car.city);
};

const formatPrice = (value) => `${Number(value ?? 0).toLocaleString("fr-FR")} DH`;
const normalize = (value) => String(value ?? "").trim().toLocaleLowerCase("fr");

function HomePage() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem("role");
  const dashboardPath = {
    CLIENT: "/client",
    OWNER: "/owner",
    ADMIN: "/admin",
  }[userRole];
  const isSignedIn = Boolean(localStorage.getItem("token")) && Boolean(dashboardPath);

  const handleDepositCar = () => {
    if (!isSignedIn) {
      navigate("/login?redirect=%2Fowner%2Fcars%2Fnew");
      return;
    }
    if (userRole === "OWNER" || userRole === "ADMIN") {
      navigate("/owner/cars/new");
      return;
    }
    if (userRole === "CLIENT") {
      const wantOwner = window.confirm(
        "Vous êtes actuellement connecté avec un compte Client.\nPour déposer une annonce, vous devez disposer d'un compte Propriétaire ou Concessionnaire.\n\nSouhaitez-vous créer un compte Propriétaire ?"
      );
      if (wantOwner) {
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        navigate("/register?role=OWNER&redirect=%2Fowner%2Fcars%2Fnew");
      }
    }
  };

  const [cars, setCars] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);
  const [filters, setFilters] = useState(emptyFilters);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      voitureService.getAllCars(),
      referenceService.getVilles(),
      referenceService.getCategories(),
    ])
      .then(([carData, cityData, categoryData]) => {
        if (!active) return;
        setCars(asArray(carData));
        setCities(asArray(cityData));
        setCategories(asArray(categoryData));
      })
      .catch((err) => {
        console.error("Erreur chargement annonces :", err);
        if (active) setError("Impossible de charger les annonces pour le moment.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const brands = useMemo(() => [...new Set(cars.map((car) => car.marque).filter(Boolean))]
    .sort((a, b) => String(a).localeCompare(String(b), "fr")), [cars]);

  const filteredCars = useMemo(() => cars.filter((car) => {
    const type = normalizeType(car);
    const price = Number(getPrice(car));
    const categoryValue = getReferenceValue(car, "category");
    const cityValue = getReferenceValue(car, "city");
    const selectedCategory = categories.find((item) => String(item.id) === filters.category);
    const selectedCity = cities.find((item) => String(item.id) === filters.city);
    const categoryMatches = !filters.category || String(categoryValue) === filters.category ||
      normalize(getLabel(car.categorie || car.category)) === normalize(selectedCategory?.label);
    const cityMatches = !filters.city || String(cityValue) === filters.city ||
      normalize(getLabel(car.ville || car.city)) === normalize(selectedCity?.label);

    return (!filters.listingType || type === filters.listingType) &&
      categoryMatches && cityMatches &&
      (!filters.brand || normalize(car.marque) === normalize(filters.brand)) &&
      (!filters.minPrice || (Number.isFinite(price) && price >= Number(filters.minPrice))) &&
      (!filters.maxPrice || (Number.isFinite(price) && price <= Number(filters.maxPrice)));
  }), [cars, categories, cities, filters]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setDraftFilters((current) => ({ ...current, [name]: value }));
  };

  const handleQuickType = (type) => {
    setDraftFilters((curr) => ({ ...curr, listingType: type }));
    setFilters((curr) => ({ ...curr, listingType: type }));
  };

  const handleQuickCity = (cityId) => {
    setDraftFilters((curr) => ({ ...curr, city: String(cityId) }));
    setFilters((curr) => ({ ...curr, city: String(cityId) }));
  };

  const resetFilters = () => {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  const hasActiveFilters = Boolean(
    filters.listingType || filters.category || filters.city ||
    filters.brand || filters.minPrice || filters.maxPrice
  );

  return (
    <div className="home-page">
      {/* Top Navigation */}
      <header className="home-nav">
        <div className="home-nav__inner">
          <Link to="/" className="home-brand">
            <strong>Tomobilty<span>.ma</span></strong>
            <small>Annonces automobiles au Maroc</small>
          </Link>

          <nav className="home-nav__menu" aria-label="Navigation principale">
            <a href="#annonces" onClick={() => handleQuickType("")}>Toutes les annonces</a>
            <a href="#annonces" onClick={() => handleQuickType("RENTAL")}>Location</a>
            <a href="#annonces" onClick={() => handleQuickType("SALE")}>Vente</a>
            <a href="#informations">Informations</a>
            <a href="#contact">Contact</a>
          </nav>

          <div className="home-nav__actions">
            <button
              type="button"
              onClick={handleDepositCar}
              className="home-register"
            >
              + Déposer une annonce
            </button>
            {isSignedIn ? (
              <Link to={dashboardPath} className="secondary-button">
                Mon espace
              </Link>
            ) : (
              <Link to="/login" className="secondary-button">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero & Search Section */}
      <section className="home-hero" id="accueil">
        <div className="home-hero__inner">
          <div className="home-hero__header">
            <p className="home-hero__eyebrow">Plateforme automobile</p>
            <h1>Achetez ou louez votre véhicule au Maroc</h1>
            <p className="home-hero__desc">
              Accédez à des centaines d'annonces vérifiées de voitures d'occasion et de véhicules de location à Casablanca, Rabat, Marrakech, Tanger et dans toutes les régions.
            </p>
          </div>

          {/* Search Console */}
          <div className="home-search-panel">
            <div className="search-tab-group" role="tablist">
              <button
                type="button"
                className={`search-tab ${draftFilters.listingType === "" ? "is-active" : ""}`}
                onClick={() => handleQuickType("")}
              >
                Toutes les offres
              </button>
              <button
                type="button"
                className={`search-tab ${draftFilters.listingType === "RENTAL" ? "is-active" : ""}`}
                onClick={() => handleQuickType("RENTAL")}
              >
                Voitures à louer
              </button>
              <button
                type="button"
                className={`search-tab ${draftFilters.listingType === "SALE" ? "is-active" : ""}`}
                onClick={() => handleQuickType("SALE")}
              >
                Voitures à vendre
              </button>
            </div>

            <form
              className="search-form-grid"
              onSubmit={(event) => {
                event.preventDefault();
                setFilters(draftFilters);
                document.getElementById("annonces")?.scrollIntoView();
              }}
            >
              <div className="search-field">
                <label htmlFor="filter-type">Type d'offre</label>
                <select id="filter-type" name="listingType" value={draftFilters.listingType} onChange={handleFilterChange}>
                  <option value="">Vente et location</option>
                  <option value="SALE">Vente uniquement</option>
                  <option value="RENTAL">Location uniquement</option>
                </select>
              </div>

              <div className="search-field">
                <label htmlFor="filter-brand">Marque</label>
                <select id="filter-brand" name="brand" value={draftFilters.brand} onChange={handleFilterChange}>
                  <option value="">Toutes les marques</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              <div className="search-field">
                <label htmlFor="filter-category">Catégorie</label>
                <select id="filter-category" name="category" value={draftFilters.category} onChange={handleFilterChange}>
                  <option value="">Toutes les catégories</option>
                  {categories.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div className="search-field">
                <label htmlFor="filter-city">Ville</label>
                <select id="filter-city" name="city" value={draftFilters.city} onChange={handleFilterChange}>
                  <option value="">Toutes les villes</option>
                  {cities.map((item) => (
                    <option key={item.id} value={item.id}>{item.label}</option>
                  ))}
                </select>
              </div>

              <div className="search-field">
                <label htmlFor="filter-min-price">Prix minimum (DH)</label>
                <input
                  id="filter-min-price"
                  type="number"
                  name="minPrice"
                  min="0"
                  placeholder="Ex: 200"
                  value={draftFilters.minPrice}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="search-field">
                <label htmlFor="filter-max-price">Prix maximum (DH)</label>
                <input
                  id="filter-max-price"
                  type="number"
                  name="maxPrice"
                  min="0"
                  placeholder="Ex: 5000"
                  value={draftFilters.maxPrice}
                  onChange={handleFilterChange}
                />
              </div>

              <div className="search-actions">
                <button type="submit" className="primary-search-button">
                  Rechercher
                </button>
                {hasActiveFilters && (
                  <button type="button" className="secondary-button" onClick={resetFilters}>
                    Réinitialiser
                  </button>
                )}
              </div>
            </form>

            {/* Clean City Filter Links */}
            {cities.length > 0 && (
              <div className="city-quick-bar">
                <span className="city-quick-bar__label">Villes fréquentes :</span>
                {cities.slice(0, 6).map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    className={`city-pill ${filters.city === String(city.id) ? "is-selected" : ""}`}
                    onClick={() => handleQuickCity(city.id)}
                  >
                    {city.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Marketplace Listings Section */}
      <section className="marketplace-section" id="annonces">
        <div className="home-container">
          <div className="marketplace-header">
            <div>
              <h2>Véhicules disponibles</h2>
              <p className="marketplace-header__meta">
                {loading ? "Chargement des résultats..." : `${filteredCars.length} annonce${filteredCars.length > 1 ? "s" : ""} trouvée${filteredCars.length > 1 ? "s" : ""}`}
              </p>
            </div>

            {hasActiveFilters && (
              <button type="button" className="reset-link-button" onClick={resetFilters}>
                Effacer les filtres
              </button>
            )}
          </div>

          {loading ? (
            <div className="marketplace-status-box">
              <p>Chargement des annonces en cours...</p>
            </div>
          ) : error ? (
            <div className="info-box info-box--error">{error}</div>
          ) : filteredCars.length === 0 ? (
            <div className="marketplace-empty-box">
              <h3>Aucune annonce ne correspond à votre recherche</h3>
              <p>Modifiez vos critères de recherche ou réinitialisez les filtres pour consulter l'ensemble des véhicules.</p>
              <button type="button" className="home-register" onClick={resetFilters}>
                Afficher toutes les annonces
              </button>
            </div>
          ) : (
            <div className="car-catalog-grid">
              {filteredCars.map((car) => {
                const isSale = normalizeType(car) === "SALE";
                const isAvailable = isCarAvailable(car.disponible);
                const image = car.image || car.images?.[0];
                const carPrice = getPrice(car);
                const cityLabel = getLabel(car.ville || car.city) || "Maroc";
                const categoryLabel = getLabel(car.categorie || car.category) || "Véhicule";

                return (
                  <article className="catalog-card" key={car.id}>
                    <div className="catalog-card__media">
                      {image ? (
                        <img src={image} alt={`${car.marque || "Voiture"} ${car.modele || ""}`} loading="lazy" />
                      ) : (
                        <div className="catalog-card__no-image">
                          <span>{car.marque?.slice(0, 3)?.toUpperCase() || "AUTO"}</span>
                        </div>
                      )}
                      <div className="catalog-card__tags">
                        <span className={`listing-type-badge ${isSale ? "type--sale" : "type--rental"}`}>
                          {isSale ? "Vente" : "Location"}
                        </span>
                        <span className={`status-badge ${isAvailable ? "status--available" : "status--unavailable"}`}>
                          {isAvailable ? "Disponible" : "Réservé"}
                        </span>
                      </div>
                    </div>

                    <div className="catalog-card__content">
                      <h3 className="catalog-card__title">
                        {car.marque} {car.modele}
                      </h3>

                      <div className="catalog-card__specs-row">
                        <span className="spec-chip">{car.annee || "Année N/C"}</span>
                        <span className="spec-chip">{cityLabel}</span>
                        <span className="spec-chip">{categoryLabel}</span>
                        <span className="spec-chip">{car.transmission || "Boîte N/C"}</span>
                      </div>

                      <div className="catalog-card__pricing-row">
                        <div className="catalog-card__price">
                          <strong>{formatPrice(carPrice)}</strong>
                          {!isSale && <span className="price-unit"> / jour</span>}
                        </div>

                        <Link to={`/cars/${car.id}`} className="catalog-card__button">
                          Voir l'annonce
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Information & Value Props Section */}
      <section className="marketplace-info-section" id="informations">
        <div className="home-container">
          <div className="info-columns-grid">
            <div className="info-column">
              <h3>Annonces contrôlées</h3>
              <p>
                Chaque annonce de vente et de location est examinée avant publication afin de garantir des informations claires sur le véhicule, son tarif et sa localisation.
              </p>
            </div>

            <div className="info-column">
              <h3>Contact direct</h3>
              <p>
                Prenez contact directement avec le propriétaire du véhicule pour convenir des dates de location, organiser un essai ou finaliser l'achat en toute transparence.
              </p>
            </div>

            <div className="info-column">
              <h3>Couverture nationale</h3>
              <p>
                Des véhicules répertoriés à Casablanca, Rabat, Marrakech, Tanger, Fès, Agadir et dans plusieurs autres villes à travers tout le territoire marocain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Owner Callout Banner */}
      <section className="owner-callout-section">
        <div className="home-container">
          <div className="owner-callout-box">
            <div className="owner-callout-box__text">
              <h3>Vous êtes propriétaire ou concessionnaire automobile ?</h3>
              <p>
                Déposez vos annonces gratuitement sur Tomobilty.ma et trouvez rapidement des acheteurs ou locataires vérifiés.
              </p>
            </div>
            <div className="owner-callout-box__action">
              <button
                type="button"
                onClick={handleDepositCar}
                className="home-register"
              >
                + Déposer une annonce
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="home-contact-section" id="contact">
        <div className="home-container">
          <div className="contact-box">
            <div>
              <h3>Une question ou besoin d'assistance ?</h3>
              <p>Notre équipe est à votre disposition pour vous orienter dans vos démarches d'achat ou de réservation.</p>
            </div>
            <div className="contact-box__buttons">
              <Link to="/login" className="secondary-button">Connexion</Link>
              <Link to="/register" className="home-register">Créer un compte</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="home-footer">
        <div className="home-container home-footer__content">
          <div className="home-footer__main">
            <strong>Tomobilty.ma</strong>
            <p>Portail d'annonces de vente et location de véhicules au Maroc.</p>
          </div>

          <div className="home-footer__links">
            <a href="#accueil">Accueil</a>
            <a href="#annonces">Toutes les annonces</a>
            <a href="#informations">Informations</a>
            <Link to="/login">Espace membre</Link>
            <Link to="/register">Inscription</Link>
          </div>
        </div>

        <div className="home-footer__bottom">
          <div className="home-container">
            <p>© {new Date().getFullYear()} Tomobilty.ma · File Rouge. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
