import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info, Plus, Minus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { expenseCategories } from "@/lib/validations";
import { motion } from "framer-motion";

interface ExpenseProjectionsStepProps {
  data: {
    baseExpenses: number;
    expenseAssumptions: {
      category: string;
      percentage: number;
      description: string;
    }[];
  };
  onUpdate: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ExpenseProjectionsStep({
  data,
  onUpdate,
  onNext,
  onBack,
}: ExpenseProjectionsStepProps) {
  const [newCategory, setNewCategory] = useState("");
  const [newPercentage, setNewPercentage] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const handleAddExpense = () => {
    if (!newCategory || !newPercentage) return;

    const updatedAssumptions = [
      ...(data.expenseAssumptions || []),
      {
        category: newCategory,
        percentage: Number(newPercentage),
        description: newDescription,
      },
    ];

    onUpdate({
      expenseAssumptions: updatedAssumptions,
    });

    // Reset form
    setNewCategory("");
    setNewPercentage("");
    setNewDescription("");
  };

  const handleRemoveExpense = (index: number) => {
    const updatedAssumptions = [...data.expenseAssumptions];
    updatedAssumptions.splice(index, 1);
    onUpdate({ expenseAssumptions: updatedAssumptions });
  };

  const isValid = data.baseExpenses > 0 && data.expenseAssumptions?.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Enter your base expenses and add expense categories with their projected growth rates.
        </AlertDescription>
      </Alert>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Base Annual Expenses</label>
            <Input
              type="number"
              value={data.baseExpenses || ""}
              onChange={(e) => onUpdate({ baseExpenses: Number(e.target.value) })}
              placeholder="Enter base annual expenses"
              className="w-full"
            />
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-medium">Add Expense Category</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(expenseCategories).map(([key, { name }]) => (
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
                placeholder="Growth % per year"
              />

              <Input
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Description (optional)"
              />
            </div>

            <Button
              type="button"
              onClick={handleAddExpense}
              disabled={!newCategory || !newPercentage}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Expense Category
            </Button>
          </div>

          {data.expenseAssumptions?.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Added Categories</h3>
              <div className="space-y-2">
                {data.expenseAssumptions.map((expense, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {expenseCategories[expense.category as keyof typeof expenseCategories]?.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Growth: {expense.percentage}% | {expense.description}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExpense(index)}
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
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
