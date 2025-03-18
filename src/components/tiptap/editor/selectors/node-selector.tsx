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

import { textItems } from "../constants";

interface NodeSelectorProps {
  editor: Editor;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  toolbar?: boolean;
}

export const NodeSelector = ({
  editor,
  open,
  onOpenChange,
  toolbar = false,
}: NodeSelectorProps) => {
  const [localOpen, setLocalOpen] = useState(false);

  const isOpen = open ?? localOpen;
  const setIsOpen = (val: boolean) => {
    setLocalOpen(val);
    onOpenChange?.(val);
  };

  // find the active item
  let activeItem = textItems.find((x) => x.isActive(editor));
  if (!activeItem) {
    activeItem = {
      name: "Multiple",
      icon: textItems[0].icon,
      command: () => {},
      isActive: () => false,
    };
  }

  return (
    <Popover modal={true} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        asChild
        className={cn(
          "gap-2 rounded-none border-none hover:bg-accent focus:ring-0",
          toolbar && "rounded-lg"
        )}
      >
        <Button size="sm" variant="ghost" className="gap-2">
          <activeItem.icon className="h-5 w-5" />
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={5} align="start" className="w-48 p-1">
        {textItems.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              item.command(editor);
              setIsOpen(false);
            }}
            className="flex cursor-pointer items-center justify-between rounded-sm px-2 py-1 text-sm hover:bg-accent"
          >
            <div className="flex items-center space-x-2">
              <div className="rounded-sm border p-1">
                <item.icon className="h-3 w-3" />
              </div>
              <span>{item.name}</span>
            </div>
            {activeItem.name === item.name && <Check className="h-4 w-4" />}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  );
};
