import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const leaderboard = [
  { rank: 1, name: "Suresh Kumar", score: 94, tickets: 35, rating: 4.8, revenue: "₹72,000", badge: "⭐ Star Performer" },
  { rank: 2, name: "Amit Patil", score: 87, tickets: 28, rating: 4.6, revenue: "₹62,000", badge: "" },
  { rank: 3, name: "Ravi Mehta", score: 85, tickets: 31, rating: 4.6, revenue: "₹58,000", badge: "" },
  { rank: 4, name: "Anil Sharma", score: 78, tickets: 25, rating: 4.3, revenue: "₹45,000", badge: "" },
  { rank: 5, name: "Vikram Singh", score: 74, tickets: 22, rating: 4.2, revenue: "₹38,000", badge: "" },
  { rank: 6, name: "Prakash Deshmukh", score: 68, tickets: 19, rating: 3.9, revenue: "₹32,000", badge: "" },
  { rank: 7, name: "Mohan Verma", score: 65, tickets: 18, rating: 4.0, revenue: "₹28,000", badge: "" },
  { rank: 8, name: "Kiran Patil", score: 60, tickets: 15, rating: 3.8, revenue: "₹22,000", badge: "" },
];

const RankIcon = ({ rank }: { rank: number }) => {
  if (rank === 1) return <Trophy className="h-5 w-5 text-warning" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-muted-foreground" />;
  if (rank === 3) return <Award className="h-5 w-5 text-warning/70" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">{rank}</span>;
};

export const IncentiveLeaderboard = () => (
  <div className="space-y-4">
    {/* Top 3 Podium */}
    <div className="grid grid-cols-3 gap-4">
      {[leaderboard[1], leaderboard[0], leaderboard[2]].map((tech, i) => {
        const podiumOrder = [2, 1, 3];
        const isFirst = podiumOrder[i] === 1;
        return (
          <motion.div
            key={tech.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={cn(
              "glass-card text-center",
              isFirst && "ring-2 ring-warning/30 bg-warning/5"
            )}>
              <CardContent className="pt-6 pb-4 space-y-2">
                <div className={cn(
                  "mx-auto rounded-full flex items-center justify-center",
                  isFirst ? "h-16 w-16 bg-warning/15" : "h-12 w-12 bg-muted/50"
                )}>
                  <RankIcon rank={podiumOrder[i]} />
                </div>
                <p className={cn("font-semibold text-sm", isFirst && "text-base")}>{tech.name}</p>
                <p className="text-2xl font-bold text-primary">{tech.score}</p>
                <p className="text-[10px] text-muted-foreground">Performance Score</p>
                {tech.badge && (
                  <span className="inline-block text-[10px] font-medium bg-warning/10 text-warning px-2 py-0.5 rounded-full">
                    {tech.badge}
                  </span>
                )}
                <div className="flex justify-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 text-warning fill-warning" />{tech.rating}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>

    {/* Full Rankings Table */}
    <Card className="glass-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">🏆 Full Rankings — March 2026</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground text-xs border-b">
                <th className="text-left py-2 font-medium w-12">Rank</th>
                <th className="text-left py-2 font-medium">Technician</th>
                <th className="text-center py-2 font-medium">Score</th>
                <th className="text-center py-2 font-medium hidden sm:table-cell">Tickets</th>
                <th className="text-center py-2 font-medium hidden md:table-cell">Rating</th>
                <th className="text-right py-2 font-medium hidden lg:table-cell">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((tech) => (
                <motion.tr
                  key={tech.rank}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: tech.rank * 0.03 }}
                  className={cn(
                    "border-b border-border/50 hover:bg-muted/30 transition-colors",
                    tech.rank <= 3 && "bg-primary/[0.02]"
                  )}
                >
                  <td className="py-2.5">
                    <RankIcon rank={tech.rank} />
                  </td>
                  <td className="py-2.5 font-medium">
                    {tech.name}
                    {tech.badge && (
                      <span className="ml-2 text-[10px] bg-warning/10 text-warning px-1.5 py-0.5 rounded-full">{tech.badge}</span>
                    )}
                  </td>
                  <td className="py-2.5 text-center font-bold text-primary">{tech.score}</td>
                  <td className="py-2.5 text-center hidden sm:table-cell">{tech.tickets}</td>
                  <td className="py-2.5 text-center hidden md:table-cell">
                    <span className="inline-flex items-center gap-0.5">
                      <Star className="h-3 w-3 text-warning fill-warning" />{tech.rating}
                    </span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-xs hidden lg:table-cell">{tech.revenue}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);
