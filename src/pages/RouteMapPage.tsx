import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Navigation, MapPin, Clock, Route } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const techIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const jobIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const RouteMapPage = () => {
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [techRes, ticketRes, skillsRes] = await Promise.all([
        supabase.from("profiles").select("id, full_name, email"),
        supabase.from("tickets").select("*").in("status", ["Assigned", "Scheduled", "On-Site", "Work-In-Progress"]),
        supabase.from("technician_skills").select("*"),
      ]);

      const skills = skillsRes.data || [];
      const techs = (techRes.data || []).map(t => {
        const skill = skills.find((s: any) => s.user_id === t.id);
        return { ...t, ...skill };
      });

      setTechnicians(techs);
      setTickets(ticketRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const activeTickets = useMemo(() => {
    if (selectedTech === "all") return tickets.filter(t => t.customer_latitude && t.customer_longitude);
    return tickets.filter(t => t.assigned_to === selectedTech && t.customer_latitude && t.customer_longitude);
  }, [tickets, selectedTech]);

  const selectedTechData = technicians.find(t => t.id === selectedTech);

  const routePoints = useMemo(() => {
    if (!selectedTechData?.home_latitude) return [];
    const home: [number, number] = [Number(selectedTechData.home_latitude), Number(selectedTechData.home_longitude)];
    const jobs = activeTickets.map(t => [Number(t.customer_latitude), Number(t.customer_longitude)] as [number, number]);
    
    // Simple nearest-neighbor route optimization
    if (jobs.length === 0) return [];
    const ordered: [number, number][] = [home];
    const remaining = [...jobs];
    let current = home;
    while (remaining.length > 0) {
      let nearest = 0;
      let minDist = Infinity;
      remaining.forEach((p, i) => {
        const d = haversine(current[0], current[1], p[0], p[1]);
        if (d < minDist) { minDist = d; nearest = i; }
      });
      ordered.push(remaining[nearest]);
      current = remaining[nearest];
      remaining.splice(nearest, 1);
    }
    return ordered;
  }, [selectedTechData, activeTickets]);

  const totalDistance = useMemo(() => {
    let d = 0;
    for (let i = 1; i < routePoints.length; i++) {
      d += haversine(routePoints[i - 1][0], routePoints[i - 1][1], routePoints[i][0], routePoints[i][1]);
    }
    return d;
  }, [routePoints]);

  const center: [number, number] = routePoints.length > 0
    ? routePoints[0]
    : activeTickets.length > 0
      ? [Number(activeTickets[0].customer_latitude), Number(activeTickets[0].customer_longitude)]
      : [19.076, 72.8777]; // Mumbai default

  return (
    <div>
      <PageHeader title="Route Map & Navigation" description="Technician routes, service locations, and navigation" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-3">
                <Select value={selectedTech} onValueChange={setSelectedTech}>
                  <SelectTrigger className="w-56 h-9 text-sm"><SelectValue placeholder="Select technician" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Technicians</SelectItem>
                    {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
                  </SelectContent>
                </Select>
                {routePoints.length > 0 && (
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Route className="h-3.5 w-3.5" /> {totalDistance.toFixed(1)} km total</span>
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> ~{Math.round(totalDistance / 30 * 60)} min</span>
                    <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {activeTickets.length} stops</span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : (
                <div className="rounded-lg overflow-hidden border border-border" style={{ height: 500 }}>
                  <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {/* Technician home markers */}
                    {technicians.filter(t => t.home_latitude && (selectedTech === "all" || t.id === selectedTech)).map(t => (
                      <Marker key={`tech-${t.id}`} position={[Number(t.home_latitude), Number(t.home_longitude)]} icon={techIcon}>
                        <Popup><strong>{t.full_name}</strong><br />Home Base</Popup>
                      </Marker>
                    ))}
                    {/* Job location markers */}
                    {activeTickets.map((t, i) => (
                      <Marker key={t.id} position={[Number(t.customer_latitude), Number(t.customer_longitude)]} icon={jobIcon}>
                        <Popup>
                          <strong>{t.ticket_number}</strong><br />
                          {t.customer_name}<br />
                          {t.customer_address || t.issue}<br />
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${t.customer_latitude},${t.customer_longitude}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-xs">
                            Navigate →
                          </a>
                        </Popup>
                      </Marker>
                    ))}
                    {/* Route polyline */}
                    {routePoints.length > 1 && (
                      <Polyline positions={routePoints} pathOptions={{ color: "hsl(var(--primary))", weight: 3, dashArray: "10 6" }} />
                    )}
                  </MapContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar: Route sequence */}
        <div>
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Route Sequence</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTech === "all" ? (
                <p className="text-xs text-muted-foreground">Select a technician to view optimized route.</p>
              ) : activeTickets.length === 0 ? (
                <p className="text-xs text-muted-foreground">No active jobs with location data.</p>
              ) : (
                <div className="space-y-2">
                  {selectedTechData?.home_address && (
                    <div className="flex items-start gap-2 p-2 rounded-md bg-primary/5 border border-primary/20">
                      <Badge className="mt-0.5 text-[10px] h-5 w-5 flex items-center justify-center p-0 rounded-full">H</Badge>
                      <div>
                        <p className="text-xs font-medium">Home Base</p>
                        <p className="text-[10px] text-muted-foreground">{selectedTechData.home_address}</p>
                      </div>
                    </div>
                  )}
                  {activeTickets.map((t, i) => {
                    const prev = i === 0 && selectedTechData?.home_latitude
                      ? { lat: Number(selectedTechData.home_latitude), lng: Number(selectedTechData.home_longitude) }
                      : i > 0 ? { lat: Number(activeTickets[i - 1].customer_latitude), lng: Number(activeTickets[i - 1].customer_longitude) } : null;
                    const dist = prev ? haversine(prev.lat, prev.lng, Number(t.customer_latitude), Number(t.customer_longitude)) : null;

                    return (
                      <div key={t.id} className="flex items-start gap-2 p-2 rounded-md border border-border/50 hover:bg-muted/30">
                        <Badge variant="outline" className="mt-0.5 text-[10px] h-5 w-5 flex items-center justify-center p-0 rounded-full">{i + 1}</Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{t.customer_name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">{t.ticket_number}</p>
                          {dist != null && (
                            <p className="text-[10px] text-muted-foreground">{dist.toFixed(1)} km • ~{Math.round(dist / 30 * 60)} min</p>
                          )}
                        </div>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0" asChild>
                          <a href={`https://www.google.com/maps/dir/?api=1&destination=${t.customer_latitude},${t.customer_longitude}`} target="_blank" rel="noopener noreferrer">
                            <Navigation className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                    );
                  })}
                  {totalDistance > 0 && (
                    <div className="pt-2 border-t border-border text-xs text-muted-foreground">
                      <p>Total: <strong className="text-foreground">{totalDistance.toFixed(1)} km</strong> • ~{Math.round(totalDistance / 30 * 60)} min drive</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Distance charge preview */}
          <Card className="glass-card mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Distance Charges</CardTitle>
            </CardHeader>
            <CardContent>
              {activeTickets.filter(t => t.distance_km).length === 0 ? (
                <p className="text-xs text-muted-foreground">No distance charges calculated yet.</p>
              ) : (
                <div className="space-y-1.5">
                  {activeTickets.filter(t => t.distance_km).map(t => (
                    <div key={t.id} className="flex justify-between text-xs">
                      <span className="font-mono text-muted-foreground">{t.ticket_number}</span>
                      <span>{Number(t.distance_km).toFixed(1)} km → <strong>₹{Number(t.distance_charge).toLocaleString()}</strong></span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RouteMapPage;
