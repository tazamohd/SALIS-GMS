import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

export default function ISOQualityManagement() {
  const mockNonConformances = [
    { id: "NC-2024-001", title: "Incorrect torque on wheel nuts", severity: "major", category: "process", detectedBy: "Mike Davis", status: "resolved", date: "2024-10-22" },
    { id: "NC-2024-002", title: "Missing customer signature", severity: "minor", category: "documentation", detectedBy: "Emily Brown", status: "investigating", date: "2024-10-24" },
  ];

  const mockChecklists = [
    { id: "1", name: "Service Delivery Quality", category: "service_delivery", itemCount: 12, completionRate: 95 },
    { id: "2", name: "Parts Inspection", category: "parts_inspection", itemCount: 8, completionRate: 100 },
  ];

  const stats = { totalNCs: 8, openNCs: 2, closedThisMonth: 6, complianceScore: 94 };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🏆 ISO 9001 Quality Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Quality control and non-conformance tracking</p>
        </div>
        <Button data-testid="button-report-nc">Report Non-Conformance</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total NCs</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalNCs}</h3>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.openNCs}</h3>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.closedThisMonth}</h3>
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
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.complianceScore}%</h3>
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
              <div className="space-y-3">
                {mockNonConformances.map((nc) => (
                  <div key={nc.id} className="flex items-start justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{nc.id}</h3>
                        <Badge variant={nc.severity === "major" ? "destructive" : "secondary"}>{nc.severity}</Badge>
                        <Badge>{nc.category}</Badge>
                      </div>
                      <p className="text-sm text-gray-900 dark:text-white mb-1">{nc.title}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Detected by {nc.detectedBy} • {new Date(nc.date).toLocaleDateString()}</p>
                    </div>
                    <Badge variant={nc.status === "resolved" ? "default" : "secondary"}>{nc.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
            <CardHeader>
              <CardTitle>Quality Checklists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockChecklists.map((checklist) => (
                  <div key={checklist.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{checklist.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{checklist.itemCount} items • {checklist.category.replace("_", " ")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900 dark:text-white">{checklist.completionRate}%</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Completion</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
