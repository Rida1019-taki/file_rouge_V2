export const isCarAvailable = (value) => {
  if (value === false || value === 0) return false;
  if (typeof value === "string" && ["false", "0", "indisponible"].includes(value.trim().toLowerCase())) {
    return false;
  }
  return true;
};
