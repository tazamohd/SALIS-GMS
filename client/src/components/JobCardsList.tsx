import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Car, Clock, User, Wrench } from "lucide-react";
import { format } from "date-fns";
import { TaskAssignmentDialog } from "@/components/TaskAssignmentDialog";
import type { JobCard as JobCardType } from "@shared/schema";

interface JobCard {
  id: string;
  jobNumber: string;
  vehicleInfo: {
    make: string;
    model: string;
    year: number;
    licensePlate?: string;
  };
  serviceType: string;
  description: string;
  status: string;
  priority: string;
  estimatedHours: string;
  createdAt: string;
}

export function JobCardsList() {
  const [selectedJobCard, setSelectedJobCard] = useState<JobCardType | null>(null);
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  
  const { data: jobCards = [], isLoading } = useQuery<JobCard[]>({
    queryKey: ['/api/job-cards'],
  });

  const handleAssignTask = (jobCard: any) => {
    setSelectedJobCard(jobCard as JobCardType);
    setTaskDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-500 text-white";
      case "high": return "bg-orange-500 text-white";
      case "medium": return "bg-blue-500 text-white";
      case "low": return "bg-gray-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white";
      case "in_progress": return "bg-blue-500 text-white";
      case "assigned": return "bg-purple-500 text-white";
      case "pending": return "bg-yellow-500 text-white";
      case "cancelled": return "bg-red-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Job Cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-gray-200 h-24 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (jobCards.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5" />
            Job Cards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Wrench className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-500">No job cards yet</p>
            <p className="text-sm text-gray-400">Create your first job card to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wrench className="w-5 h-5" />
          Job Cards ({jobCards.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {jobCards.map((jobCard) => (
            <div
              key={jobCard.id}
              className="border rounded-lg p-4 hover:border-blue-500 transition-colors cursor-pointer"
              data-testid={`card-job-${jobCard.id}`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-lg" data-testid={`text-job-number-${jobCard.id}`}>
                      {jobCard.jobNumber}
                    </span>
                    <Badge className={getPriorityColor(jobCard.priority)} data-testid={`badge-priority-${jobCard.id}`}>
                      {jobCard.priority}
                    </Badge>
                    <Badge className={getStatusColor(jobCard.status)} data-testid={`badge-status-${jobCard.id}`}>
                      {jobCard.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 capitalize">{jobCard.serviceType}</p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleAssignTask(jobCard)}
                    data-testid={`button-assign-task-${jobCard.id}`}
                  >
                    <User className="w-3 h-3 mr-1" />
                    Assign Task
                  </Button>
                  <Button variant="outline" size="sm" data-testid={`button-view-${jobCard.id}`}>
                    View Details
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1 text-gray-600">
                  <Car className="w-4 h-4" />
                  <span data-testid={`text-vehicle-${jobCard.id}`}>
                    {jobCard.vehicleInfo.make} {jobCard.vehicleInfo.model} ({jobCard.vehicleInfo.year})
                  </span>
                </div>
                {jobCard.estimatedHours && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{jobCard.estimatedHours}h estimated</span>
                  </div>
                )}
                {jobCard.vehicleInfo.licensePlate && (
                  <div className="flex items-center gap-1 text-gray-600">
                    <span className="font-mono font-semibold">
                      {jobCard.vehicleInfo.licensePlate}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                {jobCard.description}
              </p>

              {jobCard.createdAt && (
                <div className="text-xs text-gray-400 mt-2">
                  Created {format(new Date(jobCard.createdAt), 'MMM dd, yyyy HH:mm')}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>

      {selectedJobCard && (
        <TaskAssignmentDialog
          jobCard={selectedJobCard}
          open={taskDialogOpen}
          onOpenChange={setTaskDialogOpen}
        />
      )}
    </Card>
  );
}
