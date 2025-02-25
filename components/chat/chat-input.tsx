"use client";

import React from "react";
import { Textarea } from "../ui/textarea";
import { Button } from "../ui/button";
import { Loader2, SendIcon, ChevronUp } from "lucide-react";
import { Mode, Tools, Model } from "./chat-ui";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

type ChatInputProps = {
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: any) => void;
  isLoading: boolean;
  nextPromptSuggestion: string[];
  activeTool: Tools;
  mode: Mode;
  setActiveTool: (tool: Tools) => void;
  setModel: (model: Model) => void;
  model: Model;
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
  setModel,
  model,
}: ChatInputProps) => {
  return (
    <div className="p-4 bg-transparent relative">
      <section className="flex items-center absolute bottom-3 left-4 z-10">
        {mode === "chat" && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" className="rounded-md mb-1">
                {activeTool === "web" && "Web"}
                {activeTool === "x" && "X"}
                {activeTool === "none" && "Auto"}
                {activeTool === "url" && "Fetch"}
                {activeTool === "notes" && "Notes"}
                <ChevronUp className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top">
              <DropdownMenuItem onClick={() => setActiveTool("web")}>
                Web (Google)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("x")}>
                X (Twitter)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("none")}>
                Auto (ai-choose)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("url")}>
                url (fetch)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTool("notes")}>
                notes (read)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        <>
          <DropdownMenu>
            <DropdownMenuTrigger className="border-none">
              <Button variant="ghost" className="rounded-md mb-1">
                {model === "openai" ? "gpt-4o-mini" : "gemini-1.5-flash"}
                <ChevronUp className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" side="top">
              <DropdownMenuItem onClick={() => setModel("openai")}>
                gpt-4o-mini
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setModel("gemini")}>
                gemini-1.5-flash
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </>
      </section>
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
          placeholder={
            mode === "chat"
              ? "Chat with AI using Web, X, fetch-url, @whiteboard , @notes"
              : "Ask AI to help manage your notes"
          }
          className="min-h-[120px] resize-none shadow-lg"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              if (e.shiftKey) {
                return;
              }
              e.preventDefault();
              handleSubmit(e);
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
