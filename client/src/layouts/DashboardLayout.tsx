import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout } = useUser();
  const [activeTab, setActiveTab] = useState("business");

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-2xl font-bold">Startup Valuator</h1>
          <Button variant="ghost" onClick={() => logout()}>Logout</Button>
        </div>
      </header>

      <main className="container py-6">
        <Card className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="business">Business Info</TabsTrigger>
              <TabsTrigger value="financials">Financials</TabsTrigger>
              <TabsTrigger value="market">Market</TabsTrigger>
              <TabsTrigger value="team">Team & IP</TabsTrigger>
              <TabsTrigger value="valuation">Valuation</TabsTrigger>
            </TabsList>

            <TabsContent value="business" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Business Information</h2>
              {activeTab === "business" && children}
            </TabsContent>

            <TabsContent value="financials" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Financial Details</h2>
              {activeTab === "financials" && children}
            </TabsContent>

            <TabsContent value="market" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Market Analysis</h2>
              {activeTab === "market" && children}
            </TabsContent>

            <TabsContent value="team" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Team & Intellectual Property</h2>
              {activeTab === "team" && children}
            </TabsContent>

            <TabsContent value="valuation" className="mt-6">
              <h2 className="text-xl font-semibold mb-4">Valuation Results</h2>
              {activeTab === "valuation" && children}
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
