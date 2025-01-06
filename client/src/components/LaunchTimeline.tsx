import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Rocket, Users, TrendingUp, Award, Star } from "lucide-react";
import { motion } from "framer-motion";

const phases = [
  {
    title: "Pre-Launch",
    duration: "0-3 Months",
    icon: Clock,
    status: "current",
    items: [
      "Join exclusive beta testing group",
      "Early access to premium features",
      "Shape product development",
      "Special launch pricing locked in"
    ]
  },
  {
    title: "Launch",
    duration: "3-6 Months",
    icon: Rocket,
    status: "upcoming",
    items: [
      "Live product demo events",
      "Complimentary onboarding session",
      "Priority support access",
      "Feature request prioritization"
    ]
  },
  {
    title: "Growth",
    duration: "6-12 Months",
    icon: TrendingUp,
    status: "upcoming",
    items: [
      "Global market expansion",
      "Enterprise API access",
      "Advanced integrations",
      "Enhanced compliance features"
    ]
  }
];

const metrics = [
  {
    icon: Users,
    metric: "50,000+",
    description: "Target Users in Year 1"
  },
  {
    icon: Award,
    metric: "70%",
    description: "Subscription Renewal Rate"
  },
  {
    icon: Star,
    metric: "80%",
    description: "User Engagement Rate"
  }
];

export function LaunchTimeline() {
  return (
    <div className="space-y-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4">Launch Roadmap</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Join us on our journey to revolutionize startup valuation. Early adopters get exclusive benefits and help shape the future of the platform.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {phases.map((phase, index) => (
          <motion.div
            key={phase.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <phase.icon className="h-6 w-6 text-primary" />
                    <CardTitle>{phase.title}</CardTitle>
                  </div>
                  <Badge variant={phase.status === "current" ? "default" : "secondary"}>
                    {phase.duration}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {phase.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <div className="h-5 w-5 flex items-center justify-center flex-shrink-0">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-16">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <metric.icon className="h-12 w-12 text-primary" />
            </div>
            <div className="text-3xl font-bold mb-2">{metric.metric}</div>
            <div className="text-sm text-muted-foreground">{metric.description}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
