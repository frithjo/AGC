import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/react";
import React from "react";
import { selectorItems } from "../constants";

export function TextButtons({
  editor,
  toolbar,
}: {
  editor: Editor;
  toolbar: boolean;
}) {
  return (
    <div className="flex gap-0.5">
      {selectorItems.map((item, index) => {
        const active = item.isActive(editor);
        return (
          <Button
            key={index}
            size="sm"
            className={cn({
              "rounded-lg": toolbar,
              "rounded-none": !toolbar,
              "bg-accent": active && toolbar,
              "text-primary": active,
            })}
            variant="ghost"
            onClick={() => item.command(editor)}
          >
            <item.icon className="h-4 w-4" />
          </Button>
        );
      })}
    </div>
  );
}
