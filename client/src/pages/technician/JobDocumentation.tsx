import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Camera, Upload, Image as ImageIcon, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { JobCard } from "@shared/schema";

export default function TechnicianJobDocumentation() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedJobId, setSelectedJobId] = useState<string>("");

  const { data: allJobCards } = useQuery<JobCard[]>({
    queryKey: ["/api/job-cards"],
    enabled: !!user?.id,
  });

  // TODO: Replace with technician-scoped API endpoint /api/technicians/:id/job-cards
  // Current implementation uses client-side filtering (security risk)
  const jobCards = allJobCards?.filter((job) => job.assignedTechnicianId === user?.id) || [];

  const activeJobs = jobCards?.filter(
    (job) => job.status === "in_progress" || job.status === "assigned"
  ) || [];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    if (!selectedJobId) {
      toast({
        title: "No Job Selected",
        description: "Please select a job card first.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Uploading...",
      description: `Uploading ${files.length} file(s) to job ${selectedJobId}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Job Documentation
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Upload photos and videos for job cards
        </p>
      </div>

      {/* Job Selection */}
      <Card className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Select Active Job</CardTitle>
        </CardHeader>
        <CardContent>
          {activeJobs.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400 text-center py-4">
              No active jobs to document
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeJobs.map((job) => (
                <button
                  key={job.id}
                  onClick={() => setSelectedJobId(job.id)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedJobId === job.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  data-testid={`button-select-job-${job.id}`}
                >
                  <p className="font-semibold text-gray-900 dark:text-white">
                    Job #{job.jobNumber}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {job.serviceType}
                  </p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Section */}
      {selectedJobId && (
        <Card className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">Upload Media</CardTitle>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Add photos or videos to document your work
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <ImageIcon className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                <span className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Upload Photos
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  JPG, PNG, or GIF
                </span>
                <Input
                  id="photo-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  data-testid="input-photo-upload"
                />
              </label>

              <label
                htmlFor="video-upload"
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
              >
                <Video className="h-12 w-12 text-gray-400 dark:text-gray-600 mb-3" />
                <span className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Upload Videos
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  MP4, MOV, or AVI
                </span>
                <Input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  data-testid="input-video-upload"
                />
              </label>
            </div>

            <Button className="w-full" size="lg" data-testid="button-capture-photo">
              <Camera className="h-5 w-5 mr-2" />
              Capture with Camera
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Recent Uploads */}
      <Card className="bg-white dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Upload className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 dark:text-gray-400">No uploads yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
