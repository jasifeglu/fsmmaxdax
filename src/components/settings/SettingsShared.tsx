import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

export const useSettings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase.from("app_settings").select("*");
      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
      setLoading(false);
    };
    fetch();
  }, []);

  const update = useCallback(async (key: string, value: string) => {
    const previousValue = settings[key] || "";
    setSettings(prev => ({ ...prev, [key]: value }));
    const { error } = await supabase
      .from("app_settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    } else {
      // Log settings change to audit trail
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("audit_logs").insert({
          user_id: user.id,
          user_name: user.user_metadata?.full_name || user.email || "",
          user_role: "",
          action: "settings_change",
          module: "Settings",
          description: `Changed setting "${key}"`,
          record_id: key,
          previous_value: previousValue,
          new_value: value,
          device_info: navigator.userAgent.slice(0, 120),
        });
      }
    }
  }, [toast, settings]);

  return { settings, loading, update };
};

// Reusable field components
export const SettingInput = ({ label, desc, settingKey, settings, update, type = "text", placeholder }: {
  label: string; desc?: string; settingKey: string;
  settings: Record<string, string>; update: (k: string, v: string) => void;
  type?: string; placeholder?: string;
}) => (
  <div>
    <Label className="text-xs font-medium">{label}</Label>
    {desc && <p className="text-[11px] text-muted-foreground mb-1">{desc}</p>}
    <Input
      type={type}
      value={settings[settingKey] || ""}
      onChange={(e) => update(settingKey, e.target.value)}
      placeholder={placeholder}
      className="h-9 text-sm mt-1"
    />
  </div>
);

export const SettingToggle = ({ label, desc, settingKey, settings, update }: {
  label: string; desc?: string; settingKey: string;
  settings: Record<string, string>; update: (k: string, v: string) => void;
}) => (
  <div className="flex items-center justify-between py-2">
    <div className="pr-4">
      <p className="text-sm font-medium">{label}</p>
      {desc && <p className="text-xs text-muted-foreground">{desc}</p>}
    </div>
    <Switch
      checked={settings[settingKey] === "true"}
      onCheckedChange={(c) => update(settingKey, c ? "true" : "false")}
    />
  </div>
);

export const SettingSection = ({ icon, title, desc, children }: {
  icon: React.ReactNode; title: string; desc?: string; children: React.ReactNode;
}) => (
  <Card className="glass-card">
    <CardHeader className="pb-3">
      <CardTitle className="text-sm font-medium flex items-center gap-2">{icon} {title}</CardTitle>
      {desc && <CardDescription className="text-xs">{desc}</CardDescription>}
    </CardHeader>
    <CardContent className="space-y-4">{children}</CardContent>
  </Card>
);
