import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, ShoppingCart, ArrowUpDown } from "lucide-react";

const lowStock = [
  { name: "Compressor Unit", stock: 3, min: 10 },
  { name: "AC Gas R32", stock: 5, min: 15 },
  { name: "Water Filter Cartridge", stock: 2, min: 8 },
  { name: "Thermostat Sensor", stock: 4, min: 10 },
];

const frequentParts = [
  { name: "AC Gas R32", usedThisMonth: 45 },
  { name: "Water Filter Cartridge", usedThisMonth: 38 },
  { name: "Compressor Belt", usedThisMonth: 22 },
];

export const InventoryAlertPanel = () => (
  <Card className="glass-card">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">📦 Inventory Alerts</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div>
        <p className="text-xs font-medium text-destructive flex items-center gap-1 mb-2">
          <AlertTriangle className="h-3.5 w-3.5" /> Low Stock Items
        </p>
        <div className="space-y-1.5">
          {lowStock.map((item) => (
            <div key={item.name} className="flex items-center justify-between text-xs bg-destructive/5 rounded-md px-3 py-2">
              <span>{item.name}</span>
              <span className="font-mono font-semibold text-destructive">{item.stock}/{item.min}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
          <TrendingUp className="h-3.5 w-3.5" /> Frequently Used
        </p>
        <div className="space-y-1.5">
          {frequentParts.map((p) => (
            <div key={p.name} className="flex items-center justify-between text-xs bg-muted/40 rounded-md px-3 py-2">
              <span>{p.name}</span>
              <span className="font-mono font-semibold">{p.usedThisMonth} used</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShoppingCart className="h-3.5 w-3.5" />
        <span>2 purchase requests pending approval</span>
      </div>
    </CardContent>
  </Card>
);
