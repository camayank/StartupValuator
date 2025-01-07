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
import { sectors, businessStages, regions, valuationPurposes } from "@/lib/validations";

export function BusinessInfoStep() {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="businessName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Name</FormLabel>
            <FormControl>
              <Input placeholder="Enter your business name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="sector"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Industry Sector</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a sector" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(sectors).map(([key, sector]) => (
                  <SelectItem key={key} value={key}>
                    {sector.name}
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
        name="stage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Business Stage</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select business stage" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(businessStages).map(([key, stage]) => (
                  <SelectItem key={key} value={key}>
                    {stage.name}
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
        name="region"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Region</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(regions).map(([key, region]) => (
                  <SelectItem key={key} value={key}>
                    {region.name}
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
        name="valuationPurpose"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Valuation Purpose</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select purpose" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(valuationPurposes).map(([key, purpose]) => (
                  <SelectItem key={key} value={key}>
                    {purpose}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
