"use client";

import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message } from "ai/react";
import { Markdown } from "../markdown";
import ChatInput from "./chat-input";
import { Button } from "../ui/button";

type ChatUIProps = {
  setEditorContent: (content: string) => void;
  editorContent: string;
};

type ResponseObject = {
  message: string;
  updateEditorHTML: boolean;
  editorHTML: string;
  nextPrompt: string[];
};

export type Mode = "chat" | "composer";
export type Tools = "web" | "x" | "none";

export function ChatUI({ setEditorContent, editorContent }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nextPromptSuggestion, setNextPromptSuggestion] = useState<string[]>([
    "List all the tasks in table format",
    "Mark this |taskName| as done",
    "Add a new task |taskName|",
  ]);
  const [mode, setMode] = useState<Mode>("chat");
  const [activeTool, setActiveTool] = useState<Tools>("none");

  async function handleSubmitComposer() {
    if (input.length === 0) {
      alert("Please enter a message");
      return;
    }
    setInput("");
    setIsLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: input, id: crypto.randomUUID() },
      { role: "data", content: "Thinking...", id: crypto.randomUUID() },
    ]);
    const response = await fetch("/api/composer", {
      method: "POST",
      body: JSON.stringify({
        messages,
        editorHTML: editorContent,
        prompt: input,
      }),
    });
    const data: ResponseObject = await response.json();
    console.log("ai-object", data);
    if (data.updateEditorHTML === true) {
      console.log("data.editorHTML is updated", data.editorHTML);
      setEditorContent(data.editorHTML);
    }
    setNextPromptSuggestion(data.nextPrompt);
    setMessages((prevMessages) => {
      const messagesWithoutThinking = prevMessages.slice(0, -1);
      return [
        ...messagesWithoutThinking,
        { role: "assistant", content: data.message, id: crypto.randomUUID() },
      ];
    });
    setIsLoading(false);
  }

  async function handleSubmitChat() {
    if (input.length === 0) {
      alert("Please enter a message");
      return;
    }
    setInput("");
    setIsLoading(true);
    setMessages((prevMessages) => [
      ...prevMessages,
      { role: "user", content: input, id: crypto.randomUUID() },
      { role: "data", content: "Thinking...", id: crypto.randomUUID() },
    ]);
    const response = await fetch("/api/chat", {
      method: "POST",
      body: JSON.stringify({
        messages,
        prompt: input,
        tool: activeTool,
      }),
    });
    const data = await response.text();
    console.log("chat-data", data);
    setMessages((prevMessages) => {
      const messagesWithoutThinking = prevMessages.slice(0, -1);
      return [
        ...messagesWithoutThinking,
        { role: "assistant", content: data, id: crypto.randomUUID() },
      ];
    });
    setIsLoading(false);
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
        {messages.map((message) => (
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
                  : message.role === "data"
                  ? "bg-muted text-muted-foreground"
                  : "bg-gray-200 text-black"
              }`}
            >
              {message.role === "user" ? (
                message.content
              ) : (
                <Markdown>{message.content}</Markdown>
              )}
            </span>
          </div>
        ))}
      </ScrollArea>
      <ChatInput
        input={input}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        mode={mode}
        setInput={setInput}
        handleSubmit={
          mode === "composer" ? handleSubmitComposer : handleSubmitChat
        }
        isLoading={isLoading}
        nextPromptSuggestion={nextPromptSuggestion}
      />
    </div>
  );
}
