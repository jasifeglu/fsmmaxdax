import { useState, useEffect, useMemo } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Search, Loader2, Download, Filter, ChevronLeft, ChevronRight,
  Shield, User, Settings, Ticket, Package, DollarSign, FileText,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

interface AuditLog {
  id: string;
  user_name: string;
  user_role: string;
  action: string;
  module: string;
  description: string;
  record_id: string;
  previous_value: string;
  new_value: string;
  reason: string;
  device_info: string;
  ip_address: string;
  created_at: string;
}

const MODULES = [
  "All", "Auth", "Tickets", "Customers", "Inventory", "Billing",
  "Users", "Settings", "Vendors", "Devices", "Schedule", "Reports",
  "Profile", "Incentives", "Expenses",
];

const ACTIONS = [
  "All", "login", "logout", "create", "update", "delete",
  "assign", "status_change", "upload", "password_reset",
  "role_change", "settings_change", "view", "export",
];

const PAGE_SIZE = 25;

const moduleIcon = (mod: string) => {
  const m = mod.toLowerCase();
  if (m === "tickets") return <Ticket className="h-3 w-3" />;
  if (m === "users" || m === "auth") return <User className="h-3 w-3" />;
  if (m === "settings") return <Settings className="h-3 w-3" />;
  if (m === "inventory") return <Package className="h-3 w-3" />;
  if (m === "billing") return <DollarSign className="h-3 w-3" />;
  return <FileText className="h-3 w-3" />;
};

const actionColor = (action: string) => {
  if (action === "create") return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  if (action === "delete") return "bg-destructive/10 text-destructive";
  if (action === "update" || action === "status_change") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  if (action === "login" || action === "logout") return "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-400";
  if (action === "password_reset" || action === "role_change") return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  return "bg-muted text-muted-foreground";
};

const roleBadge = (role: string) => {
  if (role === "admin") return "bg-primary/10 text-primary";
  if (role === "coordinator") return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  return "bg-muted text-muted-foreground";
};

