import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import voitureService from "../../services/voitureService";
import { isCarAvailable } from "../../utils/carAvailability";

const formatPrice = (value) => `${Number(value ?? 0).toLocaleString("fr-FR")} DH`;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo

function OwnerCarDetails() {
  const { id } = useParams();
  const [car, setCar] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const loadCar = async () => {
    try {
      setLoading(true);
      const data = await voitureService.getCarById(id);
      setCar(data);
    } catch (err) {
      console.error("Erreur chargement détails voiture :", err);
      setError(err.response?.data?.message || "Impossible de charger la voiture.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCar();
  }, [id]);

  const handleFileChange = (e) => {
    setError("");
    const files = Array.from(e.target.files || []);
    const oversizedFile = files.find((file) => file.size > MAX_IMAGE_SIZE);

    if (oversizedFile) {
      setError(`L'image "${oversizedFile.name}" dépasse la taille maximale autorisée de 5 Mo.`);
      e.target.value = "";
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFiles.length) {
      return;
    }

    const oversizedFile = Array.from(selectedFiles).find((file) => file.size > MAX_IMAGE_SIZE);
    if (oversizedFile) {
      setError(`L'image "${oversizedFile.name}" dépasse la taille maximale autorisée de 5 Mo.`);
      return;
    }

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => formData.append("images", file));

    try {
      setUploading(true);
      await voitureService.uploadCarImages(id, formData);
      setSelectedFiles([]);
      await loadCar();
    } catch (err) {
      console.error("Erreur upload image :", err);
      setError(err.response?.data?.message || "Impossible d'ajouter les images.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="client-page"><h1>Détails voiture</h1><p>Chargement...</p></div>;
  }

  if (!car) {
    return <div className="client-page"><h1>Détails voiture</h1><p>Voiture introuvable.</p></div>;
  }

  const primaryPrice = car.prix ?? car.prixJour ?? car.prixVente ?? 0;
  const available = isCarAvailable(car.disponible);

  return (
    <div className="client-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Voiture</p>
          <h1>{car.marque} {car.modele}</h1>
        </div>
        <Link to="/owner/cars" className="secondary-button">Retour</Link>
      </div>

      {error && <div className="info-box info-box--error">{error}</div>}

      <div className="car-detail-layout">
        <div className="car-detail__image-wrap">
          {car.image || car.images?.[0] ? (
            <img src={car.image || car.images?.[0]} alt={`${car.marque} ${car.modele}`} className="car-detail__image" />
          ) : (
            <div className="car-detail__placeholder">{car.marque?.slice(0, 2).toUpperCase() || "VO"}</div>
          )}
        </div>

        <div className="car-detail__content">
          <div className="detail-badges">
            <span className="badge badge--soft">{car.listingType || "RENTAL"}</span>
            <span className={`status-pill ${available ? "status-pill--success" : "status-pill--muted"}`}>{available ? "Disponible" : "Indisponible"}</span>
          </div>

          <div className="detail-grid">
            <div><span>Marque</span><strong>{car.marque || "-"}</strong></div>
            <div><span>Modèle</span><strong>{car.modele || "-"}</strong></div>
            <div><span>Année</span><strong>{car.annee || "-"}</strong></div>
            <div><span>Ville</span><strong>{car.ville || "-"}</strong></div>
            <div><span>Catégorie</span><strong>{car.category || car.categorie || "-"}</strong></div>
            <div><span>Prix</span><strong>{formatPrice(primaryPrice)}</strong></div>
          </div>

          <div className="owner-detail-actions">
            <Link to={`/owner/cars/${id}/edit`} className="secondary-button">Modifier</Link>
          </div>

          <form onSubmit={handleUpload} className="upload-card">
            <div className="upload-card__header">
              <div>
                <p className="eyebrow">Photos</p>
                <h2>Ajouter des images</h2>
              </div>
            </div>

            <p className="upload-card__help">Sélectionnez une ou plusieurs photos pour illustrer cette voiture (max 5 Mo par image).</p>

            <label className="upload-button">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
              />
              Choisir des photos
            </label>

            {selectedFiles?.length > 0 && (
              <div className="upload-file-list">
                {Array.from(selectedFiles).map((file, index) => (
                  <span key={`${file.name}-${index}`}>{file.name}</span>
                ))}
              </div>
            )}

            <button type="submit" disabled={uploading || !selectedFiles.length}>
              {uploading ? "Téléchargement..." : "Téléverser"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default OwnerCarDetails;
