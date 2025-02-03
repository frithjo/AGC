"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipArrow,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

export type TooltipProps = {
  children: React.ReactNode;
  text?: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "center" | "start" | "end";
  className?: string;
  sideOffset?: number;
  tooltipTextClassName?: string;
  arrowClassName?: string;
  contentComp?: React.ReactNode;
  contentClassName?: string;
  defaultOpen?: boolean;
  variant?: "default" | "exm";
};

export const SimpleTooltip = ({
  children,
  text,
  side = "bottom",
  align,
  className,
  sideOffset,
  tooltipTextClassName,
  arrowClassName,
  contentComp,
  contentClassName,
  defaultOpen = false,
  variant = "default",
}: TooltipProps) => {
  return !text && !contentComp ? (
    <div>{children}</div>
  ) : (
    <TooltipProvider delayDuration={100}>
      <Tooltip defaultOpen={defaultOpen}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent
          side={side}
          align={align}
          className={cn(
            className,
            variant === "exm"
              ? "rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground border-primary"
              : "text-sm hidden md:block"
          )}
          sideOffset={sideOffset}
        >
          {variant === "exm" && <TooltipArrow className={arrowClassName} />}
          {!contentComp ? (
            <p className={tooltipTextClassName}>{text}</p>
          ) : (
            <div className={contentClassName}>{contentComp}</div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
