import api from "./api";

const createReservation = async (data) => {
  const response = await api.post("/reservations", data);
  return response.data;
};

const getMyReservations = async () => {
  const response = await api.get("/reservations/my");
  return response.data;
};

const cancelReservation = async (id) => {
  const response = await api.patch(`/reservations/${id}/annuler`);
  return response.data;
};

const getOwnerReservations = async () => {
  const response = await api.get("/reservations/owner");
  return response.data;
};

const updateReservationStatus = async (id, status) => {
  const response = await api.patch(`/reservations/${id}/status/${status}`);
  return response.data;
};

export default {
  createReservation,
  getMyReservations,
  cancelReservation,
  getOwnerReservations,
  updateReservationStatus,
};