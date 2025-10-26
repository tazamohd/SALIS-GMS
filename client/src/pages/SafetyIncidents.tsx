import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Shield, Activity, Users } from "lucide-react";

export default function SafetyIncidents() {
  const mockIncidents = [
    { id: "SI-2024-001", date: "2024-10-25", type: "injury", severity: "minor", description: "Minor cut on hand while handling metal part", employee: "Mike Davis", status: "closed" },
    { id: "SI-2024-002", date: "2024-10-23", type: "near_miss", severity: "moderate", description: "Forklift nearly collided with vehicle", employee: "John Smith", status: "investigating" },
    { id: "SI-2024-003", date: "2024-10-20", type: "spill", severity: "minor", description: "Oil spill in service bay cleaned immediately", employee: "Emily Brown", status: "closed" },
  ];

  const stats = { totalIncidents: 8, openInvestigations: 2, oshaRecordable: 1, daysWithoutIncident: 145 };

  const getSeverityColor = (severity: string) => {
    return severity === "minor" ? "secondary" : severity === "moderate" ? "default" : "destructive";
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            ⚠️ Safety Incident Reporting
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track and investigate workplace safety incidents</p>
        </div>
        <Button data-testid="button-report-incident">Report Incident</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total This Year</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalIncidents}</h3>
              </div>
              <AlertTriangle className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Investigating</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.openInvestigations}</h3>
              </div>
              <Activity className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">OSHA Recordable</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.oshaRecordable}</h3>
              </div>
              <Shield className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Days Without</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.daysWithoutIncident}</h3>
              </div>
              <Users className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Incidents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockIncidents.map((incident) => (
              <div key={incident.id} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`incident-${incident.id}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{incident.id}</h3>
                    <Badge variant={getSeverityColor(incident.severity)}>{incident.severity}</Badge>
                    <Badge>{incident.type.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-sm text-gray-900 dark:text-white mb-1">{incident.description}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {incident.employee} • {new Date(incident.date).toLocaleDateString()}
                  </p>
                </div>
                <Badge variant={incident.status === "closed" ? "default" : "secondary"}>{incident.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
