import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Editor } from "@tiptap/react";
import { Check, ChevronDown } from "lucide-react";
import React, { useState } from "react";

import { HIGHLIGHT_COLORS, TEXT_COLORS } from "../constants";

interface ColorSelectorProps {
  editor: Editor;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  toolbar?: boolean;
}

export function ColorSelector({
  editor,
  open,
  onOpenChange,
  toolbar = false,
}: ColorSelectorProps) {
  const activeColor = TEXT_COLORS.find(({ color }) =>
    editor.isActive("textStyle", { color })
  );
  const activeHighlight = HIGHLIGHT_COLORS.find(({ color }) =>
    editor.isActive("highlight", { color })
  );

  const [localOpen, setLocalOpen] = useState<boolean>(false);

  const isOpen = open ?? localOpen;
  const setIsOpen = (val: boolean) => {
    setLocalOpen(val);
    onOpenChange?.(val);
  };

  return (
    <Popover modal={true} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          className={cn("gap-2 rounded-none", {
            "rounded-lg": toolbar,
          })}
          variant="ghost"
        >
          <span
            className="rounded-sm px-1"
            style={{
              color: activeColor?.color,
              backgroundColor: activeHighlight?.color,
            }}
          >
            A
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        sideOffset={5}
        className="my-1 flex max-h-80 w-48 flex-col overflow-hidden overflow-y-auto rounded border p-1 shadow-xl"
        align="start"
      >
        <div className="flex flex-col">
          <div className="my-1 px-2 text-sm font-semibold text-muted-foreground">
            Color
          </div>
          {TEXT_COLORS.map(({ name, color }, index) => (
            <div
              key={index}
              className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent"
              onClick={() => {
                editor.chain().focus().unsetColor().run();
                if (name !== "Default") {
                  editor.chain().focus().setColor(color).run();
                }
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-sm border px-2 py-px font-medium"
                  style={{ color }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="my-1 px-2 text-sm font-semibold text-muted-foreground">
            Background
          </div>
          {HIGHLIGHT_COLORS.map(({ name, color }, index) => (
            <div
              key={index}
              className="flex cursor-pointer items-center justify-between px-2 py-1 text-sm hover:bg-accent"
              onClick={() => {
                editor.chain().focus().unsetHighlight().run();
                if (name !== "Default") {
                  editor.chain().focus().setHighlight({ color }).run();
                }
                setIsOpen(false);
              }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="rounded-sm border px-2 py-px font-medium"
                  style={{ backgroundColor: color }}
                >
                  A
                </div>
                <span>{name}</span>
              </div>
              {editor.isActive("highlight", { color }) && (
                <Check className="h-4 w-4" />
              )}
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
