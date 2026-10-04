import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
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
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    voitureService.getCarById(id)
      .then((data) => { if (active) setCar(data); })
      .catch((err) => {
        console.error("Erreur chargement voiture :", err);
        if (active) setError("Impossible de charger cette voiture.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const handleReservation = async (event) => {
    event.preventDefault();
    if (!car || localStorage.getItem("role") !== "CLIENT" || !localStorage.getItem("token")) return;

    const isSale = saleTypes.includes(getListingType(car));
    try {
      await reservationService.createReservation({
        voitureId: Number(id),
        type: isSale ? "ACHAT" : "LOCATION",
        ...(!isSale && { dateDebut, dateFin }),
      });
      window.alert("Demande envoyée avec succès.");
    } catch (err) {
      console.error("Erreur lors de la réservation :", err);
      window.alert(err.response?.data?.message || "Erreur lors de la réservation.");
    }
  };

  if (loading) return <div className="client-page"><h1>Détails de la voiture</h1><p>Chargement…</p></div>;
  if (error || !car) return <div className="client-page"><h1>Détails de la voiture</h1><p>{error || "Voiture introuvable."}</p><Link to="/#annonces" className="secondary-button">Retour aux annonces</Link></div>;

  const listingType = getListingType(car);
  const isSale = saleTypes.includes(listingType);
  const isRental = rentalTypes.includes(listingType);
  const isClient = localStorage.getItem("role") === "CLIENT" && Boolean(localStorage.getItem("token"));
  const available = isCarAvailable(car.disponible);
  const isPublicDetails = location.pathname.startsWith("/cars/");
  const image = car.image || car.images?.[0];
  const price = isSale
    ? car.prixVente ?? car.prix ?? car.prixJour ?? car.prixParJour
    : car.prixParJour ?? car.prixJour ?? car.prix;
  const category = car.category?.label || car.category?.nom || car.categorie?.label || car.categorie?.nom || car.category || car.categorie || "-";
  const city = car.ville?.label || car.ville?.nom || car.city?.label || car.city?.nom || car.ville || car.city || "-";

  return (
    <div className="client-page">
      <div className="page-header">
        <div><p className="eyebrow">{isSale ? "À vendre" : "À louer"}</p><h1>{car.marque} {car.modele}</h1></div>
        <Link to={isPublicDetails ? "/#annonces" : "/client/cars"} className="secondary-button">Retour aux annonces</Link>
      </div>
      <div className="car-detail-layout">
        <div className="car-detail__image-wrap">
          {image ? <img src={image} alt={`${car.marque} ${car.modele}`} className="car-detail__image" /> : <div className="car-detail__placeholder">{car.marque?.slice(0, 2)?.toUpperCase() || "VO"}</div>}
        </div>
        <div className="car-detail__content">
          <div className="detail-badges">
            <span className="badge badge--soft">{isSale ? "SALE" : "RENTAL"}</span>
            <span className={`status-pill ${available ? "status-pill--success" : "status-pill--muted"}`}>{available ? "Disponible" : "Indisponible"}</span>
          </div>
          <div className="detail-grid">
            <div><span>Année</span><strong>{car.annee || "-"}</strong></div>
            <div><span>Ville</span><strong>{city}</strong></div>
            <div><span>Catégorie</span><strong>{category}</strong></div>
            <div><span>Transmission</span><strong>{car.transmission || "-"}</strong></div>
            <div><span>Places</span><strong>{car.nombrePlaces ?? car.places ?? "-"}</strong></div>
            <div><span>Prix</span><strong>{formatPrice(price)}{!isSale && " / jour"}</strong></div>
          </div>
          {isClient ? (
            <form onSubmit={handleReservation} className="reservation-form">
              <h2>{isSale ? "Demander cette voiture à l’achat" : "Demander cette voiture"}</h2>
              {!isSale && (
                <div className="profile-form__grid">
                  <div>
                    <label htmlFor="reservation-date-debut">Date de début</label>
                    <input id="reservation-date-debut" type="date" value={dateDebut} min={new Date().toISOString().slice(0, 10)} onChange={(event) => { setDateDebut(event.target.value); if (dateFin && event.target.value > dateFin) setDateFin(""); }} required />
                  </div>
                  <div>
                    <label htmlFor="reservation-date-fin">Date de fin</label>
                    <input id="reservation-date-fin" type="date" value={dateFin} min={dateDebut || new Date().toISOString().slice(0, 10)} onChange={(event) => setDateFin(event.target.value)} required />
                  </div>
                </div>
              )}
              {!isRental && !isSale && <p className="car-meta">Type d’annonce : {listingType}</p>}
              <button type="submit">Envoyer la demande</button>
            </form>
          ) : (
            <div className="reservation-form">
              <h2>Intéressé par cette voiture ?</h2>
              <p className="car-meta">Connectez-vous avec un compte client pour envoyer une demande au propriétaire.</p>
              <div className="home-contact-actions"><Link to="/login" className="secondary-button">Connexion</Link><Link to="/register" className="home-register">Créer un compte</Link></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CarDetails;
