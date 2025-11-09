import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  {
    question: "How accurate is the valuation?",
    answer: "Our AI-powered valuations use multiple industry-standard methods (DCF, Berkus, Scorecard, VC Method) and compare against 10,000+ real startup data points. For revenue-stage startups, accuracy is typically 85-95%. For pre-revenue, we provide a realistic range based on comparable companies.",
  },
  {
    question: "What valuation methods do you use?",
    answer: "We use 4 proven methods: (1) DCF (Discounted Cash Flow) for revenue-positive startups, (2) Berkus Method for pre-revenue startups, (3) Scorecard Method comparing to similar funded companies, and (4) VC Method based on expected ROI. Our hybrid approach combines all applicable methods for the most accurate result.",
  },
  {
    question: "Do I need to sign up to use the calculator?",
    answer: "No! Our Quick Calculator is 100% free with no signup required. You can get an instant valuation estimate in under 2 minutes. For detailed reports, investor-ready PDFs, and advanced features, create a free account.",
  },
  {
    question: "How is this different from other valuation tools?",
    answer: "Unlike generic calculators, we're specifically built for Indian startups with INR support, DPIIT recognition integration, and India-specific sector benchmarks (SaaS, D2C, Fintech, Edtech). We also support multi-currency (USD, EUR, GBP) for global startups and investors.",
  },
  {
    question: "Is my data secure?",
    answer: "Absolutely. We use bank-grade encryption (AES-256), are GDPR compliant, and never share your data with third parties. All calculations are done securely on our servers. You can delete your data anytime from your account settings.",
  },
  {
    question: "Can I use this for fundraising?",
    answer: "Yes! Our detailed reports are designed to be investor-ready. They include comprehensive breakdowns, comparable analysis, risk assessment, and professional formatting. Many of our users successfully raised funding using our valuation reports as supporting documentation.",
  },
  {
    question: "What's included in the free version?",
    answer: "The free version includes: Quick Calculator, 1 detailed valuation per month, basic reports, government scheme matching, and investment readiness score. Upgrade for unlimited valuations, white-label reports, API access, and priority support.",
  },
  {
    question: "How often should I revalue my startup?",
    answer: "We recommend quarterly valuations to track progress. Revalue immediately after: (1) Significant revenue milestones, (2) New funding rounds, (3) Major product launches, (4) Team expansions, or (5) Market changes. Regular valuations help you understand your growth trajectory.",
  },
  {
    question: "Do you support international currencies?",
    answer: "Yes! We support 40+ currencies including INR, USD, EUR, GBP, SGD, AED, and more. All valuations can be displayed in your preferred currency with real-time exchange rates. Perfect for cross-border investments and international expansion.",
  },
  {
    question: "Can CAs and advisors use this for clients?",
    answer: "Absolutely! We offer special features for Chartered Accountants and advisors: white-label reports (remove our branding), bulk valuations, client management dashboard, and compliance with Indian valuation standards. Contact us for CA-specific pricing and features.",
  },
];

export function FAQSection() {
  return (
    <section className="py-20 bg-gradient-to-b from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <HelpCircle className="w-8 h-8 text-primary" />
              </div>
            </div>
            <h2 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to know about startup valuations
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <AccordionItem
                  value={`item-${index}`}
                  className="bg-card border rounded-lg px-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  <AccordionTrigger className="text-left font-semibold text-base py-5 hover:no-underline">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>

          {/* CTA */}
          <motion.div
            className="mt-12 text-center"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-muted-foreground mb-4">
              Still have questions?
            </p>
            <div className="flex gap-4 justify-center">
              <a
                href="mailto:support@valuatein.com"
                className="text-primary hover:underline font-medium"
              >
                Email Support
              </a>
              <span className="text-muted-foreground">•</span>
              <a
                href="#"
                className="text-primary hover:underline font-medium"
              >
                Live Chat
              </a>
              <span className="text-muted-foreground">•</span>
              <a
                href="/documentation"
                className="text-primary hover:underline font-medium"
              >
                Documentation
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
