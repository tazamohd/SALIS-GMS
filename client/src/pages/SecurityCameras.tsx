import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Play, Circle, Video } from "lucide-react";

export default function SecurityCameras() {
  const mockCameras = [
    { id: "1", name: "Service Bay 1", location: "Bay 1", type: "PTZ", isActive: true, recordingEnabled: true, motionDetection: true },
    { id: "2", name: "Parking Lot Main", location: "Parking", type: "outdoor", isActive: true, recordingEnabled: true, motionDetection: false },
    { id: "3", name: "Waiting Room", location: "Waiting Area", type: "indoor", isActive: false, recordingEnabled: false, motionDetection: false },
  ];

  const mockRecordings = [
    { id: "1", cameraName: "Service Bay 1", start: "2024-10-26T09:00:00Z", end: "2024-10-26T17:00:00Z", eventType: "motion", fileSize: 450 },
    { id: "2", cameraName: "Parking Lot Main", start: "2024-10-26T08:30:00Z", end: "2024-10-26T16:30:00Z", eventType: "manual", fileSize: 1200 },
  ];

  const stats = { activeCameras: 2, totalRecordings: 156, storageUsed: 45.8, motionEvents: 23 };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            📹 Security Cameras
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and manage security camera system</p>
        </div>
        <Button data-testid="button-add-camera">Add Camera</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Cameras</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.activeCameras}</h3>
              </div>
              <Camera className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recordings</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalRecordings}</h3>
              </div>
              <Video className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Storage (GB)</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.storageUsed}</h3>
              </div>
              <Video className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Motion Events</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.motionEvents}</h3>
              </div>
              <Circle className="h-12 w-12 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Camera Feeds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockCameras.map((camera) => (
              <div key={camera.id} className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden" data-testid={`camera-${camera.id}`}>
                <div className="bg-black aspect-video flex items-center justify-center relative">
                  {camera.isActive ? (
                    <>
                      <Play className="h-16 w-16 text-white opacity-50" />
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive" className="gap-1">
                          <Circle className="h-2 w-2 fill-current" />
                          LIVE
                        </Badge>
                      </div>
                    </>
                  ) : (
                    <p className="text-white">Camera Offline</p>
                  )}
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-900">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{camera.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{camera.location} • {camera.type}</p>
                    </div>
                    <div className="flex gap-2">
                      {camera.recordingEnabled && <Badge variant="secondary">Recording</Badge>}
                      {camera.motionDetection && <Badge>Motion</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Recordings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecordings.map((recording) => (
              <div key={recording.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{recording.cameraName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(recording.start).toLocaleString()} - {new Date(recording.end).toLocaleTimeString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge>{recording.eventType}</Badge>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{recording.fileSize} MB</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
