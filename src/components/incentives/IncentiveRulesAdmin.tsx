import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface IncentiveRule {
  id: string;
  name: string;
  type: string;
  description: string;
  metric: string;
  target_value: number;
  reward_value: number;
  reward_unit: string;
  is_active: boolean;
}

const typeLabels: Record<string, string> = {
  performance_bonus: "Performance Bonus",
  revenue_commission: "Revenue Commission",
  quality_bonus: "Quality Bonus",
  speed_bonus: "Speed Bonus",
  attendance_bonus: "Attendance Bonus",
};

const metricLabels: Record<string, string> = {
  completed_tickets: "Completed Tickets",
  revenue_generated: "Revenue Generated (₹)",
  avg_rating: "Average Rating",
  avg_completion_hours: "Avg Completion (hrs)",
  on_time_rate: "On-Time Rate (%)",
  first_fix_rate: "First Fix Rate (%)",
};

const emptyRule: Omit<IncentiveRule, "id"> = {
  name: "", type: "performance_bonus", description: "", metric: "completed_tickets",
  target_value: 0, reward_value: 0, reward_unit: "fixed", is_active: true,
};

export const IncentiveRulesAdmin = () => {
  const [rules, setRules] = useState<IncentiveRule[]>([]);
  const [editing, setEditing] = useState<IncentiveRule | null>(null);
  const [form, setForm] = useState(emptyRule);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchRules = async () => {
    const { data } = await supabase.from("incentive_rules").select("*").order("created_at");
    if (data) setRules(data as IncentiveRule[]);
  };

  useEffect(() => { fetchRules(); }, []);

  const openNew = () => { setEditing(null); setForm(emptyRule); setDialogOpen(true); };
  const openEdit = (rule: IncentiveRule) => {
    setEditing(rule);
    setForm({ name: rule.name, type: rule.type, description: rule.description || "", metric: rule.metric, target_value: rule.target_value, reward_value: rule.reward_value, reward_unit: rule.reward_unit, is_active: rule.is_active });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!form.name) return;
    if (editing) {
      await supabase.from("incentive_rules").update(form).eq("id", editing.id);
    } else {
      await supabase.from("incentive_rules").insert(form);
    }
    toast({ title: editing ? "Rule updated" : "Rule created" });
    setDialogOpen(false);
    fetchRules();
  };

  const remove = async (id: string) => {
    await supabase.from("incentive_rules").delete().eq("id", id);
    toast({ title: "Rule deleted" });
    fetchRules();
  };

  const toggleActive = async (rule: IncentiveRule) => {
    await supabase.from("incentive_rules").update({ is_active: !rule.is_active }).eq("id", rule.id);
    fetchRules();
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium">⚙️ Incentive Rules</CardTitle>
        <Button size="sm" className="gap-1.5 h-8 text-xs" onClick={openNew}>
          <Plus className="h-3.5 w-3.5" /> Add Rule
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rules.map((rule) => (
            <div key={rule.id} className={cn("flex items-center gap-3 rounded-lg border p-3 transition-colors", !rule.is_active && "opacity-50")}>
              <Switch checked={rule.is_active} onCheckedChange={() => toggleActive(rule)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{rule.name}</p>
                <p className="text-xs text-muted-foreground">
                  {typeLabels[rule.type]} · Target: {rule.target_value} ({metricLabels[rule.metric]}) → Reward: {rule.reward_unit === "percentage" ? `${rule.reward_value}%` : formatINR(rule.reward_value)}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(rule)}>
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => remove(rule.id)}>
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
          {rules.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No incentive rules configured yet.</p>}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Rule" : "Create Rule"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 pt-2">
              <div>
                <Label className="text-xs">Rule Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Monthly Ticket Target" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Type</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(typeLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Metric</Label>
                  <Select value={form.metric} onValueChange={(v) => setForm({ ...form, metric: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(metricLabels).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs">Target Value</Label>
                  <Input type="number" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs">Reward Value</Label>
                  <Input type="number" value={form.reward_value} onChange={(e) => setForm({ ...form, reward_value: Number(e.target.value) })} />
                </div>
                <div>
                  <Label className="text-xs">Reward Unit</Label>
                  <Select value={form.reward_unit} onValueChange={(v) => setForm({ ...form, reward_unit: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed (₹)</SelectItem>
                      <SelectItem value="percentage">Percentage (%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Optional description" />
              </div>
              <Button className="w-full" onClick={save}>{editing ? "Update" : "Create"} Rule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};
