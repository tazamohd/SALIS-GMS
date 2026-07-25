import { ReactNode } from "react";
import { LucideIcon, Save, X } from "lucide-react";
import { StandardPageLayout } from "./StandardPageLayout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormPageProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  formTitle?: string;
  formDescription?: string;
  children: ReactNode;
  onSubmit?: () => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  showActions?: boolean;
  cardClassName?: string;
}

export function FormPage({
  title,
  description,
  icon,
  formTitle,
  formDescription,
  children,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Save",
  cancelLabel = "Cancel",
  showActions = true,
  cardClassName,
}: FormPageProps) {
  return (
    <StandardPageLayout
      title={title}
      description={description}
      icon={icon}
    >
      <div className={cn("max-w-4xl mx-auto group relative", cardClassName)}>
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-3xl blur opacity-50"></div>
        <div className="relative backdrop-blur-xl bg-white/70 dark:bg-black/20 rounded-3xl border border-purple-200/50 dark:border-white/10 shadow-xl overflow-hidden">
          {(formTitle || formDescription) && (
            <div className="p-6 border-b border-gray-200/50 dark:border-white/10">
              {formTitle && <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formTitle}</h3>}
              {formDescription && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{formDescription}</p>}
            </div>
          )}
          
          <div className="p-6 space-y-6">
            {children}
            
            {showActions && (
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t border-gray-200/50 dark:border-white/10">
                {onCancel && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="bg-white/80 dark:bg-white/10 backdrop-blur-xl border-purple-200 dark:border-white/20 hover:bg-purple-50 dark:hover:bg-white/20 text-purple-700 dark:text-white"
                    data-testid="button-cancel"
                  >
                    <X className="mr-2 h-4 w-4" />
                    {cancelLabel}
                  </Button>
                )}
                {onSubmit && (
                  <Button
                    type="submit"
                    onClick={onSubmit}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-xl shadow-purple-500/25 flex-1 sm:flex-initial"
                    data-testid="button-submit"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? "Saving..." : submitLabel}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </StandardPageLayout>
  );
}
