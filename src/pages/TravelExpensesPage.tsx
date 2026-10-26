import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Loader2, Download, Car, Check, X, MapPin, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { formatINR } from "@/lib/formatINR";

const expenseTypes = ["fuel", "toll", "parking", "food", "lodging", "material", "other"];
const emptyForm = { expense_type: "fuel", expense_basis: "service", project_id: "", ticket_id: "", location: "", description: "", amount: "", distance_km: "", expense_date: new Date().toISOString().slice(0, 10) };

const StageBadge = ({ s }: { s: string }) => (
  <Badge variant={s === "approved" ? "default" : s === "rejected" ? "destructive" : "secondary"} className="text-[10px] capitalize">{s}</Badge>
);

const TravelExpensesPage = () => {
  const { toast } = useToast();
  const { user, role } = useAuth();
  const canApprove = ["admin", "manager", "hr"].includes(role);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [adjust, setAdjust] = useState<any | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    const [eRes, pRes, prRes, tRes] = await Promise.all([
      supabase.from("travel_expenses").select("*, projects(name)").order("created_at", { ascending: false }),
      supabase.from("profiles").select("id, full_name, email, reporting_manager_id"),
      supabase.from("projects").select("id, name, code").eq("status", "active").order("name"),
      supabase.from("tickets").select("id, ticket_number, customer_name").order("created_at", { ascending: false }).limit(100),
    ]);
    setExpenses(eRes.data || []);
    const n: Record<string, string> = {};
    (pRes.data || []).forEach((p: any) => { n[p.id] = p.full_name || p.email; });
    setNames(n);
    setTeamIds((pRes.data || []).filter((p: any) => p.reporting_manager_id === user?.id).map((p: any) => p.id));
    setProjects(prRes.data || []);
    setTickets(tRes.data || []);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, [user?.id]);

  // Cross-account live updates: new submissions and approval decisions by others appear instantly
  useEffect(() => {
    const ch = supabase
      .channel(`expenses-live-${user?.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "travel_expenses" }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user?.id]);

  const detectLocation = () => {
    navigator.geolocation?.getCurrentPosition(
      (p) => setForm((f: any) => ({ ...f, location: `${p.coords.latitude.toFixed(5)}, ${p.coords.longitude.toFixed(5)}` })),
      () => toast({ title: "Location not available", variant: "destructive" }),
    );
  };

  const handleCreate = async () => {
    const amount = Number(form.amount);
    if (!amount || amount <= 0) return toast({ title: "Please enter a valid amount", variant: "destructive" });
    if (form.expense_basis === "project" && !form.project_id) return toast({ title: "Please select a project", variant: "destructive" });
    setSaving(true);
    const { error } = await supabase.from("travel_expenses").insert({
      user_id: user!.id,
      expense_type: form.expense_type,
      expense_basis: form.expense_basis,
      project_id: form.expense_basis === "project" ? form.project_id : null,
      ticket_id: form.expense_basis === "service" && form.ticket_id ? form.ticket_id : null,
      location: form.location || null,
      description: form.description || null,
      amount,
      distance_km: form.distance_km ? Number(form.distance_km) : null,
      expense_date: form.expense_date,
    });
    setSaving(false);
    if (error) return toast({ title: "Error", description: error.message, variant: "destructive" });
    toast({ title: "Expense submitted", description: "Sent to your reporting manager for approval." });
    setDialogOpen(false); setForm(emptyForm); fetchAll();
  };

  const decide = async (e: any, stage: "manager" | "hr", status: "approved" | "rejected") => {
    const now = new Date().toISOString();
    const patch = stage === "manager"
      ? { manager_status: status, manager_by: user!.id, manager_at: now }
      : { hr_status: status, hr_by: user!.id, hr_at: now };
    const { error } = await supabase.from("travel_expenses").update(patch).eq("id", e.id);
    if (error) return toast({ title: "Action failed", description: error.message, variant: "destructive" });
    toast({ title: `Expense ${status}` });
    fetchAll();
  };

  const saveAdjust = async () => {
    const { error } = await supabase.from("travel_expenses").update({
      approved_amount: adjust.approved_amount === "" ? null : Number(adjust.approved_amount),
      admin_note: adjust.admin_note || null,
      manager_status: adjust.manager_status,
      hr_status: adjust.hr_status,
    }).eq("id", adjust.id);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: "Expense updated" });
    setAdjust(null); fetchAll();
  };

  const exportCSV = (rows: any[]) => {
    const headers = ["Date", "Staff", "Basis", "Project", "Type", "Location", "Description", "Amount", "Approved Amount", "Manager", "HR", "Status"];
    const body = rows.map((e) => [e.expense_date, names[e.user_id] || "", e.expense_basis, e.projects?.name || "", e.expense_type, e.location || "", e.description || "", e.amount, e.approved_amount ?? "", e.manager_status, e.hr_status, e.status]
      .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","));
    const blob = new Blob([[headers.join(","), ...body].join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `expenses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const mine = expenses.filter((e) => e.user_id === user?.id);
  const approvalQueue = expenses.filter((e) => {
    if (e.user_id === user?.id && role !== "admin") return false;
    if (role === "admin") return true;
    if (role === "hr") return e.manager_status === "approved" || teamIds.includes(e.user_id);
    if (role === "manager") return teamIds.includes(e.user_id);
    return false;
  });

  const ExpenseTable = ({ rows, approvals }: { rows: any[]; approvals?: boolean }) => (
    rows.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">No expenses here.</p> : (
      <div className="space-y-3">
        {rows.map((e) => {
          const canManager = approvals && e.manager_status === "pending" && (role === "admin" || teamIds.includes(e.user_id));
          const canHr = approvals && e.manager_status === "approved" && e.hr_status === "pending" && (role === "admin" || role === "hr");
          return (
            <div key={e.id} className="border rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  {approvals && <p className="text-sm font-medium">{names[e.user_id] || "Staff"}</p>}
                  <p className="text-xs text-muted-foreground capitalize">
                    {new Date(e.expense_date).toLocaleDateString()} · {e.expense_type} · {e.expense_basis === "project" ? `Project: ${e.projects?.name || "—"}` : "Service"}
                  </p>
                  {e.location && <p className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</p>}
                  {e.description && <p className="text-xs mt-1">{e.description}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className={`font-semibold ${e.approved_amount != null ? "line-through text-muted-foreground text-xs" : ""}`}>{formatINR(Number(e.amount))}</p>
                  {e.approved_amount != null && <p className="font-semibold">{formatINR(Number(e.approved_amount))}</p>}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px]">
                <span className="text-muted-foreground">Manager</span><StageBadge s={e.manager_status} />
                <span className="text-muted-foreground">HR</span><StageBadge s={e.hr_status} />
                {e.admin_note && <span className="text-muted-foreground">Admin: {e.admin_note}</span>}
                <div className="ml-auto flex gap-1.5">
                  {(canManager || canHr) && (
                    <>
                      <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => decide(e, canManager ? "manager" : "hr", "rejected")}><X className="h-3 w-3" /> Reject</Button>
                      <Button size="sm" className="h-7 text-xs gap-1" onClick={() => decide(e, canManager ? "manager" : "hr", "approved")}><Check className="h-3 w-3" /> {canManager ? "Manager approve" : "HR approve"}</Button>
                    </>
                  )}
                  {approvals && role === "admin" && (
                    <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => setAdjust({ ...e, approved_amount: e.approved_amount ?? "", admin_note: e.admin_note ?? "" })}><Pencil className="h-3 w-3" /> Check / Edit</Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    )
  );

  const total = mine.reduce((s, e) => s + Number(e.approved_amount ?? e.amount), 0);
  const pendingCount = approvalQueue.filter((e) => e.status === "pending").length;

  return (
    <div>
      <PageHeader title="Expenses" description="Project & service expenses with Manager → HR approval">
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportCSV(canApprove ? approvalQueue : mine)} className="gap-1.5"><Download className="h-3.5 w-3.5" /> CSV</Button>
          <Button size="sm" className="gap-1.5" onClick={() => setDialogOpen(true)}><Plus className="h-3.5 w-3.5" /> Add Expense</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card className="glass-card p-4"><div className="flex items-center gap-3"><Car className="h-7 w-7 text-primary" /><div><p className="text-xs text-muted-foreground">My total</p><p className="text-xl font-bold">{formatINR(total)}</p></div></div></Card>
        <Card className="glass-card p-4"><div><p className="text-xs text-muted-foreground">{canApprove ? "Awaiting approval" : "My entries"}</p><p className="text-xl font-bold">{canApprove ? pendingCount : mine.length}</p></div></Card>
      </div>

      {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : (
        <Tabs defaultValue={canApprove ? "approvals" : "mine"}>
          <TabsList>
            <TabsTrigger value="mine">My Expenses</TabsTrigger>
            {canApprove && <TabsTrigger value="approvals">Approvals {pendingCount > 0 && `(${pendingCount})`}</TabsTrigger>}
          </TabsList>
          <TabsContent value="mine"><Card className="glass-card"><CardContent className="pt-6"><ExpenseTable rows={mine} /></CardContent></Card></TabsContent>
          {canApprove && <TabsContent value="approvals"><Card className="glass-card"><CardContent className="pt-6"><ExpenseTable rows={approvalQueue} approvals /></CardContent></Card></TabsContent>}
        </Tabs>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle>Add Expense</DialogTitle><DialogDescription>Goes to your reporting manager, then HR.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Based on</Label>
                <Select value={form.expense_basis} onValueChange={(v) => setForm({ ...form, expense_basis: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="service">Service job</SelectItem><SelectItem value="project">Project</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs">Type</Label>
                <Select value={form.expense_type} onValueChange={(v) => setForm({ ...form, expense_type: v })}>
                  <SelectTrigger className="mt-1 capitalize"><SelectValue /></SelectTrigger>
                  <SelectContent>{expenseTypes.map((t) => <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {form.expense_basis === "project" ? (
              <div><Label className="text-xs">Project *</Label>
                <Select value={form.project_id} onValueChange={(v) => setForm({ ...form, project_id: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder={projects.length ? "Select project" : "No projects yet"} /></SelectTrigger>
                  <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={p.id}>{p.code ? `${p.code} — ` : ""}{p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            ) : (
              <div><Label className="text-xs">Service ticket (optional)</Label>
                <Select value={form.ticket_id} onValueChange={(v) => setForm({ ...form, ticket_id: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select ticket" /></SelectTrigger>
                  <SelectContent>{tickets.map((t) => <SelectItem key={t.id} value={t.id}>{t.ticket_number} — {t.customer_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div><Label className="text-xs">Location</Label>
              <div className="flex gap-2 mt-1">
                <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Place or site" />
                <Button type="button" size="icon" variant="outline" onClick={detectLocation} title="Use my location"><MapPin className="h-4 w-4" /></Button>
              </div>
            </div>
            <div><Label className="text-xs">Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1" /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs">Amount (₹) *</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Km</Label><Input type="number" value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: e.target.value })} className="mt-1" /></div>
              <div><Label className="text-xs">Date</Label><Input type="date" value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className="mt-1" /></div>
            </div>
            <Button onClick={handleCreate} disabled={saving} className="w-full">{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Submit Expense</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={!!adjust} onOpenChange={(o) => !o && setAdjust(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Admin Check</DialogTitle><DialogDescription>Change the approved value or override approvals.</DialogDescription></DialogHeader>
          {adjust && (
            <div className="space-y-3">
              <p className="text-sm">{names[adjust.user_id]} · claimed {formatINR(Number(adjust.amount))}</p>
              <div><Label className="text-xs">Approved amount (₹)</Label><Input type="number" className="mt-1" value={adjust.approved_amount} onChange={(e) => setAdjust({ ...adjust, approved_amount: e.target.value })} placeholder="Leave empty to use claimed amount" /></div>
              <div className="grid grid-cols-2 gap-3">
                {(["manager_status", "hr_status"] as const).map((k) => (
                  <div key={k}><Label className="text-xs">{k === "manager_status" ? "Manager" : "HR"}</Label>
                    <Select value={adjust[k]} onValueChange={(v) => setAdjust({ ...adjust, [k]: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div><Label className="text-xs">Admin note</Label><Input className="mt-1" value={adjust.admin_note} onChange={(e) => setAdjust({ ...adjust, admin_note: e.target.value })} /></div>
              <Button className="w-full" onClick={saveAdjust}>Save</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TravelExpensesPage;
