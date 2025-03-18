"use client";

import { Separator } from "@/components/ui/separator";
import type { Editor } from "@tiptap/react";
import React from "react";
import { ColorSelector } from "./editor/selectors/color-selectors";
import { LinkSelector } from "./editor/selectors/link-selector";
import { NodeSelector } from "./editor/selectors/node-selector";
import { TextButtons } from "./editor/selectors/text-buttons";
import { SearchAndReplaceToolbar } from "./editor/ui/search-and-replace";

interface ToolbarProps {
  editor: Editor | null;
  basicToolbar?: boolean;
  toolbar?: boolean;
}

export function Toolbar({ editor, basicToolbar, toolbar }: ToolbarProps) {
  if (!editor) return null;
  return (
    <div className="flex gap-1 bg-white items-center px-2 py-1.5 border rounded-xl mb-1 overflow-x-auto no-scrollbar">
      {basicToolbar ? (
        <TextButtons editor={editor} toolbar={toolbar || false} />
      ) : (
        <>
          <TextButtons editor={editor} toolbar={toolbar || false} />
          <LinkSelector editor={editor} toolbar={toolbar || false} />
          <Separator orientation="vertical" className="h-8" />
          <NodeSelector editor={editor} toolbar={toolbar || false} />
          <Separator orientation="vertical" className="h-8" />
          <ColorSelector editor={editor} toolbar={toolbar} />
          <Separator orientation="vertical" className="h-8" />
          <SearchAndReplaceToolbar editor={editor} />
        </>
      )}
    </div>
  );
}
