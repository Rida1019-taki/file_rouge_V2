import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../services/authService";

function Register() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get("role");
  const redirectTarget = searchParams.get("redirect");
  const isOwnerIntent = roleParam === "OWNER" || redirectTarget?.includes("/owner");

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    password: "",
    confirmPassword: "",
    role: isOwnerIntent ? "OWNER" : "CLIENT",
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

      const nextRedirect = redirectTarget || (formData.role === "OWNER" ? "/owner/cars/new" : "");
      const redirectQuery = nextRedirect ? `&redirect=${encodeURIComponent(nextRedirect)}` : "";
      navigate(`/login?registered=true&role=${formData.role}${redirectQuery}`);
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

  const loginLink = `/login?${isOwnerIntent ? "role=OWNER&" : ""}${redirectTarget ? `redirect=${encodeURIComponent(redirectTarget)}` : (isOwnerIntent ? "redirect=%2Fowner%2Fcars%2Fnew" : "")}`;

  return (
    <div className="auth-page">
      <div className="auth-card auth-card--wide">
        <div className="auth-brand">
          <Link to="/" className="auth-brand__link">
            <strong>Tomobilty<span>.ma</span></strong>
            <small>Portail Automobile au Maroc</small>
          </Link>
        </div>

        <div className="auth-header">
          <h1>{isOwnerIntent ? "Créer un compte Propriétaire" : "Créer un compte"}</h1>
          <p>
            {isOwnerIntent
              ? "Rejoignez notre réseau de propriétaires et concessionnaires pour publier vos annonces de véhicules."
              : "Inscrivez-vous pour acheter, louer ou publier des annonces de véhicules."}
          </p>
        </div>

        {isOwnerIntent && (
          <div className="booking-calculation" style={{ marginBottom: "18px", textAlign: "left" }}>
            <strong>Publication d'annonces automobiles</strong>
            <p style={{ margin: "4px 0 0", fontSize: "0.8rem", color: "var(--text)" }}>
              Ce compte vous permet d'ajouter des véhicules à la vente ou à la location, de gérer vos réservations et d'échanger avec des acheteurs et locataires.
            </p>
          </div>
        )}

        {error && <div className="info-box info-box--error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-form-grid">
            <div className="form-field">
              <label htmlFor="reg-nom">Nom</label>
              <input
                id="reg-nom"
                type="text"
                name="nom"
                placeholder="Votre nom"
                value={formData.nom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="reg-prenom">Prénom</label>
              <input
                id="reg-prenom"
                type="text"
                name="prenom"
                placeholder="Votre prénom"
                value={formData.prenom}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="reg-email">Adresse email</label>
              <input
                id="reg-email"
                type="email"
                name="email"
                placeholder="nom@exemple.com"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-field">
              <label htmlFor="reg-telephone">Téléphone</label>
              <input
                id="reg-telephone"
                type="tel"
                name="telephone"
                placeholder="06 XX XX XX XX"
                value={formData.telephone}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field auth-field--full">
              <label htmlFor="reg-role">Type de compte</label>
              <select
                id="reg-role"
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="CLIENT">Compte Client (Acheteur / Locataire)</option>
                <option value="OWNER">Compte Propriétaire / Concessionnaire (Déposer des annonces)</option>
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="reg-pwd">Mot de passe</label>
              <input
                id="reg-pwd"
                type="password"
                name="password"
                placeholder="8 caractères min, lettre et chiffre"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="form-field">
              <label htmlFor="reg-confirm-pwd">Confirmer le mot de passe</label>
              <input
                id="reg-confirm-pwd"
                type="password"
                name="confirmPassword"
                placeholder="Répétez le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="primary-search-button auth-submit-btn" disabled={loading}>
            {loading ? "Création du compte..." : (isOwnerIntent ? "Créer mon compte et déposer une annonce" : "Créer mon compte")}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Vous avez déjà un compte ?{" "}
            <Link to={loginLink}>Se connecter</Link>
          </p>
          <div className="auth-back-link">
            <Link to="/">← Retour au catalogue automobile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
