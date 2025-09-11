import React, { forwardRef } from "react";
import { cn } from "../../utils/utils"; 

export const BaseNode = forwardRef(function BaseNode(
  { className, selected, ...props }, ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "relative rounded-md border bg-card p-5 text-card-foreground",
        className,
        selected ? "border-muted-foreground shadow-lg" : "",
        "hover:ring-1"
      )}
      tabIndex={0}
      {...props}
    />
  );
});

BaseNode.displayName = "BaseNode";