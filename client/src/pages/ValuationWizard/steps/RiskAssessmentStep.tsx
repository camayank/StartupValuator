import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";
import { 
  ipProtectionStatus, 
  differentiationLevels, 
  complianceStandards 
} from "@/lib/validations";

export function RiskAssessmentStep() {
  const form = useFormContext();

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="teamExperience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Team Experience (Years)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                placeholder="Enter average team experience" 
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
        name="intellectualProperty"
        render={({ field }) => (
          <FormItem>
            <FormLabel>IP Protection Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select IP status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(ipProtectionStatus).map(([key, status]) => (
                  <SelectItem key={key} value={key}>
                    {status}
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
        name="competitiveDifferentiation"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Competitive Differentiation</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select differentiation level" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(differentiationLevels).map(([key, level]) => (
                  <SelectItem key={key} value={key}>
                    {level}
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
        name="complianceStandard"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Compliance Standard</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select compliance standard" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {Object.entries(complianceStandards).map(([key, standard]) => (
                  <SelectItem key={key} value={key}>
                    {standard}
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
