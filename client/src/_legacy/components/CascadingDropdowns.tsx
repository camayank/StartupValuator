import { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { BUSINESS_SECTORS, SectorSchema } from "@/lib/constants/business-sectors";

interface CascadingDropdownsProps {
  onSelectionChange: (selection: { sector: string; segment: string; subSegment: string }) => void;
}

export function CascadingDropdowns({ onSelectionChange }: CascadingDropdownsProps) {
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedSubSegment, setSelectedSubSegment] = useState<string>("");
  const [outputMessage, setOutputMessage] = useState<string>("");
  const { toast } = useToast();

  // Get all sectors directly from BUSINESS_SECTORS
  const sectors = Object.keys(BUSINESS_SECTORS).map(sector => ({
    value: sector,
    label: sector
  }));

  // Get segments for selected sector
  const segments = selectedSector
    ? Object.keys(BUSINESS_SECTORS[selectedSector]).map(segment => ({
        value: segment,
        label: segment
      }))
    : [];

  // Get sub-segments for selected segment
  const subSegments = selectedSector && selectedSegment
    ? BUSINESS_SECTORS[selectedSector][selectedSegment].map(subSegment => ({
        value: subSegment,
        label: subSegment
      }))
    : [];

  // Reset dependent fields when parent selection changes
  useEffect(() => {
    if (selectedSector) {
      setSelectedSegment("");
      setSelectedSubSegment("");
      setOutputMessage("");
    }
  }, [selectedSector]);

  useEffect(() => {
    if (selectedSegment) {
      setSelectedSubSegment("");
    }
  }, [selectedSegment]);

  // Handle form submission
  const handleSubmit = () => {
    const result = SectorSchema.safeParse({
      sector: selectedSector,
      segment: selectedSegment,
      subSegment: selectedSubSegment
    });

    if (!result.success) {
      toast({
        title: "Validation Error",
        description: "Please complete all selections",
        variant: "destructive"
      });
      return;
    }

    onSelectionChange({
      sector: selectedSector,
      segment: selectedSegment,
      subSegment: selectedSubSegment
    });

    // Update output message
    setOutputMessage(`Sector: ${selectedSector} | Segment: ${selectedSegment} | Sub-Segment: ${selectedSubSegment}`);

    toast({
      title: "Success",
      description: "Selection has been recorded",
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-6">Select Business Information</h2>

      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="sector">Business Sector:</Label>
          <Select
            value={selectedSector}
            onValueChange={setSelectedSector}
          >
            <SelectTrigger className="w-full" id="sector">
              <SelectValue placeholder="Select Sector" />
            </SelectTrigger>
            <SelectContent>
              {sectors.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="segment">Industry Segment:</Label>
          <Select
            value={selectedSegment}
            onValueChange={setSelectedSegment}
            disabled={!selectedSector}
          >
            <SelectTrigger className="w-full" id="segment">
              <SelectValue placeholder="Select Segment" />
            </SelectTrigger>
            <SelectContent>
              {segments.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subSegment">Sub-Segment:</Label>
          <Select
            value={selectedSubSegment}
            onValueChange={setSelectedSubSegment}
            disabled={!selectedSegment}
          >
            <SelectTrigger className="w-full" id="subSegment">
              <SelectValue placeholder="Select Sub-Segment" />
            </SelectTrigger>
            <SelectContent>
              {subSegments.map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={handleSubmit}
          className="w-full"
          disabled={!selectedSector || !selectedSegment || !selectedSubSegment}
        >
          Submit
        </Button>

        {outputMessage && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-2">Selected Values:</h3>
            <p className="text-sm p-4 bg-secondary rounded-lg">{outputMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}