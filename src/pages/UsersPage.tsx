import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserCog, Plus, Shield, Trash2, Loader2, KeyRound, Ban, CheckCircle, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  is_disabled: boolean;
}

interface ResetLog {
  id: string;
  admin_name: string;
  target_user_name: string;
  action: string;
  reason: string;
  created_at: string;
}

const UsersPage = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [resetLogs, setResetLogs] = useState<ResetLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<UserData | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState("technician");
  const [tempPassword, setTempPassword] = useState("");
  const [resetReason, setResetReason] = useState("");
  const [resetting, setResetting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "list_users" },
    });
    if (error) {
      toast({ title: "Error", description: "Failed to fetch users", variant: "destructive" });
    } else {
      setUsers(data.users || []);
    }
    setLoading(false);
  };

  const fetchLogs = async () => {
    const { data } = await supabase.functions.invoke("admin-users", {
      body: { action: "get_reset_logs" },
    });
    if (data?.logs) setResetLogs(data.logs);
  };

  useEffect(() => { fetchUsers(); fetchLogs(); }, []);

  const handleCreate = async () => {
    if (!newEmail || !newName || !newPassword) return;
    setCreating(true);
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "create_user", email: newEmail, full_name: newName, role: newRole, password: newPassword },
    });
    setCreating(false);
    if (error || data?.error) {
      toast({ title: "Error", description: data?.error || "Failed to create user", variant: "destructive" });
    } else {
      toast({ title: "User created", description: `${newName} can now login with email & password` });
      setDialogOpen(false);
      setNewEmail(""); setNewName(""); setNewPassword(""); setNewRole("technician");
      fetchUsers();
    }
  };

  const handleDelete = async (userId: string, name: string) => {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "delete_user", user_id: userId },
    });
    if (error || data?.error) {
      toast({ title: "Error", description: data?.error || "Failed to delete", variant: "destructive" });
    } else {
      toast({ title: "User deleted", description: `${name} has been removed` });
      fetchUsers();
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "update_role", user_id: userId, role },
    });
    if (error || data?.error) {
      toast({ title: "Error", description: data?.error || "Failed to update role", variant: "destructive" });
    } else {
      toast({ title: "Role updated" });
      fetchUsers();
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget || !tempPassword) return;
    setResetting(true);
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action: "reset_password", user_id: resetTarget.id, temp_password: tempPassword, reason: resetReason },
    });
    setResetting(false);
    if (error || data?.error) {
      toast({ title: "Error", description: data?.error || "Failed to reset password", variant: "destructive" });
    } else {
      toast({ title: "Password reset", description: `Temporary password set for ${resetTarget.full_name}. User will be notified.` });
      setResetDialogOpen(false);
      setTempPassword(""); setResetReason(""); setResetTarget(null);
      fetchLogs();
    }
  };

  const handleToggleDisable = async (user: UserData) => {
    const action = user.is_disabled ? "enable_user" : "disable_user";
    const { data, error } = await supabase.functions.invoke("admin-users", {
      body: { action, user_id: user.id },
    });
    if (error || data?.error) {
      toast({ title: "Error", description: data?.error || "Failed to update account", variant: "destructive" });
    } else {
      toast({ title: user.is_disabled ? "Account enabled" : "Account disabled" });
      fetchUsers(); fetchLogs();
    }
  };

  const openResetDialog = (user: UserData) => {
    setResetTarget(user);
    setTempPassword("");
    setResetReason("");
    setResetDialogOpen(true);
  };

  const actionLabel = (a: string) => {
    if (a === 'reset') return 'Password Reset';
    if (a === 'disable') return 'Account Disabled';
    if (a === 'enable') return 'Account Enabled';
    return a;
  };

  const actionColor = (a: string) => {
    if (a === 'reset') return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
    if (a === 'disable') return 'bg-destructive/10 text-destructive';
    if (a === 'enable') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
    return '';
  };

  return (
    <div>
      <PageHeader title="User Management" description="Create, manage users, reset passwords and assign roles">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-primary text-primary-foreground gap-1.5">
              <Plus className="h-3.5 w-3.5" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New User</DialogTitle>
              <DialogDescription>User will login with email and password</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div><Label className="text-xs">Full Name</Label><Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter full name" className="mt-1" /></div>
              <div><Label className="text-xs">Email</Label><Input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="user@example.com" className="mt-1" /></div>
              <div><Label className="text-xs">Password</Label><Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Set a password" className="mt-1" /></div>
              <div>
                <Label className="text-xs">Role</Label>
                <Select value={newRole} onValueChange={setNewRole}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="coordinator">Coordinator</SelectItem>
                    <SelectItem value="technician">Technician</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreate} disabled={creating} className="w-full">
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create User
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Reset Password Dialog */}
      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4" /> Reset Password</DialogTitle>
            <DialogDescription>Set a temporary password for {resetTarget?.full_name}. The user will be notified.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs">Temporary Password</Label>
              <Input type="password" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} placeholder="Min 8 characters" className="mt-1" />
              <p className="text-[11px] text-muted-foreground mt-1">User must change this after login</p>
            </div>
            <div>
              <Label className="text-xs">Reason (Optional)</Label>
              <Textarea value={resetReason} onChange={(e) => setResetReason(e.target.value)} placeholder="Why is this reset needed?" className="mt-1 h-20" />
            </div>
            <Button onClick={handleResetPassword} disabled={resetting || tempPassword.length < 8} className="w-full">
              {resetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Reset Password
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-1.5"><UserCog className="h-3.5 w-3.5" /> Users</TabsTrigger>
          <TabsTrigger value="logs" className="gap-1.5"><History className="h-3.5 w-3.5" /> Security Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="glass-card">
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : (
                <div className="space-y-4 md:hidden">
                  {users.map((u) => (
                    <div key={u.id} className="border rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{u.full_name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{u.email}</p>
                        </div>
                        {u.is_disabled ? (
                          <Badge variant="destructive" className="text-[10px]">Disabled</Badge>
                        ) : (
                          <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">Active</Badge>
                        )}
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Role</Label>
                        <Select value={u.role} onValueChange={(val) => handleRoleChange(u.id, val)}>
                          <SelectTrigger className="w-full h-8 text-xs mt-1">
                            <Shield className="h-3 w-3 mr-1" /><SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="coordinator">Coordinator</SelectItem>
                            <SelectItem value="technician">Technician</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="text-xs h-8 gap-1 flex-1" onClick={() => openResetDialog(u)}>
                          <KeyRound className="h-3 w-3" /> Change Password
                        </Button>
                        <Button variant="outline" size="sm" className={`text-xs h-8 gap-1 ${u.is_disabled ? 'text-emerald-600' : 'text-amber-600'}`} onClick={() => handleToggleDisable(u)}>
                          {u.is_disabled ? <><CheckCircle className="h-3 w-3" /> Enable</> : <><Ban className="h-3 w-3" /> Disable</>}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="sm" className="text-xs h-8 text-destructive hover:text-destructive gap-1">
                              <Trash2 className="h-3 w-3" /> Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User</AlertDialogTitle>
                              <AlertDialogDescription>Remove {u.full_name || u.email}? This cannot be undone.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(u.id, u.full_name)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="overflow-x-auto hidden md:block">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs border-b">
                        <th className="text-left py-2 font-medium">Name</th>
                        <th className="text-left py-2 font-medium">Email</th>
                        <th className="text-left py-2 font-medium">Status</th>
                        <th className="text-left py-2 font-medium">Role</th>
                        <th className="text-left py-2 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 font-medium">{u.full_name || "—"}</td>
                          <td className="py-2.5 text-muted-foreground">{u.email}</td>
                          <td className="py-2.5">
                            {u.is_disabled ? (
                              <Badge variant="destructive" className="text-[10px]">Disabled</Badge>
                            ) : (
                              <Badge className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100">Active</Badge>
                            )}
                          </td>
                          <td className="py-2.5">
                            <Select value={u.role} onValueChange={(val) => handleRoleChange(u.id, val)}>
                              <SelectTrigger className="w-32 h-7 text-xs">
                                <Shield className="h-3 w-3 mr-1" /><SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="coordinator">Coordinator</SelectItem>
                                <SelectItem value="technician">Technician</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="py-2.5">
                            <div className="flex items-center gap-1.5">
                              <Button variant="outline" size="sm" className="text-xs h-7 gap-1" onClick={() => openResetDialog(u)} title="Change Password">
                                <KeyRound className="h-3 w-3" /> Change Password
                              </Button>
                              <Button variant="ghost" size="sm" className={`text-xs h-7 ${u.is_disabled ? 'text-emerald-600' : 'text-amber-600'}`} onClick={() => handleToggleDisable(u)} title={u.is_disabled ? "Enable Account" : "Disable Account"}>
                                {u.is_disabled ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-xs h-7 text-destructive hover:text-destructive">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete User</AlertDialogTitle>
                                    <AlertDialogDescription>Remove {u.full_name || u.email}? This cannot be undone.</AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDelete(u.id, u.full_name)}>Delete</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card className="glass-card">
            <CardContent className="pt-6">
              {resetLogs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No security actions recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-muted-foreground text-xs border-b">
                        <th className="text-left py-2 font-medium">Date</th>
                        <th className="text-left py-2 font-medium">Admin</th>
                        <th className="text-left py-2 font-medium">Action</th>
                        <th className="text-left py-2 font-medium">Target User</th>
                        <th className="text-left py-2 font-medium">Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resetLogs.map((log) => (
                        <tr key={log.id} className="border-b border-border/50">
                          <td className="py-2.5 text-muted-foreground text-xs">{new Date(log.created_at).toLocaleString()}</td>
                          <td className="py-2.5 font-medium">{log.admin_name}</td>
                          <td className="py-2.5"><Badge className={`text-[10px] ${actionColor(log.action)}`}>{actionLabel(log.action)}</Badge></td>
                          <td className="py-2.5">{log.target_user_name}</td>
                          <td className="py-2.5 text-muted-foreground text-xs">{log.reason || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UsersPage;
