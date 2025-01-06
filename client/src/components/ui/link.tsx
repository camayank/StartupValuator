import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { Link as WouterLink } from "wouter"
import { cn } from "@/lib/utils"

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  children: React.ReactNode;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ href, children, className, ...props }, ref) => {
    // For external links
    if (href.startsWith('http') || href.startsWith('mailto:')) {
      return (
        <a
          ref={ref}
          href={href}
          className={cn("text-primary hover:underline", className)}
          {...props}
        >
          {children}
        </a>
      )
    }

    // For internal links
    return (
      <WouterLink href={href}>
        <a
          ref={ref}
          className={cn("text-primary hover:underline cursor-pointer", className)}
          {...props}
        >
          {children}
        </a>
      </WouterLink>
    )
  }
)
Link.displayName = "Link"

export { Link }
