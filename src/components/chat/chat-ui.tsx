import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Message, useChat } from "ai/react"; 
import { Markdown } from "../markdown";
import ChatInput from "./chat-input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Editor } from "tldraw";
import type { Model as ModelType } from "@/types";
import { ToolProgress } from "./tool-progress";
import { useToolProgress } from "@/hooks/use-tool-progress";

// Import types from types.ts
import { 
  Tools, 
  Mode, 
  CustomToolInvocation,
  getToolCallFromMessage,
  hasToolCall,
  ToolCall,
  ResponseObject
} from "@/types"; // Adjust the import path as needed
import { ThemeToggle } from "../ui/theme-toggle";

type ChatUIProps = {
  setEditorContent: (content: string) => void;
  editorContent: string;
  editor: Editor | null;
};

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
  const [model, setModel] = useState<ModelType>("openai");
  const [activeTool, setActiveTool] = useState<Tools>("none");
  const [whiteBoardImage, setWhiteBoardImage] = useState<string | null>(null);
  
  const { 
    toolProgress, 
    startToolProgress, 
    updateToolProgress, 
    completeToolProgress 
  } = useToolProgress();
  
  // Use the existing useChat hook - with proper type assertions
  const {
    messages,
    input,
    isLoading,
    setInput,
    handleSubmit,
  } = useChat({
    api: "/api/chat",
    body: {
      tool: activeTool,
      model,
      ...(activeTool === "notes" && {
        notes: editorContent,
      }),
      ...(activeTool === "whiteboard" && {
        image: "https://raw.githubusercontent.com/shrix1/ai-sdk-tool-calling/refs/heads/main/public/canvas.png",
      }),
    },
    onToolCall: async ({ toolCall }) => {
      if (!toolCall) {
        console.error("Tool call is undefined");
        return;
      }
      
      console.log("toolCall", toolCall);
      
      // Get the tool name with fallbacks for different possible structures
      const toolName = (
        toolCall.toolName ??
        "unknown"
      ) as Tools;
      
      // Get the arguments with fallbacks
      const toolArgs =
        toolCall.args || 
        toolCall.args;
      
      // Start progress tracking with estimated time
      const stopProgressUpdates = startToolProgress(toolName, toolArgs);
      
      // Set up a timeout to simulate intermediate results
      const simulateIntermediateResults = setTimeout(() => {
        if (toolName === "web" || toolName === "x") {
          updateToolProgress({
            intermediateResults: { 
              status: "searching", 
              found: Math.floor(Math.random() * 10) + 1 
            },
            message: "Found initial results...",
          });
        } else if (toolName === "fileSearch") {
          updateToolProgress({
            intermediateResults: { 
              matchCount: Math.floor(Math.random() * 5) + 1,
              topMatchScore: 0.85
            },
            message: "Calculating similarity scores...",
          });
        }
      }, 1000);
    
      // Execute the cleanup immediately after the simulated processing time
      setTimeout(() => {
        clearTimeout(simulateIntermediateResults);
        if (stopProgressUpdates) stopProgressUpdates();
        completeToolProgress("completed", "Results processed successfully");
      }, 3000);
      
      // Don't return a function - this causes the structuredClone error
      // Instead, return a simple value or undefined
    },
    onError: (error) => {
      console.error("error", error);
      toast.error("Error: " + error.message);
      
      // If there was an active tool, mark it as errored
      if (toolProgress.isActive) {
        completeToolProgress("error", error.message);
      }
    },
  });
  
  const [composerMessages, setComposerMessages] = useState<Message[]>([]);
  const [isLoadingComposer, setIsLoadingComposer] = useState(false);
  const [inputComposer, setInputComposer] = useState<string>("");

  async function getTlDrawCanvasScreenshot() {
    if (!editor) {
      toast.error("No editor found");
      return;
    }
    const shapeIds = editor.getCurrentPageShapeIds();
    if (shapeIds.size === 0) {
      toast.info("No shapes on the canvas");
      return;
    }
    const { blob } = await editor.toImage([...shapeIds], {
      format: "png",
      background: false,
    });

    const url = URL.createObjectURL(blob);
    URL.revokeObjectURL(url);
    return url;
  }

  async function handleSubmitChat(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (input.length === 0) {
      toast.error("Please enter a message");
      return;
    }
    
    if (input.includes("@whiteboard")) {
      const w = await getTlDrawCanvasScreenshot();
      setActiveTool("whiteboard");
      setWhiteBoardImage(
        w! ||
          "https://www.pexels.com/photo/macbook-air-on-grey-wooden-table-67112/"
      );
      handleSubmit(e);
      return;
    }
    if (input.includes("@notes")) {
      setActiveTool("notes");
      handleSubmit(e);
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

  function getToolNameAndArgs(toolInvocation: CustomToolInvocation) {
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
    <div>
      <div className="pt-2 px-2 border-b flex gap-2 justify-between">
        <div className="flex gap-2">
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
        <ThemeToggle /> {/* Add the theme toggle button here */}
      </div>

      <ScrollArea className="flex-1 p-4">
        {(mode === "chat" ? messages : composerMessages).map((message) => {
          const toolInvocation = getToolCallFromMessage(message);
          const hasEmptyContent = message.content === '';
          
          return (
            <div
              key={message.id}
              className={`mb-4 ${
                message.role === "user" ? "text-right" : "text-left"
              }`}
            >
              <span className={`inline-block p-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white dark:bg-blue-600"
                    : hasEmptyContent
                    ? "bg-blue-100 text-blue-500 dark:bg-blue-950 dark:text-blue-200"
                    : "bg-gray-200 text-black dark:bg-gray-800 dark:text-white"
                }`}>
                {/* content */}
                <span className={`inline-block p-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-blue-500 text-white dark:bg-blue-600"
                      : hasEmptyContent
                      ? "bg-blue-100 text-blue-500 font-medium dark:bg-blue-950 dark:text-blue-200"
                      : "bg-gray-200 text-black dark:bg-gray-800 dark:text-white"
                  }`}>
                  {message.role === "user" ? (
                    message.content
                  ) : (
                    <Markdown>
                      {hasEmptyContent && toolInvocation
                        ? getToolNameAndArgs(toolInvocation)
                        : message.content}
                    </Markdown>
                  )}
                </span>
                {/* Update the "Thinking..." indicator to support dark mode */}
                {(isLoading || isLoadingComposer) && !toolProgress.isActive && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    Thinking...
                  </span>
                )}
              </span>
            </div>
          );
        })}
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
