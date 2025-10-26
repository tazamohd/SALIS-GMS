import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  Clock,
  Wrench,
  Package,
  Search,
  Bell,
  MapPin,
} from "lucide-react";

export default function LiveServiceTracking() {
  const [selectedJobCard, setSelectedJobCard] = useState<string | null>(null);

  const { data: trackingData = [] } = useQuery({
    queryKey: ["/api/service-tracking/active"],
  });

  // Mock data
  const mockActiveJobs = [
    {
      id: "JC-2024-1850",
      customerName: "John Smith",
      vehicle: "2020 Honda Civic",
      status: "in_progress",
      currentStep: "Brake System Repair",
      progress: 65,
      estimatedCompletion: "2024-10-26T16:00:00Z",
      updates: [
        {
          id: "1",
          status: "checked_in",
          title: "Vehicle Check-In Complete",
          description: "Vehicle received and initial inspection completed",
          timestamp: "2024-10-26T09:00:00Z",
          technicianName: "Mike Davis",
        },
        {
          id: "2",
          status: "diagnosing",
          title: "Diagnostic Scan Complete",
          description: "Identified worn brake pads and rotors requiring replacement",
          timestamp: "2024-10-26T09:30:00Z",
          technicianName: "Mike Davis",
        },
        {
          id: "3",
          status: "parts_ordered",
          title: "Parts Ordered",
          description: "OEM brake pads and rotors ordered, expected arrival in 1 hour",
          timestamp: "2024-10-26T10:00:00Z",
          technicianName: "Mike Davis",
        },
        {
          id: "4",
          status: "in_progress",
          title: "Repair In Progress",
          description: "Installing new brake pads and rotors on front axle",
          timestamp: "2024-10-26T13:00:00Z",
          technicianName: "Mike Davis",
        },
      ],
    },
    {
      id: "JC-2024-1851",
      customerName: "Sarah Johnson",
      vehicle: "2019 Toyota Camry",
      status: "diagnosing",
      currentStep: "Engine Diagnostic",
      progress: 25,
      estimatedCompletion: "2024-10-26T15:30:00Z",
      updates: [
        {
          id: "1",
          status: "checked_in",
          title: "Vehicle Check-In Complete",
          description: "Customer reported check engine light",
          timestamp: "2024-10-26T12:00:00Z",
          technicianName: "Emily Brown",
        },
        {
          id: "2",
          status: "diagnosing",
          title: "Running Diagnostic Tests",
          description: "OBD-II scan in progress, analyzing error codes",
          timestamp: "2024-10-26T12:30:00Z",
          technicianName: "Emily Brown",
        },
      ],
    },
    {
      id: "JC-2024-1848",
      customerName: "Mike Wilson",
      vehicle: "2021 Ford F-150",
      status: "ready",
      currentStep: "Quality Check Complete",
      progress: 100,
      estimatedCompletion: "2024-10-26T14:00:00Z",
      updates: [
        {
          id: "1",
          status: "completed",
          title: "Service Complete",
          description: "Oil change and tire rotation completed, ready for pickup",
          timestamp: "2024-10-26T13:45:00Z",
          technicianName: "John Smith",
        },
      ],
    },
  ];

  const stats = {
    activeJobs: 15,
    completedToday: 8,
    averageProgress: 58,
    onSchedule: 12,
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      checked_in: { variant: "secondary", label: "Checked In" },
      diagnosing: { variant: "default", label: "Diagnosing" },
      parts_ordered: { variant: "default", label: "Parts Ordered" },
      in_progress: { variant: "default", label: "In Progress" },
      quality_check: { variant: "default", label: "Quality Check" },
      ready: { variant: "default", label: "Ready" },
      completed: { variant: "default", label: "Completed" },
    };
    const config = variants[status] || { variant: "secondary", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      checked_in: <MapPin className="h-5 w-5 text-blue-600" />,
      diagnosing: <Search className="h-5 w-5 text-purple-600" />,
      parts_ordered: <Package className="h-5 w-5 text-orange-600" />,
      in_progress: <Wrench className="h-5 w-5 text-blue-600" />,
      quality_check: <CheckCircle className="h-5 w-5 text-green-600" />,
      ready: <Bell className="h-5 w-5 text-green-600" />,
      completed: <CheckCircle className="h-5 w-5 text-green-600" />,
    };
    return icons[status] || <Clock className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🚗 Live Service Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Real-time updates on active service jobs
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-active-jobs">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.activeJobs}</h3>
              </div>
              <Wrench className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-completed-today">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Completed Today</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.completedToday}</h3>
              </div>
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-avg-progress">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Progress</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.averageProgress}%</h3>
              </div>
              <Clock className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800" data-testid="card-on-schedule">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">On Schedule</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.onSchedule}</h3>
              </div>
              <Bell className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Jobs List */}
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Active Service Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockActiveJobs.map((job) => (
              <div
                key={job.id}
                className="border border-gray-200 dark:border-gray-800 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
                onClick={() => setSelectedJobCard(job.id)}
                data-testid={`job-${job.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{job.id}</h3>
                    {getStatusBadge(job.status)}
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ETA: {new Date(job.estimatedCompletion).toLocaleTimeString()}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                  <div><span className="font-medium">Customer:</span> {job.customerName}</div>
                  <div><span className="font-medium">Vehicle:</span> {job.vehicle}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 dark:text-white font-medium">{job.currentStep}</span>
                    <span className="text-gray-600 dark:text-gray-400">{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} className="h-2" />
                </div>
                {selectedJobCard === job.id && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Service Updates</h4>
                    <div className="space-y-3">
                      {job.updates.map((update) => (
                        <div key={update.id} className="flex gap-3" data-testid={`update-${update.id}`}>
                          <div className="mt-1">{getStatusIcon(update.status)}</div>
                          <div className="flex-1">
                            <h5 className="font-medium text-gray-900 dark:text-white">{update.title}</h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{update.description}</p>
                            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                              <span>{update.technicianName}</span>
                              <span>•</span>
                              <span>{new Date(update.timestamp).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
