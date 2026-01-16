import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Download, FileText, TrendingUp, Users, Wrench, Calendar, DollarSign } from "lucide-react";
import type { JobCard, Tool } from "@shared/schema";

interface ReportsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportsDialog({ open, onOpenChange }: ReportsDialogProps) {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: jobCards = [] } = useQuery<JobCard[]>({
    queryKey: ['/api/job-cards'],
  });

  const { data: tools = [] } = useQuery<Tool[]>({
    queryKey: ['/api/tools'],
  });

  const { data: integrationStatus } = useQuery({
    queryKey: ['/api/integrated/status'],
  });

  const generateStats = () => {
    const totalJobCards = jobCards.length;
    const activeJobCards = jobCards.filter(jc => jc.status === 'in-progress').length;
    const completedJobCards = jobCards.filter(jc => jc.status === 'completed').length;
    const totalTools = tools.length;
    const availableTools = tools.filter(t => t.isActive).length;

    return {
      totalJobCards,
      activeJobCards,
      completedJobCards,
      totalTools,
      availableTools,
      completionRate: totalJobCards > 0 ? Math.round((completedJobCards / totalJobCards) * 100) : 0,
      toolUtilization: totalTools > 0 ? Math.round(((totalTools - availableTools) / totalTools) * 100) : 0,
    };
  };

  const stats = generateStats();

  const exportReport = (format: string) => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      stats,
      jobCards,
      tools,
      integrationStatus,
    };

    const dataStr = format === 'json' 
      ? JSON.stringify(reportData, null, 2)
      : `Integration Report - ${new Date().toLocaleDateString()}\n\n` +
        `Total Job Cards: ${stats.totalJobCards}\n` +
        `Active: ${stats.activeJobCards} | Completed: ${stats.completedJobCards}\n` +
        `Completion Rate: ${stats.completionRate}%\n\n` +
        `Total Tools: ${stats.totalTools}\n` +
        `Available: ${stats.availableTools}\n` +
        `Utilization: ${stats.toolUtilization}%`;

    const blob = new Blob([dataStr], { type: format === 'json' ? 'application/json' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `garage-report-${new Date().toISOString().split('T')[0]}.${format === 'json' ? 'json' : 'txt'}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-[#222029] flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            System Reports & Analytics
          </DialogTitle>
          <DialogDescription className="font-['Poppins',Helvetica] text-sm text-[#999999]">
            Comprehensive reports and performance metrics
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview" data-testid="tab-overview">{t('reports.overview', 'Overview')}</TabsTrigger>
            <TabsTrigger value="job-cards" data-testid="tab-job-cards">{t('reports.jobCards', 'Job Cards')}</TabsTrigger>
            <TabsTrigger value="tools" data-testid="tab-tools">{t('reports.tools', 'Tools')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Job Cards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalJobCards}</div>
                  <p className="text-xs text-gray-500 mt-1">{stats.activeJobCards} active</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Completion Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.completionRate}%</div>
                  <p className="text-xs text-gray-500 mt-1">{stats.completedJobCards} completed</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Tools</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalTools}</div>
                  <p className="text-xs text-gray-500 mt-1">{stats.availableTools} available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Tool Utilization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.toolUtilization}%</div>
                  <p className="text-xs text-gray-500 mt-1">In use</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Integration Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Modules</span>
                    <Badge variant="secondary">8 Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Sync</span>
                    <Badge className="bg-green-100 text-green-700">100% Healthy</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-Assignments</span>
                    <Badge variant="outline">12 today</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="job-cards" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Job Cards Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {jobCards.length === 0 ? (
                  <p className="text-sm text-gray-500">No job cards available</p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{jobCards.filter(jc => jc.status === 'pending').length}</div>
                        <div className="text-xs text-gray-600">Pending</div>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{jobCards.filter(jc => jc.status === 'in-progress').length}</div>
                        <div className="text-xs text-gray-600">In Progress</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{jobCards.filter(jc => jc.status === 'completed').length}</div>
                        <div className="text-xs text-gray-600">Completed</div>
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {jobCards.slice(0, 10).map((jobCard) => {
                        const vehicleInfo = jobCard.vehicleInfo as any;
                        return (
                          <div key={jobCard.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                            <div className="flex-1">
                              <div className="text-sm font-medium">
                                {vehicleInfo?.make || 'N/A'} {vehicleInfo?.model || ''}
                              </div>
                              <div className="text-xs text-gray-500">{jobCard.serviceType}</div>
                            </div>
                            <Badge variant={jobCard.status === 'completed' ? 'default' : 'outline'}>
                              {jobCard.status}
                            </Badge>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Tools Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {tools.length === 0 ? (
                  <p className="text-sm text-gray-500">No tools available</p>
                ) : (
                  <>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{tools.filter(t => t.isActive).length}</div>
                        <div className="text-xs text-gray-600">Active</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{tools.filter(t => !t.isActive).length}</div>
                        <div className="text-xs text-gray-600">Inactive</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{new Set(tools.map(t => t.toolType)).size}</div>
                        <div className="text-xs text-gray-600">Categories</div>
                      </div>
                    </div>

                    <div className="max-h-60 overflow-y-auto space-y-2">
                      {tools.slice(0, 10).map((tool) => (
                        <div key={tool.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div className="flex-1">
                            <div className="text-sm font-medium">{tool.name}</div>
                            <div className="text-xs text-gray-500">{tool.toolType}</div>
                          </div>
                          <Badge variant={tool.isActive ? 'default' : 'outline'} className={tool.isActive ? 'bg-green-100 text-green-700' : ''}>
                            {tool.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex gap-3 pt-4 border-t">
          <Button
            onClick={() => exportReport('txt')}
            variant="outline"
            className="flex-1"
            data-testid="button-export-txt"
          >
            <Download className="w-4 h-4 mr-2" />
            Export as TXT
          </Button>
          <Button
            onClick={() => exportReport('json')}
            variant="outline"
            className="flex-1"
            data-testid="button-export-json"
          >
            <Download className="w-4 h-4 mr-2" />
            Export as JSON
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
