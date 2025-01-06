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

// Text Input Field
export function TextFormField({ form, name, label, description }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Number Input Field
export function NumberFormField({ form, name, label, description, min, max }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type="number"
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
              min={min}
              max={max}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Slider Field
export function SliderFormField({ form, name, label, description, min, max }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex items-center space-x-2">
              <Slider
                min={min}
                max={max}
                step={1}
                value={[field.value]}
                onValueChange={([value]) => field.onChange(value)}
              />
              <span className="w-12 text-sm">{field.value}</span>
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Select Field with Dynamic Options
export function SelectFormField({ form, name, label, description, options }: any) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
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
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

// Pre-configured field components for specific inputs
export function SectorField({ form }: any) {
  return (
    <SelectFormField
      form={form}
      name="sector"
      label="Sector"
      description="Select the primary industry sector of your business"
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
      description="Select your business's current development stage"
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
      description="Select your primary operating region"
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
      description="Why do you need this valuation?"
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
      description="How differentiated is your product/service in the market?"
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
      description="Current status of your intellectual property protection"
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
      description="Current status of your tax compliance"
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
      description="Environmental, Social, and Governance impact level"
      options={esgImpactLevels}
    />
  );
}
