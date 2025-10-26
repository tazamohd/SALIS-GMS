import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Play, Pause, Plus } from "lucide-react";

export default function DigitalSignage() {
  const mockDisplays = [
    { id: "1", name: "Waiting Room Main", location: "Waiting Room", displayType: "mixed", isActive: true, contentCount: 5 },
    { id: "2", name: "Service Bay Status", location: "Service Area", displayType: "service_status", isActive: true, contentCount: 3 },
    { id: "3", name: "Entrance Promotions", location: "Entrance", displayType: "promotions", isActive: false, contentCount: 2 },
  ];

  const mockContent = [
    { id: "1", displayName: "Waiting Room Main", contentType: "promotion", title: "20% Off Oil Changes", duration: 10, status: "active" },
    { id: "2", displayName: "Service Bay Status", contentType: "job_status", title: "Current Service Jobs", duration: 15, status: "active" },
    { id: "3", displayName: "Waiting Room Main", contentType: "announcement", title: "Free WiFi Available", duration: 8, status: "active" },
  ];

  const stats = { totalDisplays: 3, activeDisplays: 2, totalContent: 10, activeContent: 8 };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            📺 Digital Signage
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage waiting room displays and content</p>
        </div>
        <Button data-testid="button-add-display">
          <Plus className="h-4 w-4 mr-2" />
          Add Display
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Displays</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalDisplays}</h3>
              </div>
              <Monitor className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.activeDisplays}</h3>
              </div>
              <Play className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Content</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalContent}</h3>
              </div>
              <Monitor className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Content</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.activeContent}</h3>
              </div>
              <Play className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Displays</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDisplays.map((display) => (
              <div key={display.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`display-${display.id}`}>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{display.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {display.location} • {display.contentCount} content items
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{display.displayType.replace("_", " ")}</Badge>
                  <Badge variant={display.isActive ? "default" : "secondary"}>
                    {display.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockContent.map((content) => (
              <div key={content.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{content.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {content.displayName} • {content.duration}s duration
                  </p>
                </div>
                <Badge>{content.contentType.replace("_", " ")}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
