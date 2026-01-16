import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, DollarSign, CheckCircle, Wrench } from "lucide-react";
import type { ServiceTemplate } from "@shared/schema";

interface ServiceTemplatesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServiceTemplatesDialog({ open, onOpenChange }: ServiceTemplatesDialogProps) {
  const { t } = useTranslation();
  const { data: templates = [], isLoading } = useQuery<ServiceTemplate[]>({
    queryKey: ['/api/service-templates'],
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "maintenance": return "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200";
      case "repair": return "bg-gray-300 dark:bg-gray-600 text-gray-900 dark:text-white";
      case "diagnostic": return "bg-gray-400 dark:bg-gray-500 text-gray-900 dark:text-white";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-gray-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6" />
            {t('serviceTemplates.title', 'Service Templates')}
          </DialogTitle>
          <DialogDescription className="font-['Poppins',Helvetica] text-sm text-gray-500 dark:text-gray-500">
            {t('serviceTemplates.description', 'Pre-configured service workflows with steps and requirements')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-32 rounded"></div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">{t('serviceTemplates.noTemplatesFound', 'No service templates found')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {templates.map((template) => (
              <Card key={template.id} className="border-2 hover:border-blue-400 transition-colors" data-testid={`template-${template.id}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg" data-testid={`text-template-name-${template.id}`}>
                          {template.name}
                        </h4>
                        <Badge className={getCategoryColor(template.category)}>
                          {template.category}
                        </Badge>
                        {template.isActive && (
                          <Badge variant="outline" className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600">
                            {t('serviceTemplates.active', 'Active')}
                          </Badge>
                        )}
                      </div>
                      {template.description && (
                        <p className="text-sm text-gray-600 mb-3">
                          {template.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-3">
                    {template.estimatedHours && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>{template.estimatedHours}{t('serviceTemplates.hoursEstimated', 'h estimated')}</span>
                      </div>
                    )}
                    {template.standardCost && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>${template.standardCost}</span>
                      </div>
                    )}
                  </div>

                  {template.taskSteps && Array.isArray(template.taskSteps) && (template.taskSteps as unknown[]).length > 0 && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        {t('serviceTemplates.taskSteps', 'Task Steps')} ({(template.taskSteps as unknown[]).length})
                      </h5>
                      <ul className="space-y-1">
                        {(template.taskSteps as unknown[]).slice(0, 3).map((step, index: number) => (
                          <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-gray-800 dark:text-gray-200 font-medium">{index + 1}.</span>
                            <span>{typeof step === 'string' ? step : (step as Record<string, string>)?.description || (step as Record<string, string>)?.name || t('serviceTemplates.step', 'Step')}</span>
                          </li>
                        ))}
                        {(template.taskSteps as unknown[]).length > 3 && (
                          <li className="text-sm text-gray-500 italic">
                            +{(template.taskSteps as unknown[]).length - 3} {t('serviceTemplates.moreSteps', 'more steps...')}
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {template.requiredSkills && Array.isArray(template.requiredSkills) && (template.requiredSkills as unknown[]).length > 0 && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <Wrench className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-500">{t('serviceTemplates.requiredSkills', 'Required Skills:')}</span>
                      {(template.requiredSkills as unknown[]).map((skill, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {typeof skill === 'string' ? skill : (skill as Record<string, string>)?.name || t('serviceTemplates.skill', 'Skill')}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>{t('serviceTemplates.totalTemplates', 'Total Templates')}:</strong> {templates.length} | 
            <strong className="ml-2">{t('serviceTemplates.activeCount', 'Active')}:</strong> {templates.filter(t => t.isActive).length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
