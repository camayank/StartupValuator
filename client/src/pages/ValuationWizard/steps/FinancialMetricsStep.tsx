import {
  FormControl,
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
import { useFormContext } from "react-hook-form";
import { currencies } from "@/lib/validations";

export function FinancialMetricsStep() {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="revenue"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Annual Revenue</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Enter annual revenue" 
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
        name="currency"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Currency</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(currencies).map(([key, currency]) => (
                  <SelectItem key={key} value={key}>
                    {`${currency.symbol} ${currency.name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="growthRate"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Growth Rate (%)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Enter growth rate" 
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
        name="margins"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Profit Margins (%)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Enter profit margins" 
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
        name="ebitda"
        render={({ field }) => (
          <FormItem>
            <FormLabel>EBITDA</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Enter EBITDA" 
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
