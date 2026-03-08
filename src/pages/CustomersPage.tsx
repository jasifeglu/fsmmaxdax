import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Phone, Mail } from "lucide-react";
import { useState } from "react";

const customers = [
  { id: 1, name: "Rajesh Kumar", phone: "+91 98765 43210", email: "rajesh@email.com", address: "A-12, Sector 42, Gurugram", tickets: 5, lastService: "2 days ago", totalSpent: "₹24,500", status: "Active" },
  { id: 2, name: "Priya Sharma", phone: "+91 87654 32109", email: "priya@email.com", address: "B-42, Sector 18, Noida", tickets: 3, lastService: "Today", totalSpent: "₹12,800", status: "Active" },
  { id: 3, name: "Mohammed Ali", phone: "+91 76543 21098", email: "ali@email.com", address: "C-8, Lajpat Nagar, Delhi", tickets: 8, lastService: "1 week ago", totalSpent: "₹45,200", status: "Active" },
  { id: 4, name: "Anita Desai", phone: "+91 65432 10987", email: "anita@email.com", address: "D-15, Vasant Vihar, Delhi", tickets: 2, lastService: "3 days ago", totalSpent: "₹8,500", status: "Active" },
  { id: 5, name: "Sanjay Patel", phone: "+91 54321 09876", email: "sanjay@email.com", address: "E-3, Dwarka, Delhi", tickets: 12, lastService: "Yesterday", totalSpent: "₹62,000", status: "Blacklisted" },
];

const CustomersPage = () => {
  const [search, setSearch] = useState("");
  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search));

  return (
    <div>
      <PageHeader title="Customers" description="Customer database and service history">
        <Button size="sm" className="bg-primary text-primary-foreground gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Customer
        </Button>
      </PageHeader>

      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((c) => (
              <Card key={c.id} className="border border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-sm">{c.name}</h3>
                      <p className="text-xs text-muted-foreground">{c.address}</p>
                    </div>
                    {c.status === "Blacklisted" ? (
                      <StatusBadge status="Overdue" />
                    ) : (
                      <StatusBadge status="Available" />
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1.5"><Phone className="h-3 w-3" /> {c.phone}</div>
                    <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {c.email}</div>
                  </div>
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-border/50">
                    <span>{c.tickets} tickets</span>
                    <span className="font-medium">{c.totalSpent}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Last service: {c.lastService}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomersPage;
