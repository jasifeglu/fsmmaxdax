import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IncentiveDashboard } from "@/components/incentives/IncentiveDashboard";
import { IncentiveLeaderboard } from "@/components/incentives/IncentiveLeaderboard";
import { IncentiveRulesAdmin } from "@/components/incentives/IncentiveRulesAdmin";
import { IncentivePayouts } from "@/components/incentives/IncentivePayouts";

const IncentivesPage = () => {
  const { role } = useAuth();
  const isAdmin = role === "admin";

  return (
    <div>
      <PageHeader
        title="Incentives & Rewards"
        description={isAdmin ? "Manage incentive rules and approve payouts" : "Track your performance and earnings"}
      />

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">My Performance</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          {isAdmin && <TabsTrigger value="rules">Incentive Rules</TabsTrigger>}
          {isAdmin && <TabsTrigger value="payouts">Payouts</TabsTrigger>}
        </TabsList>

        <TabsContent value="dashboard">
          <IncentiveDashboard />
        </TabsContent>
        <TabsContent value="leaderboard">
          <IncentiveLeaderboard />
        </TabsContent>
        {isAdmin && (
          <TabsContent value="rules">
            <IncentiveRulesAdmin />
          </TabsContent>
        )}
        {isAdmin && (
          <TabsContent value="payouts">
            <IncentivePayouts />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default IncentivesPage;
