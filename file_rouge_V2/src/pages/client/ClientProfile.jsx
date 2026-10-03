import { useEffect, useState } from "react";
import clientService from "../../services/clientService";

function ClientProfile() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", telephone: "" });
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) {
        setError("Utilisateur non connecté.");
        setLoading(false);
        return;
      }

      try {
        const data = await clientService.getClient(userId);
        setProfile(data);
        setForm({
          nom: data.nom || "",
          prenom: data.prenom || "",
          email: data.email || "",
          telephone: data.telephone || "",
        });
      } catch (err) {
        console.error("Erreur chargement profil :", err);
        setError(
          err.response?.data?.message ||
            "Impossible de charger le profil utilisateur."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleEdit = () => {
    setSuccess("");
    setError("");
    setEditing(true);
  };

  const handleCancel = () => {
    setForm({
      nom: profile?.nom || "",
      prenom: profile?.prenom || "",
      email: profile?.email || "",
      telephone: profile?.telephone || "",
    });
    setError("");
    setEditing(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      const updatedProfile = await clientService.updateClient(userId, form);
      const nextProfile = updatedProfile || { ...profile, ...form };
      setProfile(nextProfile);
      setForm({
        nom: nextProfile.nom || "",
        prenom: nextProfile.prenom || "",
        email: nextProfile.email || "",
        telephone: nextProfile.telephone || "",
      });
      localStorage.setItem("nom", nextProfile.nom || "");
      localStorage.setItem("prenom", nextProfile.prenom || "");
      localStorage.setItem("email", nextProfile.email || "");
      setEditing(false);
      setSuccess("Votre profil a été mis à jour.");
    } catch (err) {
      console.error("Erreur mise à jour profil :", err);
      setError(err.response?.data?.message || "Impossible de mettre à jour le profil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="client-page"><h1>Mon profil</h1><p>Chargement...</p></div>;
  }

  return (
    <div className="client-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Compte</p>
          <h1>Mon profil</h1>
        </div>
        {!editing && profile && (
          <button type="button" onClick={handleEdit}>Modifier le profil</button>
        )}
      </div>

      {error && <div className="info-box info-box--error">{error}</div>}
      {success && <div className="info-box">{success}</div>}
      {profile && (
        <div className="profile-card">
          <div className="profile-avatar">
            {profile.prenom?.charAt(0)?.toUpperCase() || "U"}
            {profile.nom?.charAt(0)?.toUpperCase() || "S"}
          </div>

          {editing ? (
            <form className="profile-form" onSubmit={handleSubmit}>
              <div className="profile-form__grid">
                <div><label htmlFor="client-nom">Nom</label><input id="client-nom" name="nom" value={form.nom} onChange={handleChange} required /></div>
                <div><label htmlFor="client-prenom">Prénom</label><input id="client-prenom" name="prenom" value={form.prenom} onChange={handleChange} required /></div>
                <div><label htmlFor="client-email">Email</label><input id="client-email" type="email" name="email" value={form.email} readOnly /></div>
                <div><label htmlFor="client-telephone">Téléphone</label><input id="client-telephone" name="telephone" value={form.telephone} onChange={handleChange} required /></div>
              </div>
              <div className="profile-form__actions">
                <button type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</button>
                <button type="button" className="secondary-button" onClick={handleCancel} disabled={saving}>Annuler</button>
              </div>
            </form>
          ) : (
            <div className="profile-grid">
              <div><span>Nom</span><strong>{profile.nom || "-"}</strong></div>
              <div><span>Prénom</span><strong>{profile.prenom || "-"}</strong></div>
              <div><span>Email</span><strong>{profile.email || "-"}</strong></div>
              <div><span>Téléphone</span><strong>{profile.telephone || "-"}</strong></div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default ClientProfile;
