import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, TrendingUp, Users, Zap } from "lucide-react";

export default function AIScheduling() {
  const { data: optimizations = [] } = useQuery({
    queryKey: ["/api/scheduling/optimizations"],
  });

  const mockRules = [
    { id: "1", name: "Skill-Based Assignment", priority: 1, considerTechnicianSkills: true, considerTechnicianWorkload: true, isActive: true },
    { id: "2", name: "Parts Availability Check", priority: 2, considerPartAvailability: true, isActive: true },
    { id: "3", name: "Customer Preference Match", priority: 3, considerCustomerPreference: true, isActive: false },
  ];

  const mockOptimization = {
    date: "2024-10-26",
    appointmentsOptimized: 12,
    efficiencyGain: 14.5,
    technicianUtilization: { "Tech1": 92, "Tech2": 88, "Tech3": 85 },
    suggestions: [
      "Reassign brake job to Mike (specialist)",
      "Move oil changes to morning slot",
      "Buffer added between complex repairs",
    ],
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🤖 AI-Powered Scheduling
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Optimize technician schedules automatically</p>
        </div>
        <Button data-testid="button-run-optimization">
          <Zap className="h-4 w-4 mr-2" />
          Run Optimization
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Optimized Today</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{mockOptimization.appointmentsOptimized}</h3>
              </div>
              <Calendar className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Efficiency Gain</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{mockOptimization.efficiencyGain}%</h3>
              </div>
              <TrendingUp className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Utilization</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">88%</h3>
              </div>
              <Users className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Rules</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">2</h3>
              </div>
              <Zap className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Scheduling Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRules.map((rule) => (
              <div key={rule.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{rule.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Priority: {rule.priority}</p>
                </div>
                <Switch checked={rule.isActive} data-testid={`switch-rule-${rule.id}`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>AI Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {mockOptimization.suggestions.map((suggestion, i) => (
              <div key={i} className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900 rounded">
                <Zap className="h-5 w-5 text-blue-600 mt-0.5" />
                <p className="text-sm text-gray-900 dark:text-white">{suggestion}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
