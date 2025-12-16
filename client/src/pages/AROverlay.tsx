import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  ScanLine, 
  Play, 
  Pause, 
  Eye,
  EyeOff,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  WifiOff,
  Camera,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Info,
  Settings,
  Download,
  Upload,
  Glasses,
  Cpu,
  Zap
} from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";

interface ARDevice {
  id: string;
  deviceName: string;
  deviceType: "phone" | "tablet" | "glasses" | "headset";
  technicianName: string;
  status: "connected" | "disconnected" | "pairing";
  batteryLevel: number;
  lastSeen: string;
}

interface ARInstruction {
  id: string;
  title: string;
  description: string;
  stepCount: number;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: number;
  category: string;
  usageCount: number;
  rating: number;
}

interface ARSession {
  id: string;
  technicianName: string;
  instructionTitle: string;
  vehicleInfo: string;
  startTime: string;
  duration: number;
  completionRate: number;
  status: "active" | "paused" | "completed";
}

export default function AROverlay() {
  const { toast } = useToast();
  const [showLivePreview, setShowLivePreview] = useState(false);

  const devices: ARDevice[] = [
    { id: "1", deviceName: "Workshop Tablet 1", deviceType: "tablet", technicianName: "Ahmed Al-Rashid", status: "connected", batteryLevel: 85, lastSeen: "2 min ago" },
    { id: "2", deviceName: "AR Glasses Pro", deviceType: "glasses", technicianName: "Mohammed Khalid", status: "connected", batteryLevel: 62, lastSeen: "Just now" },
    { id: "3", deviceName: "Mobile Device 3", deviceType: "phone", technicianName: "Unassigned", status: "disconnected", batteryLevel: 0, lastSeen: "2 hours ago" },
    { id: "4", deviceName: "Headset Unit A", deviceType: "headset", technicianName: "Fatima Hassan", status: "pairing", batteryLevel: 45, lastSeen: "5 min ago" },
  ];

  const instructions: ARInstruction[] = [
    { id: "1", title: "Brake Pad Replacement", description: "Step-by-step guide for replacing brake pads", stepCount: 12, difficulty: "intermediate", estimatedTime: 45, category: "Brakes", usageCount: 156, rating: 4.8 },
    { id: "2", title: "Oil Filter Change", description: "Complete oil and filter change procedure", stepCount: 8, difficulty: "beginner", estimatedTime: 20, category: "Maintenance", usageCount: 289, rating: 4.9 },
    { id: "3", title: "Engine Timing Belt", description: "Timing belt inspection and replacement", stepCount: 24, difficulty: "advanced", estimatedTime: 120, category: "Engine", usageCount: 67, rating: 4.6 },
    { id: "4", title: "AC System Recharge", description: "Air conditioning system diagnosis and recharge", stepCount: 15, difficulty: "intermediate", estimatedTime: 35, category: "AC/Heating", usageCount: 98, rating: 4.7 },
    { id: "5", title: "Wheel Alignment Setup", description: "Wheel alignment measurement and adjustment", stepCount: 18, difficulty: "advanced", estimatedTime: 60, category: "Alignment", usageCount: 124, rating: 4.5 },
  ];

  const activeSessions: ARSession[] = [
    { id: "1", technicianName: "Ahmed Al-Rashid", instructionTitle: "Brake Pad Replacement", vehicleInfo: "Toyota Camry 2022", startTime: "10:30 AM", duration: 25, completionRate: 58, status: "active" },
    { id: "2", technicianName: "Mohammed Khalid", instructionTitle: "Oil Filter Change", vehicleInfo: "Honda Accord 2021", startTime: "11:15 AM", duration: 12, completionRate: 75, status: "active" },
  ];

  const usageData = [
    { day: "Mon", sessions: 12, avgDuration: 28 },
    { day: "Tue", sessions: 15, avgDuration: 32 },
    { day: "Wed", sessions: 18, avgDuration: 25 },
    { day: "Thu", sessions: 14, avgDuration: 30 },
    { day: "Fri", sessions: 20, avgDuration: 27 },
    { day: "Sat", sessions: 8, avgDuration: 35 },
  ];

  const categoryData = [
    { name: "Maintenance", value: 35, color: "#10b981" },
    { name: "Brakes", value: 25, color: "#3b82f6" },
    { name: "Engine", value: 20, color: "#f59e0b" },
    { name: "AC/Heating", value: 12, color: "#8b5cf6" },
    { name: "Other", value: 8, color: "#6b7280" },
  ];

  const getDeviceIcon = (type: string) => {
    switch (type) {
      case "phone": return Smartphone;
      case "tablet": return Tablet;
      case "glasses": return Glasses;
      case "headset": return Glasses;
      default: return Monitor;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "beginner": return "bg-green-500";
      case "intermediate": return "bg-yellow-500";
      case "advanced": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const connectedDevices = devices.filter(d => d.status === "connected").length;
  const totalSessions = usageData.reduce((sum, d) => sum + d.sessions, 0);

  const overviewTab = (
    <div className="space-y-6" data-testid="ar-overview">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card data-testid="card-connected-devices">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Connected Devices</p>
                <p className="text-3xl font-bold" data-testid="text-connected-count">{connectedDevices}/{devices.length}</p>
              </div>
              <Wifi className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-active-sessions">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Sessions</p>
                <p className="text-3xl font-bold" data-testid="text-sessions-count">{activeSessions.length}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-weekly-sessions">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Weekly Sessions</p>
                <p className="text-3xl font-bold" data-testid="text-weekly-count">{totalSessions}</p>
              </div>
              <ScanLine className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card data-testid="card-instructions-count">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Instructions</p>
                <p className="text-3xl font-bold" data-testid="text-instructions-count">{instructions.length}</p>
              </div>
              <Layers className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Active AR Sessions
            </CardTitle>
            <CardDescription>Real-time technician guidance sessions</CardDescription>
          </CardHeader>
          <CardContent>
            {activeSessions.length > 0 ? (
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <div key={session.id} className="p-4 border rounded-lg" data-testid={`session-${session.id}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium">{session.technicianName}</p>
                        <p className="text-sm text-muted-foreground">{session.instructionTitle}</p>
                      </div>
                      <Badge variant={session.status === "active" ? "default" : "secondary"} data-testid={`badge-session-status-${session.id}`}>
                        {session.status === "active" ? <Play className="w-3 h-3 mr-1" /> : <Pause className="w-3 h-3 mr-1" />}
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{session.vehicleInfo}</p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{session.completionRate}%</span>
                      </div>
                      <Progress value={session.completionRate} className="h-2" data-testid={`progress-session-${session.id}`} />
                    </div>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>Started: {session.startTime}</span>
                      <span>Duration: {session.duration} min</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <EyeOff className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active AR sessions</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Usage Analytics
            </CardTitle>
            <CardDescription>Weekly AR session statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sessions" stroke="#3b82f6" name="Sessions" strokeWidth={2} />
                <Line type="monotone" dataKey="avgDuration" stroke="#10b981" name="Avg Duration (min)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              AR Live Preview
            </CardTitle>
            <CardDescription>Preview AR overlay rendering</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Live Preview</span>
            <Switch checked={showLivePreview} onCheckedChange={setShowLivePreview} data-testid="switch-live-preview" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center relative overflow-hidden">
            {showLivePreview ? (
              <>
                <div className="absolute inset-0 bg-[url('/api/placeholder/1280/720')] bg-cover bg-center opacity-50" />
                <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-sm rounded px-3 py-1 text-white text-sm flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded p-3 text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-sm">Step 5/12: Remove caliper bolts</span>
                  </div>
                  <Progress value={42} className="h-1" />
                </div>
                <div className="absolute top-20 left-1/3 border-2 border-green-400 rounded-full w-24 h-24 flex items-center justify-center">
                  <Info className="w-8 h-8 text-green-400" />
                </div>
              </>
            ) : (
              <div className="text-center text-white">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Enable Live Preview</p>
                <p className="text-sm opacity-75">Connect a device to view AR overlay</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const devicesTab = (
    <div className="space-y-6" data-testid="ar-devices">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Paired Devices</h3>
        <Button data-testid="button-pair-device">
          <Wifi className="w-4 h-4 mr-2" />
          Pair New Device
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {devices.map((device) => {
          const DeviceIcon = getDeviceIcon(device.deviceType);
          return (
            <Card key={device.id} data-testid={`device-card-${device.id}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${device.status === "connected" ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-800"}`}>
                      <DeviceIcon className={`w-6 h-6 ${device.status === "connected" ? "text-green-600" : "text-gray-400"}`} />
                    </div>
                    <div>
                      <p className="font-medium">{device.deviceName}</p>
                      <p className="text-sm text-muted-foreground">{device.technicianName}</p>
                    </div>
                  </div>
                  <Badge variant={device.status === "connected" ? "default" : device.status === "pairing" ? "secondary" : "outline"} data-testid={`badge-device-status-${device.id}`}>
                    {device.status === "connected" && <Wifi className="w-3 h-3 mr-1" />}
                    {device.status === "disconnected" && <WifiOff className="w-3 h-3 mr-1" />}
                    {device.status}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Battery: {device.batteryLevel}%</span>
                  <span className="text-muted-foreground">Last seen: {device.lastSeen}</span>
                </div>
                {device.status === "connected" && (
                  <Progress value={device.batteryLevel} className="h-1 mt-2" />
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const instructionsTab = (
    <div className="space-y-6" data-testid="ar-instructions">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Work Instructions Library</h3>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button data-testid="button-create-instruction">
            <Layers className="w-4 h-4 mr-2" />
            Create New
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {instructions.map((instruction) => (
          <Card key={instruction.id} data-testid={`instruction-card-${instruction.id}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{instruction.category}</Badge>
                <Badge className={getDifficultyColor(instruction.difficulty)}>
                  {instruction.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg mt-2">{instruction.title}</CardTitle>
              <CardDescription>{instruction.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-1">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <span>{instruction.stepCount} steps</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>~{instruction.estimatedTime} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4 text-muted-foreground" />
                  <span>{instruction.usageCount} uses</span>
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-yellow-500" />
                  <span>{instruction.rating} rating</span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" className="flex-1" data-testid={`button-preview-instruction-${instruction.id}`}>Preview</Button>
                <Button size="sm" className="flex-1" data-testid={`button-launch-instruction-${instruction.id}`}>Launch</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const analyticsTab = (
    <div className="space-y-6" data-testid="ar-analytics">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Usage by Category</CardTitle>
            <CardDescription>Distribution of AR instruction usage</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>AR system performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Avg. Completion Rate</span>
              <span className="font-bold text-green-600">87%</span>
            </div>
            <Progress value={87} className="h-2" />
            <div className="flex items-center justify-between">
              <span>Time Saved per Task</span>
              <span className="font-bold text-blue-600">-15 min</span>
            </div>
            <Progress value={75} className="h-2" />
            <div className="flex items-center justify-between">
              <span>Error Reduction</span>
              <span className="font-bold text-purple-600">42%</span>
            </div>
            <Progress value={42} className="h-2" />
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: ScanLine, content: overviewTab },
    { id: "devices", label: "Devices", icon: Smartphone, content: devicesTab },
    { id: "instructions", label: "Instructions", icon: Layers, content: instructionsTab },
    { id: "analytics", label: "Analytics", icon: Zap, content: analyticsTab },
  ];

  return (
    <TabsPageLayout
      title="AR Overlay for Mechanics"
      description="Augmented reality work instructions and guidance system"
      icon={ScanLine}
      tabs={tabs}
      defaultTab="overview"
    />
  );
}
