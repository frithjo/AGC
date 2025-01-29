"use client";

import { Button } from "@/components/ui/button";
import { Command, CommandInput } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { ArrowUp, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import type { EditorInstance } from "../constants";
import AICompletionCommands from "../selectors/ai-completion-command";
import AISelectorCommands from "../selectors/ai-selectors-command";

interface AISelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editor: EditorInstance;
}

export const addAIHighlight = (editor: EditorInstance, color?: string) => {
  editor
    .chain()
    .setAIHighlight({ color: color ?? "#c1ecf970" })
    .run();
};

export function AISelector({ onOpenChange, editor }: AISelectorProps) {
  const [inputValue, setInputValue] = useState("");
  const [completion, setCompletion] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const complete = async (
    text: string,
    options: { body: { option: string; command?: string } }
  ) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text,
          ...options.body,
        }),
      });

      if (response.status === 429) {
        toast.error("You have reached your request limit for the day.");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to generate completion");
      }

      const data = await response.json();
      setCompletion(data.completion);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  const hasCompletion = completion.length > 0;

  return (
    <Command className="w-[350px]">
      {hasCompletion && (
        <div className="flex max-h-[400px]">
          <ScrollArea>
            <div className="prose p-2 px-4 prose-sm">
              {/* <Markdown>{completion}</Markdown> */}
              {completion}
            </div>
          </ScrollArea>
        </div>
      )}

      {isLoading && (
        <div className="flex h-12 w-full items-center px-4 text-sm font-medium text-muted-foreground text-purple-500">
          <Sparkles className="mr-2 h-4 w-4 shrink-0  " />
          AI is thinking
          <div className="ml-2 mt-1">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        </div>
      )}
      {!isLoading && (
        <>
          <div className="relative">
            <CommandInput
              value={inputValue}
              onValueChange={setInputValue}
              autoFocus
              placeholder={
                hasCompletion
                  ? "Tell AI what to do next"
                  : "Ask AI to edit or generate..."
              }
              onFocus={() => addAIHighlight(editor)}
            />
            <Button
              size="icon"
              className="absolute right-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-primary hover:bg-primary/80"
              onClick={async () => {
                if (completion) {
                  await complete(completion, {
                    body: { option: "zap", command: inputValue },
                  });
                  setInputValue("");
                  return;
                }

                const slice = editor.state.selection.content();
                const text = editor.storage.markdown.serializer.serialize(
                  slice.content
                );

                await complete(text, {
                  body: { option: "zap", command: inputValue },
                });
                setInputValue("");
              }}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          {hasCompletion ? (
            <AICompletionCommands
              onDiscard={() => {
                editor.chain().unsetHighlight().focus().run();
                onOpenChange(false);
              }}
              completion={completion}
              editor={editor}
            />
          ) : (
            <AISelectorCommands
              onSelect={(value, option) =>
                complete(value, { body: { option } })
              }
              editor={editor}
            />
          )}
        </>
      )}
    </Command>
  );
}
