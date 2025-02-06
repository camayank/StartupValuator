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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { sectorOperations, SectorSchema } from "@/lib/constants/business-sectors";

interface CascadingDropdownsProps {
  onSelectionChange: (selection: { sector: string; segment: string; subSegment: string }) => void;
}

export function CascadingDropdowns({ onSelectionChange }: CascadingDropdownsProps) {
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedSubSegment, setSelectedSubSegment] = useState<string>("");
  const { toast } = useToast();

  const [segments, setSegments] = useState<Array<{ value: string; label: string }>>([]);
  const [subSegments, setSubSegments] = useState<Array<{ value: string; label: string }>>([]);

  // Reset dependent dropdowns when parent selection changes
  useEffect(() => {
    if (selectedSector) {
      setSegments(sectorOperations.getSegmentsForSector(selectedSector));
      setSelectedSegment("");
      setSelectedSubSegment("");
    }
  }, [selectedSector]);

  useEffect(() => {
    if (selectedSector && selectedSegment) {
      setSubSegments(sectorOperations.getSubSegments(selectedSector, selectedSegment));
      setSelectedSubSegment("");
    }
  }, [selectedSector, selectedSegment]);

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

    // Log selection to console as required
    console.log({
      sector: selectedSector,
      segment: selectedSegment,
      subSegment: selectedSubSegment
    });

    toast({
      title: "Selection Complete",
      description: `Selected: ${selectedSector} > ${selectedSegment} > ${selectedSubSegment}`,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Business Sector Selection</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Business Sector</Label>
          <Select
            value={selectedSector}
            onValueChange={setSelectedSector}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a sector" />
            </SelectTrigger>
            <SelectContent>
              {sectorOperations.getAllSectors().map(({ value, label }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Industry Segment</Label>
          <Select
            value={selectedSegment}
            onValueChange={setSelectedSegment}
            disabled={!selectedSector}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedSector ? "Select a segment" : "First select a sector"} />
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
          <Label>Sub-Segment</Label>
          <Select
            value={selectedSubSegment}
            onValueChange={setSelectedSubSegment}
            disabled={!selectedSegment}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={selectedSegment ? "Select a sub-segment" : "First select a segment"} />
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
          Submit Selection
        </Button>
      </CardContent>
    </Card>
  );
}