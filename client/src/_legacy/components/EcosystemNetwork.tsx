import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Badge } from "@/components/ui/badge";

interface NetworkNode {
  name: string;
  x: number;
  y: number;
  size: number;
  category: string;
  connections: string[];
}

interface EcosystemNetworkProps {
  data: {
    nodes: NetworkNode[];
    industry: string;
    stage: string;
  } | null;
}

export function EcosystemNetwork({ data }: EcosystemNetworkProps) {
  if (!data) return null;

  const categoryColors = {
    investor: "hsl(var(--primary))",
    competitor: "hsl(var(--destructive))",
    partner: "hsl(var(--success))",
    supplier: "hsl(var(--warning))",
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const node = payload[0].payload;
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-background border rounded-lg shadow-lg p-3"
        >
          <p className="font-medium">{node.name}</p>
          <p className="text-sm text-muted-foreground capitalize">
            {node.category}
          </p>
          {node.connections.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium">Connections:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {node.connections.map((connection, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {connection}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Ecosystem Network
          <div className="flex gap-2">
            <Badge variant="outline">{data.industry}</Badge>
            <Badge variant="outline">{data.stage}</Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="h-[400px]"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
              <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
              <ZAxis type="number" dataKey="size" range={[50, 400]} />
              <Tooltip content={<CustomTooltip />} />
              <Scatter data={data.nodes} shape="circle">
                {data.nodes.map((node, index) => (
                  <Cell
                    key={index}
                    fill={categoryColors[node.category as keyof typeof categoryColors]}
                  />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2"
        >
          {Object.entries(categoryColors).map(([category, color]) => (
            <div key={category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-sm capitalize">{category}</span>
            </div>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
}
