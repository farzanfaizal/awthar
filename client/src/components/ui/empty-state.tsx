import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
  variant?: "default" | "minimal";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("flex flex-col items-center justify-center p-8 text-center", className)}>
        {Icon && <Icon className="w-10 h-10 mb-4 text-muted-foreground/40" />}
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center border-2 border-dashed rounded-2xl bg-muted/5",
        className
      )}
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        {Icon ? (
          <Icon className="w-10 h-10 text-muted-foreground" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-muted-foreground/10" />
        )}
      </div>
      <h3 className="text-xl font-bold tracking-tight text-foreground">{title}</h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-lg">
        {description}
      </p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
