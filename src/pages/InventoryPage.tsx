import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, AlertTriangle, TrendingDown, Truck, Wrench, ShoppingCart, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { WarehouseCatalog } from "@/components/inventory/WarehouseCatalog";
import { StockIssuance } from "@/components/inventory/StockIssuance";
import { StockUsageReturn } from "@/components/inventory/StockUsageReturn";
import { PurchaseRequests } from "@/components/inventory/PurchaseRequests";
import { InventoryReports } from "@/components/inventory/InventoryReports";

const InventoryPage = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    setLoading(true);
    const { data } = await supabase.from("inventory").select("*").order("name");
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, []);

  const lowItems = items.filter(i => i.status !== "OK").length;
  const totalValue = items.reduce((s, i) => s + (i.price * i.warehouse_stock), 0);
  const totalVanStock = items.reduce((s, i) => s + i.van_stock, 0);

  return (
    <div>
      <PageHeader title="Inventory Management" description="Warehouse & van stock tracking, issuance, usage, and reports" />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total SKUs" value={items.length} icon={Package} iconColor="text-primary" />
        <StatCard title="Low Stock Alerts" value={lowItems} changeType="negative" icon={AlertTriangle} iconColor="text-warning" />
        <StatCard title="Warehouse Value" value={`₹${totalValue.toLocaleString()}`} icon={TrendingDown} iconColor="text-info" />
        <StatCard title="Van Stock Units" value={totalVanStock} icon={Truck} iconColor="text-accent-foreground" />
      </div>

      <Tabs defaultValue="warehouse" className="space-y-4">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl">
          <TabsTrigger value="warehouse" className="text-xs gap-1"><Package className="h-3 w-3 hidden sm:inline" /> Warehouse</TabsTrigger>
          <TabsTrigger value="issuance" className="text-xs gap-1"><Truck className="h-3 w-3 hidden sm:inline" /> Issuance</TabsTrigger>
          <TabsTrigger value="usage" className="text-xs gap-1"><Wrench className="h-3 w-3 hidden sm:inline" /> Usage</TabsTrigger>
          <TabsTrigger value="purchases" className="text-xs gap-1"><ShoppingCart className="h-3 w-3 hidden sm:inline" /> Purchases</TabsTrigger>
          <TabsTrigger value="reports" className="text-xs gap-1"><BarChart3 className="h-3 w-3 hidden sm:inline" /> Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="warehouse">
          <WarehouseCatalog items={items} loading={loading} onRefresh={fetchItems} />
        </TabsContent>
        <TabsContent value="issuance">
          <StockIssuance items={items} onRefresh={fetchItems} />
        </TabsContent>
        <TabsContent value="usage">
          <StockUsageReturn items={items} onRefresh={fetchItems} />
        </TabsContent>
        <TabsContent value="purchases">
          <PurchaseRequests items={items} />
        </TabsContent>
        <TabsContent value="reports">
          <InventoryReports items={items} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryPage;
