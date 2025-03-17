"use client";

import { Slot } from "@radix-ui/react-slot";
import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";
import { cn } from "@/lib/utils";
import { SimpleTooltip } from "./simple-tooltip";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        small: "!h-8 w-8 hover:bg-gray-100 !px-1.5 !py-1",
        xmPrimary:
          "bg-xm-primary text-sm font-normal text-white  rounded-lg border-none flex items-center px-4 py-2.5 hover:bg-xm-primary-900",
        xmGrad:
          "text-white rounded-lg h-10 bg-gradient-to-r from-[#6562E7] via-[#E25B96] to-[#FFA352]",
        smallExm:
          "border border-input shadow-sm hover:bg-accent hover:text-accent-foreground !h-8 rounded-lg px-3 text-xs shadow-none",
        pink: "text-fuchsia-600 bg-fuchsia-200 hover:bg-fuchsia-250 text-sm font-medium rounded-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  tooltipText?: string;
  tooltipPosition?: "top" | "right" | "bottom" | "left";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      tooltipText,
      tooltipPosition,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const buttonClass = cn(buttonVariants({ variant, size, className }));

    if (tooltipText) {
      return (
        <SimpleTooltip text={tooltipText} side={tooltipPosition || "right"}>
          <Comp className={buttonClass} ref={ref} {...props} />
        </SimpleTooltip>
      );
    }
    return <Comp className={buttonClass} ref={ref} {...props} />;
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
