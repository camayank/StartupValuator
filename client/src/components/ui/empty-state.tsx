import * as React from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "./button"

export interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {Icon && (
        <div className="mb-4 rounded-full bg-muted p-6">
          <Icon className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      <h3 className="mb-2 text-xl font-semibold">{title}</h3>
      {description && (
        <p className="mb-6 max-w-md text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

// Specialized empty states
export interface DataEmptyStateProps {
  resourceName?: string
  onAction?: () => void
  actionLabel?: string
}

export function DataEmptyState({
  resourceName = "items",
  onAction,
  actionLabel = "Add New",
}: DataEmptyStateProps) {
  return (
    <EmptyState
      title={`No ${resourceName} found`}
      description={`Get started by creating your first ${resourceName.toLowerCase()}.`}
      action={
        onAction && (
          <Button onClick={onAction} size="lg">
            {actionLabel}
          </Button>
        )
      }
    />
  )
}

export interface SearchEmptyStateProps {
  searchTerm?: string
  onClear?: () => void
}

export function SearchEmptyState({
  searchTerm,
  onClear,
}: SearchEmptyStateProps) {
  return (
    <EmptyState
      title="No results found"
      description={
        searchTerm
          ? `No results found for "${searchTerm}". Try adjusting your search.`
          : "Try adjusting your search criteria."
      }
      action={
        onClear && (
          <Button onClick={onClear} variant="outline">
            Clear Search
          </Button>
        )
      }
    />
  )
}
