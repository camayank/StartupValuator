import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { expenseCategories } from "@/lib/validations";
import type { FinancialProjectionData } from "@/lib/validations";

interface ExpensesProjectionsStepProps {
  data: Partial<FinancialProjectionData>;
  onUpdate: (data: Partial<FinancialProjectionData>) => void;
  onNext: () => void;
  onBack: () => void;
}

export function ExpensesProjectionsStep({ data, onUpdate, onNext, onBack }: ExpensesProjectionsStepProps) {
  const [expenses, setExpenses] = useState<Record<string, number>>(data.baseExpenses || {});

  const form = useForm<Partial<FinancialProjectionData>>({
    defaultValues: {
      baseExpenses: data.baseExpenses || 0,
      assumptions: {
        expenseAssumptions: data.assumptions?.expenseAssumptions || [],
      },
    },
  });

  const handleSubmit = (values: Partial<FinancialProjectionData>) => {
    onUpdate(values);
    onNext();
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Enter your expected expenses across different categories. This helps create accurate financial projections.
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {Object.entries(expenseCategories).map(([key, category]) => (
              <div key={key} className="space-y-4">
                <FormField
                  control={form.control}
                  name={`expenses.${key}`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{category.name}</FormLabel>
                      <FormDescription>
                        Monthly expense for {category.name.toLowerCase()}
                      </FormDescription>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          {...field}
                          onChange={(e) => {
                            const value = Number(e.target.value);
                            field.onChange(value);
                            setExpenses(prev => ({
                              ...prev,
                              [key]: value
                            }));
                            const total = Object.values({ ...expenses, [key]: value }).reduce((a, b) => a + b, 0);
                            form.setValue("baseExpenses", total);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="pl-4 border-l-2 border-muted space-y-2">
                  {category.subcategories.map((subcat, index) => (
                    <div key={index} className="text-sm text-muted-foreground">
                      • {subcat}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between pt-6 border-t">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">
              Continue
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
