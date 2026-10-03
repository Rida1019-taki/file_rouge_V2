import api from "./api";

const getClient = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

const updateClient = async (id, data) => {
  const { nom, prenom, telephone } = data;

  const response = await api.put(`/users/${id}`, {
    nom,
    prenom,
    telephone,
  });

  return response.data;
};

export default {
  getClient,
  updateClient,
};