import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings as SettingsIcon, Bell, Tag, Receipt, Camera, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const SettingsPage = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const { data } = await supabase.from("app_settings").select("*");
      const map: Record<string, string> = {};
      (data || []).forEach((s: any) => { map[s.key] = s.value; });
      setSettings(map);
      setLoading(false);
    };
    fetchSettings();
  }, []);

  const updateSetting = async (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    const { error } = await supabase
      .from("app_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key);
    if (error) {
      toast({ title: "Error saving", description: error.message, variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
    );
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="System configuration and preferences" />

      <div className="space-y-6">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2"><Camera className="h-4 w-4" /> Feature Toggles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Selfie Check-In</p>
                <p className="text-xs text-muted-foreground">Require technicians to take a selfie when checking in</p>
              </div>
              <Switch
                checked={settings.selfie_checkin_enabled === "true"}
                onCheckedChange={(checked) => updateSetting("selfie_checkin_enabled", checked ? "true" : "false")}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Travel Expense Tracking</p>
                <p className="text-xs text-muted-foreground">Allow technicians to log travel expenses</p>
              </div>
              <Switch
                checked={settings.travel_expense_enabled === "true"}
                onCheckedChange={(checked) => updateSetting("travel_expense_enabled", checked ? "true" : "false")}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2"><Receipt className="h-4 w-4" /> Tax Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">GST Rate (%)</Label>
                <Input
                  value={settings.gst_rate || "18"}
                  onChange={(e) => updateSetting("gst_rate", e.target.value)}
                  className="h-9 text-sm mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">GSTIN</Label>
                <Input
                  value={settings.gstin || ""}
                  onChange={(e) => updateSetting("gstin", e.target.value)}
                  className="h-9 text-sm mt-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center gap-2"><Tag className="h-4 w-4" /> Service Categories</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {["AC Repair", "Washing Machine", "Refrigerator", "Installation", "Plumbing", "Electrical"].map((cat) => (
              <div key={cat} className="flex items-center justify-between py-1.5">
                <span className="text-sm">{cat}</span>
                <Switch defaultChecked />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
