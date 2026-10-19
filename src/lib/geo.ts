export const distanceMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/** Total path length in km for an ordered list of points. */
export const pathKm = (pts: { latitude: number; longitude: number }[]) => {
  let m = 0;
  for (let i = 1; i < pts.length; i++) {
    m += distanceMeters(Number(pts[i - 1].latitude), Number(pts[i - 1].longitude), Number(pts[i].latitude), Number(pts[i].longitude));
  }
  return m / 1000;
};

/** Overall expense status from the two approval stages. */
export const overallExpenseStatus = (manager: string, hr: string) => {
  if (manager === "rejected" || hr === "rejected") return "rejected";
  if (manager === "approved" && hr === "approved") return "approved";
  return "pending";
};
