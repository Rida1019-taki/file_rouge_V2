import api from "./api";

const normalizeOptions = (payload) => {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload?.data ?? payload?.items ?? payload?.content ?? payload?.result ?? payload?.rows ?? [];

  if (!Array.isArray(rawItems)) return [];

  return rawItems.map((item) => {
    if (!item || typeof item !== "object") return null;
    const id = item.id ?? item.value ?? item.categorieId ?? item.villeId;
    const label = item.nom ?? item.name ?? item.label ?? item.libelle ?? item.title ??
      item.designation ?? item.categorie ?? item.ville ?? item.nomVille ?? item.nomCategorie;
    if (id === undefined || id === null || label === undefined || label === null) return null;
    return { id: Number(id), label: String(label) };
  }).filter(Boolean);
};

const fetchOptions = async (endpoints) => {
  for (const endpoint of endpoints) {
    try {
      const response = await api.get(endpoint);
      const options = normalizeOptions(response.data);
      if (options.length) return options;
    } catch {
      // Try the other existing reference route.
    }
  }
  return [];
};

const getVilles = () => fetchOptions(["/villes", "/villes/all", "/ville"]);
const getCategories = () => fetchOptions(["/categories", "/categories/all", "/categorie"]);

export default { getVilles, getCategories };
