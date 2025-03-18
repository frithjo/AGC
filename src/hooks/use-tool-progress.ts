// hooks/use-tool-progress.ts
"use client";

import { useState, useCallback } from "react";
import { Tools } from "@/components/chat/chat-ui";
import { ToolProgressState, ToolProgressStatus } from "@/components/chat/tool-progress";

// Estimated completion times for different tools to simulate progress
const estimatedToolCompletionTimes: Record<Tools, number> = {
  web: 5000,      // 5 seconds for web search
  x: 3000,        // 3 seconds for X search
  url: 2000,      // 2 seconds for URL fetch
  fileSearch: 2000, // 2 seconds for vector search
  notes: 1500,    // 1.5 seconds for notes
  whiteboard: 6000, // 6 seconds for image analysis
  none: 1000,     // 1 second default
};

export function useToolProgress() {
  const [toolProgress, setToolProgress] = useState<ToolProgressState>({
    isActive: false,
    tool: null,
    args: null,
    startTime: null,
    endTime: null,
    status: "running",
    progressPercentage: 0,
  });

  // Start tool execution progress tracking
  const startToolProgress = useCallback((tool: Tools, args: any) => {
    setToolProgress({
      isActive: true,
      tool,
      args,
      startTime: Date.now(),
      endTime: null,
      status: "running",
      progressPercentage: 0,
    });
    
    // Simulate progress updates
    const estimatedTime = estimatedToolCompletionTimes[tool];
    const updateInterval = estimatedTime / 20; // 20 updates during estimated time
    
    const progressInterval = setInterval(() => {
      setToolProgress(prev => {
        if (!prev.isActive) {
          clearInterval(progressInterval);
          return prev;
        }
        
        // Calculate progress percentage based on elapsed time and estimated completion
        const elapsedTime = Date.now() - (prev.startTime || Date.now());
        const newPercentage = Math.min(95, (elapsedTime / estimatedTime) * 100);
        
        return {
          ...prev,
          progressPercentage: newPercentage,
        };
      });
    }, updateInterval);
    
    // Return a cleanup function to stop progress updates
    return () => clearInterval(progressInterval);
  }, []);

  // Update tool progress with intermediate results
  const updateToolProgress = useCallback((data: Partial<ToolProgressState>) => {
    setToolProgress(prev => ({
      ...prev,
      ...data,
    }));
  }, []);

  // Complete tool execution progress
  const completeToolProgress = useCallback((status: ToolProgressStatus = "completed", message?: string) => {
    setToolProgress(prev => ({
      ...prev,
      isActive: false,
      endTime: Date.now(),
      status,
      progressPercentage: 100,
      message,
    }));
    
    // Reset after showing completion for a period
    setTimeout(() => {
      setToolProgress(prev => {
        // Only reset if this completion state hasn't been changed
        if (prev.endTime && Date.now() - prev.endTime > 5000) {
          return {
            isActive: false,
            tool: null,
            args: null,
            startTime: null,
            endTime: null,
            status: "running",
            progressPercentage: 0,
          };
        }
        return prev;
      });
    }, 5000);
  }, []);

  return {
    toolProgress,
    startToolProgress,
    updateToolProgress,
    completeToolProgress,
  };
}