const AuditLogsPage = () => {
  const { toast } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [roleFilter, setRoleFilter] = useState("All");
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [detailLog, setDetailLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    let query = supabase
      .from("audit_logs")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (moduleFilter !== "All") query = query.eq("module", moduleFilter);
    if (actionFilter !== "All") query = query.eq("action", actionFilter);
    if (roleFilter !== "All") query = query.eq("user_role", roleFilter);
    if (search) query = query.or(`description.ilike.%${search}%,record_id.ilike.%${search}%,user_name.ilike.%${search}%`);

    const { data, count, error } = await query;
    if (error) {
      toast({ title: "Error", description: "Failed to fetch audit logs", variant: "destructive" });
    } else {
      setLogs((data as AuditLog[]) || []);
      setTotalCount(count || 0);
    }
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [page, moduleFilter, actionFilter, roleFilter, search]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  const handleExport = () => {
    if (logs.length === 0) return;
    const headers = ["Date", "User", "Role", "Action", "Module", "Description", "Record ID", "Previous Value", "New Value", "Device"];
    const rows = logs.map((l) => [
      new Date(l.created_at).toLocaleString(),
      l.user_name, l.user_role, l.action, l.module, l.description,
      l.record_id, l.previous_value, l.new_value, l.device_info,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${(c || "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <PageHeader title="Activity Logs & Audit Trail" description="Track all user actions, system events, and configuration changes">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={handleExport} disabled={logs.length === 0}>
          <Download className="h-3.5 w-3.5" /> Export CSV
        </Button>
      </PageHeader>

      {/* Filters */}
      <Card className="glass-card mb-4">
        <CardContent className="pt-4 pb-3">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label className="text-xs text-muted-foreground">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by user, description, record ID..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(0); }}
                  className="pl-8 h-9 text-sm"
                />
              </div>
            </div>
            <div className="w-[140px]">
              <Label className="text-xs text-muted-foreground">Module</Label>
              <Select value={moduleFilter} onValueChange={(v) => { setModuleFilter(v); setPage(0); }}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODULES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[140px]">
              <Label className="text-xs text-muted-foreground">Action</Label>
              <Select value={actionFilter} onValueChange={(v) => { setActionFilter(v); setPage(0); }}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTIONS.map((a) => <SelectItem key={a} value={a}>{a === "All" ? "All" : a.replace("_", " ")}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="w-[130px]">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <Select value={roleFilter} onValueChange={(v) => { setRoleFilter(v); setPage(0); }}>
                <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coordinator">Coordinator</SelectItem>
                  <SelectItem value="technician">Technician</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Log Detail Dialog */}
      <Dialog open={!!detailLog} onOpenChange={(o) => !o && setDetailLog(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-4 w-4" /> Log Details
            </DialogTitle>
          </DialogHeader>
          {detailLog && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><p className="text-[11px] text-muted-foreground">Date & Time</p><p className="font-medium">{new Date(detailLog.created_at).toLocaleString()}</p></div>
                <div><p className="text-[11px] text-muted-foreground">User</p><p className="font-medium">{detailLog.user_name}</p></div>
                <div><p className="text-[11px] text-muted-foreground">Role</p><Badge className={`text-[10px] ${roleBadge(detailLog.user_role)}`}>{detailLog.user_role}</Badge></div>
                <div><p className="text-[11px] text-muted-foreground">Action</p><Badge className={`text-[10px] ${actionColor(detailLog.action)}`}>{detailLog.action}</Badge></div>
                <div><p className="text-[11px] text-muted-foreground">Module</p><p className="font-medium flex items-center gap-1">{moduleIcon(detailLog.module)} {detailLog.module}</p></div>
                <div><p className="text-[11px] text-muted-foreground">Record ID</p><p className="font-mono text-xs break-all">{detailLog.record_id || "—"}</p></div>
              </div>
              <div><p className="text-[11px] text-muted-foreground">Description</p><p>{detailLog.description}</p></div>
              {detailLog.previous_value && <div><p className="text-[11px] text-muted-foreground">Previous Value</p><p className="bg-destructive/5 rounded p-2 text-xs font-mono break-all">{detailLog.previous_value}</p></div>}
              {detailLog.new_value && <div><p className="text-[11px] text-muted-foreground">New Value</p><p className="bg-emerald-50 dark:bg-emerald-900/10 rounded p-2 text-xs font-mono break-all">{detailLog.new_value}</p></div>}
              {detailLog.reason && <div><p className="text-[11px] text-muted-foreground">Reason</p><p>{detailLog.reason}</p></div>}
              {detailLog.device_info && <div><p className="text-[11px] text-muted-foreground">Device Info</p><p className="text-xs text-muted-foreground break-all">{detailLog.device_info}</p></div>}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Logs Table */}
      <Card className="glass-card">
        <CardContent className="pt-4">
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-12 text-sm">No audit logs found.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground text-xs border-b">
                      <th className="text-left py-2 font-medium">Date & Time</th>
                      <th className="text-left py-2 font-medium">User</th>
                      <th className="text-left py-2 font-medium">Action</th>
                      <th className="text-left py-2 font-medium">Module</th>
                      <th className="text-left py-2 font-medium">Description</th>
                      <th className="text-left py-2 font-medium">Record</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr
                        key={log.id}
                        className="border-b border-border/50 hover:bg-muted/30 transition-colors cursor-pointer"
                        onClick={() => setDetailLog(log)}
                      >
                        <td className="py-2 text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-xs">{log.user_name}</span>
                            <Badge className={`text-[9px] px-1 py-0 ${roleBadge(log.user_role)}`}>{log.user_role}</Badge>
                          </div>
                        </td>
                        <td className="py-2">
                          <Badge className={`text-[10px] ${actionColor(log.action)}`}>{log.action.replace("_", " ")}</Badge>
                        </td>
                        <td className="py-2">
                          <span className="flex items-center gap-1 text-xs">{moduleIcon(log.module)} {log.module}</span>
                        </td>
                        <td className="py-2 text-xs max-w-[280px] truncate">{log.description}</td>
                        <td className="py-2 text-xs font-mono text-muted-foreground max-w-[100px] truncate">{log.record_id || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalCount)} of {totalCount}
                </p>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page === 0} onClick={() => setPage(page - 1)}>
                    <ChevronLeft className="h-3 w-3 mr-1" /> Previous
                  </Button>
                  <span className="text-xs text-muted-foreground">Page {page + 1} of {totalPages || 1}</span>
                  <Button variant="outline" size="sm" className="h-7 text-xs" disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>
                    Next <ChevronRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLogsPage;
