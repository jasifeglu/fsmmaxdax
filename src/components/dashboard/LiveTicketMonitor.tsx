import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Props {
  tickets: any[];
}

export const LiveTicketMonitor = ({ tickets }: Props) => {
  const newTickets = tickets.filter(t => t.status === "New").slice(0, 10);
  const unassigned = tickets.filter(t => !t.assigned_to && t.status !== "Completed" && t.status !== "Closed").slice(0, 10);
  const escalated = tickets.filter(t => t.priority === "Critical" || t.priority === "High").slice(0, 10);

  // Overdue: tickets with SLA that have exceeded their time
  const now = new Date();
  const overdue = tickets.filter(t => {
    if (t.status === "Completed" || t.status === "Closed") return false;
    if (!t.sla_hours || !t.created_at) return false;
    const created = new Date(t.created_at);
    const dueAt = new Date(created.getTime() + t.sla_hours * 3600000);
    return now > dueAt;
  }).slice(0, 10);

  const TicketRow = ({ ticket }: { ticket: any }) => (
    <tr className="border-b border-border/50 hover:bg-muted/30 transition-colors text-xs">
      <td className="py-2 font-mono text-primary">{ticket.ticket_number}</td>
      <td className="py-2">{ticket.customer_name}</td>
      <td className="py-2 text-muted-foreground hidden sm:table-cell max-w-32 truncate">{ticket.issue}</td>
      <td className="py-2"><StatusBadge status={ticket.priority} /></td>
    </tr>
  );

  return (
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
              {data.length === 0 ? (
                <p className="text-center text-xs text-muted-foreground py-4">No tickets</p>
              ) : (
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
                      {data.map((t: any) => <TicketRow key={t.id} ticket={t} />)}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
