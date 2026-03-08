import { supabase } from "@/integrations/supabase/client";

export const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const calculateDistanceCharge = async (distanceKm: number): Promise<{ charge: number; ruleName: string }> => {
  const { data: rules } = await supabase
    .from("distance_charge_rules")
    .select("*")
    .eq("is_active", true)
    .order("min_km");

  if (!rules || rules.length === 0) return { charge: 0, ruleName: "No rules" };

  const rule = rules.find(r => distanceKm >= Number(r.min_km) && distanceKm < Number(r.max_km));
  if (!rule) return { charge: 0, ruleName: "Out of range" };

  const extraKm = Math.max(0, distanceKm - Number(rule.min_km));
  const charge = Number(rule.base_fee) + extraKm * Number(rule.per_km_rate);

  return { charge: Math.round(charge), ruleName: rule.name };
};

export const getProductServiceCharge = async (productId: string): Promise<{ price: number; hsnCode: string; name: string }> => {
  const { data } = await supabase
    .from("product_catalog")
    .select("service_price, hsn_sac_code, name, warranty_months")
    .eq("id", productId)
    .single();

  if (!data) return { price: 0, hsnCode: "", name: "" };
  return { price: Number(data.service_price), hsnCode: data.hsn_sac_code || "", name: data.name };
};
