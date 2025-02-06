import { useState, useEffect } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { sectorOperations } from "@/lib/constants/business-sectors";

interface CascadingDropdownsProps {
  onSelectionChange: (selection: { sector: string; segment: string; subSegment: string }) => void;
}

export function CascadingDropdowns({ onSelectionChange }: CascadingDropdownsProps) {
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedSegment, setSelectedSegment] = useState<string>("");
  const [selectedSubSegment, setSelectedSubSegment] = useState<string>("");

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

  // Notify parent component of selection changes
  useEffect(() => {
    if (selectedSector && selectedSegment && selectedSubSegment) {
      onSelectionChange({
        sector: selectedSector,
        segment: selectedSegment,
        subSegment: selectedSubSegment
      });
    }
  }, [selectedSector, selectedSegment, selectedSubSegment, onSelectionChange]);

  return (
    <div className="space-y-4">
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
            <SelectValue placeholder="Select a segment" />
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
            <SelectValue placeholder="Select a sub-segment" />
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
    </div>
  );
}
