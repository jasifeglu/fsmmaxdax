import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Zap, MapPin, Star, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const haversine = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

interface Props {
  ticket: any;
  onAssigned?: () => void;
}

interface Suggestion {
  id: string;
  name: string;
  distance: number | null;
  skillMatch: boolean;
  activeJobs: number;
  score: number;
}

export const SmartDispatchPanel = ({ ticket, onAssigned }: Props) => {
  const { toast } = useToast();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [assigning, setAssigning] = useState<string | null>(null);

  const computeSuggestions = async () => {
    setLoading(true);
    const [techRes, skillsRes, rolesRes, ticketsRes] = await Promise.all([
      supabase.from("profiles").select("id, full_name"),
      supabase.from("technician_skills").select("*"),
      supabase.from("user_roles").select("user_id, role").eq("role", "technician"),
      supabase.from("tickets").select("assigned_to").in("status", ["Assigned", "Scheduled", "On-Site", "Work-In-Progress"]),
    ]);

    const techIds = new Set((rolesRes.data || []).map((r: any) => r.user_id));
    const techs = (techRes.data || []).filter((t: any) => techIds.has(t.id));
    const skills = skillsRes.data || [];
    const activeTickets = ticketsRes.data || [];

    const jobCounts: Record<string, number> = {};
    activeTickets.forEach((t: any) => { if (t.assigned_to) jobCounts[t.assigned_to] = (jobCounts[t.assigned_to] || 0) + 1; });

    const results: Suggestion[] = techs.map((tech: any) => {
      const skill = skills.find((s: any) => s.user_id === tech.id);
      const activeJobs = jobCounts[tech.id] || 0;

      let distance: number | null = null;
      if (ticket.customer_latitude && ticket.customer_longitude && skill?.home_latitude && skill?.home_longitude) {
        distance = haversine(Number(skill.home_latitude), Number(skill.home_longitude), Number(ticket.customer_latitude), Number(ticket.customer_longitude));
      }

      const skillMatch = skill?.skill_category ? ticket.category?.toLowerCase().includes(skill.skill_category.toLowerCase()) : false;
      const maxJobs = skill?.max_daily_jobs || 6;

      // Scoring: lower is better
      let score = 0;
      score += distance != null ? distance * 2 : 50; // proximity
      score += skillMatch ? 0 : 20; // skill match
      score += activeJobs * 10; // availability
      score += activeJobs >= maxJobs ? 100 : 0; // overloaded

      return { id: tech.id, name: tech.full_name, distance, skillMatch, activeJobs, score };
    });

    results.sort((a, b) => a.score - b.score);
    setSuggestions(results.slice(0, 5));
    setLoading(false);
  };

  useEffect(() => { computeSuggestions(); }, [ticket.id]);

  const handleAssign = async (techId: string, techName: string) => {
    setAssigning(techId);
    const { error } = await supabase.from("tickets").update({
      assigned_to: techId,
      assignee_name: techName,
      status: "Assigned",
    }).eq("id", ticket.id);

    setAssigning(null);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Assigned to ${techName}` });
      onAssigned?.();
    }
  };

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" /> Smart Dispatch Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
        ) : suggestions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No technicians available.</p>
        ) : (
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <div key={s.id} className="flex items-center gap-3 p-2 rounded-lg border border-border/50 bg-background hover:bg-muted/30 transition-colors">
                <Badge variant={i === 0 ? "default" : "outline"} className="h-6 w-6 flex items-center justify-center p-0 rounded-full text-[10px]">
                  {i + 1}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium">{s.name}</p>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    {s.distance != null && <span className="flex items-center gap-0.5"><MapPin className="h-2.5 w-2.5" />{s.distance.toFixed(1)} km</span>}
                    {s.skillMatch && <span className="flex items-center gap-0.5 text-success"><Star className="h-2.5 w-2.5" />Skill match</span>}
                    <span className="flex items-center gap-0.5"><Clock className="h-2.5 w-2.5" />{s.activeJobs} active jobs</span>
                  </div>
                </div>
                <Button size="sm" variant={i === 0 ? "default" : "outline"} className="h-7 text-xs" onClick={() => handleAssign(s.id, s.name)} disabled={!!assigning}>
                  {assigning === s.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Assign"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
