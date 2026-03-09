import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Filter, Loader2, Eye } from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { calculateDistanceCharge, getProductServiceCharge } from "@/lib/distanceChargeUtils";
import { formatINR } from "@/lib/formatINR";
import { TicketDetailDialog } from "@/components/tickets/TicketDetailDialog";

const CATEGORIES = [
  "General", "AC Repair", "Washing Machine", "Refrigerator", "Installation",
  "Plumbing", "Electrical", "Maintenance", "CCTV", "Home Automation",
  "Video Door Phone", "Networking", "Gates & Shutters", "Smart Locks",
];

const TICKET_STATUSES = [
  "New", "Assigned", "Scheduled", "On-Site Attempt", "Pickup Required",
  "Sent to Vendor", "Vendor Repairing", "Awaiting Return", "Returned from Vendor",
  "Reinstallation", "Testing", "Completed", "Closed",
];

const TicketsPage = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [detailTicket, setDetailTicket] = useState<any | null>(null);
  const [products, setProducts] = useState<any[]>([]);

  const [form, setForm] = useState({
    customer_name: "", customer_phone: "", issue: "",
    category: "General", priority: "Medium",
    product_id: "", customer_address: "",
    customer_latitude: "", customer_longitude: "",
    complaint_description: "", customer_explanation: "",
  });

  const fetchTickets = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("tickets").select("*").order("created_at", { ascending: false });
    if (!error) setTickets(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
    supabase.from("product_catalog").select("id, name, service_price, hsn_sac_code, category").eq("is_active", true).order("name")
      .then(({ data }) => setProducts(data || []));
    const channel = supabase.channel("tickets-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tickets" }, () => fetchTickets())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const generateTicketNumber = () => `MXD-${Math.floor(100000 + Math.random() * 900000)}`;

  const handleCreate = async () => {
    if (!form.customer_name.trim()) {
      toast({ title: "Validation Error", description: "Customer name is required", variant: "destructive" });
      return;
    }
    if (!form.issue.trim()) {
      toast({ title: "Validation Error", description: "Issue summary is required", variant: "destructive" });
      return;
    }
    setCreating(true);

    let serviceCharge = 0;
    let distanceKm: number | null = null;
    let distanceCharge = 0;

    if (form.product_id) {
      const pc = await getProductServiceCharge(form.product_id);
      serviceCharge = pc.price;
    }

    if (form.customer_latitude && form.customer_longitude) {
      distanceKm = 15;
      const dc = await calculateDistanceCharge(distanceKm);
      distanceCharge = dc.charge;
    }

    const { error } = await supabase.from("tickets").insert({
      ticket_number: generateTicketNumber(),
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      issue: form.issue,
      category: form.category,
      priority: form.priority,
      status: "New",
      created_by: user?.id,
      product_id: form.product_id || null,
      customer_address: form.customer_address,
      customer_latitude: form.customer_latitude ? Number(form.customer_latitude) : null,
      customer_longitude: form.customer_longitude ? Number(form.customer_longitude) : null,
      service_charge: serviceCharge,
      distance_km: distanceKm,
      distance_charge: distanceCharge,
      complaint_description: form.complaint_description,
      customer_explanation: form.customer_explanation,
    } as any);

    setCreating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket created" });
      setDialogOpen(false);
      setForm({ customer_name: "", customer_phone: "", issue: "", category: "General", priority: "Medium", product_id: "", customer_address: "", customer_latitude: "", customer_longitude: "", complaint_description: "", customer_explanation: "" });
    }
  };

  const handleProductSelect = (productId: string) => {
    const p = products.find(pr => pr.id === productId);
    setForm(f => ({ ...f, product_id: productId, ...(p?.category ? { category: p.category } : {}) }));
  };

  const filtered = tickets.filter((t) => {
    const matchSearch = (t.customer_name || "").toLowerCase().includes(search.toLowerCase()) ||
      (t.ticket_number || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || t.status?.toLowerCase().replace(/\s+/g, "-") === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <PageHeader title="Service Tickets" description="Manage all service requests">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground gap-1.5"><Plus className="h-3.5 w-3.5" /> New Ticket</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>Add a new service request</DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Customer Name</Label>
                <Input value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} className="mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Phone</Label>
                  <Input value={form.customer_phone} onChange={(e) => setForm({ ...form, customer_phone: e.target.value })} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Product</Label>
                  <Select value={form.product_id} onValueChange={handleProductSelect}>
                    <SelectTrigger className="mt-1"><SelectValue placeholder="Select product" /></SelectTrigger>
                    <SelectContent>{products.map(p => <SelectItem key={p.id} value={p.id}>{p.name} — {formatINR(Number(p.service_price))}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs">Customer Address</Label>
                <Input value={form.customer_address} onChange={(e) => setForm({ ...form, customer_address: e.target.value })} className="mt-1" placeholder="Full address for navigation" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Latitude</Label>
                  <Input value={form.customer_latitude} onChange={(e) => setForm({ ...form, customer_latitude: e.target.value })} className="mt-1" placeholder="e.g. 19.076" />
                </div>
                <div>
                  <Label className="text-xs">Longitude</Label>
                  <Input value={form.customer_longitude} onChange={(e) => setForm({ ...form, customer_longitude: e.target.value })} className="mt-1" placeholder="e.g. 72.877" />
                </div>
              </div>
              <div>
                <Label className="text-xs">Issue Summary</Label>
                <Textarea value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} className="mt-1" rows={2} />
              </div>
              <div>
                <Label className="text-xs">Detailed Complaint Description</Label>
                <Textarea value={form.complaint_description} onChange={(e) => setForm({ ...form, complaint_description: e.target.value })} className="mt-1" rows={2} placeholder="Detailed problem description..." />
              </div>
              <div>
                <Label className="text-xs">Customer Explanation</Label>
                <Textarea value={form.customer_explanation} onChange={(e) => setForm({ ...form, customer_explanation: e.target.value })} className="mt-1" rows={2} placeholder="What the customer described..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Category</Label>
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
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
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Create Ticket
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
              <SelectTrigger className="w-44 h-9 text-sm"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {TICKET_STATUSES.map(s => (
                  <SelectItem key={s} value={s.toLowerCase().replace(/\s+/g, "-")}>{s}</SelectItem>
                ))}
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
                    <th className="text-left py-2 font-medium">Actions</th>
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
                      <td className="py-2.5">
                        <StatusBadge status={t.status} />
                        {t.delay_category && <StatusBadge status={t.delay_category} className="ml-1" />}
                      </td>
                      <td className="py-2.5 hidden sm:table-cell"><StatusBadge status={t.priority} /></td>
                      <td className="py-2.5 text-muted-foreground hidden lg:table-cell">{t.assignee_name || "Unassigned"}</td>
                      <td className="py-2.5">
                        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => setDetailTicket(t)}>
                          <Eye className="h-3 w-3" /> View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <TicketDetailDialog ticket={detailTicket} onClose={() => setDetailTicket(null)} onRefresh={() => { fetchTickets(); setDetailTicket(null); }} />
    </div>
  );
};

export default TicketsPage;
