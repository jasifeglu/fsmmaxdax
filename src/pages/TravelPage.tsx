import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/PageHeader";
import { Loader2, Navigation, Flag, Repeat2, MapPin, Clock, Gauge, ClipboardCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { distanceMeters } from "@/lib/geo";
import {
  JOURNEY_TYPES,
  journeyTypeLabel,
  isReimbursableType,
  km,
  durationMinutes,
  formatDuration,
  sumGpsMetres,
  sumDurationMinutes,
  awaitingMileageReview,
} from "@/lib/travel";

const GPS_MAX_ACCURACY_M = 50;
const MIN_INTERVAL_MS = 30_000;
const MIN_MOVE_M = 40;

const getPosition = () =>
  new Promise<GeolocationPosition | null>((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { enableHighAccuracy: true, timeout: 10000 });
  });

const reverseGeocode = async (lat: number, lng: number) => {
  try {
    const res = await fetch(
      `https://nominium.openstreetmap.org/undefined`
    );
    return null;
  } catch {
    return null;
  }
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const daysAgoIso = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

type Journey = {
  id: string;
  user_id: string;
  journey_type: string;
  status: string;
  origin_lat: number | null;
  origin_lng: number | null;
  origin_address: string | null;
  dest_lat: number | null;
  dest_lng: number | null;
  dest_address: string | null;
  started_at: string;
  ended_at: string | null;
  gps_distance_m: number;
  road_distance_m: number | null;
  odometer_start: number | null;
  odometer_end: number | null;
  approved_distance_m: number | null;
  reimbursement_eligible: boolean;
  business_purpose: string | null;
  return_of_journey_id: string | null;
  attendance_id: string | null;
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Active", cls: "bg-green-500/10 text-green-600 border-green-500/30" },
    completed: { label: "Completed", cls: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
    interrupted: { label: "Interrupted", cls: "bg-orange-500/10 text-orange-600 border-orange-500/30" },
    needs_review: { label: "Needs review", cls: "bg-yellow-500/10 text-yellow-600 border-yellow-500/30" },
    cancelled: { label: "Cancelled", cls: "bg-red-500/10 text-red-600 border-red-500/30" },
    planned: { label: "Planned", cls: "bg-muted text-muted-foreground border-border" },
  };
  const s = map[status] ?? { label: status, cls: "bg-muted text-muted-foreground border-border" };
  return <Badge variant="outline" className={`text-[10px] ${s.cls}`}>{s.label}</Badge>;
};

export default function TravelPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [active, setActive] = useState<Journey | null>(null);
  const [today, setToday] = useState<Journey[]>([]);
  const [history, setHistory] = useState<Journey[]>([]);
  const [historyRange, setHistoryRange] = useState("7");
  const [loading, setLoading] = useState(true);
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);
  const [returnOf, setReturnOf] = useState<Journey | null>(null);
  const [busy, setBusy] = useState(false);

  // start form
  const [jType, setJType] = useState("home_site");
  const [projectId, setProjectId] = useState("none");
  const [ticketId, setTicketId] = useState("none");
  const [purpose, setPurpose] = useState("");
  const [odoStart, setOdoStart] = useState("");
  const [projects, setProjects] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  // end form
  const [odoEnd, setOdoEnd] = useState("");
  const [destAddress, setDestAddress] = useState("");
  const [endNotes, setEndNotes] = useState("");

  const watchRef = useRef<number | null>(null);
  const lastPointRef = useRef<{ lat: number; lng: number; t: number } | null>(null);
  const distRef = useRef(0);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [activeRes, todayRes] = await Promise.all([
      supabase.from("travel_journeys").select("*").eq("user_id", user.id).eq("status", "active").maybeSingle(),
      supabase.from("travel_journeys").select("*").eq("user_id", user.id).gte("started_at", startOfToday()).order("started_at", { ascending: false }),
    ]);
    setActive((activeRes.data as Journey) ?? null);
    setToday((todayRes.data as Journey[]) ?? []);
  }, [user?.id]);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    const days = historyRange === "all" ? 3650 : Number(historyRange);
    const { data } = await supabase
      .from("travel_journeys")
      .select("*")
      .eq("user_id", user.id)
      .gte("started_at", daysAgoIso(days))
      .order("started_at", { ascending: false })
      .limit(200);
    setHistory((data as Journey[]) ?? []);
  }, [user?.id, historyRange]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      await refresh();
      setLoading(false);
    })();
  }, [refresh]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Live breadcrumb recording while a journey is active
  useEffect(() => {
    if (!active || !user || !navigator.geolocation) return;
    distRef.current = Number(active.gps_distance_m ?? 0);
    lastPointRef.current = null;
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy, speed } = pos.coords;
        if (accuracy != null && accuracy > GPS_MAX_ACCURACY_M) return; // reject poor fixes
        const last = lastPointRef.current;
        const now = Date.now();
        if (last && now - last.t < MIN_INTERVAL_MS && distanceMeters(last.lat, last.lng, lat, lng) < MIN_MOVE_M) return;
        lastPointRef.current = { lat, lng, t: now };
        const seg = last ? distanceMeters(last.lat, last.lng, lat, lng) : 0;
        distRef.current += seg;
        await supabase.from("staff_locations").insert({
          user_id: user.id,
          journey_id: active.id,
          attendance_id: active.attendance_id,
          latitude: lat,
          longitude: lng,
          accuracy: accuracy ?? null,
          speed: speed ?? null,
        });
        await supabase.from("travel_journeys").update({ gps_distance_m: distRef.current }).eq("id", active.id);
      },
      (err) => console.warn("Travel GPS error", err.message),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
    );
    return () => {
      if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    };
  }, [active?.id, user?.id]);

  const openStart = async (returnJourney: Journey | null = null) => {
    setReturnOf(returnJourney);
    setPurpose("");
    setOdoStart("");
    setProjectId("none");
    setTicketId("none");
    setJType(returnJourney ? "site_home" : "home_site");
    const [p, t] = await Promise.all([
      supabase.from("projects").select("id, name, code").eq("status", "active").order("name"),
      supabase.from("tickets").select("id, ticket_number, customer_name").neq("status", "closed").order("created_at", { ascending: false }).limit(30),
    ]);
    setProjects(p.data || []);
    setTickets(t.data || []);
    setStartOpen(true);
  };

  const startJourney = async () => {
    if (!user) return;
    setBusy(true);
    const pos = await getPosition();
    const { data, error } = await supabase
      .from("travel_journeys")
      .insert({
        user_id: user.id,
        attendance_id: active?.id ?? null ? null : null, // attendance link is set by policy module later
        project_id: projectId === "none" ? null : projectId,
        ticket_id: ticketId === "none" ? null : ticketId,
        return_of_journey_id: returnOf?.id ?? null,
        journey_type: jType,
        status: "active",
        origin_lat: pos?.coords.latitude ?? null,
        origin_lng: pos?.coords.longitude ?? null,
        odometer_start: odoStart ? Number(odoStart) : null,
        reimbursement_eligible: isReimbursableType(jType),
        business_purpose: purpose || null,
        gps_distance_m: 0,
      })
      .select()
      .single();
    setBusy(false);
    if (error) {
      const dup = error.code === "23505";
      return toast({
        title: dup ? "Journey already active" : "Could not start journey",
        description: dup ? "End your active journey before starting a new one." : error.message,
        variant: "destructive",
      });
    }
    if (pos) {
      await supabase.from("staff_locations").insert({
        user_id: user.id,
        journey_id: data.id,
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
        accuracy: pos.coords.accuracy ?? null,
      });
    }
    setStartOpen(false);
    setActive(data as Journey);
    distRef.current = 0;
    lastPointRef.current = null;
    toast({ title: "Travel started", description: "GPS recording is on for this journey." });
  };

  const endJourney = async () => {
    if (!active) return;
    setBusy(true);
    const pos = await getPosition();
    const finalDist = distRef.current;
    const { error } = await supabase
      .from("travel_journeys")
      .update({
        status: "completed",
        ended_at: new Date().toISOString(),
        gps_distance_m: finalDist,
        distance_source: "gps",
        dest_lat: pos?.coords.latitude ?? null,
        dest_lng: pos?.coords.longitude ?? null,
        dest_address: destAddress || null,
        odometer_end: odoEnd ? Number(odoEnd) : null,
        notes: endNotes || null,
      })
      .eq("id", active.id)
      .eq("status", "active"); // idempotent: only completes an active journey
    setBusy(false);
    if (error) return toast({ title: "Could not end journey", description: error.message, variant: "destructive" });
    if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current);
    setEndOpen(false);
    setOdoEnd(""); setDestAddress(""); setEndNotes("");
    await refresh();
    await loadHistory();
    toast({ title: "Journey completed", description: `${km(finalDist)} km recorded by GPS.` });
  };

  const StatCard = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{label}</p>
          <p className="text-lg font-bold leading-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );

  const JourneyCard = ({ j, showReturn }: { j: Journey; showReturn?: boolean }) => (
    <Card>
      <CardContent className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <MapPin className="h-4 w-4 text-primary shrink-0" />
            <p className="text-sm font-medium truncate">{journeyTypeLabel(j.journey_type)}</p>
          </div>
          <StatusBadge status={j.status} />
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(j.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} → {j.ended_at ? new Date(j.ended_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "ongoing"}</span>
          <span className="flex items-center gap-1"><Gauge className="h-3 w-3" />{km(j.gps_distance_m)} km GPS{j.road_distance_m != null ? ` · ${km(j.road_distance_m)} km road` : ""}</span>
          <span>{formatDuration(durationMinutes(j.started_at, j.ended_at))}</span>
          <span>{j.return_of_journey_id ? "Return journey" : showReturn && j.status === "completed" ? "" : ""}</span>
        </div>
        {(j.origin_address || j.dest_address || j.business_purpose) && (
          <p className="text-xs text-muted-foreground truncate">
            {[j.origin_address, j.dest_address, j.business_purpose].filter(Boolean).join(" · ")}
          </p>
        )}
        <div className="flex items-center gap-2">
          {j.reimbursement_eligible ? (
            j.approved_distance_m == null ? (
              <Badge variant="outline" className="text-[10px] border-yellow-500/30 text-yellow-600">Mileage review pending</Badge>
            ) : (
              <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-600">Approved: {km(j.approved_distance_m)} km</Badge>
            )
          ) : (
            <Badge variant="outline" className="text-[10px]">Non-reimbursable</Badge>
          )}
          {showReturn && j.status === "completed" && !j.return_of_journey_id && (
            <Button size="sm" variant="outline" className="h-7 text-xs ml-auto gap-1" onClick={() => openStart(j)}>
              <Repeat2 className="h-3 w-3" /> Start Return
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedToday = today.filter((j) => j.status !== "active");
  const todayKm = km(sumGpsMetres(today));
  const todayMin = sumDurationMinutes(today);
  const awaiting = awaitingMileageReview(today);

  return (
    <div className="space-y-4 max-w-4xl">
      <PageHeader
        title="Travel"
        description="Record business journeys, GPS mileage and return trips"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Navigation} label="Today's GPS distance" value={`${todayKm} km`} />
        <StatCard icon={Flag} label="Journeys today" value={String(completedToday.length + (active ? 1 : 0))} />
        <StatCard icon={Clock} label="Time travelling today" value={formatDuration(todayMin)} />
        <StatCard icon={ClipboardCheck} label="Mileage awaiting review" value={String(awaiting)} />
      </div>

      {active ? (
        <Card className="border-green-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Active Journey — {journeyTypeLabel(active.journey_type)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div><p className="text-2xl font-bold text-primary">{km(distRef.current)} km</p><p className="text-xs text-muted-foreground">GPS distance</p></div>
              <div><p className="text-2xl font-bold">{formatDuration(durationMinutes(active.started_at))}</p><p className="text-xs text-muted-foreground">Elapsed</p></div>
              <div><p className="text-2xl font-bold">{new Date(active.started_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p><p className="text-xs text-muted-foreground">Started</p></div>
            </div>
            <p className="text-xs text-muted-foreground">Location breadcrumbs are recorded while this journey is open. GPS accuracy over 50 m is rejected.</p>
            <Button className="w-full gap-2" onClick={() => setEndOpen(true)}>
              <Flag className="h-4 w-4" /> End Travel
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Button size="lg" className="w-full gap-2" onClick={() => openStart(null)}>
          <Navigation className="h-4 w-4" /> Start Travel
        </Button>
      )}

      <Tabs defaultValue="today">
        <TabsList>
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-3 mt-3">
          {completedToday.length === 0 && !active && (
            <p className="text-sm text-muted-foreground text-center py-8">No journeys recorded today.</p>
          )}
          <div className="space-y-3">
            {today.map((j) => <JourneyCard key={j.id} j={j} showReturn />)}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-3 mt-3">
          <Select value={historyRange} onValueChange={setHistoryRange}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Today</SelectItem>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No journeys in this period.</p>
          ) : (
            <div className="space-y-3">
              {history.map((j) => <JourneyCard key={j.id} j={j} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Start Travel dialog */}
      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{returnOf ? "Start Return Journey" : "Start Travel"}</DialogTitle>
            <DialogDescription>
              {returnOf
                ? `Return leg for the ${journeyTypeLabel(returnOf.journey_type)} journey. A new journey record is created.`
                : "Your starting GPS position will be recorded."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Journey type</Label>
              <Select value={jType} onValueChange={setJType}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {JOURNEY_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              {!isReimbursableType(jType) && (
                <p className="text-[11px] text-yellow-600 mt-1">Personal journeys are not reimbursable.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Project (optional)</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.code ? `${p.code} — ` : ""}{p.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Ticket (optional)</Label>
                <Select value={ticketId} onValueChange={setTicketId}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {tickets.map((t) => <SelectItem key={t.id} value={t.id}>{t.ticket_number} · {t.customer_name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Business purpose / notes</Label>
              <Textarea value={purpose} onChange={(e) => setPurpose(e.target.value)} rows={2} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Start odometer (optional)</Label>
              <Input type="number" value={odoStart} onChange={(e) => setOdoStart(e.target.value)} placeholder="km" className="mt-1" />
            </div>
            <Button onClick={startJourney} disabled={busy} className="w-full">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Navigation className="mr-2 h-4 w-4" />}
              {returnOf ? "Start Return Journey" : "Start Travel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* End Travel dialog */}
      <Dialog open={endOpen} onOpenChange={setEndOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>End Travel</DialogTitle>
            <DialogDescription>Ending GPS fixes at your current position. The GPS distance is finalised.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="rounded-lg bg-muted p-3 text-sm">
              <p>GPS distance so far: <span className="font-bold">{km(distRef.current)} km</span></p>
              <p className="text-xs text-muted-foreground">Elapsed: {formatDuration(durationMinutes(active?.started_at ?? ""))}</p>
            </div>
            <div>
              <Label className="text-xs">Destination address (optional)</Label>
              <Input value={destAddress} onChange={(e) => setDestAddress(e.target.value)} placeholder="Where the journey ended" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">End odometer (optional)</Label>
              <Input type="number" value={odoEnd} onChange={(e) => setOdoEnd(e.target.value)} placeholder="km" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Notes (optional)</Label>
              <Textarea value={endNotes} onChange={(e) => setEndNotes(e.target.value)} rows={2} className="mt-1" />
            </div>
            <Button onClick={endJourney} disabled={busy} className="w-full">
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Flag className="mr-2 h-4 w-4" />} End Travel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
