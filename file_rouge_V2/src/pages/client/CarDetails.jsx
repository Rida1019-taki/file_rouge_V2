import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import voitureService from "../../services/voitureService";
import reservationService from "../../services/reservationService";
import { isCarAvailable } from "../../utils/carAvailability";

const formatPrice = (value) => `${Number(value ?? 0).toLocaleString("fr-FR")} DH`;
const getListingType = (car) => String(car?.listingType || car?.type || "RENTAL").toUpperCase();
const saleTypes = ["SALE", "ACHAT", "VENTE"];
const rentalTypes = ["RENTAL", "LOCATION"];

function CarDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [error, setError] = useState("");
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const userRole = localStorage.getItem("role");
  const dashboardPath = {
    CLIENT: "/client",
    OWNER: "/owner",
    ADMIN: "/admin",
  }[userRole];
  const isSignedIn = Boolean(localStorage.getItem("token")) && Boolean(dashboardPath);
  const isClient = userRole === "CLIENT" && Boolean(localStorage.getItem("token"));
  const isPublicDetails = location.pathname.startsWith("/cars/");

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

  useEffect(() => {
    let active = true;
    voitureService.getCarById(id)
      .then((data) => { if (active) setCar(data); })
      .catch((err) => {
        console.error("Erreur chargement voiture :", err);
        if (active) setError("Impossible de charger cette annonce pour le moment.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const listingType = getListingType(car);
  const isSale = saleTypes.includes(listingType);
  const isRental = rentalTypes.includes(listingType);
  const available = isCarAvailable(car?.disponible);
  const image = car?.image || car?.images?.[0];

  const price = isSale
    ? car?.prixVente ?? car?.prix ?? car?.prixJour ?? car?.prixParJour ?? 0
    : car?.prixParJour ?? car?.prixJour ?? car?.prix ?? 0;

  const category = car?.category?.label || car?.category?.nom || car?.categorie?.label || car?.categorie?.nom || car?.category || car?.categorie || "Non spécifiée";
  const city = car?.ville?.label || car?.ville?.nom || car?.city?.label || car?.city?.nom || car?.ville || car?.city || "Maroc";

  // Calculate rental duration in days
  const rentalDays = useMemo(() => {
    if (!dateDebut || !dateFin) return 0;
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  }, [dateDebut, dateFin]);

  const estimatedTotal = useMemo(() => {
    if (isSale) return price;
    return rentalDays > 0 ? rentalDays * Number(price) : Number(price);
  }, [isSale, rentalDays, price]);

  const handleReservation = async (event) => {
    event.preventDefault();
    if (!car || !isClient) return;

    setSubmitting(true);
    setReservationSuccess(false);

    try {
      await reservationService.createReservation({
        voitureId: Number(id),
        type: isSale ? "ACHAT" : "LOCATION",
        ...(!isSale && { dateDebut, dateFin }),
      });
      setReservationSuccess(true);
    } catch (err) {
      console.error("Erreur lors de la réservation :", err);
      window.alert(err.response?.data?.message || "Une erreur est survenue lors de l’envoi de votre demande.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={isPublicDetails ? "car-details-public-page" : "client-page"}>
        <div className="showroom-container">
          <p className="showroom-loading">Chargement des caractéristiques du véhicule...</p>
        </div>
      </div>
    );
  }

  if (error || !car) {
    return (
      <div className={isPublicDetails ? "car-details-public-page" : "client-page"}>
        <div className="showroom-container">
          <div className="info-box info-box--error">{error || "Ce véhicule n'est plus disponible."}</div>
          <Link to="/#annonces" className="secondary-button" style={{ display: "inline-block", marginTop: "16px" }}>
            Retour aux annonces
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={isPublicDetails ? "car-details-public-page" : "client-page"}>
      {/* Public Top Bar */}
      {isPublicDetails && (
        <header className="home-nav">
          <div className="home-nav__inner">
            <Link to="/" className="home-brand">
              <strong>Tomobilty<span>.ma</span></strong>
              <small>Annonces automobiles au Maroc</small>
            </Link>

            <nav className="home-nav__menu" aria-label="Navigation principale">
              <Link to="/#annonces">Toutes les offres</Link>
              <Link to="/#annonces">Location</Link>
              <Link to="/#annonces">Vente</Link>
              <Link to="/#informations">Informations</Link>
              <Link to="/#contact">Contact</Link>
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
                <Link to={dashboardPath} className="secondary-button">Mon espace</Link>
              ) : (
                <Link to="/login" className="secondary-button">Connexion</Link>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Breadcrumb strip */}
      <div className="car-breadcrumb-bar">
        <div className="showroom-container">
          <nav className="car-breadcrumbs" aria-label="Fil d'ariane">
            <Link to="/">Accueil</Link>
            <span aria-hidden="true">›</span>
            <Link to={isPublicDetails ? "/#annonces" : "/client/cars"}>
              {isPublicDetails ? "Annonces automobiles" : "Catalogue"}
            </Link>
            <span aria-hidden="true">›</span>
            <span className="current">{car.marque} {car.modele}</span>
          </nav>
        </div>
      </div>

      {/* Main Showroom Layout */}
      <main className="showroom-container">
        {/* Title Bar */}
        <div className="showroom-header">
          <div className="showroom-header__info">
            <div className="showroom-badges">
              <span className={`listing-type-badge ${isSale ? "type--sale" : "type--rental"}`}>
                {isSale ? "Vente d'occasion" : "Location de véhicule"}
              </span>
              <span className={`status-badge ${available ? "status--available" : "status--unavailable"}`}>
                {available ? "Disponible immédiatement" : "Véhicule actuellement réservé"}
              </span>
              <span className="showroom-city-tag">{city}</span>
            </div>

            <h1 className="showroom-title">{car.marque} {car.modele}</h1>
            <p className="showroom-subtitle">
              {category} · Année {car.annee || "N/C"} · Référence annonce #{car.id}
            </p>
          </div>

          <div className="showroom-header__pricing">
            <span className="showroom-price-label">{isSale ? "Prix de vente" : "Tarif journalier"}</span>
            <div className="showroom-price-value">
              <strong>{formatPrice(price)}</strong>
              {!isSale && <span className="showroom-price-unit"> / jour</span>}
            </div>
          </div>
        </div>

        {/* 2-Column Showroom Content */}
        <div className="showroom-grid">
          {/* Left Column: Visuals & Specifications */}
          <section className="showroom-main">
            {/* Gallery Media Box */}
            <div className="showroom-media">
              {image ? (
                <img
                  src={image}
                  alt={`${car.marque} ${car.modele}`}
                  className="showroom-main-img"
                />
              ) : (
                <div className="showroom-placeholder">
                  <span>{car.marque?.slice(0, 3)?.toUpperCase() || "AUTO"}</span>
                  <p>Photo non fournie pour cette annonce</p>
                </div>
              )}
            </div>

            {/* Technical Specifications Table */}
            <div className="showroom-card">
              <h2 className="showroom-card__title">Fiche technique du véhicule</h2>
              <div className="tech-specs-table">
                <div className="tech-spec-row">
                  <span className="tech-spec-label">Marque</span>
                  <span className="tech-spec-value">{car.marque || "-"}</span>
                </div>
                <div className="tech-spec-row">
                  <span className="tech-spec-label">Modèle</span>
                  <span className="tech-spec-value">{car.modele || "-"}</span>
                </div>
                <div className="tech-spec-row">
                  <span className="tech-spec-label">Année de mise en circulation</span>
                  <span className="tech-spec-value">{car.annee || "-"}</span>
                </div>
                <div className="tech-spec-row">
                  <span className="tech-spec-label">Catégorie de carrosserie</span>
                  <span className="tech-spec-value">{category}</span>
                </div>
                <div className="tech-spec-row">
                  <span className="tech-spec-label">Ville de stationnement</span>
                  <span className="tech-spec-value">{city}</span>
                </div>
                <div className="tech-spec-row">
                  <span className="tech-spec-label">Transmission / Boîte</span>
                  <span className="tech-spec-value">{car.transmission || "Non spécifiée"}</span>
                </div>
                <div className="tech-spec-row">
                  <span className="tech-spec-label">Nombre de places assises</span>
                  <span className="tech-spec-value">{car.nombrePlaces ?? car.places ?? "5 places"}</span>
                </div>
                <div className="tech-spec-row">
                  <span className="tech-spec-label">Type d'offre</span>
                  <span className="tech-spec-value">{isSale ? "Vente" : "Location"}</span>
                </div>
                <div className="tech-spec-row">
                  <span className="tech-spec-label">Disponibilité actuelle</span>
                  <span className="tech-spec-value">{available ? "Disponible" : "Indisponible"}</span>
                </div>
              </div>
            </div>

            {/* Equipment & Features */}
            <div className="showroom-card">
              <h2 className="showroom-card__title">Équipements et prestations incluses</h2>
              <div className="equipment-grid">
                <div className="equipment-item">
                  <span className="equipment-check" aria-hidden="true">✓</span>
                  <span>Climatisation d'origine</span>
                </div>
                <div className="equipment-item">
                  <span className="equipment-check" aria-hidden="true">✓</span>
                  <span>Direction assistée</span>
                </div>
                <div className="equipment-item">
                  <span className="equipment-check" aria-hidden="true">✓</span>
                  <span>Système de freinage ABS & ESP</span>
                </div>
                <div className="equipment-item">
                  <span className="equipment-check" aria-hidden="true">✓</span>
                  <span>Airbags conducteur et passagers</span>
                </div>
                <div className="equipment-item">
                  <span className="equipment-check" aria-hidden="true">✓</span>
                  <span>Système audio avec port USB & Bluetooth</span>
                </div>
                <div className="equipment-item">
                  <span className="equipment-check" aria-hidden="true">✓</span>
                  <span>Fermeture centralisée à distance</span>
                </div>
              </div>
            </div>

            {/* Inspection & Trust Notice */}
            <div className="showroom-card showroom-trust-card">
              <h2 className="showroom-card__title">Engagements et sécurité</h2>
              <div className="trust-points-grid">
                <div className="trust-point">
                  <strong>Contrôle de conformité</strong>
                  <p>Les informations du véhicule et l'identité de l'annonceur sont vérifiées avant validation.</p>
                </div>
                <div className="trust-point">
                  <strong>Contrat transparent</strong>
                  <p>Mise à disposition d'un contrat de location ou de vente conforme aux règles en vigueur au Maroc.</p>
                </div>
                <div className="trust-point">
                  <strong>Accompagnement client</strong>
                  <p>Notre équipe vous assiste en cas de question ou de litige concernant une réservation.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Reservation / Inquiry Console */}
          <aside className="showroom-sidebar">
            <div className="booking-card">
              <div className="booking-card__header">
                <h3>{isSale ? "Acheter ce véhicule" : "Réserver ce véhicule"}</h3>
                <div className="booking-card__rate">
                  <strong>{formatPrice(price)}</strong>
                  {!isSale && <span> / jour</span>}
                </div>
              </div>

              {reservationSuccess && (
                <div className="booking-success-box">
                  <strong>Demande transmise avec succès</strong>
                  <p>Le propriétaire a reçu votre dossier et prendra contact avec vous dans les plus brefs délais.</p>
                </div>
              )}

              {isClient ? (
                <form onSubmit={handleReservation} className="booking-form">
                  {!isSale && (
                    <>
                      <div className="booking-field">
                        <label htmlFor="booking-start">Date de prise en charge</label>
                        <input
                          id="booking-start"
                          type="date"
                          min={new Date().toISOString().slice(0, 10)}
                          value={dateDebut}
                          onChange={(e) => {
                            setDateDebut(e.target.value);
                            if (dateFin && e.target.value > dateFin) setDateFin("");
                          }}
                          required
                        />
                      </div>

                      <div className="booking-field">
                        <label htmlFor="booking-end">Date de restitution</label>
                        <input
                          id="booking-end"
                          type="date"
                          min={dateDebut || new Date().toISOString().slice(0, 10)}
                          value={dateFin}
                          onChange={(e) => setDateFin(e.target.value)}
                          required
                        />
                      </div>

                      {/* Dynamic duration & total calculation */}
                      {rentalDays > 0 && (
                        <div className="booking-calculation">
                          <div className="calc-row">
                            <span>Durée calculée :</span>
                            <strong>{rentalDays} jour{rentalDays > 1 ? "s" : ""}</strong>
                          </div>
                          <div className="calc-row">
                            <span>Tarif journalier :</span>
                            <span>{formatPrice(price)}</span>
                          </div>
                          <div className="calc-divider" />
                          <div className="calc-total">
                            <span>Estimation totale :</span>
                            <strong>{formatPrice(estimatedTotal)}</strong>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {isSale && (
                    <div className="sale-notice-box">
                      <p>
                        En soumettant cette demande, vous manifestez votre intérêt formel pour l'acquisition de ce véhicule au prix convenu de <strong>{formatPrice(price)}</strong>.
                      </p>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="booking-submit-btn"
                    disabled={submitting || !available}
                  >
                    {submitting
                      ? "Envoi en cours..."
                      : available
                      ? (isSale ? "Envoyer une offre d'achat" : "Confirmer la réservation")
                      : "Véhicule non disponible"}
                  </button>
                </form>
              ) : (
                <div className="booking-visitor-box">
                  <p>
                    Connectez-vous à votre compte client pour envoyer une demande de {isSale ? "visite et d'achat" : "location"} directement au propriétaire.
                  </p>
                  <div className="booking-visitor-actions">
                    <Link to="/login" className="booking-login-btn">
                      Connexion client
                    </Link>
                    <Link to="/register" className="booking-register-btn">
                      Créer un compte
                    </Link>
                  </div>
                </div>
              )}

              {/* Owner / Dealer Trust Box */}
              <div className="booking-owner-card">
                <span className="owner-card-label">Annonceur vérifié</span>
                <strong>Propriétaire Tomobilty.ma</strong>
                <p>Répond généralement en moins de 2 heures</p>
                <div className="owner-guarantee-line">
                  <span aria-hidden="true">✓</span>
                  <span>Identité et annonce contrôlées</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Public Footer */}
      {isPublicDetails && (
        <footer className="home-footer">
          <div className="home-container home-footer__content">
            <div className="home-footer__main">
              <strong>Tomobilty.ma</strong>
              <p>Portail d'annonces de vente et location de véhicules au Maroc.</p>
            </div>
            <div className="home-footer__links">
              <Link to="/">Accueil</Link>
              <Link to="/#annonces">Toutes les annonces</Link>
              <Link to="/login">Espace membre</Link>
              <Link to="/register">Inscription</Link>
            </div>
          </div>
          <div className="home-footer__bottom">
            <div className="home-container">
              <p>© {new Date().getFullYear()} Tomobilty.ma · Portail Automobile. Tous droits réservés.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default CarDetails;
