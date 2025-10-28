import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Award, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

export default function ISOQualityManagement() {
  const { toast } = useToast();

  // Fetch non-conformances from backend
  const { data: nonConformances = [], isLoading: ncsLoading } = useQuery<any[]>({
    queryKey: ['/api/quality/non-conformances'],
  });

  // Fetch quality checklists from backend
  const { data: checklists = [], isLoading: checklistsLoading } = useQuery<any[]>({
    queryKey: ['/api/quality/checklists'],
  });

  // Calculate KPIs from real data
  const stats = {
    totalNCs: nonConformances.length,
    openNCs: nonConformances.filter((nc: any) => nc.status !== 'resolved' && nc.status !== 'closed').length,
    closedThisMonth: nonConformances.filter((nc: any) => {
      const detectedDate = new Date(nc.detectedDate);
      const now = new Date();
      return (nc.status === 'resolved' || nc.status === 'closed') &&
        detectedDate.getMonth() === now.getMonth() &&
        detectedDate.getFullYear() === now.getFullYear();
    }).length,
    complianceScore: nonConformances.length > 0 
      ? Math.round((nonConformances.filter((nc: any) => nc.status === 'resolved').length / nonConformances.length) * 100)
      : 100,
  };

  // Create non-conformance mutation
  const createNCMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/quality/non-conformances', data);
    },
    onSuccess: () => {
      toast({
        title: "Non-Conformance Reported",
        description: "Non-conformance created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quality/non-conformances'] });
    },
    onError: (error: any) => {
      toast({
        title: "Report Failed",
        description: error.message || "Failed to report non-conformance",
        variant: "destructive",
      });
    },
  });

  // Create checklist mutation
  const createChecklistMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/quality/checklists', data);
    },
    onSuccess: () => {
      toast({
        title: "Checklist Created",
        description: "Quality checklist created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/quality/checklists'] });
    },
    onError: (error: any) => {
      toast({
        title: "Creation Failed",
        description: error.message || "Failed to create checklist",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🏆 ISO 9001 Quality Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Quality control and non-conformance tracking</p>
        </div>
        <Button 
          onClick={() => {
            createNCMutation.mutate({
              ncNumber: `NC-${Date.now()}`,
              title: 'New Non-Conformance',
              description: 'Sample non-conformance description',
              severity: 'minor',
              category: 'process',
              detectedBy: 'current-user',
              detectedDate: new Date().toISOString(),
            });
          }}
          disabled={createNCMutation.isPending}
          data-testid="button-report-nc"
        >
          {createNCMutation.isPending ? "Reporting..." : "Report Non-Conformance"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total NCs</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-total-ncs">{stats.totalNCs}</h3>
              </div>
              <AlertCircle className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Open</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-open-ncs">{stats.openNCs}</h3>
              </div>
              <AlertCircle className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Closed This Month</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-closed-this-month">{stats.closedThisMonth}</h3>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Score</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-compliance-score">{stats.complianceScore}%</h3>
              </div>
              <Award className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="ncs" className="space-y-4">
        <TabsList className="bg-gray-100 dark:bg-salis-gray-dark">
          <TabsTrigger value="ncs">Non-Conformances</TabsTrigger>
          <TabsTrigger value="checklists">Quality Checklists</TabsTrigger>
        </TabsList>

        <TabsContent value="ncs">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Recent Non-Conformances</CardTitle>
            </CardHeader>
            <CardContent>
              {ncsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading non-conformances...</div>
              ) : nonConformances.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No non-conformances found</div>
              ) : (
                <div className="space-y-3">
                  {nonConformances.map((nc) => (
                    <div key={nc.id} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`nc-${nc.id}`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{nc.ncNumber}</h3>
                          <Badge variant={nc.severity === "major" ? "destructive" : "secondary"}>{nc.severity}</Badge>
                          <Badge>{nc.category}</Badge>
                        </div>
                        <p className="text-sm text-gray-900 dark:text-white mb-1">{nc.title}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Detected by {nc.detectedBy} • {new Date(nc.detectedDate).toLocaleDateString()}</p>
                      </div>
                      <Badge variant={nc.status === "resolved" ? "default" : "secondary"}>{nc.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Quality Checklists</CardTitle>
            </CardHeader>
            <CardContent>
              {checklistsLoading ? (
                <div className="text-center py-8 text-gray-500">Loading checklists...</div>
              ) : checklists.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No quality checklists found</div>
              ) : (
                <div className="space-y-3">
                  {checklists.map((checklist) => (
                    <div key={checklist.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`checklist-${checklist.id}`}>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">{checklist.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{checklist.itemCount || 0} items • {checklist.category?.replace("_", " ")}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">{checklist.completionRate || 0}%</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Completion</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
