import { useEffect, useState } from "react";
import voitureService from "../../services/voitureService";
import reservationService from "../../services/reservationService";

function ClientDashboard() {
  const [cars, setCars] = useState([]);
  const [reservations, setReservations] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [carsData, reservationsData] = await Promise.all([
        voitureService.getRentalCars(),
        reservationService.getMyReservations(),
      ]);

      setCars(carsData);
      setReservations(reservationsData);
    } catch (error) {
      console.error("Erreur chargement dashboard :", error);
    }
  };

  return (
    <div>
      <h1>Dashboard Client</h1>

      <div>
        <h2>Voitures disponibles</h2>
        <p>{cars.length} voiture(s)</p>
      </div>

      <div>
        <h2>Mes réservations</h2>
        <p>{reservations.length} réservation(s)</p>
      </div>
    </div>
  );
}

export default ClientDashboard;