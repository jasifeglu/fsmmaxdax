import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props { userId: string; users: { id: string; full_name: string; role: string }[]; className?: string }

/** Admin picks who approves this staff member's expenses first. */
export const ReportingManagerSelect = ({ userId, users, className }: Props) => {
  const { toast } = useToast();
  const [value, setValue] = useState("none");

  useEffect(() => {
    supabase.from("profiles").select("reporting_manager_id").eq("id", userId).maybeSingle()
      .then(({ data }) => setValue(data?.reporting_manager_id || "none"));
  }, [userId]);

  const change = async (v: string) => {
    setValue(v);
    const { error } = await supabase.from("profiles").update({ reporting_manager_id: v === "none" ? null : v }).eq("id", userId);
    if (error) toast({ title: "Could not set manager", description: error.message, variant: "destructive" });
    else toast({ title: "Reporting manager updated" });
  };

  const candidates = users.filter((u) => u.id !== userId && ["manager", "admin", "hr", "coordinator"].includes(u.role));
  return (
    <Select value={value} onValueChange={change}>
      <SelectTrigger className={className ?? "w-36 h-7 text-xs"}><SelectValue placeholder="Manager" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="none">No manager</SelectItem>
        {candidates.map((u) => <SelectItem key={u.id} value={u.id}>{u.full_name}</SelectItem>)}
      </SelectContent>
    </Select>
  );
};
