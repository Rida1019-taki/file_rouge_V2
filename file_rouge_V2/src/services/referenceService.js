import api from "./api";

const normalizeOptions = (payload) => {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload?.data ?? payload?.items ?? payload?.content ?? payload?.result ?? payload?.rows ?? [];

  if (!Array.isArray(rawItems)) return [];

  return rawItems
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const id = item.id ?? item.value ?? item.categorieId ?? item.villeId;
      const label =
        item.nom ??
        item.name ??
        item.label ??
        item.libelle ??
        item.title ??
        item.designation ??
        item.categorie ??
        item.ville ??
        item.nomVille ??
        item.nomCategorie;

      if (id === undefined || id === null || label === undefined || label === null) {
        return null;
      }

      return {
        id: Number(id),
        label: String(label),
      };
    })
    .filter(Boolean);
};

const fetchOptions = async (candidates) => {
  for (const endpoint of candidates) {
    try {
      const response = await api.get(endpoint);
      const normalized = normalizeOptions(response.data);

      if (normalized.length > 0) {
        return normalized;
      }
    } catch {
      // Ignore endpoint errors and try the next common route.
    }
  }

  return [];
};

const fallbackCities = [
  { id: 1, label: "Casablanca" },
  { id: 2, label: "Rabat" },
  { id: 3, label: "Marrakech" },
  { id: 4, label: "Fès" },
  { id: 5, label: "Tanger" },
  { id: 6, label: "Agadir" },
  { id: 7, label: "Meknès" },
  { id: 8, label: "Oujda" },
  { id: 9, label: "Sale" },
  { id: 10, label: "Kenitra" },
];

const fallbackCategories = [
  { id: 1, label: "Berline" },
  { id: 2, label: "SUV" },
  { id: 3, label: "Compacte" },
  { id: 4, label: "4x4" },
  { id: 5, label: "Utilitaire" },
  { id: 6, label: "Coupé" },
  { id: 7, label: "Monospace" },
  { id: 8, label: "Camion" },
];

const getVilles = async () => {
  const endpoints = [
    "/villes",
    "/villes/all",
    "/ville",
  ];

  const result = await fetchOptions(endpoints);
  return result.length > 0 ? result : fallbackCities;
};

const getCategories = async () => {
  const endpoints = [
    "/categories",
    "/categories/all",
    "/categorie",
  ];

  const result = await fetchOptions(endpoints);
  return result.length > 0 ? result : fallbackCategories;
};

export default {
  getVilles,
  getCategories,
};
