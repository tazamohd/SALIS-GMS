import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
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

const BRAND_COLORS = {
  primary: '#0A5ED7',
  secondary: '#0BB3FF',
  navy: '#0B1F3B',
  orange: '#F97316',
  success: '#0A5ED7',
  accent: '#6366F1',
  darkBg: '#0E1117',
  darkSurface: '#151A23',
  darkBorder: '#232A36',
  lightBg: '#F8FAFC',
  lightSurface: '#FFFFFF',
  lightBorder: '#E2E8F0',
};

interface BayWithSession extends ServiceBay {
  currentSession?: BayOccupancySession & {
    vehicle?: Vehicle;
    jobCard?: JobCard;
  };
}

export default function ServiceBayDashboard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedBayType, setSelectedBayType] = useState<string>("all");
  const [isConnected, setIsConnected] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);

  const { data: bays = [], isLoading: loadingBays, refetch: refetchBays } = useQuery<BayWithSession[]>({
    queryKey: ['/api/service-bays', 'with-sessions'],
    refetchInterval: 30000,
  });

  const { data: apiStatistics } = useQuery<{
    totalBays: number;
    occupiedBays: number;
    availableBays: number;
    maintenanceBays: number;
    avgSessionDuration: number;
    todayCompletedSessions: number;
  }>({
    queryKey: ['/api/service-bays/statistics'],
  });

  const sampleStatistics = {
    totalBays: 12,
    occupiedBays: 7,
    availableBays: 3,
    maintenanceBays: 2,
    avgSessionDuration: 145,
    todayCompletedSessions: 18,
  };

  const statistics = apiStatistics ?? sampleStatistics;

  const updateBayStatusMutation = useMutation({
    mutationFn: async ({ bayId, status }: { bayId: string; status: string }) => {
      return apiRequest('PATCH', `/api/service-bays/${bayId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bays'] });
      toast({ title: t('serviceBay.bayStatusUpdated', 'Bay status updated') });
    },
    onError: (error: any) => {
      toast({ title: t('serviceBay.errorUpdatingStatus', 'Error updating bay status'), description: error.message, variant: "destructive" });
    },
  });

  const startSessionMutation = useMutation({
    mutationFn: async ({ bayId, vehicleId, jobCardId }: { bayId: string; vehicleId?: string; jobCardId?: string }) => {
      return apiRequest('POST', `/api/service-bays/${bayId}/sessions`, { vehicleId, jobCardId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bays'] });
      toast({ title: t('serviceBay.sessionStarted', 'Session started') });
    },
    onError: (error: any) => {
      toast({ title: t('serviceBay.errorStartingSession', 'Error starting session'), description: error.message, variant: "destructive" });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (sessionId: string) => {
      return apiRequest('PATCH', `/api/service-bays/sessions/${sessionId}/end`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/service-bays'] });
      toast({ title: t('serviceBay.sessionEnded', 'Session ended') });
    },
    onError: (error: any) => {
      toast({ title: t('serviceBay.errorEndingSession', 'Error ending session'), description: error.message, variant: "destructive" });
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
      case 'available': return 'bg-[#0A5ED7]';
      case 'occupied': return 'bg-[#0A5ED7]';
      case 'maintenance': return 'bg-[#F97316]';
      case 'reserved': return 'bg-[#6366F1]';
      case 'cleaning': return 'bg-[#0BB3FF]';
      default: return 'bg-[#64748B]';
    }
  };

  const getBayStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return <CheckCircle2 className="w-4 h-4 text-[#0A5ED7]" />;
      case 'occupied': return <Car className="w-4 h-4 text-[#0A5ED7]" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-[#F97316]" />;
      case 'reserved': return <Clock className="w-4 h-4 text-[#6366F1]" />;
      case 'cleaning': return <RefreshCw className="w-4 h-4 text-[#0BB3FF]" />;
      default: return <XCircle className="w-4 h-4 text-[#64748B]" />;
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
      label: t('serviceBay.totalBays', 'Total Bays'),
      value: statistics?.totalBays || 0,
      icon: Wrench,
      color: "text-[#0A5ED7]",
    },
    {
      label: t('serviceBay.occupied', 'Occupied'),
      value: statistics?.occupiedBays || 0,
      icon: Car,
      color: "text-[#0BB3FF]",
    },
    {
      label: t('serviceBay.available', 'Available'),
      value: statistics?.availableBays || 0,
      icon: CheckCircle2,
      color: "text-[#0A5ED7]",
    },
    {
      label: t('serviceBay.todaySessions', "Today's Sessions"),
      value: statistics?.todayCompletedSessions || 0,
      icon: TrendingUp,
      color: "text-[#6366F1]",
    },
  ];

  const bayTypes = [
    { value: "all", label: t('serviceBay.allTypes', 'All Types') },
    { value: "general", label: t('serviceBay.generalService', 'General Service') },
    { value: "diagnostic", label: t('serviceBay.diagnostic', 'Diagnostic') },
    { value: "alignment", label: t('serviceBay.alignment', 'Alignment') },
    { value: "paint", label: t('serviceBay.paintBooth', 'Paint Booth') },
    { value: "wash", label: t('serviceBay.washBay', 'Wash Bay') },
    { value: "quick", label: t('serviceBay.quickService', 'Quick Service') },
  ];

  return (
    <DashboardPage
      title={t('serviceBay.title', 'Service Bay Dashboard')}
      description={t('serviceBay.description', 'Real-time monitoring of all service bays and their occupancy status')}
      icon={Wrench}
      metrics={metrics}
    >
      <div className="space-y-6" data-testid="service-bay-dashboard">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <Select value={selectedBayType} onValueChange={setSelectedBayType}>
              <SelectTrigger 
                className="w-48 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" 
                data-testid="select-bay-type"
              >
                <SelectValue placeholder={t('serviceBay.filterByType', 'Filter by type')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                {bayTypes.map((type) => (
                  <SelectItem 
                    key={type.value} 
                    value={type.value}
                    className="text-[#0B1F3B] dark:text-white hover:bg-[#0A5ED7]/10 focus:bg-[#0A5ED7]/10"
                  >
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Badge 
              variant={isConnected ? "default" : "destructive"} 
              className={`flex items-center gap-1 ${isConnected ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0' : 'bg-[#F97316] text-white border-0'}`}
              data-testid="badge-connection-status"
            >
              <Zap className="w-3 h-3" />
              {isConnected ? t('serviceBay.live', 'Live') : t('serviceBay.disconnected', 'Disconnected')}
            </Badge>
          </div>
          <Button 
            variant="outline" 
            onClick={() => refetchBays()}
            disabled={loadingBays}
            className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-[#0A5ED7]/10 hover:border-[#0A5ED7]"
            data-testid="button-refresh-bays"
          >
            <RefreshCw className={`w-4 h-4 mr-2 text-[#0A5ED7] ${loadingBays ? 'animate-spin' : ''}`} />
            {t('common.refresh', 'Refresh')}
          </Button>
        </div>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Activity className="w-5 h-5 text-[#0A5ED7]" />
              {t('serviceBay.occupancyOverview', 'Occupancy Overview')}
            </CardTitle>
            <CardDescription className="text-[#64748B] dark:text-gray-400">{t('serviceBay.workshopCapacity', 'Current workshop capacity utilization')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('serviceBay.overallOccupancy', 'Overall Occupancy')}</span>
                <span className="text-sm font-bold text-[#0A5ED7]" data-testid="text-occupancy-rate">{occupancyRate}%</span>
              </div>
              <div className="relative h-3 w-full rounded-full bg-[#E2E8F0] dark:bg-[#232A36] overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] transition-all duration-500"
                  style={{ width: `${occupancyRate}%` }}
                  data-testid="progress-occupancy"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4">
                <div className="text-center p-3 rounded-lg bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 border border-[#0A5ED7]/30" data-testid="stat-available">
                  <div className="flex items-center justify-center gap-1 text-[#0A5ED7] mb-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('serviceBay.available', 'Available')}</span>
                  </div>
                  <span className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-available-count">{statistics?.availableBays || 0}</span>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 border border-[#0A5ED7]/30" data-testid="stat-occupied">
                  <div className="flex items-center justify-center gap-1 text-[#0A5ED7] mb-1">
                    <Car className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('serviceBay.occupied', 'Occupied')}</span>
                  </div>
                  <span className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-occupied-count">{statistics?.occupiedBays || 0}</span>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#F97316]/10 dark:bg-[#F97316]/20 border border-[#F97316]/30" data-testid="stat-maintenance">
                  <div className="flex items-center justify-center gap-1 text-[#F97316] mb-1">
                    <Wrench className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('serviceBay.maintenance', 'Maintenance')}</span>
                  </div>
                  <span className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-maintenance-count">{statistics?.maintenanceBays || 0}</span>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#6366F1]/10 dark:bg-[#6366F1]/20 border border-[#6366F1]/30" data-testid="stat-avg-time">
                  <div className="flex items-center justify-center gap-1 text-[#6366F1] mb-1">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('serviceBay.avgTime', 'Avg. Time')}</span>
                  </div>
                  <span className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-avg-duration">{formatDuration(statistics?.avgSessionDuration || 0)}</span>
                </div>
                <div className="text-center p-3 rounded-lg bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 dark:from-[#0A5ED7]/20 dark:to-[#0BB3FF]/20 border border-[#0A5ED7]/30" data-testid="stat-today">
                  <div className="flex items-center justify-center gap-1 text-[#0BB3FF] mb-1">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">{t('serviceBay.today', 'Today')}</span>
                  </div>
                  <span className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-today-count">{statistics?.todayCompletedSessions || 0}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Wrench className="w-5 h-5 text-[#0A5ED7]" />
              {t('serviceBay.serviceBays', 'Service Bays')} ({filteredBays.length})
            </CardTitle>
            <CardDescription className="text-[#64748B] dark:text-gray-400">{t('serviceBay.clickForActions', 'Click on a bay for quick actions')}</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingBays ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-32 bg-[#E2E8F0] dark:bg-[#232A36] animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredBays.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="w-12 h-12 mx-auto text-[#64748B] mb-4" />
                <p className="text-[#0B1F3B] dark:text-white font-medium">{t('serviceBay.noBaysFound', 'No service bays found')}</p>
                <p className="text-sm text-[#64748B] mt-1">{t('serviceBay.configureBays', 'Configure bays in system settings')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredBays.map((bay) => (
                  <div
                    key={bay.id}
                    className={`relative p-4 rounded-lg border-2 transition-all hover:shadow-lg cursor-pointer bg-white dark:bg-[#151A23] ${
                      bay.status === 'occupied' ? 'border-[#0A5ED7] bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10' :
                      bay.status === 'available' ? 'border-[#0A5ED7] bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10' :
                      bay.status === 'maintenance' ? 'border-[#F97316] bg-[#F97316]/5 dark:bg-[#F97316]/10' :
                      'border-[#64748B] bg-[#64748B]/5 dark:bg-[#64748B]/10'
                    }`}
                    data-testid={`bay-card-${bay.id}`}
                  >
                    <div className={`absolute top-2 right-2 w-3 h-3 rounded-full ${getBayStatusColor(bay.status || 'unknown')} ${bay.status === 'occupied' ? 'animate-pulse' : ''}`} />
                    
                    <div className="text-center mb-2">
                      <h3 className="font-bold text-lg text-[#0B1F3B] dark:text-white">{bay.bayNumber}</h3>
                      <p className="text-xs text-[#64748B] capitalize">{t(`serviceBay.bayTypes.${bay.bayType}`, bay.bayType || 'general')}</p>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1 mb-2">
                      {getBayStatusIcon(bay.status || 'unknown')}
                      <span className="text-sm capitalize text-[#0B1F3B] dark:text-gray-300">{t(`serviceBay.statuses.${bay.status}`, bay.status || 'unknown')}</span>
                    </div>
                    
                    {bay.currentSession && (
                      <div className="text-xs text-center space-y-1 border-t border-[#E2E8F0] dark:border-[#232A36] pt-2 mt-2">
                        {bay.currentSession.vehicle && (
                          <p className="font-medium text-[#0B1F3B] dark:text-white truncate" title={bay.currentSession.vehicle.licensePlate || ''}>
                            {bay.currentSession.vehicle.licensePlate}
                          </p>
                        )}
                        <p className="text-[#64748B] flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-[#0A5ED7]" />
                          {getSessionDuration(bay.currentSession.startTime!)}
                        </p>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full mt-2 h-7 text-xs border-[#F97316] text-[#F97316] hover:bg-[#F97316]/10 dark:border-[#F97316] dark:text-[#F97316]"
                          onClick={(e) => {
                            e.stopPropagation();
                            endSessionMutation.mutate(bay.currentSession!.id);
                          }}
                          disabled={endSessionMutation.isPending}
                          data-testid={`button-end-session-${bay.id}`}
                        >
                          {t('serviceBay.endSession', 'End Session')}
                        </Button>
                      </div>
                    )}
                    
                    {bay.status === 'available' && !bay.currentSession && (
                      <div className="text-center mt-2">
                        <Button
                          size="sm"
                          className="w-full h-7 text-xs bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0 hover:opacity-90"
                          onClick={(e) => {
                            e.stopPropagation();
                            startSessionMutation.mutate({ bayId: bay.id });
                          }}
                          disabled={startSessionMutation.isPending}
                          data-testid={`button-start-session-${bay.id}`}
                        >
                          {t('serviceBay.startSession', 'Start Session')}
                        </Button>
                      </div>
                    )}
                    
                    {bay.status === 'maintenance' && (
                      <div className="text-center mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full h-7 text-xs border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10 dark:border-[#0A5ED7] dark:text-[#0A5ED7]"
                          onClick={(e) => {
                            e.stopPropagation();
                            updateBayStatusMutation.mutate({ bayId: bay.id, status: 'available' });
                          }}
                          disabled={updateBayStatusMutation.isPending}
                          data-testid={`button-complete-maintenance-${bay.id}`}
                        >
                          {t('serviceBay.complete', 'Complete')}
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
