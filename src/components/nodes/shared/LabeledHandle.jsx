import React, { forwardRef } from "react";
import { cn } from "../../utils/utils"; 
import { BaseHandle } from "./base-handle";
import "./LabeledHandle.css";

const flexDirections = {
  top: "labeled-handle lh-top",
  right: "labeled-handle lh-right", 
  bottom: "labeled-handle lh-bottom",
  left: "labeled-handle lh-left",
};

export const LabeledHandle = forwardRef(function LabeledHandle(
  { className, labelClassName, handleClassName, title, position, ...props }, ref
) {
  return (
    <div
      ref={ref}
      title={title}
      className={cn(
        flexDirections[position],
        className
      )}
    >
      <BaseHandle position={position} className={handleClassName} {...props} />
      <label className={cn("labeled-handle-label", labelClassName)}>
        {title}
      </label>
    </div>
  );
});

LabeledHandle.displayName = "LabeledHandle";