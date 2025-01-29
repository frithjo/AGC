"use client";

import type { JSONContent } from "@tiptap/core";
import { EditorContent } from "@tiptap/react";
import React from "react";
import { useTiptap } from "./editor/hooks/use-tiptap";
import { TiptapImageResizer } from "./editor/image-resizer";
import { ColorSelector } from "./editor/selectors/color-selectors";
import { LinkSelector } from "./editor/selectors/link-selector";
import { NodeSelector } from "./editor/selectors/node-selector";
import { TextButtons } from "./editor/selectors/text-buttons";
import BubbleMenuRoot from "./editor/ui/bubble-menu";
import { Toolbar } from "./toolbar";
import { cn } from "@/lib/utils";
import { DEFAULT_HTML } from "../constants";
import { CheckIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

interface ITiptapEditorProps {
  value?: string;
  onChange: (val: JSONContent | string) => void;
  bubbleMenu?: boolean;
  slashCommand?: boolean;
  toolbar?: boolean;
  className?: string;
  output?: "json" | "html";
  basicToolbar?: boolean;
  editorClassName?: string;
  throttleDelay?: number;
  isSaving?: boolean;
}

const TiptapEditor = ({
  value,
  onChange,
  bubbleMenu = false,
  slashCommand: slashEnabled = false,
  toolbar = false,
  className,
  editorClassName,
  output = "html",
  basicToolbar = false,
  throttleDelay = 500,
  isSaving,
}: ITiptapEditorProps) => {
  const editor = useTiptap({
    slashEnabled,
    output: output || "html",
    onChange,
    editorClassName,
    initialContent: value || DEFAULT_HTML,
    throttleDelay,
  });

  if (!editor) {
    return (
      <div
        className={cn(
          "bg-background p-4 relative border rounded-2xl focus-within:border-primary min-h-80"
        )}
      >
        <p>Loading editor...</p>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="absolute top-4 right-4 rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground z-50">
        {isSaving ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin size-4" />
            <div>Saving...</div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div>
              <CheckIcon className="animate-pulse size-4 stroke-2" />
            </div>
            <div>Saved</div>
          </div>
        )}
      </div>

      {toolbar && (
        <Toolbar
          editor={editor}
          basicToolbar={basicToolbar}
          toolbar={toolbar || false}
        />
      )}
      <EditorContent editor={editor} />
      {bubbleMenu && (
        <BubbleMenuRoot editor={editor}>
          <TextButtons editor={editor} toolbar={toolbar} />
          <LinkSelector editor={editor} toolbar={toolbar} />
          <NodeSelector editor={editor} toolbar={toolbar} />
          <ColorSelector editor={editor} toolbar={toolbar} />
        </BubbleMenuRoot>
      )}
      <TiptapImageResizer editor={editor} />
    </div>
  );
};

export default TiptapEditor;
