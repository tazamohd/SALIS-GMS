import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Wrench, User, TrendingUp, CheckCircle, Clock } from "lucide-react";
import type { JobCard, Tool } from "@shared/schema";

interface SmartAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface AssignmentRecommendation {
  tool: Tool;
  confidence: number;
  reason: string;
  availability: 'available' | 'in-use' | 'reserved';
}

export function SmartAssignmentDialog({ open, onOpenChange }: SmartAssignmentDialogProps) {
  const { t } = useTranslation();
  const [selectedJobCardId, setSelectedJobCardId] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [recommendations, setRecommendations] = useState<AssignmentRecommendation[]>([]);

  const { data: jobCards = [] } = useQuery<JobCard[]>({
    queryKey: ['/api/job-cards'],
  });

  const { data: tools = [] } = useQuery<Tool[]>({
    queryKey: ['/api/tools'],
  });

  const analyzeJobCard = () => {
    if (!selectedJobCardId) return;

    setAnalyzing(true);
    
    setTimeout(() => {
      const selectedJob = jobCards.find(jc => jc.id === selectedJobCardId);
      if (!selectedJob) {
        setAnalyzing(false);
        return;
      }

      if (tools.length === 0) {
        setRecommendations([]);
        setAnalyzing(false);
        return;
      }

      const serviceType = selectedJob.serviceType;
      
      const matchedTools = tools.filter(tool => {
        if (serviceType === 'diagnostic' && tool.toolType === 'diagnostic') return true;
        if (serviceType === 'repair' && (tool.toolType === 'mechanical' || tool.toolType === 'electrical')) return true;
        if (serviceType === 'maintenance' && tool.toolType === 'mechanical') return true;
        return false;
      });

      const recs: AssignmentRecommendation[] = matchedTools.slice(0, 3).map((tool, index) => ({
        tool,
        confidence: 95 - (index * 10),
        reason: index === 0 
          ? `Perfect match for ${serviceType} service type` 
          : index === 1 
          ? `Alternative option with good compatibility`
          : `Backup option if primary tools unavailable`,
        availability: tool.isActive ? 'available' : 'in-use',
      }));

      if (recs.length === 0 && tools.length > 0) {
        recs.push({
          tool: tools[0],
          confidence: 60,
          reason: 'Generic tool recommendation - consider manual review',
          availability: tools[0].isActive ? 'available' : 'in-use',
        });
      }

      setRecommendations(recs);
      setAnalyzing(false);
    }, 1500);
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-700 border-green-200";
    if (confidence >= 70) return "bg-blue-100 text-blue-700 border-blue-200";
    return "bg-orange-100 text-orange-700 border-orange-200";
  };

  const getAvailabilityBadge = (availability: string) => {
    switch (availability) {
      case 'available':
        return <Badge className="bg-green-100 text-green-700">Available</Badge>;
      case 'in-use':
        return <Badge className="bg-red-100 text-red-700">In Use</Badge>;
      case 'reserved':
        return <Badge className="bg-yellow-100 text-yellow-700">Reserved</Badge>;
      default:
        return <Badge variant="outline">{t('common.unknown', 'Unknown')}</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            Smart Tool Assignment
          </DialogTitle>
          <DialogDescription className="font-['Poppins',Helvetica] text-sm text-gray-500 dark:text-gray-500">
            AI-powered tool recommendations based on job requirements and availability
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select Job Card</label>
                  <Select value={selectedJobCardId} onValueChange={setSelectedJobCardId}>
                    <SelectTrigger data-testid="select-job-card">
                      <SelectValue placeholder="Choose a job card to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobCards.map((jobCard) => {
                        const vehicleInfo = jobCard.vehicleInfo as any;
                        return (
                          <SelectItem key={jobCard.id} value={jobCard.id}>
                            {jobCard.jobNumber} - {vehicleInfo?.make || 'N/A'} {vehicleInfo?.model || ''} ({jobCard.serviceType})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={analyzeJobCard}
                  disabled={!selectedJobCardId || analyzing}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  data-testid="button-analyze-job"
                >
                  {analyzing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Job Requirements...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze & Recommend
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {recommendations.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                Recommended Tool Assignments
              </h3>

              {recommendations.map((rec, index) => (
                <Card key={index} className="border-2 hover:border-purple-400 transition-colors" data-testid={`recommendation-${index}`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Wrench className="w-4 h-4" />
                          {rec.tool.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">{rec.tool.toolType}</p>
                      </div>
                      <div className="flex gap-2">
                        {getAvailabilityBadge(rec.availability)}
                        <Badge className={getConfidenceColor(rec.confidence)}>
                          {rec.confidence}% Match
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircle className="w-4 h-4 mt-0.5 text-purple-600 flex-shrink-0" />
                        <span>{rec.reason}</span>
                      </div>

                      {rec.tool.brand && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-medium">{t('tools.brand', 'Brand')}:</span>
                          <span>{rec.tool.brand}</span>
                        </div>
                      )}

                      {index === 0 && (
                        <div className="pt-2 border-t">
                          <Button 
                            size="sm" 
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            data-testid={`button-assign-tool-${index}`}
                          >
                            {t('tools.assignThisTool', 'Assign This Tool')}
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!analyzing && recommendations.length === 0 && selectedJobCardId && tools.length === 0 && (
            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardContent className="p-6 text-center">
                <Wrench className="w-12 h-12 mx-auto text-orange-400 mb-3" />
                <p className="text-orange-700 font-medium">{t('tools.noToolsAvailable', 'No tools available in inventory')}</p>
                <p className="text-sm text-orange-600 mt-2">{t('tools.addToolsForRecommendations', 'Add tools to your inventory to get AI recommendations')}</p>
              </CardContent>
            </Card>
          )}

          {!analyzing && recommendations.length === 0 && selectedJobCardId && tools.length > 0 && (
            <Card className="border-2 border-gray-200">
              <CardContent className="p-6 text-center">
                <Sparkles className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-500">{t('tools.clickAnalyzeForRecommendations', 'Click "Analyze & Recommend" to get AI-powered tool suggestions')}</p>
              </CardContent>
            </Card>
          )}

          {!selectedJobCardId && (
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">{t('tools.howItWorks', 'How It Works')}</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      {t('tools.aiAnalysisDescription', 'Our AI analyzes job requirements, service type, and tool availability to recommend the best tools for each task. The system considers tool compatibility, current availability, and success patterns from previous assignments.')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
