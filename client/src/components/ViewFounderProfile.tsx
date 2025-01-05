import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Linkedin,
  Twitter,
  Globe,
  Users,
  TrendingUp,
  Award,
} from "lucide-react";
import { StartupJourneyDashboard } from "./StartupJourneyDashboard";

interface ViewFounderProfileProps {
  profile: {
    name: string;
    bio?: string;
    experience?: string;
    linkedinUrl?: string;
    twitterHandle?: string;
    companyName: string;
    companyWebsite?: string;
    teamSize?: number;
    keyRoles?: string[];
    previousExits?: Array<{
      companyName: string;
      exitYear: number;
      exitType: string;
      amount?: number;
    }>;
    fundingHistory?: Array<{
      round: string;
      amount: number;
      date: string;
      investors: string[];
    }>;
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

export function ViewFounderProfile({ profile }: ViewFounderProfileProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
      notation: 'compact'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{profile.name}</CardTitle>
            <CardDescription>{profile.companyName}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.bio && (
              <div>
                <h4 className="text-sm font-medium mb-2">Bio</h4>
                <p className="text-sm text-muted-foreground">{profile.bio}</p>
              </div>
            )}

            {profile.experience && (
              <div>
                <h4 className="text-sm font-medium mb-2">Experience</h4>
                <p className="text-sm text-muted-foreground">{profile.experience}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">Team Size: {profile.teamSize || 'N/A'}</span>
            </div>

            {profile.linkedinUrl && (
              <a
                href={profile.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Linkedin className="w-4 h-4" />
                LinkedIn Profile
              </a>
            )}

            {profile.twitterHandle && (
              <a
                href={`https://twitter.com/${profile.twitterHandle}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Twitter className="w-4 h-4" />
                @{profile.twitterHandle}
              </a>
            )}

            {profile.companyWebsite && (
              <a
                href={profile.companyWebsite}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Globe className="w-4 h-4" />
                Company Website
              </a>
            )}
          </CardContent>
        </Card>
      </div>

      <StartupJourneyDashboard profile={profile} />

      {profile.previousExits && profile.previousExits.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Previous Exits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.previousExits.map((exit, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                >
                  <div>
                    <h4 className="font-medium">{exit.companyName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {exit.exitType} ({exit.exitYear})
                    </p>
                  </div>
                  {exit.amount && (
                    <Badge variant="secondary">
                      {formatCurrency(exit.amount)}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {profile.fundingHistory && profile.fundingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Funding History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.fundingHistory.map((funding, index) => (
                <div
                  key={index}
                  className="border-b last:border-0 pb-4 last:pb-0"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{funding.round}</h4>
                    <Badge variant="outline">
                      {formatCurrency(funding.amount)}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(funding.date).toLocaleDateString()}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {funding.investors.map((investor, i) => (
                      <Badge key={i} variant="secondary">
                        {investor}
                      </Badge>
                    ))}
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