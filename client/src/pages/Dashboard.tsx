import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { sectors } from "@/lib/validations";
import { 
  Store, 
  Building2, 
  Factory,
  Cog,
  ChevronRight
} from "lucide-react";

const sectorIcons = {
  technology: Cog,
  digital: Store,
  enterprise: Building2,
  manufacturing: Factory,
} as const;

export default function Dashboard() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Smart Valuation</h1>
        <p className="text-muted-foreground mt-2">
          Select your industry to get started with an AI-powered valuation analysis
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(sectors).map(([key, sector]) => {
          const Icon = sectorIcons[key as keyof typeof sectorIcons] || Building2;
          return (
            <Card key={key} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setLocation(`/valuation/new?sector=${key}`)}
                >
                  <span>Start Valuation</span>
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <h3 className="font-semibold text-lg mb-2">{sector.name}</h3>

              <div className="space-y-2">
                {Object.entries(sector.subsectors).map(([id, subsector]) => (
                  <div key={id} className="flex items-center text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-primary/50 mr-2" />
                    {subsector.name}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}