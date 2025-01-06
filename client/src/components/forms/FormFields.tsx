import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  sectors,
  businessStages,
  regions,
  valuationPurposes,
  differentiationLevels,
  complianceStandards,
  ipProtectionStatus,
  taxComplianceStatus,
  esgImpactLevels,
} from "@/lib/validations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Enhanced field tooltip wrapper
function FieldTooltip({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">{label}</span>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <HelpCircle className="h-4 w-4 text-muted-foreground" />
          </TooltipTrigger>
          <TooltipContent>{description}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// Text Input Field with enhanced tooltips
export function TextFormField({ form, name, label, description, placeholder, className }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-1", className)}>
          <FieldTooltip label={label} description={description} />
          <FormControl>
            <Input placeholder={placeholder} {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Number Input Field with suggestions
export function NumberFormField({ form, name, label, description, min, max, suggestion, unit = "" }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FieldTooltip label={label} description={description} />
          <div className="relative">
            <FormControl>
              <Input
                type="number"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
                min={min}
                max={max}
                className="pr-12"
              />
            </FormControl>
            {unit && (
              <span className="absolute right-3 top-2.5 text-sm text-muted-foreground">
                {unit}
              </span>
            )}
          </div>
          {suggestion && (
            <FormDescription className="mt-1 flex items-center gap-2">
              <span>Suggestion: {suggestion}</span>
              <button
                type="button"
                onClick={() => field.onChange(suggestion)}
                className="text-xs text-primary hover:underline"
              >
                Use this value
              </button>
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Enhanced Slider Field with visual feedback
export function SliderFormField({ form, name, label, description, min, max, step = 1, suggestion }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FieldTooltip label={label} description={description} />
          <FormControl>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Slider
                  min={min}
                  max={max}
                  step={step}
                  value={[field.value]}
                  onValueChange={([value]) => field.onChange(value)}
                  className="flex-1"
                />
                <span className="w-12 text-sm font-medium">{field.value}</span>
              </div>
              {suggestion !== undefined && (
                <FormDescription className="flex items-center gap-2">
                  <span>Industry average: {suggestion}</span>
                  <button
                    type="button"
                    onClick={() => field.onChange(suggestion)}
                    className="text-xs text-primary hover:underline"
                  >
                    Use average
                  </button>
                </FormDescription>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Select Field with enhanced visual feedback
export function SelectFormField({ form, name, label, description, options, suggestion }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FieldTooltip label={label} description={description} />
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${label.toLowerCase()}`} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(options).map(([key, value]: [string, any]) => (
                <SelectItem key={key} value={key}>
                  {value.name || value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {suggestion && (
            <FormDescription>
              Suggested: {suggestion}
            </FormDescription>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Pre-configured field components with enhanced descriptions
export function SectorField({ form }: any) {
  return (
    <SelectFormField
      form={form}
      name="sector"
      label="Sector"
      description="Choose the primary industry sector that best describes your business operations"
      options={sectors}
    />
  );
}

export function BusinessStageField({ form }: any) {
  return (
    <SelectFormField
      form={form}
      name="stage"
      label="Business Stage"
      description="Select the current development stage of your business. This helps us adjust valuation methods accordingly."
      options={businessStages}
    />
  );
}

export function RegionField({ form }: any) {
  return (
    <SelectFormField
      form={form}
      name="region"
      label="Region"
      description="Choose your primary operating region. This affects compliance requirements and market adjustments."
      options={regions}
    />
  );
}

export function ValuationPurposeField({ form }: any) {
  return (
    <SelectFormField
      form={form}
      name="valuationPurpose"
      label="Valuation Purpose"
      description="Tell us why you need this valuation. This helps us tailor the report to your needs."
      options={valuationPurposes}
    />
  );
}

export function CompetitiveDifferentiationField({ form }: any) {
  return (
    <SelectFormField
      form={form}
      name="competitiveDifferentiation"
      label="Competitive Differentiation"
      description="How unique is your product/service compared to competitors? This affects market positioning and growth potential."
      options={differentiationLevels}
    />
  );
}

export function IpProtectionField({ form }: any) {
  return (
    <SelectFormField
      form={form}
      name="ipProtection"
      label="IP Protection Status"
      description="Select your current intellectual property protection status. This impacts risk assessment and valuation multiples."
      options={ipProtectionStatus}
    />
  );
}

export function TaxComplianceField({ form }: any) {
  return (
    <SelectFormField
      form={form}
      name="taxCompliance"
      label="Tax Compliance Status"
      description="Indicate your current tax compliance status. This affects risk assessment and regulatory considerations."
      options={taxComplianceStatus}
    />
  );
}

export function EsgImpactField({ form }: any) {
  return (
    <SelectFormField
      form={form}
      name="esgImpact"
      label="ESG Impact"
      description="Rate your business's environmental, social, and governance impact. This can affect valuation multiples and investor appeal."
      options={esgImpactLevels}
    />
  );
}