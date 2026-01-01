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

  const { data: jobCards } = useQuery<JobCard[]>({
    queryKey: ["/api/technicians", user?.id, "job-cards"],
    enabled: !!user?.id,
  });

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
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white mb-2">
          Job Documentation
        </h1>
        <p className="text-[#64748B]">
          Upload photos and videos for job cards
        </p>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">Select Active Job</CardTitle>
        </CardHeader>
        <CardContent>
          {activeJobs.length === 0 ? (
            <p className="text-[#64748B] text-center py-4">
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
                      ? "border-[#0A5ED7] bg-blue-50 dark:bg-blue-900/20"
                      : "border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7]/50"
                  }`}
                  data-testid={`button-select-job-${job.id}`}
                >
                  <p className="font-semibold text-[#0B1F3B] dark:text-white">
                    Job #{job.jobNumber}
                  </p>
                  <p className="text-sm text-[#64748B] mt-1">
                    {job.serviceType}
                  </p>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedJobId && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">Upload Media</CardTitle>
            <p className="text-sm text-[#64748B] mt-1">
              Add photos or videos to document your work
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label
                htmlFor="photo-upload"
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#E2E8F0] dark:border-[#232A36] rounded-lg cursor-pointer hover:border-[#0A5ED7] transition-colors"
              >
                <ImageIcon className="h-12 w-12 text-[#64748B] mb-3" />
                <span className="text-sm font-medium text-[#0B1F3B] dark:text-white mb-1">
                  Upload Photos
                </span>
                <span className="text-xs text-[#64748B]">
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
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#E2E8F0] dark:border-[#232A36] rounded-lg cursor-pointer hover:border-[#0A5ED7] transition-colors"
              >
                <Video className="h-12 w-12 text-[#64748B] mb-3" />
                <span className="text-sm font-medium text-[#0B1F3B] dark:text-white mb-1">
                  Upload Videos
                </span>
                <span className="text-xs text-[#64748B]">
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

            <Button className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90" size="lg" data-testid="button-capture-photo">
              <Camera className="h-5 w-5 mr-2" />
              Capture with Camera
            </Button>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">Recent Uploads</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Upload className="h-12 w-12 mx-auto text-[#64748B] mb-3" />
            <p className="text-[#64748B]">No uploads yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
