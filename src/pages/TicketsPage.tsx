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
import { WhatsAppPanel } from "@/components/WhatsAppPanel";
import { SmartDispatchPanel } from "@/components/tickets/SmartDispatchPanel";
import { Separator } from "@/components/ui/separator";
import { calculateDistanceCharge, getProductServiceCharge } from "@/lib/distanceChargeUtils";
import { formatINR } from "@/lib/formatINR";

const CATEGORIES = [
  "General", "AC Repair", "Washing Machine", "Refrigerator", "Installation",
  "Plumbing", "Electrical", "Maintenance", "CCTV", "Home Automation",
  "Video Door Phone", "Networking", "Gates & Shutters", "Smart Locks",
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
    if (!form.customer_name || !form.issue) return;
    setCreating(true);

    let serviceCharge = 0;
    let distanceKm: number | null = null;
    let distanceCharge = 0;

    // Auto-fill service charge from product
    if (form.product_id) {
      const pc = await getProductServiceCharge(form.product_id);
      serviceCharge = pc.price;
    }

    // Calculate distance charge if coordinates provided
    if (form.customer_latitude && form.customer_longitude) {
      // Use a default base (Mumbai) for now – in production this would be the assigned tech's home
      distanceKm = 15; // placeholder until tech assigned
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
    } as any);

    setCreating(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Ticket created" });
      setDialogOpen(false);
      setForm({ customer_name: "", customer_phone: "", issue: "", category: "General", priority: "Medium", product_id: "", customer_address: "", customer_latitude: "", customer_longitude: "" });
    }
  };

  const handleProductSelect = (productId: string) => {
    setForm(f => ({ ...f, product_id: productId }));
    const p = products.find(pr => pr.id === productId);
    if (p?.category) {
      setForm(f => ({ ...f, product_id: productId, category: p.category }));
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
                <Label className="text-xs">Issue</Label>
                <Textarea value={form.issue} onChange={(e) => setForm({ ...form, issue: e.target.value })} className="mt-1" rows={2} />
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
              <SelectTrigger className="w-40 h-9 text-sm"><Filter className="h-3.5 w-3.5 mr-1.5" /><SelectValue placeholder="Status" /></SelectTrigger>
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
                      <td className="py-2.5"><StatusBadge status={t.status} /></td>
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

      {/* Ticket Detail Dialog */}
      <Dialog open={!!detailTicket} onOpenChange={(open) => { if (!open) setDetailTicket(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          {detailTicket && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <span className="font-mono text-primary">{detailTicket.ticket_number}</span>
                  <StatusBadge status={detailTicket.status} />
                  <StatusBadge status={detailTicket.priority} />
                </DialogTitle>
                <DialogDescription>{detailTicket.issue}</DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs text-muted-foreground">Customer</p><p className="font-medium">{detailTicket.customer_name}</p></div>
                  <div><p className="text-xs text-muted-foreground">Phone</p><p className="font-medium">{detailTicket.customer_phone || "—"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Category</p><p className="font-medium">{detailTicket.category}</p></div>
                  <div><p className="text-xs text-muted-foreground">Assigned To</p><p className="font-medium">{detailTicket.assignee_name || "Unassigned"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Created</p><p className="font-medium">{new Date(detailTicket.created_at).toLocaleDateString("en-IN", { dateStyle: "medium" })}</p></div>
                  <div><p className="text-xs text-muted-foreground">Scheduled</p><p className="font-medium">{detailTicket.scheduled_at ? new Date(detailTicket.scheduled_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "Not scheduled"}</p></div>
                </div>

                {/* Charges breakdown */}
                {(detailTicket.service_charge > 0 || detailTicket.distance_charge > 0) && (
                  <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">CHARGE BREAKDOWN</p>
                    {detailTicket.service_charge > 0 && (
                      <div className="flex justify-between text-xs"><span>Service Charge</span><span className="font-mono">{formatINR(Number(detailTicket.service_charge))}</span></div>
                    )}
                    {detailTicket.distance_km && (
                      <div className="flex justify-between text-xs"><span>Distance ({Number(detailTicket.distance_km).toFixed(1)} km)</span><span className="font-mono">{formatINR(Number(detailTicket.distance_charge))}</span></div>
                    )}
                    <div className="flex justify-between text-xs font-semibold border-t border-border pt-1">
                      <span>Total</span><span className="font-mono">{formatINR(Number(detailTicket.service_charge || 0) + Number(detailTicket.distance_charge || 0))}</span>
                    </div>
                  </div>
                )}

                {detailTicket.customer_latitude && (
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1" asChild>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${detailTicket.customer_latitude},${detailTicket.customer_longitude}`} target="_blank" rel="noopener noreferrer">
                      Navigate to Customer →
                    </a>
                  </Button>
                )}

                {detailTicket.notes && (
                  <div><p className="text-xs text-muted-foreground">Notes</p><p className="text-sm mt-0.5">{detailTicket.notes}</p></div>
                )}

                <Separator />

                {/* Smart Dispatch */}
                {(!detailTicket.assigned_to || detailTicket.status === "New") && (
                  <>
                    <SmartDispatchPanel ticket={detailTicket} onAssigned={() => { fetchTickets(); setDetailTicket(null); }} />
                    <Separator />
                  </>
                )}

                <WhatsAppPanel ticket={detailTicket} />
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TicketsPage;
