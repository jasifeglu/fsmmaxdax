import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Clock, Plus, Loader2 } from "lucide-react";

interface TicketTimelineProps {
  ticketId: string;
}

export const TicketTimeline = ({ ticketId }: TicketTimelineProps) => {
  const { user, userName } = useAuth();
  const { toast } = useToast();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);

  const fetchEntries = async () => {
    const { data } = await supabase.from("ticket_timeline").select("*")
      .eq("ticket_id", ticketId).order("created_at", { ascending: false }) as any;
    setEntries(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, [ticketId]);

  const handleAdd = async () => {
    if (!note.trim() || !user) return;
    setAdding(true);
    const { error } = await supabase.from("ticket_timeline").insert({
      ticket_id: ticketId,
      user_id: user.id,
      user_name: userName,
      action: "note",
      description: note.trim(),
    } as any);
    setAdding(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setNote("");
    fetchEntries();
  };

  const actionIcons: Record<string, string> = {
    note: "📝", status_change: "🔄", assigned: "👤", vendor_update: "🏢",
    checkin: "📍", checkout: "✅", photo: "📷",
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <Clock className="h-3.5 w-3.5" /> Activity Timeline
      </p>

      <div className="flex gap-2">
        <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Add a note..."
          className="text-xs flex-1" rows={1} />
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1 self-end" onClick={handleAdd} disabled={adding || !note.trim()}>
          {adding ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />} Add
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-3"><Loader2 className="h-4 w-4 animate-spin text-primary" /></div>
      ) : entries.length === 0 ? (
        <p className="text-[10px] text-muted-foreground text-center py-2">No activity yet</p>
      ) : (
        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {entries.map(e => (
            <div key={e.id} className="flex gap-2 p-2 rounded border border-border/30 bg-muted/10 text-xs">
              <span>{actionIcons[e.action] || "📝"}</span>
              <div className="flex-1 min-w-0">
                <p>{e.description}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {e.user_name} · {new Date(e.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
