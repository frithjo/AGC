import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Editor } from "@tiptap/react";
import { Check, Link2, Trash } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { getUrlFromString, isValidUrl } from "../utils";

interface LinkSelectorProps {
  editor: Editor;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  toolbar?: boolean;
}

export function LinkSelector({
  editor,
  open,
  onOpenChange,
  toolbar = false,
}: LinkSelectorProps) {
  const [localOpen, setLocalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isOpen = open ?? localOpen;
  const setIsOpen = (val: boolean) => {
    setLocalOpen(val);
    onOpenChange?.(val);
  };

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <Popover modal={true} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className={cn("gap-2 rounded-none", {
            "text-primary": editor.isActive("link"),
            "rounded-lg": toolbar,
            "bg-accent": editor.isActive("link") && toolbar,
          })}
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 p-0" sideOffset={10}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!inputRef.current) return;
            const url = getUrlFromString(inputRef.current.value);
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
              setIsOpen(false);
            }
          }}
          className="flex p-1"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Paste a link"
            className="flex-1 bg-background p-1 text-sm outline-none"
            defaultValue={editor.getAttributes("link").href || ""}
          />
          {editor.getAttributes("link").href ? (
            <Button
              size="icon"
              variant="outline"
              type="button"
              className="flex h-8 items-center rounded-sm p-1 text-red-600 transition-all hover:bg-red-100 dark:hover:bg-red-800"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setIsOpen(false);
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" className="h-8">
              <Check className="h-4 w-4" />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
}
