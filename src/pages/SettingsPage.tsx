import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Bell, Shield, Tag, Receipt } from "lucide-react";

const SettingsPage = () => (
  <div className="max-w-3xl">
    <PageHeader title="Settings" description="System configuration and preferences" />

    <div className="space-y-6">
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
          <Button variant="outline" size="sm" className="text-xs mt-2">+ Add Category</Button>
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
              <Input defaultValue="18" className="h-9 text-sm mt-1" />
            </div>
            <div>
              <Label className="text-xs">GSTIN</Label>
              <Input defaultValue="27AABCU9603R1ZM" className="h-9 text-sm mt-1" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2"><Bell className="h-4 w-4" /> Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { label: "SLA Deadline Reminders", desc: "Alert before SLA breach" },
            { label: "Low Stock Alerts", desc: "When inventory below minimum" },
            { label: "Payment Reminders", desc: "Overdue invoice notifications" },
            { label: "New Ticket Alerts", desc: "Notify coordinators on new tickets" },
          ].map((n) => (
            <div key={n.label} className="flex items-center justify-between py-1.5">
              <div>
                <p className="text-sm">{n.label}</p>
                <p className="text-xs text-muted-foreground">{n.desc}</p>
              </div>
              <Switch defaultChecked />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  </div>
);

export default SettingsPage;
