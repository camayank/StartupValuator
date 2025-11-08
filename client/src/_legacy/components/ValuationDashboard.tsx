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
  Plus,
  X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type ValuationModel = "DCF" | "LBO" | "Comparables";

interface ModelConfig {
  type: ValuationModel;
  assumptions: Record<string, number>;
  results: Record<string, number>;
}

interface PanelState {
  id: string;
  model: ModelConfig;
}

const DEFAULT_ASSUMPTIONS = {
  DCF: {
    discountRate: 0.12,
    growthRate: 0.03,
    terminalValue: 10,
  },
  LBO: {
    debtRatio: 0.7,
    exitMultiple: 8,
    interestRate: 0.08,
  },
  Comparables: {
    evEbitdaMultiple: 12,
    evRevenueMultiple: 3,
    peRatio: 15,
  },
};

const ModelPanel: React.FC<{
  model: ModelConfig;
  onUpdate: (assumptions: Record<string, number>) => void;
  onRemove?: () => void;
}> = ({ model, onUpdate, onRemove }) => (
  <Card className="h-full">
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{model.type} Model</h3>
        {onRemove && (
          <Button variant="ghost" size="icon" onClick={onRemove}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="space-y-4">
        {Object.entries(model.assumptions).map(([key, value]) => (
          <div key={key} className="space-y-2">
            <label className="text-sm font-medium">{key}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => {
                const newAssumptions = {
                  ...model.assumptions,
                  [key]: parseFloat(e.target.value) || 0,
                };
                onUpdate(newAssumptions);
              }}
              className="w-full p-2 border rounded"
              step="0.01"
            />
          </div>
        ))}
      </div>
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
  const [panels, setPanels] = useState<PanelState[]>([
    {
      id: "dcf",
      model: {
        type: "DCF",
        assumptions: DEFAULT_ASSUMPTIONS.DCF,
        results: {},
      },
    },
  ]);
  const [activeModel, setActiveModel] = useState<ValuationModel>("DCF");

  const addModel = (type: ValuationModel) => {
    if (panels.length >= 3) {
      toast({
        title: "Maximum models reached",
        description: "You can only compare up to 3 models at a time.",
      });
      return;
    }

    setPanels([
      ...panels,
      {
        id: `${type.toLowerCase()}-${panels.length}`,
        model: {
          type,
          assumptions: DEFAULT_ASSUMPTIONS[type],
          results: {},
        },
      },
    ]);
  };

  const removePanel = (id: string) => {
    setPanels(panels.filter((panel) => panel.id !== id));
  };

  const updateModel = (id: string, assumptions: Record<string, number>) => {
    setPanels(
      panels.map((panel) =>
        panel.id === id
          ? {
              ...panel,
              model: {
                ...panel.model,
                assumptions,
              },
            }
          : panel
      )
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] p-4">
      <div className="mb-4 space-y-4">
        <ContextualToolbar activeModel={activeModel} />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addModel("DCF")}
            disabled={panels.length >= 3}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add DCF
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addModel("LBO")}
            disabled={panels.length >= 3}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add LBO
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addModel("Comparables")}
            disabled={panels.length >= 3}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Comparables
          </Button>
        </div>
      </div>

      <ResizablePanelGroup direction="horizontal" className="h-[calc(100%-8rem)]">
        {panels.map((panel, index) => (
          <React.Fragment key={panel.id}>
            {index > 0 && <ResizableHandle withHandle />}
            <ResizablePanel defaultSize={100 / panels.length} minSize={25}>
              <ModelPanel
                model={panel.model}
                onUpdate={(assumptions) => updateModel(panel.id, assumptions)}
                onRemove={
                  panels.length > 1 ? () => removePanel(panel.id) : undefined
                }
              />
            </ResizablePanel>
          </React.Fragment>
        ))}
      </ResizablePanelGroup>
    </div>
  );
}