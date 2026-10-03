import api from "./api";

const getCarsByType = async (listingType) => {
  const response = await api.get("/voitures", {
    params: listingType ? { listingType } : {},
  });

  return response.data;
};

const getRentalCars = async () => getCarsByType("RENTAL");
const getSaleCars = async () => getCarsByType("SALE");
const getAllCars = async () => getCarsByType();

const getCarById = async (id) => {
  const response = await api.get(`/voitures/${id}`);
  return response.data;
};

const getMyCars = async () => {
  const response = await api.get("/voitures/mine");
  return response.data;
};

const createCar = async (data) => {
  const response = await api.post("/voitures", data);
  return response.data;
};

const updateCar = async (id, data) => {
  const response = await api.put(`/voitures/${id}`, data);
  return response.data;
};

const deleteCar = async (id) => {
  const response = await api.delete(`/voitures/${id}`);
  return response.data;
};

const uploadCarImages = async (id, formData) => {
  const response = await api.post(`/voitures/${id}/images`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data;
};

export default {
  getCarsByType,
  getRentalCars,
  getSaleCars,
  getAllCars,
  getCarById,
  getMyCars,
  createCar,
  updateCar,
  deleteCar,
  uploadCarImages,
};