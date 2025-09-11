import React, { forwardRef } from "react";
import { Handle } from "@xyflow/react";
import  { cn }  from "../../utils/utils"; 

export const BaseHandle = forwardRef(function BaseHandle(
  { className, children, ...props }, ref
) {
  return (
    <Handle
      ref={ref}
      {...props}
      className={cn(
        "h-[11px] w-[11px] rounded-full border border-slate-300 bg-slate-100 transition dark:border-secondary dark:bg-secondary",
        className
      )}
    >
      {children}
    </Handle>
  );
});

BaseHandle.displayName = "BaseHandle";