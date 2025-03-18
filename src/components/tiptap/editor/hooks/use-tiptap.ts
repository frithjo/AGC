"use client";

"use client";

import Placeholder from "@tiptap/extension-placeholder";
import {
  type Content,
  type Editor,
  useEditor,
} from "@tiptap/react";
import { useCallback, useEffect } from "react";
import { defaultExtensions } from "../extensions";
import { uploadFn } from "../image-upload";
import { slashCommandExtension } from "../slash-command";
import { handleSlashCommandNavigation } from "../ui/slash-command-list";
import { getOutput } from "../utils";
import { useThrottle } from "./use-throttle";
import { cn } from "@/lib/utils";

export function useTiptap({
  slashEnabled,
  output = "html",
  onChange,
  editorClassName,
  initialContent,
  throttleDelay = 500,
}: {
  slashEnabled: boolean;
  output: "html" | "json";
  onChange: (value: string) => void;
  editorClassName?: string;
  initialContent: string;
  throttleDelay?: number;
}): Editor | null {
  const throttledSetValue = useThrottle(
    (value: Content) => onChange(value as string),
    throttleDelay
  );

  const handleUpdate = useCallback(
    (editor: Editor) => throttledSetValue(getOutput(editor, output)),
    [output, throttledSetValue]
  );

  const placeholderExtension = Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === "heading") {
        return `Heading ${node.attrs.level}`;
      }
      return slashEnabled ? 'Press "/" for commands' : "Type here";
    },
  });

  const editor = useEditor({
    extensions: [
      placeholderExtension,
      ...defaultExtensions,
      ...(slashEnabled ? [slashCommandExtension] : []),
    ],
    onUpdate: ({ editor }) => handleUpdate(editor),
    content: initialContent,
    editorProps: {
      attributes: {
        class: cn(
          "bg-background p-4 relative border rounded-2xl focus-within:border-primary min-h-screen",
          "tiptap ProseMirror prose prose-lg dark:prose-invert prose-headings:font-title font-default focus:outline-none max-w-full",
          editorClassName
        ),
      },
      handleDOMEvents: {
        keydown: (_view, event) => handleSlashCommandNavigation(event),
      },
      handlePaste: (view, event) => {
        if (event.clipboardData?.files?.length) {
          const file = event.clipboardData.files[0];
          if (file && file.type.startsWith("image/")) {
            event.preventDefault();
            const pos = view.state.selection.from;
            uploadFn(file, view, pos);
            return true;
          }
        }
        return false;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (!moved && event.dataTransfer?.files?.length) {
          event.preventDefault();
          const [file] = Array.from(event.dataTransfer.files);
          const coords = view.posAtCoords({
            left: event.clientX,
            top: event.clientY,
          });
          if (file && file.type.startsWith("image/")) {
            uploadFn(file, view, coords?.pos ?? 0);
            return true;
          }
        }
        return false;
      },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor) {
      const currentContent = getOutput(editor, output);
      if (initialContent !== currentContent) {
        editor.commands.setContent(initialContent, false);
      }
    }
  }, [initialContent, editor, output]);

  return editor;
}
