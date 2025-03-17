"use client";

import type React from "react";
import { cn } from "@/lib/utils";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { forwardRef } from "react";

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

const SimpleTooltip = forwardRef<HTMLSpanElement, TooltipProps>(
  (
    {
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
      ...props
    },
    ref
  ) => {
    return (
      <TooltipPrimitive.Provider delayDuration={100}>
        <TooltipPrimitive.Root defaultOpen={defaultOpen}>
          <TooltipPrimitive.Trigger asChild>
            <span
              ref={ref}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  (e.currentTarget as HTMLElement).click();
                }
              }}
              {...props}
            >
              {children}
            </span>
          </TooltipPrimitive.Trigger>
          <TooltipPrimitive.Portal>
            <TooltipPrimitive.Content
              side={side}
              align={align}
              className={cn(
                "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
                className,
                variant === "exm" &&
                  "rounded-lg bg-primary px-3 py-1.5 text-xs text-primary-foreground border-primary"
              )}
              sideOffset={sideOffset}
            >
              {variant === "exm" && (
                <TooltipPrimitive.Arrow className={arrowClassName} />
              )}
              {!contentComp ? (
                <p className={tooltipTextClassName}>{text}</p>
              ) : (
                <div className={contentClassName}>{contentComp}</div>
              )}
            </TooltipPrimitive.Content>
          </TooltipPrimitive.Portal>
        </TooltipPrimitive.Root>
      </TooltipPrimitive.Provider>
    );
  }
);

SimpleTooltip.displayName = "SimpleTooltip";

export { SimpleTooltip };
