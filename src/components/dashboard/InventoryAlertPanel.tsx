import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, ShoppingCart } from "lucide-react";

interface Props {
  items: any[];
}

export const InventoryAlertPanel = ({ items }: Props) => {
  const lowStock = items
    .filter(i => i.status !== "OK")
    .map(i => ({ name: i.name, stock: i.warehouse_stock, min: i.min_stock }))
    .slice(0, 5);

  // Most stocked items as proxy for frequently used
  const topItems = [...items]
    .sort((a, b) => (b.warehouse_stock + b.van_stock) - (a.warehouse_stock + a.van_stock))
    .slice(0, 3)
    .map(i => ({ name: i.name, total: i.warehouse_stock + i.van_stock }));

  return (
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">📦 Inventory Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs font-medium text-destructive flex items-center gap-1 mb-2">
            <AlertTriangle className="h-3.5 w-3.5" /> Low Stock Items ({lowStock.length})
          </p>
          {lowStock.length === 0 ? (
            <p className="text-xs text-muted-foreground">All items are well-stocked</p>
          ) : (
            <div className="space-y-1.5">
              {lowStock.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs bg-destructive/5 rounded-md px-3 py-2">
                  <span>{item.name}</span>
                  <span className="font-mono font-semibold text-destructive">{item.stock}/{item.min}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {topItems.length > 0 && (
          <div>
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-2">
              <TrendingUp className="h-3.5 w-3.5" /> Top Stocked Items
            </p>
            <div className="space-y-1.5">
              {topItems.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs bg-muted/40 rounded-md px-3 py-2">
                  <span>{p.name}</span>
                  <span className="font-mono font-semibold">{p.total} units</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
