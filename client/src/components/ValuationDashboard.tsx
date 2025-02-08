import React, { useState } from "react";
import {
  ResizablePanel,
  ResizablePanelGroup,
  ResizableHandle,
} from "@/components/ui/resizable";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Calculator,
  LineChart,
  BarChart,
  Settings,
  PieChart,
  Percent,
  DollarSign,
  Building,
} from "lucide-react";

type ValuationModel = "DCF" | "LBO" | "Comparables";

const DCFModelPanel = () => (
  <Card className="h-full">
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">DCF Model</h3>
      {/* DCF content will be implemented next */}
    </div>
  </Card>
);

const LBOModelPanel = () => (
  <Card className="h-full">
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">LBO Model</h3>
      {/* LBO content will be implemented next */}
    </div>
  </Card>
);

const ComparablesPanel = () => (
  <Card className="h-full">
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-4">Comparables Analysis</h3>
      {/* Comparables content will be implemented next */}
    </div>
  </Card>
);

const ContextualToolbar: React.FC<{ activeModel: ValuationModel }> = ({
  activeModel,
}) => {
  const toolbarControls = {
    DCF: [
      { icon: Percent, label: "Discount Rate" },
      { icon: LineChart, label: "Growth Rate" },
      { icon: DollarSign, label: "Terminal Value" },
    ],
    LBO: [
      { icon: Building, label: "Debt Schedule" },
      { icon: PieChart, label: "Capital Structure" },
      { icon: Calculator, label: "Exit Multiple" },
    ],
    Comparables: [
      { icon: BarChart, label: "Peer Group" },
      { icon: Settings, label: "Multiples" },
      { icon: Calculator, label: "Adjustments" },
    ],
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-muted rounded-md mb-4">
      {toolbarControls[activeModel].map(({ icon: Icon, label }) => (
        <Button
          key={label}
          variant="ghost"
          size="sm"
          className="flex items-center gap-2"
        >
          <Icon className="h-4 w-4" />
          <span>{label}</span>
        </Button>
      ))}
    </div>
  );
};

export function ValuationDashboard() {
  const [activeModel, setActiveModel] = useState<ValuationModel>("DCF");

  return (
    <div className="h-[calc(100vh-4rem)]">
      <ContextualToolbar activeModel={activeModel} />

      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={33} minSize={25}>
          <DCFModelPanel />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel>
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50}>
              <LBOModelPanel />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel>
              <ComparablesPanel />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}