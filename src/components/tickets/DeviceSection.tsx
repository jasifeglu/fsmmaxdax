import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Search, HardDrive, Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface DeviceSectionProps {
  ticketId?: string;
  deviceId?: string;
  customerId?: string;
  onDeviceLinked?: (deviceId: string) => void;
  readOnly?: boolean;
}

export const DeviceSection = ({ ticketId, deviceId, customerId, onDeviceLinked, readOnly }: DeviceSectionProps) => {
  const { toast } = useToast();
  const [device, setDevice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [serviceHistory, setServiceHistory] = useState<any[]>([]);

  const [form, setForm] = useState({
    device_name: "", brand: "", model: "", serial_number: "", eid: "",
    installation_date: "", warranty_status: "Under Warranty",
  });

  useEffect(() => {
    if (deviceId) {
      supabase.from("devices").select("*").eq("id", deviceId).single()
        .then(({ data }) => { if (data) setDevice(data); });
      supabase.from("tickets").select("id, ticket_number, status, created_at, issue")
        .eq("device_id", deviceId).order("created_at", { ascending: false }).limit(10)
        .then(({ data }) => setServiceHistory(data || []));
    }
  }, [deviceId]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    const q = searchQuery.trim().toLowerCase();
    const { data } = await supabase.from("devices").select("*")
      .or(`serial_number.ilike.%${q}%,eid.ilike.%${q}%,device_name.ilike.%${q}%`)
      .limit(5) as any;
    setSearchResults(data || []);
    setSearching(false);
  };

  const handleLink = async (devId: string) => {
    if (!ticketId) { onDeviceLinked?.(devId); return; }
    await supabase.from("tickets").update({ device_id: devId } as any).eq("id", ticketId);
    onDeviceLinked?.(devId);
    toast({ title: "Device linked to ticket" });
  };

  const handleCreate = async () => {
    if (!form.device_name) return;
    setCreating(true);
    const { data, error } = await supabase.from("devices").insert({
      ...form,
      customer_id: customerId || null,
      installation_date: form.installation_date || null,
    } as any).select().single();
    setCreating(false);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    if (data) {
      setCreateOpen(false);
      handleLink((data as any).id);
      toast({ title: "Device created and linked" });
    }
  };

  if (device) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <HardDrive className="h-3.5 w-3.5" /> Linked Device / Asset
        </p>
        <div className="bg-muted/30 rounded-lg p-3 space-y-1.5 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-muted-foreground">Device:</span> <span className="font-medium">{device.device_name}</span></div>
            <div><span className="text-muted-foreground">Brand:</span> <span className="font-medium">{device.brand}</span></div>
            <div><span className="text-muted-foreground">Model:</span> <span className="font-medium">{device.model}</span></div>
            <div><span className="text-muted-foreground">Serial:</span> <span className="font-mono font-medium">{device.serial_number || "—"}</span></div>
            <div><span className="text-muted-foreground">EID:</span> <span className="font-mono font-medium">{device.eid || "—"}</span></div>
            <div><span className="text-muted-foreground">Warranty:</span> <span className="font-medium">{device.warranty_status}</span></div>
          </div>
          {serviceHistory.length > 1 && (
            <div className="pt-1.5 border-t border-border/50">
              <p className="text-[10px] text-muted-foreground mb-1">SERVICE HISTORY ({serviceHistory.length} tickets)</p>
              {serviceHistory.slice(0, 3).map(h => (
                <div key={h.id} className="flex justify-between text-[10px]">
                  <span className="font-mono text-primary">{h.ticket_number}</span>
                  <span>{h.status}</span>
                  <span className="text-muted-foreground">{new Date(h.created_at).toLocaleDateString("en-IN")}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (readOnly) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
        <HardDrive className="h-3.5 w-3.5" /> Link Device / Asset
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input placeholder="Search by Serial/EID/Name..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="pl-7 h-8 text-xs" />
        </div>
        <Button size="sm" variant="outline" className="h-8 text-xs" onClick={handleSearch} disabled={searching}>
          {searching ? <Loader2 className="h-3 w-3 animate-spin" /> : "Search"}
        </Button>
        <Button size="sm" variant="outline" className="h-8 text-xs gap-1" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3 w-3" /> New
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="space-y-1">
          {searchResults.map(d => (
            <div key={d.id} className="flex items-center justify-between p-2 rounded border border-border/50 text-xs bg-muted/20">
              <div>
                <span className="font-medium">{d.device_name}</span>
                <span className="text-muted-foreground ml-2">{d.brand} {d.model}</span>
                {d.serial_number && <span className="font-mono ml-2 text-muted-foreground">SN: {d.serial_number}</span>}
              </div>
              <Button size="sm" variant="default" className="h-6 text-[10px]" onClick={() => handleLink(d.id)}>Link</Button>
            </div>
          ))}
        </div>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>Register a new device/asset</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <div><Label className="text-xs">Device Name</Label><Input value={form.device_name} onChange={e => setForm({...form, device_name: e.target.value})} className="mt-1 h-8 text-xs" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Brand</Label><Input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="mt-1 h-8 text-xs" /></div>
              <div><Label className="text-xs">Model</Label><Input value={form.model} onChange={e => setForm({...form, model: e.target.value})} className="mt-1 h-8 text-xs" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Serial Number</Label><Input value={form.serial_number} onChange={e => setForm({...form, serial_number: e.target.value})} className="mt-1 h-8 text-xs" /></div>
              <div><Label className="text-xs">EID</Label><Input value={form.eid} onChange={e => setForm({...form, eid: e.target.value})} className="mt-1 h-8 text-xs" /></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label className="text-xs">Install Date</Label><Input type="date" value={form.installation_date} onChange={e => setForm({...form, installation_date: e.target.value})} className="mt-1 h-8 text-xs" /></div>
              <div><Label className="text-xs">Warranty</Label>
                <Select value={form.warranty_status} onValueChange={v => setForm({...form, warranty_status: v})}>
                  <SelectTrigger className="mt-1 h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Under Warranty">Under Warranty</SelectItem>
                    <SelectItem value="Out of Warranty">Out of Warranty</SelectItem>
                    <SelectItem value="Extended Warranty">Extended Warranty</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button onClick={handleCreate} disabled={creating} className="w-full h-8 text-xs">
              {creating && <Loader2 className="mr-1 h-3 w-3 animate-spin" />} Create Device
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
