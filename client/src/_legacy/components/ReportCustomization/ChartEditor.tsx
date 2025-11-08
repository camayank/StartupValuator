import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartIcon, PaintBrush, BarChart3, LineChart, PieChart } from "lucide-react";
import { ChromePicker } from 'react-color';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ChartEditorProps {
  chartId: string;
  chartType: 'bar' | 'line' | 'pie';
  onChartUpdate: (config: ChartConfig) => void;
}

interface ChartConfig {
  type: 'bar' | 'line' | 'pie';
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
  labels: {
    title: string;
    xAxis: string;
    yAxis: string;
  };
  display: {
    legend: boolean;
    grid: boolean;
    animations: boolean;
  };
}

export function ChartEditor({
  chartId,
  chartType: initialChartType,
  onChartUpdate,
}: ChartEditorProps) {
  const [chartConfig, setChartConfig] = useState<ChartConfig>({
    type: initialChartType,
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      background: '#ffffff',
    },
    labels: {
      title: '',
      xAxis: '',
      yAxis: '',
    },
    display: {
      legend: true,
      grid: true,
      animations: true,
    },
  });

  const handleConfigUpdate = (update: Partial<ChartConfig>) => {
    const newConfig = { ...chartConfig, ...update };
    setChartConfig(newConfig);
    onChartUpdate(newConfig);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChartIcon className="h-5 w-5" />
          Chart Customization
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Chart Type Selection */}
          <div className="space-y-4">
            <Label>Chart Type</Label>
            <div className="grid grid-cols-3 gap-4">
              <Button
                variant={chartConfig.type === 'bar' ? 'default' : 'outline'}
                onClick={() => handleConfigUpdate({ type: 'bar' })}
                className="flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Bar
              </Button>
              <Button
                variant={chartConfig.type === 'line' ? 'default' : 'outline'}
                onClick={() => handleConfigUpdate({ type: 'line' })}
                className="flex items-center gap-2"
              >
                <LineChart className="h-4 w-4" />
                Line
              </Button>
              <Button
                variant={chartConfig.type === 'pie' ? 'default' : 'outline'}
                onClick={() => handleConfigUpdate({ type: 'pie' })}
                className="flex items-center gap-2"
              >
                <PieChart className="h-4 w-4" />
                Pie
              </Button>
            </div>
          </div>

          {/* Color Customization */}
          <div className="space-y-4">
            <Label>Colors</Label>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(chartConfig.colors).map(([key, color]) => (
                <div key={key} className="space-y-2">
                  <Label className="capitalize">{key}</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full h-8"
                        style={{ backgroundColor: color }}
                      >
                        <PaintBrush className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <ChromePicker
                        color={color}
                        onChange={(color) => {
                          handleConfigUpdate({
                            colors: {
                              ...chartConfig.colors,
                              [key]: color.hex,
                            },
                          });
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              ))}
            </div>
          </div>

          {/* Labels */}
          <div className="space-y-4">
            <Label>Labels</Label>
            <div className="space-y-4">
              <div>
                <Label>Chart Title</Label>
                <Input
                  value={chartConfig.labels.title}
                  onChange={(e) =>
                    handleConfigUpdate({
                      labels: { ...chartConfig.labels, title: e.target.value },
                    })
                  }
                  placeholder="Enter chart title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>X-Axis Label</Label>
                  <Input
                    value={chartConfig.labels.xAxis}
                    onChange={(e) =>
                      handleConfigUpdate({
                        labels: { ...chartConfig.labels, xAxis: e.target.value },
                      })
                    }
                    placeholder="X-Axis label"
                  />
                </div>
                <div>
                  <Label>Y-Axis Label</Label>
                  <Input
                    value={chartConfig.labels.yAxis}
                    onChange={(e) =>
                      handleConfigUpdate({
                        labels: { ...chartConfig.labels, yAxis: e.target.value },
                      })
                    }
                    placeholder="Y-Axis label"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Display Options */}
          <div className="space-y-4">
            <Label>Display Options</Label>
            <div className="space-y-2">
              {Object.entries(chartConfig.display).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={key}
                    checked={value}
                    onChange={(e) =>
                      handleConfigUpdate({
                        display: {
                          ...chartConfig.display,
                          [key]: e.target.checked,
                        },
                      })
                    }
                  />
                  <Label htmlFor={key} className="capitalize">
                    {key}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
