import api from "./api";

const getRentalCars = async () => {
  const response = await api.get("/voitures", {
    params: {
      listingType: "RENTAL",
    },
  });

  return response.data;
};

const getCarById = async (id) => {
  const response = await api.get(`/voitures/${id}`);
  return response.data;
};

export default {
  getRentalCars,
  getCarById,
};