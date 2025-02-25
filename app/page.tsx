"use client";

import { ChatUI } from "@/components/chat/chat-ui";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { useState, useEffect, useCallback } from "react";
import { DEFAULT_HTML } from "@/components/constants";
import { TiptapEditor } from "@/components/tiptap";
import "tldraw/tldraw.css";
import { TldrawComponent } from "@/components/tldraw-component";
import { Editor } from "tldraw";

export default function Home() {
  // const [initialContent, setInitialContent] = useState<string>(() => {
  // if (typeof window !== "undefined") {
  //   const saved = localStorage.getItem("editorContent");
  //   return saved ? saved : DEFAULT_HTML;
  // }
  // return DEFAULT_HTML;
  // });
  // const [isSaving, setIsSaving] = useState(false);

  // const throttledSave = useCallback((content: string) => {
  //   let timeoutId: NodeJS.Timeout;
  //   return () => {
  //     if (timeoutId) {
  //       clearTimeout(timeoutId);
  //     }
  //     setIsSaving(true);
  //     timeoutId = setTimeout(() => {
  //       localStorage.setItem("editorContent", content);
  //       setIsSaving(false);
  //     }, 500); // Save after 500ms of no updates
  //   };
  // }, []);

  // useEffect(() => {
  //   const saveToStorage = throttledSave(initialContent);
  //   saveToStorage();
  // }, [initialContent, throttledSave]);

  const [initialContent, setInitialContent] = useState<string>(DEFAULT_HTML);
  console.log("initialContent", initialContent);
  const [editor, setEditor] = useState<Editor | null>(null);

  const handleEditorChange = (newEditor: Editor) => {
    setEditor(newEditor);
  };

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
            editor={editor}
          />
        </ResizablePanel>
        <ResizableHandle withHandle={true} className="z-50" />
        <ResizablePanel
          defaultSize={50}
          minSize={30}
          className="overflow-hidden"
        >
          <ResizablePanelGroup direction="vertical">
            <ResizablePanel defaultSize={50} minSize={30}>
              <TiptapEditor
                value={initialContent}
                onChange={(value) => setInitialContent(value as string)}
                isSaving={false}
                editorClassName="focus-within:border-none border-none"
                bubbleMenu={true}
                slashCommand={true}
                // toolbar={true}
              />
            </ResizablePanel>
            <ResizableHandle withHandle={true} className="z-50" />
            <ResizablePanel defaultSize={50} minSize={30} className="z-20">
              <TldrawComponent onEditorChange={handleEditorChange} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
