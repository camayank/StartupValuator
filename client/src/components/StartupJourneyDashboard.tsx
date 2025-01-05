import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  History,
  Trophy,
  TrendingUp,
  Target,
  Calendar,
} from "lucide-react";

interface StartupJourneyDashboardProps {
  profile: {
    journeyMilestones?: Array<{
      date: string;
      title: string;
      description: string;
      category: "product" | "team" | "funding" | "market" | "other";
      impact: number;
    }>;
    growthMetrics?: Array<{
      date: string;
      metric: string;
      value: number;
      target: number;
      unit: string;
    }>;
    keyAchievements?: Array<{
      date: string;
      title: string;
      description: string;
      impact: string;
    }>;
    futureGoals?: Array<{
      targetDate: string;
      title: string;
      description: string;
      status: "planned" | "in_progress" | "achieved" | "delayed";
      priority: "low" | "medium" | "high";
    }>;
  };
}

export function StartupJourneyDashboard({ profile }: StartupJourneyDashboardProps) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-red-100 text-red-800",
  };

  const statusColors = {
    planned: "bg-gray-100 text-gray-800",
    in_progress: "bg-blue-100 text-blue-800",
    achieved: "bg-green-100 text-green-800",
    delayed: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-6">
      {/* Journey Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Journey Milestones
          </CardTitle>
          <CardDescription>Key milestones in your startup journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.journeyMilestones?.map((milestone, index) => (
              <div
                key={index}
                className="flex items-start gap-4 border-l-2 border-primary pl-4 pb-4 last:pb-0"
              >
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">
                    {new Date(milestone.date).toLocaleDateString()}
                  </p>
                  <h4 className="font-medium">{milestone.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {milestone.description}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge>{milestone.category}</Badge>
                    <Progress value={milestone.impact * 10} className="w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Growth Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.growthMetrics?.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{metric.metric}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(metric.date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {metric.value} / {metric.target} {metric.unit}
                  </Badge>
                </div>
                <Progress
                  value={(metric.value / metric.target) * 100}
                  className="w-full"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Key Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.keyAchievements?.map((achievement, index) => (
              <div
                key={index}
                className="border-b last:border-0 pb-4 last:pb-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                  <Badge>{achievement.impact}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {new Date(achievement.date).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Future Goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Future Goals
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {profile.futureGoals?.map((goal, index) => (
              <div
                key={index}
                className="border-b last:border-0 pb-4 last:pb-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {goal.description}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      className={priorityColors[goal.priority]}
                      variant="secondary"
                    >
                      {goal.priority}
                    </Badge>
                    <Badge
                      className={statusColors[goal.status]}
                      variant="secondary"
                    >
                      {goal.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}