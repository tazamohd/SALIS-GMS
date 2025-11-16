import { ReactNode } from "react";
import { LucideIcon, Save, X } from "lucide-react";
import { StandardPageLayout } from "./StandardPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      <Card className={cn("max-w-4xl mx-auto", cardClassName)}>
        {(formTitle || formDescription) && (
          <CardHeader>
            {formTitle && <CardTitle>{formTitle}</CardTitle>}
            {formDescription && <CardDescription>{formDescription}</CardDescription>}
          </CardHeader>
        )}
        
        <CardContent className="space-y-6">
          {children}
          
          {showActions && (
            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t">
              {onCancel && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isSubmitting}
                  className="btn-touch focus-visible-ring"
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
                  className="btn-touch focus-visible-ring flex-1 sm:flex-initial"
                  data-testid="button-submit"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : submitLabel}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
