import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Users, Plus, Loader2, Clock, User } from "lucide-react";

interface MultiTechnicianSectionProps {
  ticketId: string;
}

export const MultiTechnicianSection = ({ ticketId }: MultiTechnicianSectionProps) => {
  const { role, user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const [form, setForm] = useState({
    user_id: "", role: "Lead", assignment_type: "sequential",
  });

  const canManage = role === "admin" || role === "coordinator";

  const fetchData = async () => {
    const [assignRes, techRes, rolesRes] = await Promise.all([
      supabase.from("ticket_technicians").select("*").eq("ticket_id", ticketId).order("sequence_order") as any,
      supabase.from("profiles").select("id, full_name"),
      supabase.from("user_roles").select("user_id").eq("role", "technician"),
    ]);
    setAssignments(assignRes.data || []);
    const techIds = new Set((rolesRes.data || []).map((r: any) => r.user_id));
    setTechnicians((techRes.data || []).filter((t: any) => techIds.has(t.id)));
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [ticketId]);

  const handleAdd = async () => {
    if (!form.user_id) return;
    setAdding(true);
    const techName = technicians.find(t => t.id === form.user_id)?.full_name || "";
    const nextOrder = assignments.length + 1;
    const { error } = await supabase.from("ticket_technicians").insert({
      ticket_id: ticketId,
      user_id: form.user_id,
      role: form.role,
      assignment_type: form.assignment_type,
      sequence_order: nextOrder,
    } as any);
    setAdding(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setShowAdd(false);
    setForm({ user_id: "", role: "Lead", assignment_type: "sequential" });
    fetchData();
    toast({ title: `Technician added` });
  };

  const handleUpdateLog = async (id: string, field: string, value: string) => {
    await supabase.from("ticket_technicians").update({ [field]: value } as any).eq("id", id);
    fetchData();
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" /> Technician Assignments ({assignments.length})
        </p>
        {canManage && (
          <Button size="sm" variant="ghost" className="h-6 text-[10px] gap-1" onClick={() => setShowAdd(!showAdd)}>
            <Plus className="h-3 w-3" /> Add Tech
          </Button>
        )}
      </div>

      {showAdd && canManage && (
        <div className="bg-muted/20 rounded-lg p-2 space-y-2 border border-border/30">
          <div className="grid grid-cols-3 gap-2">
            <div>
              <Label className="text-[10px]">Technician</Label>
              <Select value={form.user_id} onValueChange={v => setForm({...form, user_id: v})}>
                <SelectTrigger className="mt-0.5 h-7 text-[10px]"><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>{technicians.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px]">Role</Label>
              <Select value={form.role} onValueChange={v => setForm({...form, role: v})}>
                <SelectTrigger className="mt-0.5 h-7 text-[10px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead">Lead</SelectItem>
                  <SelectItem value="Assistant">Assistant</SelectItem>
                  <SelectItem value="Specialist">Specialist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-[10px]">Type</Label>
              <Select value={form.assignment_type} onValueChange={v => setForm({...form, assignment_type: v})}>
                <SelectTrigger className="mt-0.5 h-7 text-[10px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="team">Team</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleAdd} disabled={adding} size="sm" className="w-full h-7 text-[10px]">
            {adding && <Loader2 className="mr-1 h-3 w-3 animate-spin" />} Add Technician
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-2"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
      ) : assignments.length === 0 ? (
        <p className="text-[10px] text-muted-foreground text-center py-1">No additional technicians assigned</p>
      ) : (
        <div className="space-y-1.5">
          {assignments.map((a, i) => {
            const techName = technicians.find(t => t.id === a.user_id)?.full_name || "Unknown";
            const isOwnAssignment = a.user_id === user?.id;
            const canLog = isOwnAssignment || canManage;

            return (
              <div key={a.id} className="p-2 rounded border border-border/30 bg-muted/10 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3 text-muted-foreground" />
                  <span className="font-medium">{techName}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{a.role}</span>
                  <span className="text-[10px] text-muted-foreground">#{a.sequence_order} · {a.assignment_type}</span>
                </div>
                {(a.checkin_time || a.checkout_time) && (
                  <div className="flex gap-3 text-[10px] text-muted-foreground">
                    {a.checkin_time && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> In: {new Date(a.checkin_time).toLocaleString("en-IN", { timeStyle: "short", dateStyle: "short" })}</span>}
                    {a.checkout_time && <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" /> Out: {new Date(a.checkout_time).toLocaleString("en-IN", { timeStyle: "short", dateStyle: "short" })}</span>}
                  </div>
                )}
                {a.work_performed && <p className="text-[10px]"><span className="text-muted-foreground">Work:</span> {a.work_performed}</p>}
                {a.notes && <p className="text-[10px]"><span className="text-muted-foreground">Notes:</span> {a.notes}</p>}

                {canLog && !a.checkout_time && (
                  <div className="flex gap-1 pt-1">
                    {!a.checkin_time && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px]"
                        onClick={() => handleUpdateLog(a.id, "checkin_time", new Date().toISOString())}>
                        Check In
                      </Button>
                    )}
                    {a.checkin_time && !a.checkout_time && (
                      <Button size="sm" variant="outline" className="h-6 text-[10px]"
                        onClick={() => handleUpdateLog(a.id, "checkout_time", new Date().toISOString())}>
                        Check Out
                      </Button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
