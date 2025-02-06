import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { HelpCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { BUSINESS_SECTORS, sectorOperations } from "@/lib/constants/business-sectors";
import { useState, useEffect } from "react";

export function BusinessProfileForm() {
  const form = useFormContext();
  const [availableSegments, setAvailableSegments] = useState<string[]>([]);
  const [availableSubSegments, setAvailableSubSegments] = useState<string[]>([]);

  // Watch for sector changes
  const selectedSector = form.watch("businessInfo.sector");
  const selectedSegment = form.watch("businessInfo.segment");

  // Update available segments when sector changes
  useEffect(() => {
    if (selectedSector) {
      const segments = Object.keys(BUSINESS_SECTORS[selectedSector] || {});
      setAvailableSegments(segments);
      // Reset segment and sub-segment when sector changes
      form.setValue("businessInfo.segment", "");
      form.setValue("businessInfo.subSegment", "");
    } else {
      setAvailableSegments([]);
    }
  }, [selectedSector, form]);

  // Update available sub-segments when segment changes
  useEffect(() => {
    if (selectedSector && selectedSegment) {
      const subSegments = BUSINESS_SECTORS[selectedSector]?.[selectedSegment] || [];
      setAvailableSubSegments(subSegments);
      // Reset sub-segment when segment changes
      form.setValue("businessInfo.subSegment", "");
    } else {
      setAvailableSubSegments([]);
    }
  }, [selectedSector, selectedSegment, form]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Business Profile</CardTitle>
        <CardDescription>Tell us about your business</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Business Name Field */}
        <FormField
          control={form.control}
          name="businessInfo.name"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Business Name</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Enter your company's legal or registered business name</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <FormControl>
                <Input placeholder="Enter business name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sector Field */}
        <FormField
          control={form.control}
          name="businessInfo.sector"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Business Sector</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select the primary sector your business operates in</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sector" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.keys(BUSINESS_SECTORS).map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Segment Field */}
        <FormField
          control={form.control}
          name="businessInfo.segment"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Industry Segment</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select your specific industry segment</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedSector}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a segment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableSegments.map((segment) => (
                    <SelectItem key={segment} value={segment}>
                      {segment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Sub-Segment Field */}
        <FormField
          control={form.control}
          name="businessInfo.subSegment"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center gap-2">
                <FormLabel>Sub-Segment</FormLabel>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select your specific sub-segment</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={!selectedSegment}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sub-segment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableSubSegments.map((subSegment) => (
                    <SelectItem key={subSegment} value={subSegment}>
                      {subSegment}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
}