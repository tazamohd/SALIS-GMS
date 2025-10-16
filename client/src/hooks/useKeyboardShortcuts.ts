import { useEffect } from "react";
import { useUndoRedo } from "@/contexts/UndoRedoContext";
import { useToast } from "@/hooks/use-toast";

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  handler: (e: KeyboardEvent) => void;
  description: string;
}

export function useKeyboardShortcuts(enabled: boolean = true) {
  const { undo, redo, canUndo, canRedo } = useUndoRedo();
  const { toast } = useToast();

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      // Cmd/Ctrl + Z: Undo
      if (modifier && e.key === 'z' && !e.shiftKey && canUndo) {
        e.preventDefault();
        undo();
        return;
      }

      // Cmd/Ctrl + Shift + Z: Redo
      if (modifier && e.key === 'z' && e.shiftKey && canRedo) {
        e.preventDefault();
        redo();
        return;
      }

      // Cmd/Ctrl + Y: Redo (alternative)
      if (modifier && e.key === 'y' && canRedo) {
        e.preventDefault();
        redo();
        return;
      }

      // Cmd/Ctrl + S: Save (prevent default, let forms handle)
      if (modifier && e.key === 's') {
        e.preventDefault();
        toast({ 
          title: "Save Shortcut", 
          description: "Use the save button on the form to save changes" 
        });
        return;
      }

      // Cmd/Ctrl + P: Print
      if (modifier && e.key === 'p') {
        e.preventDefault();
        window.print();
        return;
      }

      // Cmd/Ctrl + F: Search (let browser handle, but show toast)
      if (modifier && e.key === 'f') {
        // Don't prevent default, let browser search work
        toast({ 
          title: "Search", 
          description: "Use your browser's search functionality" 
        });
        return;
      }

      // Cmd/Ctrl + K: Quick actions (for future implementation)
      if (modifier && e.key === 'k') {
        e.preventDefault();
        toast({ 
          title: "Quick Actions", 
          description: "Quick actions coming soon!" 
        });
        return;
      }

      // Escape: Close modals/dialogs (let components handle)
      if (e.key === 'Escape') {
        // Don't prevent default, let components handle
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, undo, redo, canUndo, canRedo, toast]);
}

// Hook for registering custom shortcuts in specific components
export function useCustomShortcut(
  shortcut: Omit<KeyboardShortcut, "description">,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modifier = isMac ? e.metaKey : e.ctrlKey;

      const ctrlMatch = shortcut.ctrl === undefined || shortcut.ctrl === modifier;
      const shiftMatch = shortcut.shift === undefined || shortcut.shift === e.shiftKey;
      const altMatch = shortcut.alt === undefined || shortcut.alt === e.altKey;
      const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();

      if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
        e.preventDefault();
        shortcut.handler(e);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, shortcut]);
}
