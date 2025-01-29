"use client";

import { defaultExtensions } from "./extensions";
import { useState } from "react";
import {
  EditorContent,
  EditorRoot,
  type JSONContent,
  handleCommandNavigation,
} from "novel";
import { Loader2, CheckIcon } from "lucide-react";

export function Editor({
  editorContent,
  setEditorContent,
  isSaving,
}: {
  editorContent: JSONContent;
  setEditorContent: (content: JSONContent) => void;
  isSaving: boolean;
}) {
  return (
    <div className="w-full h-full relative">
      <div className="absolute top-4 right-4 rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground z-50">
        {isSaving ? (
          <div className="flex items-center gap-2">
            <Loader2 className="animate-spin size-4" />
            <div>Saving...</div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <div>
              <CheckIcon className="animate-pulse size-4" />
            </div>
            <div>Saved</div>
          </div>
        )}
      </div>
      <EditorRoot>
        <EditorContent
          initialContent={editorContent}
          extensions={defaultExtensions}
          className="relative min-h-screen w-full max-w-screen-lg border-muted bg-background sm:mb-[calc(20vh)] sm:rounded-lg sm:border sm:shadow-lg"
          editorProps={{
            handleDOMEvents: {
              keydown: (_view, event) => handleCommandNavigation(event),
            },
            // handlePaste: (view, event) => handleImagePaste(view, event, uploadFn),
            // handleDrop: (view, event, _slice, moved) => handleImageDrop(view, event, moved, uploadFn),
            attributes: {
              class:
                "prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
            },
          }}
          onUpdate={({ editor }) => {
            setEditorContent(editor.getJSON());
          }}
        >
          <></>
        </EditorContent>
      </EditorRoot>
    </div>
  );
}
