import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Camera, Play, Circle, Video } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts";

export default function SecurityCameras() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  const { data: cameras = [], isLoading: loadingCameras } = useQuery<any[]>({
    queryKey: ["/api/cameras/cameras"],
  });

  const { data: recordings = [] } = useQuery<any[]>({
    queryKey: ["/api/cameras/recordings", { cameraId: selectedCamera }],
    enabled: !!selectedCamera,
  });

  const createCameraMutation = useMutation({
    mutationFn: async (cameraData: {
      name: string;
      location: string;
      cameraType: string;
      ipAddress?: string;
      streamUrl?: string;
      resolution: string;
    }) => {
      return await apiRequest("POST", "/api/cameras/cameras", cameraData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cameras/cameras"] });
      toast({
        title: t('common.success', 'Success'),
        description: t('cameras.cameraCreated', 'Camera created successfully'),
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('common.error', 'Error'),
        description: error.message || t('cameras.failedToCreate', 'Failed to create camera'),
      });
    },
  });

  const stats = {
    activeCameras: cameras.filter((c: any) => c.isActive).length || 0,
    totalRecordings: recordings.length || 0,
    storageUsed: recordings.reduce((sum: number, r: any) => sum + (r.fileSize || 0), 0) / 1000 || 0,
    motionEvents: recordings.filter((r: any) => r.eventType === "motion").length || 0,
  };

  return (
    <StandardPageLayout
      title={t('cameras.title', 'Security Cameras')}
      description={t('cameras.description', 'Monitor and manage security camera system')}
      icon={Camera}
      actions={[
        {
          label: t('cameras.addCamera', 'Add Camera'),
          onClick: () => {
            createCameraMutation.mutate({
              name: t('cameras.newCamera', 'New Camera'),
              location: t('cameras.serviceBay', 'Service Bay'),
              cameraType: "indoor",
              resolution: "1920x1080",
            });
          },
        },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('cameras.activeCameras', 'Active Cameras')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="stat-active-cameras">{stats.activeCameras}</h3>
              </div>
              <Camera className="h-12 w-12 text-[#0A5ED7]" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('cameras.recordings', 'Recordings')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="stat-total-recordings">{stats.totalRecordings}</h3>
              </div>
              <Video className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('cameras.storageGB', 'Storage (GB)')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="stat-storage-used">{stats.storageUsed.toFixed(1)}</h3>
              </div>
              <Video className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{t('cameras.motionEvents', 'Motion Events')}</p>
                <h3 className="text-2xl font-bold mt-2 text-[#0B1F3B] dark:text-white" data-testid="stat-motion-events">{stats.motionEvents}</h3>
              </div>
              <Circle className="h-12 w-12 text-[#F97316]" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('cameras.cameraFeeds', 'Camera Feeds')}</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingCameras ? (
            <div className="text-center py-8">
              <p className="text-[#64748B]">{t('cameras.loadingCameras', 'Loading cameras...')}</p>
            </div>
          ) : cameras.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#64748B]">{t('cameras.noCamerasConfigured', 'No cameras configured yet. Add a camera to get started.')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cameras.map((camera: any) => (
                <div 
                  key={camera.id} 
                  className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg overflow-hidden cursor-pointer hover:border-[#0A5ED7] transition-colors"
                  onClick={() => setSelectedCamera(camera.id)}
                  data-testid={`camera-${camera.id}`}
                >
                  <div className="bg-[#0E1117] aspect-video flex items-center justify-center relative">
                    {camera.isActive ? (
                      <>
                        <Play className="h-16 w-16 text-white opacity-50" />
                        <div className="absolute top-2 right-2">
                          <Badge variant="destructive" className="gap-1">
                            <Circle className="h-2 w-2 fill-current" />
                            {t('cameras.live', 'LIVE')}
                          </Badge>
                        </div>
                      </>
                    ) : (
                      <p className="text-white">{t('cameras.cameraOffline', 'Camera Offline')}</p>
                    )}
                  </div>
                  <div className="p-3 bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{camera.cameraName}</h3>
                        <p className="text-sm text-[#64748B]">{camera.location} • {camera.cameraType}</p>
                      </div>
                      <div className="flex gap-2">
                        {camera.recordingEnabled && <Badge variant="secondary" className="bg-[#F8FAFC] dark:bg-[#232A36] text-[#64748B]">{t('cameras.recording', 'Recording')}</Badge>}
                        {camera.motionDetection && <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">{t('cameras.motion', 'Motion')}</Badge>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('cameras.recentRecordings', 'Recent Recordings')}</CardTitle>
        </CardHeader>
        <CardContent>
          {recordings.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#64748B]">
                {selectedCamera ? t('cameras.noRecordingsForCamera', 'No recordings found for this camera.') : t('cameras.selectCameraToView', 'Select a camera to view recordings.')}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recordings.map((recording: any) => (
                <div key={recording.id} className="flex items-center justify-between p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg" data-testid={`recording-${recording.id}`}>
                  <div className="flex-1">
                    <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                      {recording.vehiclePlate || t('cameras.recording', 'Recording')}
                    </h3>
                    <p className="text-sm text-[#64748B]">
                      {recording.recordingStart ? new Date(recording.recordingStart).toLocaleString() : ""} - 
                      {recording.recordingEnd ? new Date(recording.recordingEnd).toLocaleTimeString() : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-[#F8FAFC] dark:bg-[#232A36] text-[#0B1F3B] dark:text-white">{recording.eventType}</Badge>
                    <p className="text-sm text-[#64748B] mt-1">
                      {recording.fileSize ? `${(recording.fileSize / 1000).toFixed(1)} MB` : t('drone.na', 'N/A')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
