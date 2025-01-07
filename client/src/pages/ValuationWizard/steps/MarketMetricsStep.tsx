import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

export function MarketMetricsStep() {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="totalAddressableMarket"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Addressable Market (TAM)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Enter TAM size" 
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="marketShare"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Current Market Share (%)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Enter market share percentage" 
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="customerBase"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Total Customer Base</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Enter total number of customers" 
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
