import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Props {
  items: any[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--accent))", "#f59e0b", "#10b981", "#8b5cf6"];

export const InventoryReports = ({ items }: Props) => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from("inventory_transactions").select("*").order("created_at", { ascending: false }).limit(500);
      setTransactions(data || []);
      setLoading(false);
    };
    fetch();
  }, []);

  // Stock summary by category
  const categoryData = items.reduce((acc: any[], item) => {
    const existing = acc.find(a => a.category === item.category);
    if (existing) {
      existing.warehouse += item.warehouse_stock;
      existing.van += item.van_stock;
    } else {
      acc.push({ category: item.category, warehouse: item.warehouse_stock, van: item.van_stock });
    }
    return acc;
  }, []);

  // Frequently used items
  const usageCounts = transactions
    .filter(t => t.transaction_type === "usage")
    .reduce((acc: Record<string, number>, t) => {
      acc[t.inventory_id] = (acc[t.inventory_id] || 0) + t.quantity;
      return acc;
    }, {});
  const topUsed = Object.entries(usageCounts)
    .map(([id, count]) => ({ name: items.find(i => i.id === id)?.name || "Unknown", count: Number(count) }))
    .sort((a, b) => Number(b.count) - Number(a.count))
    .slice(0, 6);

  // Stock value by status
  const statusData = [
    { name: "OK", value: items.filter(i => i.status === "OK").length },
    { name: "Low", value: items.filter(i => i.status === "Low").length },
    { name: "Critical", value: items.filter(i => i.status === "Critical").length },
  ].filter(d => d.value > 0);

  const totalValue = items.reduce((s: number, i: any) => s + Number(i.price) * (Number(i.warehouse_stock) + Number(i.van_stock)), 0);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total SKUs</p>
          <p className="text-2xl font-bold">{items.length}</p>
        </Card>
        <Card className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Stock Value</p>
          <p className="text-2xl font-bold">₹{totalValue.toLocaleString()}</p>
        </Card>
        <Card className="glass-card p-4">
          <p className="text-xs text-muted-foreground">Total Movements</p>
          <p className="text-2xl font-bold">{transactions.length}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Stock by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="warehouse" fill="hsl(var(--primary))" name="Warehouse" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="van" fill="hsl(var(--accent))" name="Van" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Stock Health</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              {statusData.length === 0 ? (
                <p className="text-sm text-muted-foreground">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {topUsed.length > 0 && (
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Most Used Parts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topUsed} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" name="Units Used" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
