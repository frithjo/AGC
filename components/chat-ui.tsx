"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, useChat } from "ai/react";
import { JSONContent } from "novel";
import { Textarea } from "./ui/textarea";
import { Loader2, SendIcon } from "lucide-react";

type ChatUIProps = {
  setEditorContent: (content: JSONContent) => void;
  editorContent: JSONContent;
};

type ResponseObject = {
  message: string;
  updateEditorJSON: boolean;
  editorJSON: JSONContent;
  nextPrompt: string[];
};

export function ChatUI({ setEditorContent, editorContent }: ChatUIProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [nextPromptSuggestion, setNextPromptSuggestion] = useState<string[]>(
    []
  );

  // const { messages, input, handleInputChange, handleSubmit, isLoading } =
  //   useChat({
  //     api: "/api/chat",
  //     body: {
  //       editorContent,
  //     },
  //   });

  console.log("editorContent", editorContent);

  async function handleSubmit() {
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
        editorContent,
        prompt: input,
      }),
    });
    const data: ResponseObject = await response.json();
    console.log("ai-object", data);
    if (data.updateEditorJSON === true) {
      setEditorContent(data.editorJSON);
    }
    setNextPromptSuggestion(data.nextPrompt);
    setMessages((prevMessages) => {
      // Remove the last "Thinking..." message
      const messagesWithoutThinking = prevMessages.slice(0, -1);
      return [
        ...messagesWithoutThinking,
        { role: "assistant", content: data.message, id: crypto.randomUUID() },
      ];
    });
    setIsLoading(false);
  }

  return (
    <div className="flex flex-col h-full">
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
                  ? "bg-gray-200 text-blue-400"
                  : "bg-gray-200 text-black"
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 bg-transparent">
        <div className="flex space-x-2 relative">
          {nextPromptSuggestion && nextPromptSuggestion.length > 0 && (
            <section className="w-[400px] flex gap-2 overflow-x-auto whitespace-nowrap text-muted-foreground absolute -top-9 left-1/2 -translate-x-1/2">
              {nextPromptSuggestion.map(
                (prompt) =>
                  input !== prompt && (
                    <div
                      key={prompt}
                      className="px-2 py-0.5 cursor-pointer hover:bg-muted text-sm flex-shrink-0 rounded-full bg-white border border-muted"
                      onClick={() => setInput(prompt)}
                    >
                      {prompt}
                    </div>
                  )
              )}
            </section>
          )}
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="min-h-[120px] resize-none shadow-lg"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                if (e.shiftKey) {
                  return;
                }
                e.preventDefault();
                handleSubmit();
              }
            }}
          />
          {input.length > 0 && (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              size="icon"
              className="rounded-full absolute bottom-2 right-1"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <SendIcon className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
