import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LogIn, LogOut, Loader2, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { distanceMeters } from "@/lib/geo";

const MIN_INTERVAL_MS = 30_000;
const MIN_MOVE_M = 40;

const getPosition = () =>
  new Promise<GeolocationPosition | null>((resolve) => {
    if (!navigator.geolocation) return resolve(null);
    navigator.geolocation.getCurrentPosition(resolve, () => resolve(null), { enableHighAccuracy: true, timeout: 10000 });
  });

/** Check-in / check-out button. Location is shared live only while checked in. */
export const AttendanceControl = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [active, setActive] = useState<any | null>(null);
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [projectId, setProjectId] = useState("none");
  const [notes, setNotes] = useState("");
  const watchRef = useRef<number | null>(null);
  const lastRef = useRef<{ lat: number; lng: number; t: number } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("staff_attendance").select("*").eq("user_id", user.id).is("check_out_at", null)
      .order("check_in_at", { ascending: false }).limit(1)
      .then(({ data }) => setActive(data?.[0] ?? null));
  }, [user?.id]);

  // Live tracking while checked in
  useEffect(() => {
    if (!active || !user || !navigator.geolocation) return;
    watchRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng, accuracy, speed } = pos.coords;
        const last = lastRef.current;
        const now = Date.now();
        if (last && now - last.t < MIN_INTERVAL_MS && distanceMeters(last.lat, last.lng, lat, lng) < MIN_MOVE_M) return;
        lastRef.current = { lat, lng, t: now };
        await supabase.from("staff_locations").insert({
          user_id: user.id, attendance_id: active.id, latitude: lat, longitude: lng,
          accuracy: accuracy ?? null, speed: speed ?? null,
        });
      },
      (err) => console.warn("Location error", err.message),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
    );
    return () => { if (watchRef.current !== null) navigator.geolocation.clearWatch(watchRef.current); };
  }, [active?.id, user?.id]);

  const openCheckIn = async () => {
    const { data } = await supabase.from("projects").select("id, name, code").eq("status", "active").order("name");
    setProjects(data || []);
    setOpen(true);
  };

  const checkIn = async () => {
    if (!user) return;
    setBusy(true);
    const pos = await getPosition();
    if (!pos) toast({ title: "Location not available", description: "Allow location access so your manager can see your route." });
    const { data, error } = await supabase.from("staff_attendance").insert({
      user_id: user.id,
      project_id: projectId === "none" ? null : projectId,
      check_in_lat: pos?.coords.latitude ?? null,
      check_in_lng: pos?.coords.longitude ?? null,
      notes: notes || null,
    }).select().single();
    setBusy(false);
    if (error) return toast({ title: "Check-in failed", description: error.message, variant: "destructive" });
    if (pos) {
      await supabase.from("staff_locations").insert({ user_id: user.id, attendance_id: data.id, latitude: pos.coords.latitude, longitude: pos.coords.longitude, accuracy: pos.coords.accuracy });
    }
    setActive(data); setOpen(false); setNotes(""); setProjectId("none");
    toast({ title: "Checked in", description: "Live location sharing is on." });
  };

  const checkOut = async () => {
    if (!active) return;
    setBusy(true);
    const pos = await getPosition();
    const { error } = await supabase.from("staff_attendance").update({
      check_out_at: new Date().toISOString(),
      check_out_lat: pos?.coords.latitude ?? null,
      check_out_lng: pos?.coords.longitude ?? null,
    }).eq("id", active.id);
    setBusy(false);
    if (error) return toast({ title: "Check-out failed", description: error.message, variant: "destructive" });
    setActive(null); lastRef.current = null;
    toast({ title: "Checked out", description: "Location sharing stopped." });
  };

  if (!user) return null;

  return (
    <>
      {active ? (
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={checkOut} disabled={busy}>
          {busy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Radio className="h-3 w-3 text-success animate-pulse" />}
          <span className="hidden sm:inline">Check Out</span>
          <LogOut className="h-3 w-3 sm:hidden" />
        </Button>
      ) : (
        <Button size="sm" className="h-8 text-xs gap-1.5" onClick={openCheckIn}>
          <LogIn className="h-3 w-3" /> <span className="hidden sm:inline">Check In</span>
        </Button>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Check In</DialogTitle>
            <DialogDescription>Your location will be shared live until you check out.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Project (optional)</Label>
              <Select value={projectId} onValueChange={setProjectId}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Service work / no project</SelectItem>
                  {projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.code ? `${p.code} — ` : ""}{p.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1" rows={2} />
            </div>
            <Button onClick={checkIn} disabled={busy} className="w-full">
              {busy && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Check In
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
