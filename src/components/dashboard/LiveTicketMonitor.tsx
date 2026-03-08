import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const newTickets = [
  { id: "MXD-001042", customer: "Rajesh Kumar", issue: "AC not cooling", priority: "High", time: "2 min ago" },
  { id: "MXD-001043", customer: "Meena Patel", issue: "Fridge compressor noise", priority: "Medium", time: "8 min ago" },
  { id: "MXD-001044", customer: "Arjun Reddy", issue: "Geyser leak", priority: "Critical", time: "12 min ago" },
];

const unassigned = [
  { id: "MXD-001042", customer: "Rajesh Kumar", issue: "AC not cooling", priority: "High", created: "10 min ago" },
  { id: "MXD-001035", customer: "Sonal Desai", issue: "Chimney installation", priority: "Low", created: "1 hr ago" },
];

const escalated = [
  { id: "MXD-001028", customer: "Farhan Khan", issue: "Repeated AC failure", priority: "Critical", reason: "3rd complaint" },
  { id: "MXD-001031", customer: "Kavita Joshi", issue: "Water purifier not working", priority: "High", reason: "SLA breach" },
];

const overdue = [
  { id: "MXD-001020", customer: "Deepak Nair", issue: "Washing machine drain", assignee: "Vikram S.", dueBy: "2 hrs ago" },
  { id: "MXD-001018", customer: "Sunita Rao", issue: "Microwave sparking", assignee: "Amit P.", dueBy: "4 hrs ago" },
];

const TicketRow = ({ ticket }: { ticket: { id: string; customer: string; issue: string; priority: string; [k: string]: string } }) => (
  <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors text-xs">
    <td className="py-2 font-mono text-primary">{ticket.id}</td>
    <td className="py-2">{ticket.customer}</td>
    <td className="py-2 text-muted-foreground hidden sm:table-cell">{ticket.issue}</td>
    <td className="py-2"><StatusBadge status={ticket.priority} /></td>
  </tr>
);

export const LiveTicketMonitor = () => (
  <Card className="glass-card">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm font-medium">🎫 Live Ticket Monitor</CardTitle>
    </CardHeader>
    <CardContent>
      <Tabs defaultValue="new" className="w-full">
        <TabsList className="w-full justify-start mb-3 h-8">
          <TabsTrigger value="new" className="text-xs">New ({newTickets.length})</TabsTrigger>
          <TabsTrigger value="unassigned" className="text-xs">Unassigned ({unassigned.length})</TabsTrigger>
          <TabsTrigger value="escalated" className="text-xs">Escalated ({escalated.length})</TabsTrigger>
          <TabsTrigger value="overdue" className="text-xs">Overdue ({overdue.length})</TabsTrigger>
        </TabsList>
        {[
          { key: "new", data: newTickets },
          { key: "unassigned", data: unassigned },
          { key: "escalated", data: escalated },
          { key: "overdue", data: overdue },
        ].map(({ key, data }) => (
          <TabsContent key={key} value={key}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground text-xs border-b">
                    <th className="text-left py-1.5 font-medium">ID</th>
                    <th className="text-left py-1.5 font-medium">Customer</th>
                    <th className="text-left py-1.5 font-medium hidden sm:table-cell">Issue</th>
                    <th className="text-left py-1.5 font-medium">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((t) => <TicketRow key={t.id} ticket={t as any} />)}
                </tbody>
              </table>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </CardContent>
  </Card>
);
