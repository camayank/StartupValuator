import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building, Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface CompanyCardViewProps {
  onDataChange?: (data: any) => void;
}

export function CompanyCardView({ onDataChange }: CompanyCardViewProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [companyName, setCompanyName] = useState("");

  const handleNameChange = (value: string) => {
    setCompanyName(value);
    // Show suggestions after user stops typing
    if (value.length > 2) {
      setShowSuggestions(true);
    }
    onDataChange?.({ name: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
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
                className="pl-10 h-12 text-lg transition-all duration-200 focus:ring-2 focus:ring-primary/20"
                onChange={(e) => handleNameChange(e.target.value)}
                value={companyName}
              />
              <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />

              <AnimatePresence>
                {showSuggestions && companyName && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-2 p-2 bg-background border rounded-lg shadow-lg z-10"
                  >
                    <div className="flex items-center gap-2 p-2 text-sm text-muted-foreground">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Detecting industry based on company name...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <Select 
              onValueChange={(value) => onDataChange?.({ industry: value })}
            >
              <SelectTrigger className="h-12 text-lg">
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tech">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="retail">Retail</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="manufacturing">Manufacturing</SelectItem>
                <SelectItem value="education">Education</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 p-4 bg-primary/5 rounded-lg border border-primary/10"
          >
            <Brain className="w-5 h-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              AI-powered analysis will provide instant insights as you enter your company details
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {['AI-Powered Analysis', 'Enterprise Security', 'Global Market Data'].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 * (index + 1) }}
                className={cn(
                  "flex items-center gap-2 p-3 rounded-lg",
                  "bg-background border border-border",
                  "transition-all duration-200 hover:border-primary/50 hover:bg-primary/5"
                )}
              >
                <Brain className="w-4 h-4 text-primary" />
                <span className="text-sm">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}