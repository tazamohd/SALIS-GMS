import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

interface Action {
  id: string;
  type: string;
  description: string;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  timestamp: Date;
}

interface UndoRedoContextType {
  canUndo: boolean;
  canRedo: boolean;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  addAction: (action: Omit<Action, "id" | "timestamp">) => void;
  clearHistory: () => void;
  history: Action[];
}

const UndoRedoContext = createContext<UndoRedoContextType | undefined>(undefined);

const MAX_HISTORY_SIZE = 50;

export function UndoRedoProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<Action[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const { toast } = useToast();
  const abortControllerRef = useRef(new AbortController());

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current.abort();
    };
  }, []);

  const addAction = useCallback((action: Omit<Action, "id" | "timestamp">) => {
    const newAction: Action = {
      ...action,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
    };

    setHistory((prev) => {
      // Remove any actions after the current index (when undoing then doing something new)
      const newHistory = prev.slice(0, currentIndex + 1);
      
      // Add the new action
      newHistory.push(newAction);
      
      // Keep only the last MAX_HISTORY_SIZE actions
      if (newHistory.length > MAX_HISTORY_SIZE) {
        return newHistory.slice(-MAX_HISTORY_SIZE);
      }
      
      return newHistory;
    });

    setCurrentIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= MAX_HISTORY_SIZE ? MAX_HISTORY_SIZE - 1 : newIndex;
    });

    // Save to backend with abort signal
    fetch('/api/action-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        actionType: action.type,
        actionDescription: action.description,
      }),
      signal: abortControllerRef.current.signal,
    }).catch((error) => {
      // Ignore abort errors
      if (error.name !== 'AbortError') {
        console.error('Failed to save action to history:', error);
      }
    });
  }, [currentIndex]);

  const undo = useCallback(async () => {
    if (currentIndex < 0) {
      toast({ title: "Cannot Undo", description: "No actions to undo", variant: "destructive" });
      return;
    }

    const action = history[currentIndex];
    
    try {
      await action.undo();
      setCurrentIndex((prev) => prev - 1);
      toast({ title: "Action Undone", description: action.description });
    } catch (error: any) {
      toast({ 
        title: "Undo Failed", 
        description: error.message || "Failed to undo action", 
        variant: "destructive" 
      });
    }
  }, [currentIndex, history, toast]);

  const redo = useCallback(async () => {
    if (currentIndex >= history.length - 1) {
      toast({ title: "Cannot Redo", description: "No actions to redo", variant: "destructive" });
      return;
    }

    const action = history[currentIndex + 1];
    
    try {
      await action.redo();
      setCurrentIndex((prev) => prev + 1);
      toast({ title: "Action Redone", description: action.description });
    } catch (error: any) {
      toast({ 
        title: "Redo Failed", 
        description: error.message || "Failed to redo action", 
        variant: "destructive" 
      });
    }
  }, [currentIndex, history, toast]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setCurrentIndex(-1);
  }, []);

  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  return (
    <UndoRedoContext.Provider
      value={{
        canUndo,
        canRedo,
        undo,
        redo,
        addAction,
        clearHistory,
        history: history.slice(0, currentIndex + 1),
      }}
    >
      {children}
    </UndoRedoContext.Provider>
  );
}

export function useUndoRedo() {
  const context = useContext(UndoRedoContext);
  if (!context) {
    throw new Error("useUndoRedo must be used within UndoRedoProvider");
  }
  return context;
}
