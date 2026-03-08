import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, MapPin, Clock, Navigation, Loader2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const SchedulePage = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [selectedTech, setSelectedTech] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);
      const [tRes, pRes, rRes] = await Promise.all([
        supabase.from("tickets").select("*").in("status", ["Assigned", "Scheduled", "On-Site", "Work-In-Progress", "Completed"]).order("scheduled_at", { ascending: true }),
        supabase.from("profiles").select("id, full_name"),
        supabase.from("user_roles").select("user_id").eq("role", "technician"),
      ]);
      const techIds = new Set((rRes.data || []).map((r: any) => r.user_id));
      setTechnicians((pRes.data || []).filter((p: any) => techIds.has(p.id)));
      setTickets(tRes.data || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = selectedTech === "all" ? tickets : tickets.filter(t => t.assigned_to === selectedTech);

  const totalDistance = filtered.reduce((s, t) => s + (Number(t.distance_km) || 0), 0);

  return (
    <div>
      <PageHeader title="Schedule & Route View" description="Daily job sequence with route and distance details" />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <Select value={selectedTech} onValueChange={setSelectedTech}>
          <SelectTrigger className="w-56 h-9 text-sm"><SelectValue placeholder="Filter by technician" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Technicians</SelectItem>
            {technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>{filtered.length} jobs</span>
          {totalDistance > 0 && <span>• {totalDistance.toFixed(1)} km total distance</span>}
        </div>
      </div>

      <Card className="glass-card">
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No scheduled jobs found.</p>
          ) : (
            <div className="space-y-1">
              {filtered.map((t, i) => (
                <div key={t.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/30 transition-colors text-sm">
                  <Badge variant="outline" className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-[10px] shrink-0">{i + 1}</Badge>
                  <span className="font-mono text-xs text-muted-foreground w-16 shrink-0">
                    {t.scheduled_at ? new Date(t.scheduled_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : "—"}
                  </span>
                  <div className="h-8 w-0.5 bg-primary/30 rounded-full" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary">{t.ticket_number}</span>
                      <span className="font-medium">{t.customer_name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{t.category} • {t.assignee_name || "Unassigned"}</span>
                      {t.distance_km && <span className="flex items-center gap-0.5"><MapPin className="h-3 w-3" />{Number(t.distance_km).toFixed(1)} km</span>}
                      {t.distance_charge > 0 && <span>₹{Number(t.distance_charge).toLocaleString()}</span>}
                    </div>
                  </div>
                  <StatusBadge status={t.status} />
                  {t.customer_latitude && (
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" asChild>
                      <a href={`https://www.google.com/maps/dir/?api=1&destination=${t.customer_latitude},${t.customer_longitude}`} target="_blank" rel="noopener noreferrer">
                        <Navigation className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distance Revenue Summary */}
      {filtered.some(t => t.distance_charge > 0) && (
        <Card className="glass-card mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Distance Revenue Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold font-mono">{totalDistance.toFixed(1)}</p>
                <p className="text-xs text-muted-foreground">Total km</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">₹{filtered.reduce((s, t) => s + (Number(t.distance_charge) || 0), 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Distance Revenue</p>
              </div>
              <div>
                <p className="text-2xl font-bold font-mono">₹{filtered.reduce((s, t) => s + (Number(t.service_charge) || 0), 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Service Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SchedulePage;
