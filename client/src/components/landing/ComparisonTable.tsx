import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, X, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

export function ComparisonTable() {
  const features = [
    { name: "Quick Calculator", us: true, others: true },
    { name: "Multiple Valuation Methods", us: true, others: false },
    { name: "India-Specific Benchmarks", us: true, others: false },
    { name: "INR Support", us: true, others: false },
    { name: "DPIIT Recognition Integration", us: true, others: false },
    { name: "Government Scheme Matching", us: true, others: false },
    { name: "Investment Readiness Score", us: true, others: false },
    { name: "AI-Powered Analysis", us: true, others: false },
    { name: "Investor-Ready PDF Reports", us: true, others: "Limited" },
    { name: "Multi-Currency Support (40+)", us: true, others: "Few" },
    { name: "Free Forever Plan", us: true, others: false },
    { name: "White-Label Reports", us: true, others: false },
  ];

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold mb-4">
            Why Choose ValuateIN?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built specifically for Indian startups with features you won't find elsewhere
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Our Platform Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="md:col-span-1"
            >
              <Card className="border-2 border-primary shadow-lg h-full">
                <CardHeader className="bg-gradient-to-br from-primary/10 to-purple/10 text-center pb-6">
                  <div className="flex justify-center mb-2">
                    <Badge className="bg-primary text-white">
                      <Star className="w-3 h-3 mr-1" fill="currentColor" />
                      Recommended
                    </Badge>
                  </div>
                  <CardTitle className="text-2xl">ValuateIN</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Built for India
                  </p>
                  <div className="mt-4">
                    <div className="text-3xl font-bold text-primary">₹0</div>
                    <div className="text-sm text-muted-foreground">Free Forever</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0" />
                      <span className="text-sm font-medium">{feature.name}</span>
                    </div>
                  ))}
                  <div className="pt-4">
                    <Link href="/auth/signup">
                      <Button className="w-full" size="lg">
                        Get Started Free
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Generic Tools Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="md:col-span-1"
            >
              <Card className="h-full opacity-75">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl text-muted-foreground">
                    Generic Tools
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Basic calculators
                  </p>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-muted-foreground">$99+</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      {feature.others === true ? (
                        <Check className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : feature.others === false ? (
                        <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <span className="w-5 text-xs text-muted-foreground flex-shrink-0">
                          ⚠
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">{feature.name}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Manual CA/Consultant Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-1"
            >
              <Card className="h-full opacity-75">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl text-muted-foreground">
                    Manual Consulting
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    Traditional approach
                  </p>
                  <div className="mt-4">
                    <div className="text-2xl font-bold text-muted-foreground">₹50K+</div>
                    <div className="text-sm text-muted-foreground">per valuation</div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Quick Calculator</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Comprehensive Analysis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Instant Results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-xs text-muted-foreground flex-shrink-0">⏰</span>
                    <span className="text-sm text-muted-foreground">2-4 weeks turnaround</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-xs text-muted-foreground flex-shrink-0">💰</span>
                    <span className="text-sm text-muted-foreground">High cost per valuation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <X className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">Self-service updates</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <Card className="bg-gradient-to-r from-primary/5 to-purple/5 border-2 border-primary/20">
              <CardContent className="py-8">
                <h3 className="text-2xl font-bold mb-2">
                  Get the Best of Both Worlds
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  AI-powered accuracy at a fraction of the cost, with instant results.
                  Perfect for Indian startups from Pre-seed to Series C.
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Link href="/">
                    <Button size="lg" variant="outline">
                      Try Quick Calculator
                    </Button>
                  </Link>
                  <Link href="/auth/signup">
                    <Button size="lg">
                      Start Free Account
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
