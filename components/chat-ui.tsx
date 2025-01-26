"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, useChat } from "ai/react";
import { JSONContent } from "novel";
import { Textarea } from "./ui/textarea";
import { Loader2, SendIcon } from "lucide-react";

export function ChatUI({
  setEditorContent,
  editorContent,
}: {
  setEditorContent: (content: JSONContent) => void;
  editorContent: JSONContent;
}) {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      body: {
        editorContent,
      },
    });

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
          <Textarea
            value={input}
            onChange={handleInputChange}
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
