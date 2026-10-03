import { useEffect, useState } from "react";
import clientService from "../../services/clientService";
import adminService from "../../services/adminService";

function AdminProfile() {
  const userId = localStorage.getItem("userId");
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ nom: "", prenom: "", email: "", telephone: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let active = true;
    adminService.getUsers()
      .then((users) => {
        const current = users.find((user) => String(user.id) === String(userId));
        if (!current) throw new Error("Profil administrateur introuvable.");
        if (active) {
          setProfile(current);
          setForm({ nom: current.nom || "", prenom: current.prenom || "", email: current.email || "", telephone: current.telephone || "" });
        }
      })
      .catch((err) => { if (active) setError(err.response?.data?.message || err.message || "Impossible de charger le profil."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  const handleChange = ({ target: { name, value } }) => setForm((current) => ({ ...current, [name]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(""); setSuccess(""); setSaving(true);
    try {
      const updated = await clientService.updateClient(userId, form);
      const next = { ...profile, ...form, ...(updated || {}) };
      setProfile(next);
      ["nom", "prenom", "email"].forEach((key) => localStorage.setItem(key, next[key] || ""));
      setSuccess("Votre profil a été mis à jour.");
    } catch (err) {
      setError(err.response?.data?.message || "Impossible de mettre à jour le profil.");
    } finally { setSaving(false); }
  };

  if (loading) return <div className="client-page"><h1>Mon profil</h1><p>Chargement...</p></div>;

  return (
    <div className="client-page">
      <div className="page-header"><div><p className="eyebrow">Compte administrateur</p><h1>Modifier mon profil</h1></div></div>
      {error && <div className="info-box info-box--error">{error}</div>}
      {success && <div className="info-box">{success}</div>}
      {profile && <div className="profile-card">
        <div className="profile-avatar">{profile.prenom?.[0]?.toUpperCase() || "A"}{profile.nom?.[0]?.toUpperCase() || "D"}</div>
        <form className="profile-form" onSubmit={handleSubmit}>
          <div className="profile-form__grid">
            <div><label htmlFor="admin-nom">Nom</label><input id="admin-nom" name="nom" value={form.nom} onChange={handleChange} required /></div>
            <div><label htmlFor="admin-prenom">Prénom</label><input id="admin-prenom" name="prenom" value={form.prenom} onChange={handleChange} required /></div>
            <div><label htmlFor="admin-email">Email</label><input id="admin-email" type="email" value={form.email} readOnly /></div>
            <div><label htmlFor="admin-telephone">Téléphone</label><input id="admin-telephone" name="telephone" value={form.telephone} onChange={handleChange} /></div>
          </div>
          <div className="profile-form__actions"><button type="submit" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</button></div>
        </form>
      </div>}
    </div>
  );
}

export default AdminProfile;
