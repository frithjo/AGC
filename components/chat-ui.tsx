"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, useChat } from "ai/react";
import { JSONContent } from "novel";

export function ChatUI({
  setEditorContent,
  editorContent,
}: {
  setEditorContent: (content: JSONContent) => void;
  editorContent: JSONContent;
}) {
  const [mainMessages, setMainMessages] = useState<Message[]>([]);

  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: {
      editorContent,
    },
  });

  useEffect(() => {
    if (messages.length > 0) {
      setMainMessages([...mainMessages, ...messages]);
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        {mainMessages.map((message) => (
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
                  : "bg-gray-200 text-black"
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
      </ScrollArea>
      <div className="p-4 border-t bg-background">
        <div className="flex space-x-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <Button onClick={handleSubmit}>Send</Button>
        </div>
      </div>
    </div>
  );
}
