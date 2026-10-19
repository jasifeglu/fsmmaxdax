import { useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, Radio, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { pathKm } from "@/lib/geo";

const icon = (color: string) => new L.Icon({
  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});
const liveIcon = icon("green");
const offIcon = icon("grey");

const FlyTo = ({ pos }: { pos: [number, number] | null }) => {
  const map = useMap();
  useEffect(() => { if (pos) map.flyTo(pos, 15); }, [pos?.[0], pos?.[1]]);
  return null;
};

type Pt = { user_id: string; latitude: number; longitude: number; recorded_at: string; speed: number | null };

const LiveTrackingPage = () => {
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [points, setPoints] = useState<Pt[]>([]);
  const [active, setActive] = useState<Record<string, any>>({});
  const [names, setNames] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const start = new Date(date + "T00:00:00").toISOString();
    const end = new Date(date + "T23:59:59").toISOString();
    const [locRes, attRes, profRes] = await Promise.all([
      supabase.from("staff_locations").select("user_id, latitude, longitude, recorded_at, speed")
        .gte("recorded_at", start).lte("recorded_at", end).order("recorded_at", { ascending: true }).limit(5000),
      supabase.from("staff_attendance").select("*, projects(name)").is("check_out_at", null),
      supabase.from("profiles").select("id, full_name, email"),
    ]);
    setPoints((locRes.data || []) as Pt[]);
    const a: Record<string, any> = {};
    (attRes.data || []).forEach((r: any) => { a[r.user_id] = r; });
    setActive(a);
    const n: Record<string, string> = {};
    (profRes.data || []).forEach((p: any) => { n[p.id] = p.full_name || p.email; });
    setNames(n);
    setLoading(false);
  };

  useEffect(() => { load(); }, [date]);

  useEffect(() => {
    const ch = supabase.channel("live-tracking")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "staff_locations" }, (payload) => {
        const p = payload.new as Pt;
        if (p.recorded_at.slice(0, 10) === date) setPoints((prev) => [...prev, p]);
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_attendance" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [date]);

  const byUser = useMemo(() => {
    const m: Record<string, Pt[]> = {};
    points.forEach((p) => { (m[p.user_id] ||= []).push(p); });
    return m;
  }, [points]);

  const staffIds = useMemo(() => Array.from(new Set([...Object.keys(byUser), ...Object.keys(active)])), [byUser, active]);
  const latest = (id: string) => byUser[id]?.[byUser[id].length - 1];
  const selLatest = selected ? latest(selected) : null;
  const firstWithPos = staffIds.map(latest).find(Boolean);
  const center: [number, number] = firstWithPos ? [Number(firstWithPos.latitude), Number(firstWithPos.longitude)] : [10.0, 76.3];

  return (
    <div>
      <PageHeader title="Live Staff Tracking" description="Real-time location and travel of checked-in staff">
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="h-8 w-40 text-xs" />
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="glass-card lg:col-span-1 order-2 lg:order-1">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Staff ({staffIds.length})</CardTitle></CardHeader>
          <CardContent className="space-y-2 max-h-[520px] overflow-auto">
            {loading ? <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
              : staffIds.length === 0 ? <p className="text-xs text-muted-foreground py-6 text-center">No staff checked in or tracked on this day.</p>
              : staffIds.map((id) => {
                const pts = byUser[id] || [];
                const last = latest(id);
                const isLive = !!active[id];
                return (
                  <button key={id} onClick={() => setSelected(id === selected ? null : id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${selected === id ? "border-primary bg-primary/5" : "border-border hover:bg-muted/40"}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{names[id] || "Staff"}</span>
                      {isLive ? <Badge className="text-[10px] gap-1"><Radio className="h-3 w-3" /> Live</Badge>
                        : <Badge variant="secondary" className="text-[10px]">Offline</Badge>}
                    </div>
                    <div className="text-[11px] text-muted-foreground mt-1 space-y-0.5">
                      {active[id]?.projects?.name && <div>Project: {active[id].projects.name}</div>}
                      <div>Travelled: {pathKm(pts).toFixed(1)} km · {pts.length} points</div>
                      {last && <div>Last seen: {new Date(last.recorded_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>}
                    </div>
                  </button>
                );
              })}
          </CardContent>
        </Card>

        <Card className="glass-card lg:col-span-2 overflow-hidden order-1 lg:order-2">
          <div className="h-[420px] lg:h-[560px]">
            <MapContainer center={center} zoom={11} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
              <FlyTo pos={selLatest ? [Number(selLatest.latitude), Number(selLatest.longitude)] : null} />
              {staffIds.map((id) => {
                const pts = byUser[id] || [];
                const last = latest(id);
                if (!last) return null;
                return (
                  <div key={id}>
                    {(selected === null || selected === id) && pts.length > 1 && (
                      <Polyline positions={pts.map((p) => [Number(p.latitude), Number(p.longitude)] as [number, number])}
                        pathOptions={{ color: "hsl(var(--primary))", weight: selected === id ? 4 : 2, opacity: 0.7 }} />
                    )}
                    <Marker position={[Number(last.latitude), Number(last.longitude)]} icon={active[id] ? liveIcon : offIcon}>
                      <Popup>
                        <strong>{names[id] || "Staff"}</strong><br />
                        {new Date(last.recorded_at).toLocaleTimeString()}<br />
                        {pathKm(pts).toFixed(1)} km today
                      </Popup>
                    </Marker>
                  </div>
                );
              })}
            </MapContainer>
          </div>
        </Card>
      </div>
      <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1"><MapPin className="h-3 w-3" /> Staff locations are shared only while they are checked in.</p>
    </div>
  );
};

export default LiveTrackingPage;
