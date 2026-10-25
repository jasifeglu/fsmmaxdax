import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, LogIn, LogOut, Radio, MapPinOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  id: string;
  user_id: string;
  check_in_at: string;
  check_out_at: string | null;
  check_in_lat: number | null;
  notes: string | null;
  staff_name: string;
  last_seen: string | null;
};

/** Today's check-in / check-out records with last GPS ping — shown on management dashboards. */
export const AttendanceTodayPanel = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const start = new Date(new Date().toLocaleDateString("en-CA")).toISOString(); // local midnight
    const [attRes, locRes, profRes] = await Promise.all([
      supabase.from("staff_attendance")
        .select("id, user_id, check_in_at, check_out_at, check_in_lat, notes")
        .gte("check_in_at", start)
        .order("check_in_at", { ascending: false }),
      supabase.from("staff_locations")
        .select("user_id, recorded_at")
        .gte("recorded_at", start)
        .order("recorded_at", { ascending: false })
        .limit(2000),
      supabase.from("profiles").select("id, full_name"),
    ]);
    const names: Record<string, string> = {};
    (profRes.data || []).forEach((p: any) => { names[p.id] = p.full_name || "Staff"; });
    const lastSeen: Record<string, string> = {};
    const seen: Record<string, boolean> = {};
    (locRes.data || []).forEach((l: any) => {
      if (!seen[l.user_id]) { lastSeen[l.user_id] = l.recorded_at; seen[l.user_id] = true; }
    });
    setRows((attRes.data || []).map((a: any) => ({
      ...a,
      staff_name: names[a.user_id] || "Unknown staff",
      last_seen: lastSeen[a.user_id] || null,
    })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const ch = supabase
      .channel(`attendance-today-${Date.now().toString(36)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "staff_attendance" }, () => load())
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "staff_locations" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const liveCount = rows.filter(r => !r.check_out_at).length;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <span>📋 Attendance Today</span>
          <span className="text-xs text-muted-foreground font-normal">{liveCount} checked in now</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : rows.length === 0 ? (
          <p className="text-xs text-muted-foreground py-4 text-center">
            No check-ins yet today. Staff appear here once they check in (web or Android app).
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-2 font-medium">Staff</th>
                  <th className="text-left py-2 font-medium">Check In</th>
                  <th className="text-left py-2 font-medium">Check Out</th>
                  <th className="text-left py-2 font-medium">GPS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-medium">{r.staff_name}</td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center gap-1.5">
                        <LogIn className="h-3 w-3 text-success" />
                        {new Date(r.check_in_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </td>
                    <td className="py-2.5">
                      {r.check_out_at ? (
                        <span className="inline-flex items-center gap-1.5">
                          <LogOut className="h-3 w-3 text-muted-foreground" />
                          {new Date(r.check_out_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      ) : (
                        <Badge className="text-[10px] gap-1"><Radio className="h-3 w-3" /> Live</Badge>
                      )}
                    </td>
                    <td className="py-2.5 text-xs text-muted-foreground">
                      {r.last_seen
                        ? `Last ping ${new Date(r.last_seen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                        : <span className="inline-flex items-center gap-1"><MapPinOff className="h-3 w-3" /> No GPS yet</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
