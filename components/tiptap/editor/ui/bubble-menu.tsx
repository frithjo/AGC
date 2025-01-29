import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Editor } from "@tiptap/core";
import { BubbleMenu } from "@tiptap/react";
import { Sparkles } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { AISelector } from "./ai-selectors";

export default function BubbleMenuRoot({
  children,
  editor,
  className,
}: {
  children: React.ReactNode;
  editor: Editor;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ placement: "top" }}
      shouldShow={({ editor, state }) => {
        const { selection } = state;
        if (!editor.isEditable || selection.empty) return false;
        return true;
      }}
      className={cn(
        "flex w-fit max-w-[90vw] overflow-hidden rounded-md border border-gray-200 bg-white shadow-xl",
        className
      )}
    >
      {open ? (
        <AISelector editor={editor} open={open} onOpenChange={setOpen} />
      ) : (
        <>
          <Button
            className="gap-1 rounded-none text-primary"
            variant="ghost"
            onClick={() => setOpen(true)}
            size="sm"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Ask AI
          </Button>
          {children}
        </>
      )}
    </BubbleMenu>
  );
}
