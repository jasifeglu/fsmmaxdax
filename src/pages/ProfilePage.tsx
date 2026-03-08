import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import {
  User, Mail, Shield, Calendar, Edit, Save, Loader2, Lock, Camera,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";

const roleLabels: Record<string, string> = { admin: "Administrator", coordinator: "Service Coordinator", technician: "Field Technician" };

const ProfilePage = () => {
  const { user, role, userName, avatarUrl, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);
  const [pwDialogOpen, setPwDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setFullName(userName || "");
    }
  }, [user, userName]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, updated_at: new Date().toISOString() })
      .eq("id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated" });
      setEditOpen(false);
      refreshProfile();
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPw(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password changed successfully" });
      setNewPassword("");
      setPwDialogOpen(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file", description: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast({ title: "File too large", description: "Max 2MB allowed", variant: "destructive" });
      return;
    }

    setUploading(true);
    const ext = file.name.split(".").pop() || "jpg";
    const path = `${user.id}/avatar.${ext}`;

    // Upload (overwrite existing)
    const { error: uploadError } = await supabase.storage
      .from("uploads")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      toast({ title: "Upload failed", description: uploadError.message, variant: "destructive" });
      setUploading(false);
      return;
    }

    // Save path in profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: path, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    setUploading(false);
    if (updateError) {
      toast({ title: "Error", description: updateError.message, variant: "destructive" });
    } else {
      toast({ title: "Profile picture updated" });
      refreshProfile();
    }

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const initials = fullName ? fullName.split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase() : "U";

  return (
    <div className="max-w-2xl">
      <PageHeader title="My Profile" description="View and manage your personal information">
        <div className="flex gap-2">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Edit className="h-3.5 w-3.5" /> Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Edit Profile</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">Full Name</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" />
                </div>
                <Button onClick={handleSave} disabled={saving} className="w-full">
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={pwDialogOpen} onOpenChange={setPwDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Change Password</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-xs">New Password</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 8 characters" className="mt-1" />
                </div>
                <Button onClick={handleChangePassword} disabled={changingPw} className="w-full">
                  {changingPw && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Password
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </PageHeader>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="relative group">
                <Avatar className="h-16 w-16 border-4 border-primary/20">
                  {avatarUrl && <AvatarImage src={avatarUrl} alt={fullName} />}
                  <AvatarFallback className="text-xl font-bold bg-primary/10 text-primary">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                  ) : (
                    <Camera className="h-5 w-5 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <div>
                <h2 className="text-lg font-bold text-foreground">{fullName || "User"}</h2>
                <p className="text-sm text-muted-foreground">{roleLabels[role]}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Hover avatar to change photo</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                { icon: Mail, label: "Email", value: email },
                { icon: Shield, label: "Role", value: roleLabels[role] },
                { icon: Calendar, label: "Member Since", value: user?.created_at ? new Date(user.created_at).toLocaleDateString() : "—" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-sm">
                  <item.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground w-28">{item.label}</span>
                  <span className="font-medium text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
