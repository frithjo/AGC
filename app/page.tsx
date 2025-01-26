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

export default function Home() {
  const content: JSONContent = {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: {
          level: 1,
        },
        content: [
          {
            type: "text",
            text: "Hello world",
          },
        ],
      },
      {
        type: "heading",
        attrs: {
          level: 2,
        },
        content: [
          {
            type: "text",
            text: "Hello World",
          },
        ],
      },
      {
        type: "heading",
        attrs: {
          level: 3,
        },
        content: [
          {
            type: "text",
            text: "Hello world",
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This is the demo",
          },
        ],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "hello world",
                  },
                ],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "world hello",
                  },
                ],
              },
              {
                type: "orderedList",
                attrs: {
                  start: 1,
                },
                content: [
                  {
                    type: "listItem",
                    content: [
                      {
                        type: "paragraph",
                        content: [
                          {
                            type: "text",
                            text: "sasa",
                          },
                        ],
                      },
                    ],
                  },
                  {
                    type: "listItem",
                    content: [
                      {
                        type: "paragraph",
                        content: [
                          {
                            type: "text",
                            text: "sasa",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "taskList",
        content: [
          {
            type: "taskItem",
            attrs: {
              checked: false,
            },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "hello world",
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  const [initialContent, setInitialContent] = useState<JSONContent>(content);

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
