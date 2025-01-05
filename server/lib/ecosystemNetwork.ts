interface NetworkNode {
  name: string;
  x: number;
  y: number;
  size: number;
  category: string;
  connections: string[];
}

const INDUSTRY_ECOSYSTEMS = {
  tech: {
    investors: ["Tech Ventures", "Digital Innovation Fund", "Silicon Valley Capital"],
    competitors: ["TechCorp", "InnovateTech", "FutureSolutions"],
    partners: ["Cloud Services Inc", "DevOps Pro", "Security Solutions"],
    suppliers: ["Hardware Solutions", "Infrastructure Provider", "Data Center Co"],
  },
  ecommerce: {
    investors: ["Retail Capital", "E-commerce Fund", "Digital Retail Ventures"],
    competitors: ["ShopNow", "E-Store", "Digital Marketplace"],
    partners: ["Logistics Pro", "Payment Solutions", "Customer Support Inc"],
    suppliers: ["Inventory Systems", "Packaging Solutions", "Shipping Partners"],
  },
  saas: {
    investors: ["SaaS Capital", "Cloud Ventures", "Enterprise Fund"],
    competitors: ["CloudSoft", "SaaS Solutions", "Enterprise Tech"],
    partners: ["API Services", "Integration Pro", "Cloud Infrastructure"],
    suppliers: ["Server Provider", "Analytics Platform", "Security Services"],
  },
  marketplace: {
    investors: ["Market Ventures", "Platform Capital", "Network Fund"],
    competitors: ["MarketPro", "Exchange Hub", "Trading Platform"],
    partners: ["Payment Gateway", "Escrow Services", "Support Solutions"],
    suppliers: ["Infrastructure Co", "Security Provider", "Data Analytics"],
  },
};

function generateRandomPosition(index: number, total: number): { x: number; y: number } {
  const angle = (index / total) * 2 * Math.PI;
  const radius = 40;
  const centerX = 50;
  const centerY = 50;
  
  return {
    x: centerX + radius * Math.cos(angle),
    y: centerY + radius * Math.sin(angle),
  };
}

export function generateEcosystemNetwork(params: {
  industry: string;
  stage: string;
}): { nodes: NetworkNode[]; industry: string; stage: string } {
  const ecosystem = INDUSTRY_ECOSYSTEMS[params.industry as keyof typeof INDUSTRY_ECOSYSTEMS];
  const nodes: NetworkNode[] = [];
  
  // Generate nodes for each category
  Object.entries(ecosystem).forEach(([category, entities]) => {
    const singularCategory = category.slice(0, -1); // Remove 's' from plural
    entities.forEach((name, index) => {
      const position = generateRandomPosition(nodes.length, 12); // 12 total nodes (3 per category)
      const connections = [];
      
      // Add random connections
      const otherEntities = Object.values(ecosystem)
        .flat()
        .filter(e => e !== name);
      for (let i = 0; i < 2; i++) {
        const randomEntity = otherEntities[Math.floor(Math.random() * otherEntities.length)];
        if (!connections.includes(randomEntity)) {
          connections.push(randomEntity);
        }
      }
      
      nodes.push({
        name,
        x: position.x,
        y: position.y,
        size: Math.random() * 100 + 100,
        category: singularCategory,
        connections,
      });
    });
  });
  
  return {
    nodes,
    industry: params.industry,
    stage: params.stage,
  };
}
