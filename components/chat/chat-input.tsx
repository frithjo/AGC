"use client";

import React from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2, SendIcon } from "lucide-react";
import { Mode, Tools } from "./chat-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type ChatInputProps = {
  input: string;
  setInput: (input: string) => void;
  handleSubmit: () => void;
  isLoading: boolean;
  nextPromptSuggestion: string[];
  activeTool: Tools;
  mode: Mode;
  setActiveTool: (tool: Tools) => void;
};

const ChatInput = ({
  input,
  setInput,
  handleSubmit,
  isLoading,
  nextPromptSuggestion,
  activeTool,
  setActiveTool,
  mode,
}: ChatInputProps) => {
  return (
    <div className="p-4 bg-transparent">
      {mode === "chat" && (
        <>
          Tool:
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-md mb-1 border min-w-[70px]"
              >
                {activeTool === "web" && "web"}
                {activeTool === "x" && "x (Twitter)"}
                {activeTool === "none" && "none"}
                {activeTool === "url" && "url (fetch)"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top">
              <DropdownMenuItem onClick={() => setActiveTool("web")}>
                web
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("x")}>
                x
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("none")}>
                none
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("url")}>
                url
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      )}
      <div className="flex space-x-2 relative">
        {nextPromptSuggestion &&
          nextPromptSuggestion.length > 0 &&
          mode === "composer" && (
            <section className="w-[400px] md:w-[600px] flex gap-2 overflow-x-auto whitespace-nowrap text-muted-foreground absolute -top-9 left-1/2 -translate-x-1/2">
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
  );
};

export default ChatInput;
