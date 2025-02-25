"use client";

import { Editor, Tldraw } from "tldraw";
import "tldraw/tldraw.css";

type TldrawComponentProps = {
  onEditorChange: (editor: Editor) => void;
};

export function TldrawComponent({ onEditorChange }: TldrawComponentProps) {
  const handleMount = (editor: Editor) => {
    onEditorChange(editor);
  };

  return <Tldraw persistenceKey="whiteboard" onMount={handleMount} />;
}
