import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Wrench, Zap, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { Tool, ToolAvailability, Garage } from "@shared/schema";

interface ToolAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ToolAvailabilityDialog({ open, onOpenChange }: ToolAvailabilityDialogProps) {
  const { data: tools = [], isLoading: toolsLoading } = useQuery<Tool[]>({
    queryKey: ['/api/tools'],
  });

  const { data: garages = [], isLoading: garagesLoading } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const getToolIcon = (toolType: string) => {
    switch (toolType) {
      case 'diagnostic': return <Zap className="w-5 h-5 text-red-600" />;
      case 'electrical': return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'mechanical': return <Wrench className="w-5 h-5 text-blue-600" />;
      default: return <Wrench className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    if (isActive) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    return <XCircle className="w-5 h-5 text-red-500" />;
  };

  const isLoading = toolsLoading || garagesLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-[#222029] flex items-center gap-2">
            <Wrench className="w-6 h-6" />
            Tool Availability Status
          </DialogTitle>
          <DialogDescription className="font-['Poppins',Helvetica] text-sm text-[#999999]">
            Real-time availability of tools across all garages
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-20 rounded"></div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {tools.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">No tools found</p>
              </div>
            ) : (
              tools.map((tool) => (
                <div 
                  key={tool.id} 
                  className="border rounded-lg p-4 hover:border-blue-500 transition-colors"
                  data-testid={`tool-availability-${tool.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        {getToolIcon(tool.toolType)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-base" data-testid={`text-tool-name-${tool.id}`}>
                            {tool.name}
                          </h4>
                          {getStatusIcon(tool.isActive ?? false)}
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="outline" className="capitalize">
                            {tool.toolType}
                          </Badge>
                          {tool.brand && (
                            <span className="text-sm text-gray-500">{tool.brand}</span>
                          )}
                          {tool.isGlobal && (
                            <Badge variant="secondary">Global</Badge>
                          )}
                        </div>
                        {tool.description && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-1">
                            {tool.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-semibold ${tool.isActive ? 'text-green-600' : 'text-red-600'}`}>
                        {tool.isActive ? 'Available' : 'Unavailable'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {tool.visibility || 'Private'}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Availability Summary</p>
              <p className="text-sm text-blue-700 mt-1">
                Total Tools: {tools.length} | 
                Available: {tools.filter(t => t.isActive).length} | 
                In Use: {tools.filter(t => !t.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
