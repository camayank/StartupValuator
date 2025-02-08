import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface CompanyCardViewProps {
  onDataChange?: (data: any) => void;
}

export function CompanyCardView({ onDataChange }: CompanyCardViewProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto transition-all duration-300 hover:shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Building className="w-6 h-6 text-primary" />
          Your Business
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Company Name"
              className="pl-10 h-12 text-lg"
              onChange={(e) => onDataChange?.({ name: e.target.value })}
            />
            <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          </div>

          <Select onValueChange={(value) => onDataChange?.({ industry: value })}>
            <SelectTrigger className="h-12 text-lg">
              <SelectValue placeholder="Select Industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tech">Technology</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="retail">Retail</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg">
          <Brain className="w-5 h-5 text-primary" />
          <p className="text-sm text-muted-foreground">
            AI-powered analysis will provide instant insights as you enter your company details
          </p>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {['AI-Powered Analysis', 'Enterprise Security', 'Global Market Data'].map((feature) => (
            <div
              key={feature}
              className={cn(
                "flex items-center gap-2 p-3 rounded-lg",
                "bg-background border border-border",
                "transition-colors duration-200 hover:border-primary/50"
              )}
            >
              <Brain className="w-4 h-4 text-primary" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
