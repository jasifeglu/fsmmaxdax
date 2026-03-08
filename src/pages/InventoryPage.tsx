import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, AlertTriangle, TrendingDown, Truck, Search, Plus } from "lucide-react";
import { useState } from "react";

const inventory = [
  { id: 1, name: "Compressor Unit (1.5T)", sku: "CMP-150", category: "AC Parts", warehouse: 12, vanStock: 3, minStock: 5, price: "₹4,500", status: "OK" },
  { id: 2, name: "Drain Pump Assembly", sku: "DPA-200", category: "Washing Machine", warehouse: 3, vanStock: 2, minStock: 10, price: "₹1,200", status: "Low" },
  { id: 3, name: "Copper Pipe 3m", sku: "CPP-300", category: "Installation", warehouse: 45, vanStock: 12, minStock: 20, price: "₹650", status: "OK" },
  { id: 4, name: "PCB Board - Universal", sku: "PCB-100", category: "Electronics", warehouse: 2, vanStock: 0, minStock: 5, price: "₹2,800", status: "Critical" },
  { id: 5, name: "Gas Refill R32 (500g)", sku: "GAS-R32", category: "AC Parts", warehouse: 28, vanStock: 8, minStock: 15, price: "₹800", status: "OK" },
  { id: 6, name: "Hose Clamp Set", sku: "HCS-050", category: "General", warehouse: 4, vanStock: 1, minStock: 10, price: "₹150", status: "Low" },
  { id: 7, name: "Bracket Set - Split AC", sku: "BRK-SAC", category: "Installation", warehouse: 18, vanStock: 5, minStock: 10, price: "₹350", status: "OK" },
  { id: 8, name: "Thermostat Sensor", sku: "THS-100", category: "Refrigerator", warehouse: 1, vanStock: 0, minStock: 5, price: "₹900", status: "Critical" },
];

const InventoryPage = () => {
  const [search, setSearch] = useState("");
  const filtered = inventory.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.sku.toLowerCase().includes(search.toLowerCase()));

  const lowItems = inventory.filter(i => i.status !== "OK").length;
  const totalValue = "₹2.4L";

  return (
    <div>
      <PageHeader title="Inventory" description="Warehouse and van stock management">
        <Button size="sm" className="bg-primary text-primary-foreground gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Item
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Items" value={inventory.length} icon={Package} iconColor="text-primary" />
        <StatCard title="Low Stock Alerts" value={lowItems} change="Needs reorder" changeType="negative" icon={AlertTriangle} iconColor="text-warning" />
        <StatCard title="Stock Value" value={totalValue} icon={TrendingDown} iconColor="text-info" />
        <StatCard title="Van Stock Items" value={31} change="6 technicians" changeType="neutral" icon={Truck} iconColor="text-success" />
      </div>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search parts..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-muted-foreground text-xs border-b">
                  <th className="text-left py-2 font-medium">SKU</th>
                  <th className="text-left py-2 font-medium">Item</th>
                  <th className="text-left py-2 font-medium hidden md:table-cell">Category</th>
                  <th className="text-right py-2 font-medium">Warehouse</th>
                  <th className="text-right py-2 font-medium hidden sm:table-cell">Van Stock</th>
                  <th className="text-right py-2 font-medium hidden lg:table-cell">Price</th>
                  <th className="text-left py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 font-mono text-xs text-primary">{item.sku}</td>
                    <td className="py-2.5 font-medium">{item.name}</td>
                    <td className="py-2.5 text-muted-foreground hidden md:table-cell">{item.category}</td>
                    <td className="py-2.5 text-right">{item.warehouse}</td>
                    <td className="py-2.5 text-right hidden sm:table-cell">{item.vanStock}</td>
                    <td className="py-2.5 text-right hidden lg:table-cell">{item.price}</td>
                    <td className="py-2.5">
                      <StatusBadge status={item.status === "OK" ? "Available" : item.status === "Low" ? "Pending" : "Critical"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryPage;
