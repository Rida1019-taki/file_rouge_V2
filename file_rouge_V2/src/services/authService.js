import api from "./api";

const login = async (email, password) => {
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  const data = response.data;

  localStorage.setItem("token", data.token);
  localStorage.setItem("userId", data.userId);
  localStorage.setItem("role", data.role);
  localStorage.setItem("nom", data.nom);
  localStorage.setItem("prenom", data.prenom);
  localStorage.setItem("email", data.email);

  return data;
};

const register = async ({ nom, prenom, email, telephone, password, role }) => {
  const response = await api.post("/auth/register", {
    nom,
    prenom,
    email,
    telephone,
    password,
    role,
  });

  return response.data;
};

const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("nom");
  localStorage.removeItem("prenom");
  localStorage.removeItem("email");
};

export default {
  login,
  register,
  logout,
};