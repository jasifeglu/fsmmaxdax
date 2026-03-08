import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Filter, Loader2 } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const TicketsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  // New ticket form
  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", issue: "",
    category: "General", priority: "Medium",
  });

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
    // Realtime subscription
    const channel = supabase
      .channel("tickets-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => fetchTickets())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const generateTicketNumber = () => {
    const num = Math.floor(100000 + Math.random() * 900000);
    return `MXD-${num}`;
  };

  const handleCreate = async () => {
    if (!form.customer_name || !form.issue) return;
    setCreating(true);
    const { error } = await supabase.from("tickets").insert({
      ticket_number: generateTicketNumber(),
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      issue: form.issue,
      category: form.category,
      priority: form.priority,
      status: "New",
      created_by: user?.id,
    });
    setCreating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket created" });
      setDialogOpen(false);
      setForm({ customer_name: "", customer_phone: "", issue: "", category: "General", priority: "Medium" });
    }
  };

  const filtered = tickets.filter((t) => {
    const matchSearch = (t.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.ticket_number || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status?.toLowerCase() === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <PageHeader title="Service Tickets" description="Manage all service requests">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground gap-1.5">
              <Plus className="h-3.5 w-3.5" /> New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>Add a new service request</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Customer Name</Label>
                <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Issue</Label>
                <Textarea value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} className="mt-1" rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["General", "AC Repair", "Washing Machine", "Refrigerator", "Installation", "Plumbing", "Electrical", "Maintenance"].map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs">Priority</Label>
                  <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input placeholder="Search tickets..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="on-site">On-Site</SelectItem>
                <SelectItem value="work-in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No tickets found. Create your first ticket!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b">
                    <th className="text-left py-2 font-medium">Ticket</th>
                    <th className="text-left py-2 font-medium">Customer</th>
                    <th className="text-left py-2 font-medium hidden md:table-cell">Issue</th>
                    <th className="text-left py-2 font-medium">Status</th>
                    <th className="text-left py-2 font-medium hidden sm:table-cell">Priority</th>
                    <th className="text-left py-2 font-medium hidden lg:table-cell">Assignee</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => (
                    <tr key={t.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      <td className="py-2.5 font-mono text-xs text-primary">{t.ticket_number}</td>
                      <td className="py-2.5">
                        <div>
                          <span className="font-medium">{t.customer_name}</span>
                          {t.customer_phone && <span className="block text-xs text-muted-foreground">{t.customer_phone}</span>}
                        </div>
                      </td>
                      <td className="py-2.5 text-muted-foreground hidden md:table-cell max-w-48 truncate">{t.issue}</td>
                      <td className="py-2.5"><StatusBadge status={t.status} /></td>
                      <td className="py-2.5 hidden sm:table-cell"><StatusBadge status={t.priority} /></td>
                      <td className="py-2.5 text-muted-foreground hidden lg:table-cell">{t.assignee_name || "Unassigned"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketsPage;
