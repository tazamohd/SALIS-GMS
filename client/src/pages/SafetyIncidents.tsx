import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { AlertTriangle, Shield, Activity, Users } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts";

export default function SafetyIncidents() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: incidents = [], isLoading: incidentsLoading } = useQuery<any[]>({
    queryKey: ['/api/safety/incidents'],
  });

  const { data: analytics } = useQuery<any>({
    queryKey: ['/api/safety/analytics'],
  });

  const stats = {
    totalIncidents: incidents.length,
    openInvestigations: incidents.filter((i: any) => i.status === 'investigating').length,
    oshaRecordable: analytics?.oshaRecordable || 0,
    daysWithoutIncident: analytics?.daysWithoutIncident || 0,
  };

  const createIncidentMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/safety/incidents', data);
    },
    onSuccess: () => {
      toast({
        title: t('safety.incidentReported', 'Incident Reported'),
        description: t('safety.incidentCreatedSuccess', 'Safety incident created successfully'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/safety/incidents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/safety/analytics'] });
    },
    onError: (error: any) => {
      toast({
        title: t('safety.reportFailed', 'Report Failed'),
        description: error.message || t('safety.failedToReportIncident', 'Failed to report incident'),
        variant: "destructive",
      });
    },
  });

  const getSeverityColor = (severity: string) => {
    return severity === "minor" ? "secondary" : severity === "moderate" ? "default" : "destructive";
  };

  return (
    <StandardPageLayout
      title={t('safety.safetyIncidentReporting', 'Safety Incident Reporting')}
      description={t('safety.description', 'Track and investigate workplace safety incidents')}
      icon={AlertTriangle}
      actions={[
        {
          label: createIncidentMutation.isPending ? t('safety.reporting', 'Reporting...') : t('safety.reportIncident', 'Report Incident'),
          onClick: () => {
            createIncidentMutation.mutate({
              incidentNumber: `SI-${Date.now()}`,
              incidentDate: new Date().toISOString(),
              incidentType: 'near_miss',
              severity: 'minor',
              location: 'Service Bay 1',
              description: 'Sample incident description',
              involvedPersons: ['current-user'],
              witnesses: [],
              immediateActions: 'Area secured and cleaned',
            });
          },
        },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('safety.totalThisYear', 'Total This Year')}</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-total-incidents">{stats.totalIncidents}</h3>
              </div>
              <AlertTriangle className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('safety.investigating', 'Investigating')}</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-open-investigations">{stats.openInvestigations}</h3>
              </div>
              <Activity className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('safety.oshaRecordable', 'OSHA Recordable')}</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-osha-recordable">{stats.oshaRecordable}</h3>
              </div>
              <Shield className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('safety.daysWithout', 'Days Without')}</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="text-days-without">{stats.daysWithoutIncident}</h3>
              </div>
              <Users className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>{t('safety.recentIncidents', 'Recent Incidents')}</CardTitle>
        </CardHeader>
        <CardContent>
          {incidentsLoading ? (
            <div className="text-center py-8 text-gray-500">{t('safety.loadingIncidents', 'Loading incidents...')}</div>
          ) : incidents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">{t('safety.noIncidentsFound', 'No incidents found')}</div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <div key={incident.id} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`incident-${incident.id}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{incident.incidentNumber}</h3>
                      <Badge variant={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                      <Badge>{incident.incidentType?.replace("_", " ")}</Badge>
                    </div>
                    <p className="text-sm text-gray-900 dark:text-white mb-1">{incident.description}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {incident.location} • {new Date(incident.incidentDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={incident.status === "closed" ? "default" : "secondary"}>{incident.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
