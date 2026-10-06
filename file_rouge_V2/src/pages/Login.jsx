import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get("redirect");
  const isRegisteredSuccess = searchParams.get("registered") === "true";
  const isDepositIntent = redirectTarget?.includes("/owner/cars/new") || searchParams.get("role") === "OWNER";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await authService.login(email, password);

      // If redirect was requested and user has suitable role:
      if (redirectTarget) {
        if (user.role === "OWNER" || user.role === "ADMIN") {
          navigate(redirectTarget);
          return;
        }
        if (user.role === "CLIENT") {
          if (redirectTarget.startsWith("/owner")) {
            // Client tried to access owner area
            window.alert(
              "Vous êtes connecté en tant que Client. La publication d'annonces nécessite un compte Propriétaire."
            );
            navigate("/client");
            return;
          }
          navigate(redirectTarget);
          return;
        }
      }

      if (user.role === "CLIENT") {
        navigate("/client");
      } else if (user.role === "OWNER") {
        navigate("/owner");
      } else if (user.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Email ou mot de passe incorrect."
      );
    } finally {
      setLoading(false);
    }
  };

  const registerLink = isDepositIntent
    ? `/register?role=OWNER${redirectTarget ? `&redirect=${encodeURIComponent(redirectTarget)}` : "&redirect=%2Fowner%2Fcars%2Fnew"}`
    : "/register";

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-brand">
          <Link to="/" className="auth-brand__link">
            <strong>Tomobilty<span>.ma</span></strong>
            <small>Portail Automobile au Maroc</small>
          </Link>
        </div>

        <div className="auth-header">
          <h1>{isDepositIntent ? "Déposer une annonce" : "Connexion"}</h1>
          <p>
            {isDepositIntent
              ? "Connectez-vous à votre compte Propriétaire pour publier votre annonce automobile."
              : "Accédez à votre espace pour gérer vos réservations et vos annonces."}
          </p>
        </div>

        {isRegisteredSuccess && (
          <div className="booking-success-box" style={{ marginBottom: "16px" }}>
            <strong>Compte créé avec succès !</strong>
            <p>Connectez-vous ci-dessous pour accéder directement à la publication de votre annonce.</p>
          </div>
        )}

        {error && <div className="info-box info-box--error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-field">
            <label htmlFor="login-email">Adresse email</label>
            <input
              id="login-email"
              type="email"
              placeholder="nom@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-field">
            <label htmlFor="login-password">Mot de passe</label>
            <input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="primary-search-button auth-submit-btn" disabled={loading}>
            {loading ? "Connexion en cours..." : (isDepositIntent ? "Se connecter et publier mon annonce" : "Se connecter")}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            {isDepositIntent
              ? "Vous n'avez pas encore de compte Propriétaire ? "
              : "Vous n'avez pas encore de compte ? "}
            <Link to={registerLink}>
              {isDepositIntent ? "Créer un compte Propriétaire" : "Créer un compte"}
            </Link>
          </p>
          <div className="auth-back-link">
            <Link to="/">← Retour au catalogue automobile</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;