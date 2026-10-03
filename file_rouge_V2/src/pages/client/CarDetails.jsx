import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import voitureService from "../../services/voitureService";
import reservationService from "../../services/reservationService";

const formatPrice = (value) => `${Number(value ?? 0).toLocaleString("fr-FR")} DH`;
const getListingType = (car) => String(car?.listingType || car?.type || "RENTAL").toUpperCase();
const saleTypes = ["SALE", "ACHAT", "VENTE"];
const rentalTypes = ["RENTAL", "LOCATION"];

function CarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);

  useEffect(() => {
    let active = true;
    voitureService.getCarById(id)
      .then((data) => { if (active) setCar(data); })
      .catch((error) => console.error("Erreur chargement voiture :", error));
    return () => { active = false; };
  }, [id]);

  const handleReservation = async (event) => {
    event.preventDefault();
    if (!car) return;

    const isSale = saleTypes.includes(getListingType(car));
    try {
      await reservationService.createReservation({
        voitureId: Number(id),
        type: isSale ? "ACHAT" : "LOCATION",
      });
      window.alert("Demande de réservation envoyée avec succès.");
    } catch (error) {
      console.error("Erreur lors de la réservation :", error);
      window.alert(error.response?.data?.message || "Erreur lors de la réservation.");
    }
  };

  if (!car) return <div className="client-page"><h1>Détails</h1><p>Chargement...</p></div>;

  const listingType = getListingType(car);
  const isSale = saleTypes.includes(listingType);
  const isRental = rentalTypes.includes(listingType);
  const carImage = car.image || car.images?.[0] || null;
  const price = isSale
    ? car.prix ?? car.prixVente ?? car.prixJour ?? car.prixParJour
    : car.prixJour ?? car.prix ?? car.prixParJour;

  return (
    <div className="client-page">
      <div className="page-header">
        <div><p className="eyebrow">Détails</p><h1>{car.marque} {car.modele}</h1></div>
        <Link to="/client/cars" className="secondary-button">Retour</Link>
      </div>

      <div className="car-detail-layout">
        <div className="car-detail__image-wrap">
          {carImage ? <img src={carImage} alt={`${car.marque} ${car.modele}`} className="car-detail__image" /> : (
            <div className="car-detail__placeholder">{car.marque?.slice(0, 2)?.toUpperCase() || "VO"}</div>
          )}
        </div>

        <div className="car-detail__content">
          <div className="detail-badges">
            <span className="badge badge--soft">{listingType}</span>
            <span className="status-pill">{car.disponible === false ? "Indisponible" : "Disponible"}</span>
          </div>

          <div className="detail-grid">
            <div><span>Année</span><strong>{car.annee || "-"}</strong></div>
            <div><span>Ville</span><strong>{car.ville || "-"}</strong></div>
            <div><span>Catégorie</span><strong>{car.category || car.categorie || "-"}</strong></div>
            <div><span>Transmission</span><strong>{car.transmission || "-"}</strong></div>
            <div><span>Places</span><strong>{car.nombrePlaces ?? car.places ?? "-"}</strong></div>
            <div><span>Prix</span><strong>{formatPrice(price)}</strong></div>
          </div>

          <form onSubmit={handleReservation} className="reservation-form">
            <h2>{isSale ? "Réserver cette voiture à l'achat" : "Réserver cette voiture"}</h2>
            {isSale && <p className="car-meta">Envoyez une demande pour réserver cette voiture à l'achat.</p>}
            {!isRental && !isSale && <p className="car-meta">Type d'annonce : {listingType}</p>}
            <button type="submit">Envoyer la demande</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CarDetails;
