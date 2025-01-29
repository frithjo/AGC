"use client";

import { ChatUI } from "@/components/chat-ui";
import { Editor } from "@/components/editor/main-editor";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState } from "react";
import { JSONContent } from "novel";
import { DEFAULT_CONTENT } from "@/components/constants";

export default function Home() {
  const [initialContent, setInitialContent] =
    useState<JSONContent>(DEFAULT_CONTENT);

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
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
