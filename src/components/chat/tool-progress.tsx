// components/chat/tool-progress.tsx
"use client";

import { useState, useEffect } from "react";
import { ToolInvocation } from "ai";
import { Tools } from "./chat-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

// Additional imports if needed
import { Search, Globe, BarChart2, FileText, Image, X } from "lucide-react";

export type ToolProgressStatus = "running" | "completed" | "error";

export interface ToolProgressState {
  isActive: boolean;
  tool: Tools | null;
  args: any;
  startTime: number | null;
  endTime: number | null;
  status: ToolProgressStatus;
  progressPercentage: number;
  intermediateResults?: any;
  message?: string;
}

interface ToolProgressProps {
  toolProgress: ToolProgressState;
  toolInvocation?: ToolInvocation;
}

// Mapping of tool types to icons for visual representation
const toolIcons = {
  web: <Globe className="h-5 w-5 text-blue-500" />,
  x: <X className="h-5 w-5 text-blue-500" />,
  url: <FileText className="h-5 w-5 text-green-500" />,
  fileSearch: <Search className="h-5 w-5 text-purple-500" />,
  notes: <FileText className="h-5 w-5 text-amber-500" />,
  whiteboard: <Image className="h-5 w-5 text-rose-500" />,
  none: <BarChart2 className="h-5 w-5 text-gray-500" />,
};

// Tool-specific progress descriptions
const toolProgressDescriptions = {
  web: "Searching the web for information...",
  x: "Searching X for latest posts...",
  url: "Fetching content from URL...",
  fileSearch: "Searching vector database for relevant information...",
  notes: "Processing notes content...",
  whiteboard: "Analyzing whiteboard image...",
  none: "Thinking...",
};

export function ToolProgress({ toolProgress, toolInvocation }: ToolProgressProps) {
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  
  // Update elapsed time while tool is running
  useEffect(() => {
    if (!toolProgress.isActive || !toolProgress.startTime) return;
    
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - toolProgress.startTime!);
    }, 100);
    
    return () => clearInterval(timer);
  }, [toolProgress.isActive, toolProgress.startTime]);

  // If no tool is active or no invocation, don't render
  if (!toolProgress.isActive && !toolInvocation) return null;

  // Determine which tool to show
  const toolToShow = toolProgress.tool || (toolInvocation?.toolName as Tools) || "none";
  
  // Format elapsed time
  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="tool-progress-container p-3 bg-gray-50 dark:bg-gray-800 rounded-lg mb-4 border border-gray-200 dark:border-gray-700 transition-all">
      {/* Active tool execution state */}
      {toolProgress.isActive && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="animate-spin mr-1">
              {toolIcons[toolToShow]}
            </div>
            <div className="font-medium text-sm">
              {toolProgressDescriptions[toolToShow]}
            </div>
          </div>
          
          {/* Progress bar */}
          <Progress value={toolProgress.progressPercentage || 25} className="h-1" />
          
          {/* Args display */}
          <div className="mt-2 text-xs font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded overflow-x-auto">
            {typeof toolProgress.args === 'object' 
              ? JSON.stringify(toolProgress.args, null, 2)
              : String(toolProgress.args)}
          </div>
          
          {/* Time display */}
          <div className="text-xs text-gray-500 mt-1 flex justify-between">
            <span>Time elapsed: {formatTime(elapsedTime)}</span>
            {toolProgress.message && (
              <span className="text-blue-500">{toolProgress.message}</span>
            )}
          </div>
          
          {/* Show intermediate results if available */}
          {toolProgress.intermediateResults && (
            <div className="mt-2 text-xs bg-blue-50 dark:bg-blue-900/20 p-2 rounded border border-blue-100 dark:border-blue-800">
              <div className="font-medium mb-1">Intermediate Results:</div>
              <div className="overflow-x-auto">
                {typeof toolProgress.intermediateResults === 'object' 
                  ? JSON.stringify(toolProgress.intermediateResults, null, 2)
                  : String(toolProgress.intermediateResults)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed tool state */}
      {!toolProgress.isActive && toolProgress.status === "completed" && (
        <div className="flex items-center">
          <span className="mr-2 text-green-500">✓</span>
          <div>
            <span className="font-medium">{toolToShow} completed</span>
            {toolProgress.startTime && toolProgress.endTime && (
              <span className="ml-2 text-xs text-gray-500">
                (took {formatTime(toolProgress.endTime - toolProgress.startTime)})
              </span>
            )}
          </div>
        </div>
      )}

      {/* Error state */}
      {!toolProgress.isActive && toolProgress.status === "error" && (
        <div className="flex items-center text-red-500">
          <span className="mr-2">⚠️</span>
          <div>
            <span className="font-medium">Error with {toolToShow}</span>
            {toolProgress.message && (
              <div className="text-xs mt-1">{toolProgress.message}</div>
            )}
          </div>
        </div>
      )}
      
      {/* Loading state for tool invocation without active progress */}
      {!toolProgress.isActive && toolInvocation && !toolProgress.status && (
        <div className="space-y-2">
          <div className="flex items-center">
            <Skeleton className="h-4 w-4 mr-2 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-1 w-full" />
        </div>
      )}
    </div>
  );
}