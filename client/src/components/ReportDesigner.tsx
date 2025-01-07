import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Eye,
  EyeOff,
  Settings,
  Save,
} from "lucide-react";

interface ReportSection {
  id: string;
  title: string;
  visible: boolean;
  component: string;
  customization?: {
    chartType?: string;
    metrics?: string[];
    layout?: "compact" | "detailed";
  };
}

interface SortableItemProps {
  section: ReportSection;
  onVisibilityToggle: (id: string) => void;
  onCustomize: (id: string) => void;
}

function SortableItem({ section, onVisibilityToggle, onCustomize }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <button
              className="cursor-grab hover:text-primary"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-5 w-5" />
            </button>
            <CardTitle className="text-lg">{section.title}</CardTitle>
          </div>
          <div className="flex items-center gap-4">
            <Switch
              checked={section.visible}
              onCheckedChange={() => onVisibilityToggle(section.id)}
              aria-label={`Toggle ${section.title} visibility`}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCustomize(section.id)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export function ReportDesigner() {
  const [sections, setSections] = useState<ReportSection[]>([
    {
      id: "executive-summary",
      title: "Executive Summary",
      visible: true,
      component: "ExecutiveSummary",
    },
    {
      id: "market-analysis",
      title: "Market Analysis",
      visible: true,
      component: "MarketAnalysis",
      customization: {
        chartType: "bar",
        metrics: ["revenue", "ebitda", "growth"],
      },
    },
    {
      id: "financial-projections",
      title: "Financial Projections",
      visible: true,
      component: "FinancialProjections",
      customization: {
        chartType: "line",
        metrics: ["revenue", "cashFlow", "ebitda"],
      },
    },
    {
      id: "risk-analysis",
      title: "Risk Analysis",
      visible: true,
      component: "RiskAnalysis",
      customization: {
        layout: "detailed",
      },
    },
    {
      id: "ai-insights",
      title: "AI Insights",
      visible: true,
      component: "AIInsights",
    },
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((sections) => {
        const oldIndex = sections.findIndex((s) => s.id === active.id);
        const newIndex = sections.findIndex((s) => s.id === over.id);

        return arrayMove(sections, oldIndex, newIndex);
      });
    }
  };

  const handleVisibilityToggle = (id: string) => {
    setSections((sections) =>
      sections.map((section) =>
        section.id === id
          ? { ...section, visible: !section.visible }
          : section
      )
    );
  };

  const handleCustomize = (id: string) => {
    // TODO: Open customization modal for the section
    console.log("Customize section:", id);
  };

  const handleSaveLayout = () => {
    // TODO: Save layout configuration to backend
    console.log("Save layout:", sections);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Customize Report Layout</h2>
        <Button onClick={handleSaveLayout}>
          <Save className="h-4 w-4 mr-2" />
          Save Layout
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sections.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {sections.map((section) => (
            <SortableItem
              key={section.id}
              section={section}
              onVisibilityToggle={handleVisibilityToggle}
              onCustomize={handleCustomize}
            />
          ))}
        </SortableContext>
      </DndContext>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Section Visibility</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Card key={section.id} className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{section.title}</span>
                <div className="flex items-center gap-2">
                  {section.visible ? (
                    <Eye className="h-4 w-4 text-green-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
