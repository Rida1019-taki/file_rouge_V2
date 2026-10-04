import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
  const userRole = localStorage.getItem("role");
  const dashboardPath = {
    CLIENT: "/client",
    OWNER: "/owner",
    ADMIN: "/admin",
  }[userRole];
  const isSignedIn = Boolean(localStorage.getItem("token")) && Boolean(dashboardPath);
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
        console.error("Erreur chargement annonces publiques :", err);
        if (active) setError("Impossible de charger les annonces. Réessayez plus tard.");
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

  const resetFilters = () => {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  return (
    <main className="home-page">
      <header className="home-nav">
        <a className="home-brand" href="#accueil">Tomobilty.ma <span>by File Rouge</span></a>
        <nav aria-label="Navigation principale">
          <a href="#annonces">Annonces</a>
          <a href="#apropos">À propos</a>
          <a href="#contact">Contact</a>
        </nav>
        <div className="home-nav__actions">
          {isSignedIn ? (
            <Link to={dashboardPath} className="home-register">Mon tableau de bord</Link>
          ) : (
            <>
              <Link to="/login" className="secondary-button">Connexion</Link>
              <Link to="/register" className="home-register">Inscription</Link>
            </>
          )}
        </div>
      </header>

      <section className="home-hero" id="accueil">
        <p className="eyebrow">Le marché automobile, simplement</p>
        <h1>Trouvez la voiture qui vous correspond.</h1>
        <p>Comparez les voitures à vendre et à louer partout au Maroc.</p>
        <a href="#annonces" className="home-register">Parcourir les annonces</a>
      </section>

      <section className="home-marketplace" id="annonces">
        <div className="home-section-title">
          <div><p className="eyebrow">Annonces réelles</p><h2>Rechercher une voiture</h2></div>
          <span className="home-result-count">{loading ? "…" : `${filteredCars.length} annonce${filteredCars.length === 1 ? "" : "s"}`}</span>
        </div>

        <form className="marketplace-filters" onSubmit={(event) => { event.preventDefault(); setFilters(draftFilters); }}>
          <div className="marketplace-filter-grid">
            <div>
              <label htmlFor="filter-type">Type d’annonce</label>
              <select id="filter-type" name="listingType" value={draftFilters.listingType} onChange={handleFilterChange}>
                <option value="">Vente et location</option>
                <option value="SALE">À vendre</option>
                <option value="RENTAL">À louer</option>
              </select>
            </div>
            <div>
              <label htmlFor="filter-category">Catégorie</label>
              <select id="filter-category" name="category" value={draftFilters.category} onChange={handleFilterChange}>
                <option value="">Toutes les catégories</option>
                {categories.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filter-city">Ville</label>
              <select id="filter-city" name="city" value={draftFilters.city} onChange={handleFilterChange}>
                <option value="">Toutes les villes</option>
                {cities.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filter-brand">Marque</label>
              <select id="filter-brand" name="brand" value={draftFilters.brand} onChange={handleFilterChange}>
                <option value="">Toutes les marques</option>
                {brands.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="filter-min-price">Prix minimum (DH)</label>
              <input id="filter-min-price" type="number" name="minPrice" min="0" step="any" placeholder="Sans minimum" value={draftFilters.minPrice} onChange={handleFilterChange} />
            </div>
            <div>
              <label htmlFor="filter-max-price">Prix maximum (DH)</label>
              <input id="filter-max-price" type="number" name="maxPrice" min="0" step="any" placeholder="Sans maximum" value={draftFilters.maxPrice} onChange={handleFilterChange} />
            </div>
          </div>
          <div className="marketplace-filter-actions">
            <button type="submit">Rechercher</button>
            <button type="button" className="secondary-button" onClick={resetFilters}>Réinitialiser</button>
          </div>
        </form>

        {loading ? <p className="home-loading">Chargement des annonces…</p> : error ? (
          <div className="info-box info-box--error">{error}</div>
        ) : filteredCars.length === 0 ? (
          <div className="empty-state">Aucune voiture ne correspond à ces filtres. Essayez d’autres critères.</div>
        ) : (
          <div className="car-grid home-car-grid">
            {filteredCars.map((car) => {
              const isSale = normalizeType(car) === "SALE";
              const isAvailable = isCarAvailable(car.disponible);
              const image = car.image || car.images?.[0];
              return (
                <article className="car-card home-car-card" key={car.id}>
                  <div className="car-card__image">
                    {image ? <img src={image} alt={`${car.marque || "Voiture"} ${car.modele || ""}`} /> : <div className="car-card__placeholder">{car.marque?.slice(0, 2).toUpperCase() || "VO"}</div>}
                  </div>
                  <div className="car-card__body">
                    <div className="car-card__topline">
                      <span className="badge badge--soft">{isSale ? "À vendre" : "À louer"}</span>
                      <span className={`status-pill ${isAvailable ? "status-pill--success" : "status-pill--muted"}`}>
                        {isAvailable ? "Disponible" : "Indisponible"}
                      </span>
                    </div>
                    <h3>{car.marque} {car.modele}</h3>
                    <div className="home-car-facts">
                      <span>{car.annee || "Année non précisée"}</span>
                      <span>{getLabel(car.categorie || car.category) || "Catégorie non précisée"}</span>
                      <span>{getLabel(car.ville || car.city) || "Ville non précisée"}</span>
                    </div>
                    <p className="car-price">{formatPrice(getPrice(car))}{!isSale && <small> / jour</small>}</p>
                    <Link to={`/cars/${car.id}`} className="secondary-button">Voir les détails</Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="home-about" id="apropos">
        <p className="eyebrow">À propos</p>
        <h2>Une façon simple de chercher, louer et acheter.</h2>
        <p>Tomobilty.ma rassemble les annonces publiées sur File Rouge pour aider les visiteurs à comparer des offres de vente et de location.</p>
      </section>
      <section className="home-contact" id="contact">
        <div><p className="eyebrow">Contact</p><h2>Vous avez trouvé une voiture ?</h2><p>Connectez-vous ou créez un compte client pour envoyer une demande au propriétaire.</p></div>
        <div className="home-contact-actions"><Link to="/login" className="secondary-button">Connexion</Link><Link to="/register" className="home-register">Créer un compte</Link></div>
      </section>
      <footer className="home-footer">© {new Date().getFullYear()} Tomobilty.ma · File Rouge</footer>
    </main>
  );
}

export default HomePage;
