import { useEffect, useState } from "react";
import adminService from "../../services/adminService";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      setUsers(await adminService.getUsers());
      setError("");
    } catch (err) {
      console.error("Erreur chargement utilisateurs :", err);
      setError(err.response?.data?.message || "Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    adminService.getUsers()
      .then((data) => {
        if (active) {
          setUsers(data);
          setError("");
        }
      })
      .catch((err) => {
        console.error("Erreur chargement utilisateurs :", err);
        if (active) {
          setError(err.response?.data?.message || "Impossible de charger les utilisateurs.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cet utilisateur ?")) return;
    try {
      await adminService.deleteUser(id);
      await loadUsers();
    } catch (err) {
      console.error("Erreur suppression utilisateur :", err);
      setError(err.response?.data?.message || "Impossible de supprimer cet utilisateur.");
    }
  };

  if (loading) return <div className="client-page"><h1>Utilisateurs</h1><p>Chargement...</p></div>;

  return (
    <div className="client-page">
      <div className="page-header"><div><p className="eyebrow">Administration</p><h1>Utilisateurs</h1></div></div>
      {error && <div className="info-box info-box--error">{error}</div>}
      {users.length === 0 ? <div className="empty-state">Aucun utilisateur trouvé.</div> : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Utilisateur</th><th>Email</th><th>Téléphone</th><th>Rôle</th><th>Action</th></tr></thead>
            <tbody>{users.map((user) => (
              <tr key={user.id}>
                <td><strong>{user.prenom} {user.nom}</strong></td>
                <td>{user.email}</td>
                <td>{user.telephone || "-"}</td>
                <td><span className="status-pill status-pill--success">{user.role || "-"}</span></td>
                <td><button type="button" className="danger-button small-button" onClick={() => handleDelete(user.id)}>Supprimer</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AdminUsers;
