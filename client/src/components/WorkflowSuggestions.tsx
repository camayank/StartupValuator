import { useEffect, useState } from "react";
import { useUser } from "@/hooks/use-user";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, ChevronRight, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

interface Suggestion {
  id: number;
  title: string;
  description: string;
  suggestedAction: string;
  priority: number;
}

export function WorkflowSuggestions() {
  const { user } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isMinimized, setIsMinimized] = useState(false);

  const { data: suggestions = [], refetch } = useQuery<Suggestion[]>({
    queryKey: ["/api/suggestions"],
    enabled: !!user,
    refetchInterval: 60000, // Refetch every minute
  });

  useEffect(() => {
    // Mark suggestions as shown when they appear
    if (suggestions.length > 0) {
      suggestions.forEach(async (suggestion) => {
        await fetch(`/api/suggestions/${suggestion.id}/shown`, {
          method: "POST",
          credentials: "include",
        });
      });
    }
  }, [suggestions]);

  const handleSuggestionClick = async (suggestion: Suggestion) => {
    try {
      await fetch(`/api/suggestions/${suggestion.id}/clicked`, {
        method: "POST",
        credentials: "include",
      });
      setLocation(suggestion.suggestedAction);
    } catch (error) {
      console.error("Failed to mark suggestion as clicked:", error);
    }
  };

  if (!user || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Card className="w-80 shadow-lg">
        <CardContent className="p-0">
          <div className="flex items-center justify-between p-4 bg-primary/5">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-medium">Suggested Next Steps</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? <ChevronRight className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>

          {!isMinimized && (
            <ScrollArea className="max-h-[300px]">
              <div className="p-4 space-y-4">
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="space-y-2 hover:bg-accent rounded-lg p-2 transition-colors cursor-pointer"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <h4 className="text-sm font-medium">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {suggestion.description}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start"
                    >
                      Get Started
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}