"use client";

import { defaultExtensions } from "./extensions";
import { useState } from "react";
import {
  EditorContent,
  EditorRoot,
  type JSONContent,
  handleCommandNavigation,
} from "novel";

export function Editor({
  editorContent,
  setEditorContent,
}: {
  editorContent: JSONContent;
  setEditorContent: (content: JSONContent) => void;
}) {
  return (
    <div className="w-full h-full">
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
