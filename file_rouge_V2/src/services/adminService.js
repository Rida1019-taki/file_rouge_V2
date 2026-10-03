import api from "./api";

const getStats = async () => {
  const response = await api.get("/admin/stats");
  return response.data;
};

const getUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

const deleteUser = async (id) => {
  await api.delete(`/users/${id}`);
};

export default { getStats, getUsers, deleteUser };
