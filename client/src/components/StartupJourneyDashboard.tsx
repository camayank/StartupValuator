import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Rocket, Target, Trophy, Calendar } from "lucide-react";

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
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "product": return "bg-blue-100 text-blue-800";
      case "team": return "bg-green-100 text-green-800";
      case "funding": return "bg-purple-100 text-purple-800";
      case "market": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "achieved": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "planned": return "bg-gray-100 text-gray-800";
      case "delayed": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {profile.journeyMilestones && profile.journeyMilestones.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="w-5 h-5" />
              Journey Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.journeyMilestones.map((milestone, index) => (
                <div key={index} className="flex items-start gap-4 pb-4 border-b last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium">{milestone.title}</h4>
                      <Badge className={getCategoryColor(milestone.category)}>
                        {milestone.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{milestone.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(milestone.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">Impact: {milestone.impact}/10</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {profile.keyAchievements && profile.keyAchievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Key Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.keyAchievements.map((achievement, index) => (
                <div key={index} className="pb-4 border-b last:border-0">
                  <h4 className="font-medium mb-1">{achievement.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      {new Date(achievement.date).toLocaleDateString()}
                    </span>
                    <Badge variant="outline">{achievement.impact}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {profile.futureGoals && profile.futureGoals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Future Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.futureGoals.map((goal, index) => (
                <div key={index} className="pb-4 border-b last:border-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{goal.title}</h4>
                    <Badge variant={getPriorityColor(goal.priority)}>{goal.priority}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{goal.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(goal.targetDate).toLocaleDateString()}
                    </span>
                    <Badge className={getStatusColor(goal.status)}>{goal.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
