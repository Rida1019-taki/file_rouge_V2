import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import voitureService from "../../services/voitureService";

function ClientCars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      const data = await voitureService.getRentalCars();
      setCars(data);
    } catch (error) {
      console.error("Erreur :", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Chargement...</p>;
  }

  return (
    <div>
      <h1>Voitures disponibles à la location</h1>

      {cars.length === 0 ? (
        <p>Aucune voiture disponible.</p>
      ) : (
        <div>
          {cars.map((car) => (
            <div key={car.id}>
              <h2>
                {car.marque} {car.modele}
              </h2>

              <p>Prix : {car.prixJour} DH / jour</p>

              <Link to={`/client/cars/${car.id}`}>
                Voir détails
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ClientCars;