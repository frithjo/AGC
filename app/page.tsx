"use client";

import { ChatUI } from "@/components/chat-ui";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState, useEffect, useCallback } from "react";
import { DEFAULT_HTML } from "@/components/constants";
import { TiptapEditor } from "@/components/tiptap";
import { useThrottle } from "@/components/tiptap/editor/hooks/use-throttle";

export default function Home() {
  const [initialContent, setInitialContent] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("editorContent");
      return saved ? saved : DEFAULT_HTML;
    }
    return DEFAULT_HTML;
  });
  const [isSaving, setIsSaving] = useState(false);

  const debouncedSave = useThrottle((content: string) => {
    setIsSaving(true);
    localStorage.setItem("editorContent", content);
    setIsSaving(false);
  }, 500);

  useEffect(() => {
    debouncedSave(initialContent);
  }, [initialContent, debouncedSave]);

  return (
    <div className="h-screen font-sans">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel
          defaultSize={50}
          minSize={30}
          className="overflow-hidden"
        >
          <ChatUI
            setEditorContent={setInitialContent}
            editorContent={initialContent}
          />
        </ResizablePanel>
        <ResizableHandle withHandle={true} />
        <ResizablePanel
          defaultSize={50}
          minSize={30}
          className="overflow-hidden"
        >
          <TiptapEditor
            value={initialContent}
            onChange={(value) => setInitialContent(value as string)}
            isSaving={isSaving}
            editorClassName="focus-within:border-none border-none"
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
