import api from "./api";

const getClient = async (id) => {
  const response = await api.get(`/client/${id}`);
  return response.data;
};

export default {
  getClient,
};