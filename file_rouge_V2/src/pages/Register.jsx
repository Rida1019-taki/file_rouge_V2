import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../services/authService";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
    role: "CLIENT",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (formData.password.length < 8) {
      setError("Le mot de passe doit comporter au moins 8 caractères.");
      return;
    }

    if (!/[a-zA-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      setError("Le mot de passe doit contenir au moins une lettre et un chiffre.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        password: formData.password,
        role: formData.role,
      });

      navigate("/login");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Erreur lors de l'inscription. Vérifiez vos informations."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Inscription</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nom</label>
          <input
            type="text"
            name="nom"
            value={formData.nom}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Prénom</label>
          <input
            type="text"
            name="prenom"
            value={formData.prenom}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Téléphone</label>
          <input
            type="tel"
            name="telephone"
            value={formData.telephone}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Rôle</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="CLIENT">CLIENT</option>
            <option value="OWNER">OWNER</option>
          </select>
        </div>

        <div>
          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Confirmer le mot de passe</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Inscription..." : "S'inscrire"}
        </button>
      </form>

      <p>
        Déjà un compte ? <Link to="/login">Se connecter</Link>
      </p>
    </div>
  );
}

export default Register;
