import { CompanyCardView } from "@/components/CompanyCardView";
import { ValuationForm } from "@/components/ValuationForm";
import { motion } from "framer-motion";
import { ArrowRight, Brain, Calculator, ChartBar, DollarSign, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ValuationCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <motion.div 
        className="max-w-7xl mx-auto space-y-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h1 
            className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            AI-Powered Startup Valuation
          </motion.h1>
          <motion.p 
            className="text-lg text-muted-foreground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Get precise valuations using advanced AI and real-time market data analysis
          </motion.p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced machine learning models for accurate valuations
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Market Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Real-time market data and competitor analysis
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/20 hover:border-primary/40 transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ChartBar className="h-5 w-5 text-primary" />
                Smart Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Comprehensive metrics and growth projections
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Valuation Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-primary/5 via-background to-background rounded-lg border shadow-lg"
        >
          <ValuationForm 
            onResult={(data) => {
              console.log('Valuation result:', data);
              // Handle valuation result
            }}
          />
        </motion.div>

        {/* AI Badge */}
        <motion.div 
          className="mt-8 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 text-sm text-muted-foreground hover:bg-primary/10 transition-colors">
            <Brain className="w-4 h-4 text-primary" />
            <span>Powered by advanced AI algorithms</span>
            <ArrowRight className="w-4 h-4" />
          </div>
        </motion.div>

        {/* Real-time Market Updates */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mt-12"
        >
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Market Insights
              </CardTitle>
              <CardDescription>
                Real-time market data and industry benchmarks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <CompanyCardView />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}