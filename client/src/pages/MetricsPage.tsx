import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowUpRight, Users, DollarSign, HeartPulse, Target } from "lucide-react";

export default function MetricsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Growth Metrics</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+12.3%</span>
              <span className="ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,234</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <ArrowUpRight className="h-4 w-4 text-green-500" />
              <span className="text-green-500">+18.5%</span>
              <span className="ml-1">vs last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Retention</CardTitle>
            <HeartPulse className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <Progress value={85} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Growth Goals</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4/6</div>
            <Progress value={66.7} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Key Performance Indicators</CardTitle>
            <CardDescription>Track your startup's vital metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Customer Acquisition Cost</span>
                  <span className="font-medium">$45.00</span>
                </div>
                <Progress value={75} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Lifetime Value</span>
                  <span className="font-medium">$850.00</span>
                </div>
                <Progress value={82} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Burn Rate</span>
                  <span className="font-medium">$12k/mo</span>
                </div>
                <Progress value={45} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Growth Trajectory</CardTitle>
            <CardDescription>Your path to success</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Product Market Fit</span>
                  <span className="font-medium">70%</span>
                </div>
                <Progress value={70} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Customer Satisfaction</span>
                  <span className="font-medium">92%</span>
                </div>
                <Progress value={92} />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Team Growth</span>
                  <span className="font-medium">85%</span>
                </div>
                <Progress value={85} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
