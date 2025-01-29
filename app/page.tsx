"use client";

import { ChatUI } from "@/components/chat-ui";
import { Editor } from "@/components/editor/main-editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState, useEffect, useCallback } from "react";
import { JSONContent } from "novel";
import { DEFAULT_HTML } from "@/components/constants";

export default function Home() {
  const [initialContent, setInitialContent] = useState<string>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("editorContent");
      return saved ? saved : DEFAULT_HTML;
    }
    return DEFAULT_HTML;
  });
  const [isSaving, setIsSaving] = useState(false);

  const throttledSave = useCallback((content: string) => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      setIsSaving(true);
      timeoutId = setTimeout(() => {
        localStorage.setItem("editorContent", content);
        setIsSaving(false);
      }, 500); // Save after 500ms of no updates
    };
  }, []);

  useEffect(() => {
    const saveToStorage = throttledSave(initialContent);
    saveToStorage();
  }, [initialContent, throttledSave]);

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
          <Editor
            editorContent={initialContent}
            setEditorContent={setInitialContent}
            isSaving={isSaving}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
