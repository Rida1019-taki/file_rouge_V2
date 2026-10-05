import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import referenceService from "../../services/referenceService";
import voitureService from "../../services/voitureService";

const defaultForm = {
  marque: "",
  modele: "",
  annee: "",
  nombrePlaces: "",
  transmission: "MANUELLE",
  carburant: "",
  prix: "",
  villeId: "",
  categorieId: "",
  listingType: "RENTAL",
  disponible: true,
};

function OwnerCarForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [form, setForm] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingReferences, setLoadingReferences] = useState(true);
  const isSaleListing = form.listingType === "SALE";

  useEffect(() => {
    const loadReferences = async () => {
      try {
        setLoadingReferences(true);
        const [villeList, categorieList] = await Promise.all([
          referenceService.getVilles(),
          referenceService.getCategories(),
        ]);

        setCities(villeList);
        setCategories(categorieList);
      } catch (error) {
        console.error("Erreur chargement références:", error);
      } finally {
        setLoadingReferences(false);
      }
    };

    loadReferences();
  }, []);

  useEffect(() => {
    if (!isEditMode) {
      return;
    }

    const loadCar = async () => {
      try {
        setLoading(true);
        const data = await voitureService.getCarById(id);
        setForm({
          marque: data.marque || "",
          modele: data.modele || "",
          annee: data.annee || "",
          nombrePlaces: data.nombrePlaces ?? data.places ?? "",
          transmission: data.transmission || "MANUELLE",
          carburant: data.carburant || "",
          prix: data.prix ?? data.prixParJour ?? data.prixJour ?? data.prixVente ?? "",
          villeId: data.villeId ?? data.ville?.id ?? "",
          categorieId: data.categorieId ?? data.categorie?.id ?? data.categoryId ?? "",
          listingType: data.listingType || data.type || "RENTAL",
          disponible: data.disponible === true || data.disponible === "true",
        });
      } catch (error) {
        console.error("Erreur chargement voiture :", error);
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 Mo

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const oversizedFile = files.find((file) => file.size > MAX_IMAGE_SIZE);

    if (oversizedFile) {
      alert(`L'image "${oversizedFile.name}" dépasse la taille maximale autorisée de 5 Mo.`);
      e.target.value = "";
      setSelectedFiles([]);
      return;
    }

    setSelectedFiles(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const numericPrice = Number(form.prix);

    if (isSaleListing && (!form.prix || Number.isNaN(numericPrice) || numericPrice <= 0)) {
      alert("Le prix de vente est obligatoire pour une annonce de vente.");
      return;
    }

    if (!isSaleListing && (!form.prix || Number.isNaN(numericPrice) || numericPrice <= 0)) {
      alert("Le prix de location est obligatoire pour une annonce de location.");
      return;
    }

    const payload = {
      marque: form.marque,
      modele: form.modele,
      annee: Number(form.annee),
      nombrePlaces: Number(form.nombrePlaces),
      transmission: form.transmission,
      carburant: form.carburant,
      prixParJour: !isSaleListing ? numericPrice : null,
      prixVente: isSaleListing ? numericPrice : null,
      listingType: form.listingType,
      categorieId: Number(form.categorieId),
      villeId: Number(form.villeId),
      disponible: form.disponible === true,
    };

    try {
      setSaving(true);

      let savedCar;
      if (isEditMode) {
        savedCar = await voitureService.updateCar(id, payload);
      } else {
        savedCar = await voitureService.createCar(payload);
      }

      if (selectedFiles.length > 0) {
        const formData = new FormData();
        Array.from(selectedFiles).forEach((file) => formData.append("images", file));

        const oversizedFile = Array.from(selectedFiles).find((file) => file.size > MAX_IMAGE_SIZE);
        if (oversizedFile) {
          alert(`L'image "${oversizedFile.name}" dépasse la taille maximale autorisée de 5 Mo.`);
          return;
        }

        setUploading(true);
        const carId = savedCar?.id ?? id;
        await voitureService.uploadCarImages(carId, formData);
      }

      navigate("/owner/cars");
    } catch (error) {
      console.error("Erreur sauvegarde voiture :", error);
      alert(error.response?.data?.message || "Erreur lors de l'enregistrement de la voiture.");
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  if (loading && isEditMode) {
    return <div className="client-page"><h1>Voiture</h1><p>Chargement...</p></div>;
  }

  return (
    <div className="client-page">
      <div className="page-header">
        <div>
          <p className="eyebrow">Véhicule</p>
          <h1>{isEditMode ? "Modifier la voiture" : "Ajouter une voiture"}</h1>
        </div>
        <Link to="/owner/cars" className="secondary-button">Retour</Link>
      </div>

      <form onSubmit={handleSubmit} className="owner-form">
        {loadingReferences && (
          <div style={{ gridColumn: "1 / -1", color: "#64748b", fontSize: "0.82rem" }}>
            Chargement des villes et catégories…
          </div>
        )}

        <div style={{ gridColumn: "1 / -1" }}>
          <label>Type d’annonce</label>
          <select name="listingType" value={form.listingType} onChange={handleChange}>
            <option value="RENTAL">Location</option>
            <option value="SALE">Achat / Vente</option>
          </select>
        </div>

        <div>
          <label>Marque</label>
          <input name="marque" value={form.marque} onChange={handleChange} required />
        </div>

        <div>
          <label>Modèle</label>
          <input name="modele" value={form.modele} onChange={handleChange} required />
        </div>

        <div>
          <label>Année</label>
          <input type="number" name="annee" value={form.annee} onChange={handleChange} required />
        </div>

        <div>
          <label>Nombre de places</label>
          <input
            type="number"
            name="nombrePlaces"
            value={form.nombrePlaces}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        <div>
          <label>Transmission</label>
          <select name="transmission" value={form.transmission} onChange={handleChange} required>
            <option value="MANUELLE">Manuelle</option>
            <option value="AUTOMATIQUE">Automatique</option>
          </select>
        </div>

        <div>
          <label>Carburant</label>
          <select name="carburant" value={form.carburant} onChange={handleChange} required>
            <option value="">Choisir un carburant</option>
            <option value="ESSENCE">Essence</option>
            <option value="DIESEL">Diesel</option>
            <option value="HYBRIDE">Hybride</option>
            <option value="ELECTRIQUE">Électrique</option>
            <option value="GPL">GPL</option>
          </select>
        </div>

        <div>
          <label>{isSaleListing ? "Prix de vente" : "Prix de location"}</label>
          <input
            type="number"
            name="prix"
            value={form.prix}
            onChange={handleChange}
            required
            min="1"
          />
        </div>

        <div>
          <label>Ville</label>
          {cities.length > 0 ? (
            <select name="villeId" value={form.villeId} onChange={handleChange} required>
              <option value="">Choisir une ville</option>
              {cities.map((ville) => (
                <option key={ville.id} value={ville.id}>{ville.label}</option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              name="villeId"
              value={form.villeId}
              onChange={handleChange}
              required
              min="1"
              placeholder="ID ville"
            />
          )}
        </div>

        <div>
          <label>Catégorie</label>
          {categories.length > 0 ? (
            <select name="categorieId" value={form.categorieId} onChange={handleChange} required>
              <option value="">Choisir une catégorie</option>
              {categories.map((categorie) => (
                <option key={categorie.id} value={categorie.id}>{categorie.label}</option>
              ))}
            </select>
          ) : (
            <input
              type="number"
              name="categorieId"
              value={form.categorieId}
              onChange={handleChange}
              required
              min="1"
              placeholder="ID catégorie"
            />
          )}
        </div>

        <div className="checkbox-row">
          <label>
            <input type="checkbox" name="disponible" checked={form.disponible === true} onChange={handleChange} />
            Disponible
          </label>
        </div>

        <div style={{ gridColumn: "1 / -1" }} className="upload-box">
          <label className="upload-button">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            Ajouter une photo
          </label>

          {selectedFiles?.length > 0 && (
            <div className="upload-file-list">
              {Array.from(selectedFiles).map((file, index) => (
                <span key={`${file.name}-${index}`}>{file.name}</span>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={saving || uploading}>
          {saving || uploading ? (isEditMode ? "Mise à jour..." : "Création...") : (isEditMode ? "Enregistrer" : "Ajouter")}
        </button>
      </form>
    </div>
  );
}

export default OwnerCarForm;
