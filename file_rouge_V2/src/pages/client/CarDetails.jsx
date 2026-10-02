import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import voitureService from "../../services/voitureService";
import reservationService from "../../services/reservationService";

function CarDetails() {
  const { id } = useParams();

  const [car, setCar] = useState(null);
  const [dateDebut, setDateDebut] = useState("");
  const [dateFin, setDateFin] = useState("");

  useEffect(() => {
    loadCar();
  }, [id]);

  const loadCar = async () => {
    try {
      const data = await voitureService.getCarById(id);
      setCar(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleReservation = async (e) => {
    e.preventDefault();

    try {
      const data = {
        voitureId: Number(id),
        type: "LOCATION",
        dateDebut,
        dateFin,
      };

      await reservationService.createReservation(data);

      alert("Réservation créée avec succès");

      setDateDebut("");
      setDateFin("");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la réservation");
    }
  };

  if (!car) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <h1>
        {car.marque} {car.modele}
      </h1>

      <p>Année : {car.annee}</p>
      <p>Places : {car.nombrePlaces}</p>
      <p>Transmission : {car.transmission}</p>

      <p>
        Prix : {car.prixParJour} DH / jour
      </p>

      <p>Catégorie : {car.categorie}</p>
      <p>Ville : {car.ville}</p>

      <h2>Réserver cette voiture</h2>

      <form onSubmit={handleReservation}>
        <div>
          <label>Date début</label>

          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Date fin</label>

          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            required
          />
        </div>

        <button type="submit">
          Réserver
        </button>
      </form>
    </div>
  );
}

export default CarDetails;