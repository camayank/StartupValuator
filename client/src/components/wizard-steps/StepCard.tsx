import { FC } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isActive: boolean;
  isComplete: boolean;
  stepNumber: number;
  totalSteps: number;
}

export const StepCard: FC<StepCardProps> = ({
  icon,
  title,
  description,
  isActive,
  isComplete,
  stepNumber,
  totalSteps,
}) => {
  return (
    <Card
      className={cn(
        "relative p-4 transition-all duration-200 cursor-pointer",
        isActive && "ring-2 ring-primary shadow-lg",
        !isActive && "opacity-70 hover:opacity-100"
      )}
    >
      <div className="absolute -top-2 -right-2">
        {isComplete && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-primary text-primary-foreground p-1.5 rounded-full shadow-md"
          >
            <Check className="h-3 w-3" />
          </motion.div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className={cn(
          "p-2 rounded-lg w-fit",
          isActive ? "bg-primary text-primary-foreground" : "bg-muted"
        )}>
          {icon}
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-sm">{title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
        </div>
      </div>
    </Card>
  );
};