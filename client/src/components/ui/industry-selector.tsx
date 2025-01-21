import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { InfoIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import IndustrySelector from "@/lib/industry-selector";

interface IndustrySelectorProps {
  value: {
    sector?: string;
    industry?: string;
  };
  onChange: (value: { sector?: string; industry?: string }) => void;
  error?: string;
}

export function IndustrySelectorComponent({
  value,
  onChange,
  error
}: IndustrySelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredIndustries, setFilteredIndustries] = useState(
    value.sector ? IndustrySelector.getIndustries(value.sector) : []
  );

  useEffect(() => {
    if (value.sector) {
      setFilteredIndustries(
        IndustrySelector.searchIndustries(value.sector, searchTerm)
      );
    }
  }, [value.sector, searchTerm]);

  const sectors = Object.keys(IndustrySelector.dependencies);

  return (
    <div className="space-y-4">
      {/* Sector Selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Business Sector</label>
        <Select
          value={value.sector}
          onValueChange={(sector) => {
            onChange({ sector, industry: undefined });
            setSearchTerm("");
          }}
        >
          <SelectTrigger className={error ? "border-red-500" : ""}>
            <SelectValue placeholder={IndustrySelector.ui.placeholder.sector} />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((sector) => (
              <SelectItem key={sector} value={sector}>
                <div className="flex items-center gap-2">
                  {sector}
                  <HoverCard>
                    <HoverCardTrigger>
                      <InfoIcon className="h-4 w-4 text-muted-foreground" />
                    </HoverCardTrigger>
                    <HoverCardContent>
                      <div className="space-y-2">
                        <h4 className="font-medium">{sector}</h4>
                        <p className="text-sm text-muted-foreground">
                          {IndustrySelector.getIndustries(sector).length} industries available
                        </p>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Industry Selector */}
      {value.sector && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Specific Industry</label>
          {IndustrySelector.ui.searchEnabled && (
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search industries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
          <Select
            value={value.industry}
            onValueChange={(industry) => onChange({ ...value, industry })}
          >
            <SelectTrigger className={error ? "border-red-500" : ""}>
              <SelectValue placeholder={IndustrySelector.ui.placeholder.industry} />
            </SelectTrigger>
            <SelectContent>
              {filteredIndustries.map((industry) => (
                <SelectItem key={industry.value} value={industry.value}>
                  <div className="flex items-center gap-2">
                    {industry.label}
                    {industry.description && IndustrySelector.ui.tooltips && (
                      <HoverCard>
                        <HoverCardTrigger>
                          <InfoIcon className="h-4 w-4 text-muted-foreground" />
                        </HoverCardTrigger>
                        <HoverCardContent>
                          <p className="text-sm">{industry.description}</p>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default IndustrySelectorComponent;
