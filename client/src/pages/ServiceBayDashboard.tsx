import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DashboardPage } from "@/components/layouts/DashboardPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Wrench, 
  Car, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle2,
  XCircle,
  Timer,
  Users,
  TrendingUp,
  RefreshCw,
  Zap
} from "lucide-react";
import type { ServiceBay, BayOccupancySession, Vehicle, JobCard } from "@shared/schema";

interface BayWithSession extends ServiceBay {
  currentSession?: BayOccupancySession & {
    vehicle?: Vehicle;
    jobCard?: JobCard;
  };
}

export default function ServiceBayDashboard() {
  const { toast } = useToast();
  const [selectedBayType, setSelectedBayType] = useState<string>("all");
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const { data: bays = [], isLoading: loadingBays, refetch: refetchBays } = useQuery<BayWithSession[]>({
    queryKey: ['/api/service-bays', 'with-sessions'],
    refetchInterval: 30000,
  });

  const { data: statistics } = useQuery<{
    totalBays: number;
    occupiedBays: number;
    availableBays: number;
    maintenanceBays: number;
    avgSessionDuration: number;
    todayCompletedSessions: number;
  }>({
    queryKey: ['/api/service-bays/statistics'],
  });

  const updateBayStatusMutation = useMutation({
    mutationFn: async ({ bayId, status }: { bayId: string; status: string }) => {
      return apiRequest('PATCH', `/api/service-bays/${bayId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bays'] });
      toast({ title: "Bay status updated" });
    },
    onError: (error: any) => {
      toast({ title: "Error updating bay status", description: error.message, variant: "destructive" });
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: async ({ bayId, vehicleId, jobCardId }: { bayId: string; vehicleId?: string; jobCardId?: string }) => {
      return apiRequest('POST', `/api/service-bays/${bayId}/sessions`, { vehicleId, jobCardId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bays'] });
      toast({ title: "Session started" });
    },
    onError: (error: any) => {
      toast({ title: "Error starting session", description: error.message, variant: "destructive" });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest('PATCH', `/api/service-bays/sessions/${sessionId}/end`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bays'] });
      toast({ title: "Session ended" });
    },
    onError: (error: any) => {
      toast({ title: "Error ending session", description: error.message, variant: "destructive" });
    },
  });

  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws/chat`;
    
    const websocket = new WebSocket(wsUrl);
    
    websocket.onopen = () => {
      setIsConnected(true);
      websocket.send(JSON.stringify({ type: 'auth' }));
      websocket.send(JSON.stringify({ type: 'subscribe', data: { channel: 'service-bays' } }));
    };
    
    websocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'bay-update' || message.type === 'session-update') {
          refetchBays();
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    websocket.onclose = () => {
      setIsConnected(false);
    };
    
    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
    
    setWs(websocket);
    
    return () => {
      websocket.close();
    };
  }, [refetchBays]);

  const filteredBays = bays.filter(bay => {
    if (selectedBayType === "all") return true;
    return bay.bayType === selectedBayType;
  });

  const occupancyRate = statistics ? Math.round((statistics.occupiedBays / statistics.totalBays) * 100) || 0 : 0;

  const getBayStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'occupied': return 'bg-blue-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'reserved': return 'bg-purple-500';
      case 'cleaning': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getBayStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle2 className="w-4 h-4" />;
      case 'occupied': return <Car className="w-4 h-4" />;
      case 'maintenance': return <Wrench className="w-4 h-4" />;
      case 'reserved': return <Clock className="w-4 h-4" />;
      case 'cleaning': return <RefreshCw className="w-4 h-4" />;
      default: return <XCircle className="w-4 h-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (!minutes) return '0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getSessionDuration = (startTime: string | Date) => {
    const start = new Date(startTime);
    const now = new Date();
    const diffMs = now.getTime() - start.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return formatDuration(diffMins);
  };

  const metrics = [
    {
      label: "Total Bays",
      value: statistics?.totalBays || 0,
      icon: Wrench,
      color: "text-blue-500",
    },
    {
      label: "Occupied",
      value: statistics?.occupiedBays || 0,
      icon: Car,
      color: "text-green-500",
    },
    {
      label: "Available",
      value: statistics?.availableBays || 0,
      icon: CheckCircle2,
      color: "text-emerald-500",
    },
    {
      label: "Today's Sessions",
      value: statistics?.todayCompletedSessions || 0,
      icon: TrendingUp,
      color: "text-purple-500",
    },
  ];

  const bayTypes = [
    { value: "all", label: "All Types" },
    { value: "general", label: "General Service" },
    { value: "diagnostic", label: "Diagnostic" },
    { value: "alignment", label: "Alignment" },
    { value: "paint", label: "Paint Booth" },
    { value: "wash", label: "Wash Bay" },
    { value: "quick", label: "Quick Service" },
  ];

  return (
    <DashboardPage
      title="Service Bay Dashboard"
      description="Real-time monitoring of all service bays and their occupancy status"
      icon={Wrench}
      metrics={metrics}
    >
      <div className="space-y-6" data-testid="service-bay-dashboard">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Select value={selectedBayType} onValueChange={setSelectedBayType}>
              <SelectTrigger className="w-48" data-testid="select-bay-type">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {bayTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge variant={isConnected ? "default" : "destructive"} className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {isConnected ? "Live" : "Disconnected"}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refetchBays()}
            disabled={loadingBays}
            data-testid="button-refresh-bays"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loadingBays ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Occupancy Overview
            </CardTitle>
            <CardDescription>Current workshop capacity utilization</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Occupancy</span>
                <span className="text-sm text-muted-foreground">{occupancyRate}%</span>
              </div>
              <Progress value={occupancyRate} className="h-3" />
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-green-500 mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Available</span>
                  </div>
                  <span className="text-2xl font-bold">{statistics?.availableBays || 0}</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-blue-500 mb-1">
                    <Car className="w-4 h-4" />
                    <span className="text-sm font-medium">Occupied</span>
                  </div>
                  <span className="text-2xl font-bold">{statistics?.occupiedBays || 0}</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-yellow-500 mb-1">
                    <Wrench className="w-4 h-4" />
                    <span className="text-sm font-medium">Maintenance</span>
                  </div>
                  <span className="text-2xl font-bold">{statistics?.maintenanceBays || 0}</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-purple-500 mb-1">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-medium">Avg. Time</span>
                  </div>
                  <span className="text-2xl font-bold">{formatDuration(statistics?.avgSessionDuration || 0)}</span>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-indigo-500 mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Today</span>
                  </div>
                  <span className="text-2xl font-bold">{statistics?.todayCompletedSessions || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Service Bays ({filteredBays.length})
            </CardTitle>
            <CardDescription>Click on a bay for quick actions</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingBays ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredBays.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No service bays found</p>
                <p className="text-sm text-muted-foreground mt-1">Configure bays in system settings</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredBays.map((bay) => (
                  <div
                    key={bay.id}
                    className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer ${
                      bay.status === 'occupied' ? 'border-blue-500 bg-blue-500/10' :
                      bay.status === 'available' ? 'border-green-500 bg-green-500/10' :
                      bay.status === 'maintenance' ? 'border-yellow-500 bg-yellow-500/10' :
                      'border-gray-500 bg-gray-500/10'
                    }`}
                    data-testid={`bay-card-${bay.id}`}
                  >
                    <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getBayStatusColor(bay.status || 'unknown')} ${bay.status === 'occupied' ? 'animate-pulse' : ''}`} />
                    
                    <div className="text-center mb-2">
                      <h3 className="font-bold text-lg">{bay.bayNumber}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{bay.bayType}</p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {getBayStatusIcon(bay.status || 'unknown')}
                      <span className="text-sm capitalize">{bay.status}</span>
                    </div>
                    
                    {bay.currentSession && (
                      <div className="text-xs text-center space-y-1 border-t pt-2 mt-2">
                        {bay.currentSession.vehicle && (
                          <p className="font-medium truncate" title={bay.currentSession.vehicle.licensePlate || ''}>
                            {bay.currentSession.vehicle.licensePlate}
                          </p>
                        )}
                        <p className="text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3" />
                          {getSessionDuration(bay.currentSession.startTime!)}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            endSessionMutation.mutate(bay.currentSession!.id);
                          }}
                          disabled={endSessionMutation.isPending}
                          data-testid={`button-end-session-${bay.id}`}
                        >
                          End Session
                        </Button>
                      </div>
                    )}
                    
                    {bay.status === 'available' && !bay.currentSession && (
                      <div className="text-center mt-2">
                        <Button
                          size="sm"
                          variant="default"
                          className="w-full h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            startSessionMutation.mutate({ bayId: bay.id });
                          }}
                          disabled={startSessionMutation.isPending}
                          data-testid={`button-start-session-${bay.id}`}
                        >
                          Start Session
                        </Button>
                      </div>
                    )}
                    
                    {bay.status === 'maintenance' && (
                      <div className="text-center mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateBayStatusMutation.mutate({ bayId: bay.id, status: 'available' });
                          }}
                          disabled={updateBayStatusMutation.isPending}
                          data-testid={`button-complete-maintenance-${bay.id}`}
                        >
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardPage>
  );
}
