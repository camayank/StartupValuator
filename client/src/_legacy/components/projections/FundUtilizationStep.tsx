import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Plus, Minus, AlertCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fundingCategories } from "@/lib/validations";
import { motion } from "framer-motion";

interface FundUtilizationStepProps {
  data: {
    totalFunding: number;
    burnRate: number;
    runway: number;
    allocation: {
      category: string;
      percentage: number;
      amount: number;
      description: string;
    }[];
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function FundUtilizationStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: FundUtilizationStepProps) {
  const [newCategory, setNewCategory] = useState("");
  const [newPercentage, setNewPercentage] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const totalAllocation = data.allocation?.reduce((sum, item) => sum + item.percentage, 0) || 0;
  const remainingPercentage = 100 - totalAllocation;

  const calculateAmount = (percentage: number) => {
    return (data.totalFunding * percentage) / 100;
  };

  const handleAddAllocation = () => {
    if (!newCategory || !newPercentage) return;

    const percentage = Number(newPercentage);
    if (percentage > remainingPercentage) {
      alert(`Cannot exceed 100%. Remaining allocation: ${remainingPercentage}%`);
      return;
    }

    const updatedAllocation = [
      ...(data.allocation || []),
      {
        category: newCategory,
        percentage,
        amount: calculateAmount(percentage),
        description: newDescription,
      },
    ];

    onUpdate({
      allocation: updatedAllocation,
    });

    // Reset form
    setNewCategory("");
    setNewPercentage("");
    setNewDescription("");
  };

  const handleRemoveAllocation = (index: number) => {
    const updatedAllocation = [...data.allocation];
    updatedAllocation.splice(index, 1);
    onUpdate({ allocation: updatedAllocation });
  };

  const updateBurnRate = (value: number) => {
    const burnRate = Number(value);
    const runway = burnRate > 0 ? Math.floor(data.totalFunding / burnRate) : 0;
    onUpdate({ burnRate, runway });
  };

  const isValid = data.totalFunding > 0 && data.burnRate > 0 && totalAllocation === 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Plan your fund utilization by allocating percentages to different categories and calculating your runway.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Funding Amount</label>
              <Input
                type="number"
                value={data.totalFunding || ""}
                onChange={(e) => onUpdate({ totalFunding: Number(e.target.value) })}
                placeholder="Enter total funding amount"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Burn Rate</label>
              <Input
                type="number"
                value={data.burnRate || ""}
                onChange={(e) => updateBurnRate(Number(e.target.value))}
                placeholder="Expected monthly expenses"
              />
              {data.runway > 0 && (
                <p className="text-sm text-muted-foreground">
                  Estimated runway: {data.runway} months
                </p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Fund Allocation</h3>
              <span className="text-sm text-muted-foreground">
                Remaining: {remainingPercentage}%
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(fundingCategories).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="number"
                value={newPercentage}
                onChange={(e) => setNewPercentage(e.target.value)}
                placeholder="Allocation %"
              />

              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
              />
            </div>

            <Button
              type="button"
              onClick={handleAddAllocation}
              disabled={!newCategory || !newPercentage || remainingPercentage <= 0}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Allocation
            </Button>
          </div>

          {data.allocation?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Allocated Categories</h3>
              <div className="space-y-2">
                {data.allocation.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {fundingCategories[item.category as keyof typeof fundingCategories]}
                      </p>
                      <div className="text-sm text-muted-foreground">
                        <p>{item.percentage}% | Amount: {item.amount.toLocaleString()}</p>
                        {item.description && <p>{item.description}</p>}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveAllocation(index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {totalAllocation !== 100 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Total allocation must equal 100%. Current total: {totalAllocation}%
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Next
        </Button>
      </div>
    </motion.div>
  );
}
