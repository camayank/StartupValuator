import { CompanyCardView } from "@/components/CompanyCardView";
import { motion } from "framer-motion";
import { ArrowRight, Brain } from "lucide-react";

export default function ValuationCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div 
        className="max-w-6xl mx-auto space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <motion.h1 
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Value Your Company
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Get an accurate valuation in minutes using advanced AI and real market data
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <CompanyCardView 
            onDataChange={(data) => {
              console.log('Company data updated:', data);
              // Will implement data handling in next iteration
            }}
          />
        </motion.div>

        <motion.div 
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-sm text-muted-foreground">
            <Brain className="w-4 h-4 text-primary" />
            <span>Powered by advanced AI algorithms</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}