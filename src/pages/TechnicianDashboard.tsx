import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { motion } from "framer-motion";
import { MapPin, Clock, Camera, CheckCircle2, Navigation, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const TechnicianDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [availability, setAvailability] = useState("available");
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selfieEnabled, setSelfieEnabled] = useState(true);
  const [selfieDialogOpen, setSelfieDialogOpen] = useState(false);
  const [selfieTicketId, setSelfieTicketId] = useState<string | null>(null);
  const [capturing, setCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("tickets")
        .select("*")
        .eq("assigned_to", user?.id)
        .in("status", ["Assigned", "Scheduled", "On-Site Attempt", "Reinstallation", "Testing"])
        .order("scheduled_at", { ascending: true });
      setJobs(data || []);
      setLoading(false);
    };

    const fetchSettings = async () => {
      const { data } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "selfie_checkin_enabled")
        .single();
      if (data) setSelfieEnabled(data.value === "true");
    };

    fetchJobs();
    fetchSettings();
  }, [user?.id]);

  const startCamera = async (ticketId: string) => {
    setSelfieTicketId(ticketId);
    setSelfieDialogOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      toast({ title: "Camera access denied", variant: "destructive" });
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setSelfieDialogOpen(false);
  };

  const captureSelfie = async () => {
    if (!videoRef.current || !user?.id || !selfieTicketId) return;
    setCapturing(true);

    // Capture photo from video
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.8));

    // Get GPS
    let lat: number | null = null, lng: number | null = null;
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      lat = pos.coords.latitude;
      lng = pos.coords.longitude;
    } catch { /* GPS optional */ }

    // Upload photo
    const path = `${user.id}/checkins/${Date.now()}.jpg`;
    const { error: uploadError } = await supabase.storage.from("uploads").upload(path, blob);
    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setCapturing(false);
      return;
    }

    // Save check-in record (store the path, not a public URL)
    await supabase.from("selfie_checkins").insert({
      user_id: user.id,
      ticket_id: selfieTicketId,
      checkin_type: "check_in",
      selfie_url: path,
      latitude: lat,
      longitude: lng,
    });

    toast({ title: "Checked in successfully!" });
    setCapturing(false);
    stopCamera();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader title="My Jobs" description="Today's assigned work">
        <Select value={availability} onValueChange={setAvailability}>
          <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="available">🟢 Available</SelectItem>
            <SelectItem value="on-job">🟡 On Job</SelectItem>
            <SelectItem value="offline">🔴 Offline</SelectItem>
          </SelectContent>
        </Select>
      </PageHeader>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : jobs.length === 0 ? (
        <Card className="glass-card">
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No jobs assigned to you right now.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs.map((job, i) => (
            <motion.div key={job.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="glass-card overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-primary">{job.ticket_number}</span>
                      <StatusBadge status={job.status} />
                      <StatusBadge status={job.priority} />
                    </div>
                    {job.scheduled_at && (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {new Date(job.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    )}
                  </div>
                  <CardTitle className="text-base mt-1">{job.customer_name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{job.issue}</p>
                  {job.customer_phone && (
                    <div className="flex items-start gap-2 mb-3 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                      <span>{job.customer_phone}</span>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                    {selfieEnabled && (
                      <Button size="sm" variant="outline" className="text-xs h-8 gap-1.5" onClick={() => startCamera(job.id)}>
                        <Camera className="h-3 w-3" /> Check-In
                      </Button>
                    )}
                    <Button size="sm" className="text-xs h-8 ml-auto bg-primary text-primary-foreground">
                      Update Status
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Selfie Check-in Dialog */}
      <Dialog open={selfieDialogOpen} onOpenChange={(open) => { if (!open) stopCamera(); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Selfie Check-In</DialogTitle>
            <DialogDescription>Take a selfie to confirm your presence at the job site</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-lg bg-muted aspect-[4/3] object-cover" />
            <Button onClick={captureSelfie} disabled={capturing} className="w-full">
              {capturing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Camera className="mr-2 h-4 w-4" />}
              {capturing ? "Capturing..." : "Capture & Check In"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
