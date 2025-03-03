"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, useChat } from "ai/react";
import { Markdown } from "../markdown";
import ChatInput from "./chat-input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Editor } from "tldraw";
import { ToolInvocation } from "ai";

type ChatUIProps = {
  setEditorContent: (content: string) => void;
  editorContent: string;
  editor: Editor | null;
};

type ResponseObject = {
  message: string;
  updateEditorHTML: boolean;
  editorHTML: string;
  nextPrompt: string[];
};

export type Mode = "chat" | "composer";
export type Tools = "web" | "x" | "none" | "url" | "notes";
export type Model = "openai" | "gemini";

export function ChatUI({
  setEditorContent,
  editorContent,
  editor,
}: ChatUIProps) {
  const [nextPromptSuggestion, setNextPromptSuggestion] = useState<string[]>([
    "List all the tasks in table format",
    "Mark this |taskName| as done",
    "Add a new task |taskName|",
  ]);
  const [mode, setMode] = useState<Mode>("chat");
  const [model, setModel] = useState<Model>("openai");
  const [activeTool, setActiveTool] = useState<Tools>("none");
  const { messages, input, isLoading, setInput, handleSubmit, addToolResult } =
    useChat({
      api: "/api/chat",
      body: {
        tool: activeTool,
        model,
        ...(activeTool === "notes" && {
          notes: editorContent,
        }),
      },
      onToolCall: async ({ toolCall }) => {
        console.log("toolCall", toolCall);
      },
      onError: (error) => {
        console.error("error", error);
        toast.error("Error: " + error.message);
      },
    });
  const [composerMessages, setComposerMessages] = useState<Message[]>([]);
  const [isLoadingComposer, setIsLoadingComposer] = useState(false);
  const [inputComposer, setInputComposer] = useState<string>("");

  // async function getTlDrawCanvasScreenshot() {
  //   if (!editor) {
  //     toast.error("No editor found");
  //     return;
  //   }
  //   const shapeIds = editor.getCurrentPageShapeIds();
  //   if (shapeIds.size === 0) {
  //     toast.info("No shapes on the canvas");
  //     return;
  //   }
  //   const { blob } = await editor.toImage([...shapeIds], {
  //     format: "png",
  //     background: false,
  //   });

  //   const url = URL.createObjectURL(blob);
  //   URL.revokeObjectURL(url);
  //   return url;
  // }

  async function handleSubmitChat(e: any) {
    e.preventDefault();
    if (input.length === 0) {
      toast.error("Please enter a message");
      return;
    }
    if (input.includes("@whiteboard")) {
      // const whiteBoardImage = await getTlDrawCanvasScreenshot();
      handleSubmit(undefined, {
        experimental_attachments: [
          {
            contentType: "image/png",
            name: "whiteboard.png",
            url: "https://unsplash.com/photos/person-typing-on-gray-and-black-hp-laptop-EDZTb2SQ6j0",
          },
        ],
      });
      return;
    }
    if (input.includes("@notes")) {
      setActiveTool("notes");
      handleSubmit();
      return;
    }
    handleSubmit(e);
  }

  async function handleSubmitComposer() {
    if (inputComposer.length === 0) {
      toast.error("Please enter a message");
      return;
    }
    setInputComposer("");
    setIsLoadingComposer(true);
    setComposerMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: inputComposer, id: crypto.randomUUID() },
    ]);
    const response = await fetch("/api/composer", {
      method: "POST",
      body: JSON.stringify({
        messages: composerMessages,
        editorHTML: editorContent,
        prompt: inputComposer,
      }),
    });
    const data: ResponseObject = await response.json();
    console.log("ai-object", data);
    if (data.updateEditorHTML === true) {
      console.log("data.editorHTML is updated", data.editorHTML);
      setEditorContent(data.editorHTML);
    }
    setNextPromptSuggestion(data.nextPrompt);
    setComposerMessages((prevMessages) => [
      ...prevMessages,
      { role: "assistant", content: data.message, id: crypto.randomUUID() },
    ]);
    setIsLoadingComposer(false);
  }

  console.log("messages", messages);
  console.log("composerMessages", composerMessages);

  function getToolNameAndArgs(toolInvocation: ToolInvocation) {
    const toolName = toolInvocation.toolName;
    const toolArgs = toolInvocation.args;
    const args = {
      fileSearch: toolArgs.prompt,
      url: toolArgs.url,
      x: toolArgs.query,
      web: toolArgs.query,
    };
    return (
      toolName.toUpperCase() +
      " called : **" +
      (args[toolName as keyof typeof args] || JSON.stringify(toolArgs)) +
      "**"
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="pt-2 px-2 border-b flex gap-2">
        <Button
          variant="ghost"
          tooltipText="Chat with search, twitter and more"
          className={`rounded-none border-b-2 border-b-transparent ${
            mode === "chat" ? "border-b-primary" : ""
          } `}
          onClick={() => setMode("chat")}
        >
          Chat
        </Button>
        <Button
          variant="ghost"
          tooltipText="AI have context about the Notes, So it can edit, add, delete, and create new notes"
          className={`rounded-none border-b-2 border-b-transparent ${
            mode === "composer" ? "border-b-primary" : ""
          } `}
          onClick={() => setMode("composer")}
        >
          Composer
        </Button>
      </div>
      <ScrollArea className="flex-1 p-4">
        {(mode === "chat" ? messages : composerMessages).map((message) => (
          <div
            key={message.id}
            className={`mb-4 ${
              message.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <span
              className={`inline-block p-2 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-500 text-white"
                  : message.content === ""
                  ? "bg-blue-100 text-blue-500 font-medium"
                  : "bg-gray-200 text-black"
              }`}
            >
              {message.role === "user" ? (
                message.content
              ) : (
                <Markdown>
                  {message.content === ""
                    ? getToolNameAndArgs(
                        message.toolInvocations?.[0] as ToolInvocation
                      )
                    : message.content}
                </Markdown>
              )}
            </span>
          </div>
        ))}
        {(isLoading || isLoadingComposer) && (
          <span className="ml-2 text-xs text-muted-foreground">
            Thinking...
          </span>
        )}
      </ScrollArea>
      <ChatInput
        input={mode === "chat" ? input : inputComposer}
        setInput={mode === "chat" ? setInput : setInputComposer}
        handleSubmit={mode === "chat" ? handleSubmitChat : handleSubmitComposer}
        isLoading={mode === "chat" ? isLoading : isLoadingComposer}
        nextPromptSuggestion={nextPromptSuggestion}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        setModel={setModel}
        model={model}
        mode={mode}
      />
    </div>
  );
}
