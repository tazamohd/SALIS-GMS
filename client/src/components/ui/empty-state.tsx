import { Button } from "@/components/ui/button";
import { FileQuestion } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  testId?: string;
}

export function EmptyState({ title, description, actionLabel, onAction, testId = "empty-state" }: EmptyStateProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg bg-slate-50 dark:bg-slate-900 dark:border-slate-700"
      data-testid={`container-${testId}`}
    >
      <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
        <FileQuestion className="h-8 w-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-medium" data-testid={`text-${testId}-title`}>{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm text-center mt-1 mb-4" data-testid={`text-${testId}-description`}>{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="outline" data-testid={`button-${testId}-action`}>{actionLabel}</Button>
      )}
    </div>
  );
}
