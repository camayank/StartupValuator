import { Link } from "wouter";
import {
  Github,
  Twitter,
  Linkedin,
  Mail,
  Shield,
  FileText,
  Heart,
  TrendingUp,
  Globe
} from "lucide-react";
import { Button } from "./button";
import { Separator } from "./separator";

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Valuation Calculator", href: "/valuation/calculator" },
      { name: "Pricing", href: "/#pricing" },
      { name: "Features", href: "/#features" },
      { name: "Refer & Earn", href: "/referral" },
    ],
    company: [
      { name: "About Us", href: "/#about" },
      { name: "Blog", href: "/blog" },
      { name: "Careers", href: "/careers" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
      { name: "Cookie Policy", href: "/cookies" },
      { name: "Disclaimer", href: "/disclaimer" },
    ],
    resources: [
      { name: "Documentation", href: "/docs" },
      { name: "API Reference", href: "/api-docs" },
      { name: "Support", href: "/support" },
      { name: "Status", href: "/status" },
    ],
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/valuationpro", label: "Twitter" },
    { icon: Linkedin, href: "https://linkedin.com/company/valuationpro", label: "LinkedIn" },
    { icon: Github, href: "https://github.com/valuationpro", label: "GitHub" },
    { icon: Mail, href: "mailto:hello@valuationpro.com", label: "Email" },
  ];

  return (
    <footer className="border-t bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-8">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/">
              <div className="flex items-center space-x-2 mb-4 group cursor-pointer">
                <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary/80 group-hover:from-primary/90 group-hover:to-primary transition-all">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    ValuationPro
                  </h3>
                  <p className="text-xs text-muted-foreground">AI-Powered Valuations</p>
                </div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Professional startup valuations powered by AI. Trusted by 10,000+ founders
              and investors across India and 50+ countries worldwide.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Bank-grade security • GDPR compliant</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      {link.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      {link.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      {link.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link href={link.href}>
                    <a className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      {link.name}
                    </a>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>© {currentYear} ValuationPro. All rights reserved.</span>
            <span className="hidden md:inline">•</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> in India
            </span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <social.icon className="h-4 w-4 text-muted-foreground hover:text-primary transition-colors" />
              </a>
            ))}
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
              <Shield className="h-3 w-3" />
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
              <Globe className="h-3 w-3" />
              <span>50+ Countries</span>
            </div>
          </div>
        </div>

        {/* Additional Trust Line */}
        <div className="mt-6 pt-6 border-t text-center">
          <p className="text-xs text-muted-foreground max-w-3xl mx-auto">
            <strong>Disclaimer:</strong> ValuationPro provides AI-powered startup valuations for informational purposes only.
            These valuations should not be considered as financial, investment, or legal advice.
            Always consult with qualified professionals before making investment decisions.
          </p>
        </div>
      </div>
    </footer>
  );
}
