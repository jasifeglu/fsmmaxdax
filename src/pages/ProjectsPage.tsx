import { useEffect, useRef, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Loader2, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const empty = { name: "", code: "", location: "", latitude: "", longitude: "", status: "active", zoho_project_id: "" };

const parseCSV = (text: string) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];
  const split = (l: string) => l.match(/("([^"]|"")*"|[^,]*)(,|$)/g)!.map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"').trim());
  const headers = split(lines[0]).map((h) => h.toLowerCase());
  return lines.slice(1).map((l) => {
    const cells = split(l);
    const get = (...keys: string[]) => { const i = headers.findIndex((h) => keys.some((k) => h.includes(k))); return i >= 0 ? cells[i] : ""; };
    return {
      name: get("project name", "name"),
      code: get("code", "key") || null,
      location: get("location", "address", "site") || null,
      latitude: Number(get("lat")) || null,
      longitude: Number(get("lng", "long")) || null,
      zoho_project_id: get("project id", "zoho", "id") || null,
      status: /closed|completed|archived/i.test(get("status")) ? "closed" : "active",
    };
  }).filter((r) => r.name);
};

const ProjectsPage = () => {
  const { role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(empty);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("projects").select("*").order("created_at", { ascending: false });
    setProjects(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.name.trim()) return toast({ title: "Project name is required", variant: "destructive" });
    setSaving(true);
    const row = {
      name: form.name.trim(), code: form.code || null, location: form.location || null,
      latitude: form.latitude === "" ? null : Number(form.latitude),
      longitude: form.longitude === "" ? null : Number(form.longitude),
      status: form.status, zoho_project_id: form.zoho_project_id || null,
    };
    const { error } = editId
      ? await supabase.from("projects").update(row).eq("id", editId)
      : await supabase.from("projects").insert(row);
    setSaving(false);
    if (error) return toast({ title: "Save failed", description: error.message, variant: "destructive" });
    toast({ title: editId ? "Project updated" : "Project added" });
    setOpen(false); load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    load();
  };

  const importFile = async (file: File) => {
    const rows = parseCSV(await file.text());
    if (!rows.length) return toast({ title: "No projects found", description: "CSV needs a header row with a 'Project Name' column.", variant: "destructive" });
    const { error } = await supabase.from("projects").insert(rows);
    if (error) return toast({ title: "Import failed", description: error.message, variant: "destructive" });
    toast({ title: `Imported ${rows.length} projects` });
    load();
  };

  return (
    <div>
      <PageHeader title="Projects" description="Project list for project-team check-ins and expenses">
        {isAdmin && (
          <div className="flex gap-2">
            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) importFile(f); e.target.value = ""; }} />
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => fileRef.current?.click()}>
              <Upload className="h-3.5 w-3.5" /> Import CSV
            </Button>
            <Button size="sm" className="gap-1.5" onClick={() => { setEditId(null); setForm(empty); setOpen(true); }}>
              <Plus className="h-3.5 w-3.5" /> Add Project
            </Button>
          </div>
        )}
      </PageHeader>
      {isAdmin && <p className="text-xs text-muted-foreground mb-4">Tip: export your project list from Zoho Projects as CSV and import it here. Automatic Zoho sync can be connected later.</p>}

      <Card className="glass-card">
        <CardContent className="pt-6">
          {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            : projects.length === 0 ? <p className="text-center text-sm text-muted-foreground py-8">No projects yet.</p>
            : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="text-muted-foreground text-xs border-b">
                    <th className="text-left py-2 font-medium">Project</th>
                    <th className="text-left py-2 font-medium hidden sm:table-cell">Location</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    {isAdmin && <th className="text-right py-2 font-medium">Actions</th>}
                  </tr></thead>
                  <tbody>
                    {projects.map((p) => (
                      <tr key={p.id} className="border-b border-border/50">
                        <td className="py-2.5"><div className="font-medium">{p.name}</div>{p.code && <div className="text-[11px] text-muted-foreground font-mono">{p.code}</div>}</td>
                        <td className="py-2.5 text-muted-foreground hidden sm:table-cell">{p.location || "—"}</td>
                        <td className="py-2.5"><Badge variant={p.status === "active" ? "default" : "secondary"} className="text-[10px] capitalize">{p.status}</Badge></td>
                        {isAdmin && (
                          <td className="py-2.5 text-right whitespace-nowrap">
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => { setEditId(p.id); setForm({ ...empty, ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, v ?? ""])) }); setOpen(true); }}><Pencil className="h-3.5 w-3.5" /></Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => remove(p.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editId ? "Edit Project" : "Add Project"}</DialogTitle><DialogDescription>Project details and site location</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs">Name *</Label><Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Code</Label><Input className="mt-1" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} /></div>
              <div><Label className="text-xs">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs">Site location</Label><Input className="mt-1" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs">Latitude</Label><Input type="number" className="mt-1" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} /></div>
              <div><Label className="text-xs">Longitude</Label><Input type="number" className="mt-1" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} /></div>
            </div>
            <div><Label className="text-xs">Zoho Project ID</Label><Input className="mt-1" value={form.zoho_project_id} onChange={(e) => setForm({ ...form, zoho_project_id: e.target.value })} /></div>
            <Button className="w-full" onClick={save} disabled={saving}>{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsPage;
