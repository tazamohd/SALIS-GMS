import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, PhoneOff, Users, Clock, TrendingUp, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useCallCenterWebSocket } from "@/hooks/useCallCenterWebSocket";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TabsPageLayout, TabConfig } from "@/components/layouts";

interface CallQueue {
  id: string;
  name: string;
  description: string | null;
  maxWaitTime: number | null;
  isActive: boolean;
  garageId: string;
}

interface CallSession {
  id: string;
  garageId: string;
  queueId: string | null;
  customerId: string | null;
  vehicleId: string | null;
  direction: string;
  status: string;
  phoneNumber: string;
  assignedAgentId: string | null;
  startedAt: Date | null;
  endedAt: Date | null;
  duration: number | null;
  twilioCallSid: string | null;
  dispositionCodeId: string | null;
}

interface DispositionCode {
  id: string;
  code: string;
  label: string;
  category: string | null;
  isActive: boolean;
}

export default function CallCenter() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedQueue, setSelectedQueue] = useState<string | null>(null);
  const [newQueueOpen, setNewQueueOpen] = useState(false);
  const [newSessionOpen, setNewSessionOpen] = useState(false);
  
  const { data: currentUser } = useQuery<any>({
    queryKey: ["/api/user"],
  });
  
  useCallCenterWebSocket(currentUser?.id || null, currentUser?.garageId || null);

  const { data: queues, isLoading: queuesLoading } = useQuery<CallQueue[]>({
    queryKey: ["/api/call-center/queues"],
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery<CallSession[]>({
    queryKey: ["/api/call-center/sessions"],
    refetchInterval: 5000,
  });

  const { data: dispositionCodes } = useQuery<DispositionCode[]>({
    queryKey: ["/api/call-center/disposition-codes"],
  });

  const activeSessions = sessions?.filter(s => s.status === 'active' || s.status === 'ringing') || [];
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = sessions?.filter(s => {
    if (s.status !== 'completed' || !s.endedAt) return false;
    const endDate = new Date(s.endedAt);
    endDate.setHours(0, 0, 0, 0);
    return endDate.getTime() === today.getTime();
  }) || [];
  
  const completedSessions = sessions?.filter(s => s.status === 'completed') || [];

  const createQueueMutation = useMutation({
    mutationFn: async (data: { name: string; description: string; maxWaitTime: number }) => {
      return await apiRequest("POST", "/api/call-center/queues", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/call-center/queues"] });
      toast({ title: t('callCenter.queueCreated', 'Queue created successfully') });
      setNewQueueOpen(false);
    },
    onError: () => {
      toast({ title: t('callCenter.queueCreateFailed', 'Failed to create queue'), variant: "destructive" });
    },
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: { 
      phoneNumber: string; 
      direction: string; 
      queueId?: string;
    }) => {
      return await apiRequest("POST", "/api/call-center/sessions", {
        ...data,
        status: 'ringing',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/call-center/sessions"] });
      toast({ title: t('callCenter.callInitiated', 'Call session initiated') });
      setNewSessionOpen(false);
    },
    onError: () => {
      toast({ title: t('callCenter.callCreateFailed', 'Failed to create call session'), variant: "destructive" });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/call-center/sessions/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/call-center/sessions"] });
      toast({ title: t('callCenter.statusUpdated', 'Call status updated') });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ringing': return 'bg-[#0A5ED7] dark:bg-[#0BB3FF]';
      case 'active': return 'bg-green-500 dark:bg-green-600';
      case 'completed': return 'bg-[#64748B] dark:bg-[#64748B]';
      case 'missed': return 'bg-red-500 dark:bg-red-600';
      case 'abandoned': return 'bg-[#F97316] dark:bg-[#F97316]';
      default: return 'bg-[#64748B] dark:bg-[#64748B]';
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return t('common.notAvailable', 'N/A');
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}${t('callCenter.minutes', 'm')} ${secs}${t('callCenter.seconds', 's')}`;
  };

  if (queuesLoading || sessionsLoading) {
    return (
      <div className="p-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
        <div className="text-center text-[#64748B] dark:text-[#64748B]">{t('callCenter.loading', 'Loading Call Center...')}</div>
      </div>
    );
  }

  const statsCards = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('callCenter.activeCalls', 'Active Calls')}</CardTitle>
          <Phone className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-active-calls">
            {activeSessions.length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('callCenter.totalQueues', 'Total Queues')}</CardTitle>
          <Users className="h-4 w-4 text-[#0A5ED7]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-total-queues">
            {queues?.filter(q => q.isActive).length || 0}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('callCenter.completedToday', 'Completed Today')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-[#0BB3FF]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-completed-calls">
            {completedToday.length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-[#0B1F3B] dark:text-white">{t('callCenter.avgDurationToday', 'Avg Duration Today')}</CardTitle>
          <Clock className="h-4 w-4 text-[#F97316]" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-avg-duration">
            {completedToday.length > 0
              ? formatDuration(
                  Math.floor(
                    completedToday.reduce((acc, s) => acc + (s.duration || 0), 0) / completedToday.length
                  )
                )
              : t('common.notAvailable', 'N/A')}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const tabs: TabConfig[] = [
    {
      id: "live",
      label: t('callCenter.liveCalls', 'Live Calls'),
      icon: PhoneCall,
      content: activeSessions.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="p-12 text-center">
            <PhoneOff className="h-12 w-12 mx-auto mb-4 text-[#64748B]" />
            <p className="text-[#64748B]">{t('callCenter.noActiveCalls', 'No active calls')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activeSessions.map((session) => (
            <Card key={session.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`card-session-${session.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${getStatusColor(session.status)}`}>
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0B1F3B] dark:text-white">{session.phoneNumber}</div>
                      <div className="text-sm text-[#64748B]">
                        {session.direction === 'inbound' ? t('callCenter.incoming', 'Incoming') : t('callCenter.outgoing', 'Outgoing')} • {session.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                      {session.status}
                    </Badge>
                    {session.status === 'ringing' && (
                      <Button
                        size="sm"
                        onClick={() => updateSessionMutation.mutate({ id: session.id, status: 'active' })}
                        className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                        data-testid={`button-answer-${session.id}`}
                      >
                        {t('callCenter.answer', 'Answer')}
                      </Button>
                    )}
                    {session.status === 'active' && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => updateSessionMutation.mutate({ id: session.id, status: 'completed' })}
                        data-testid={`button-end-${session.id}`}
                      >
                        {t('callCenter.endCall', 'End Call')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
    },
    {
      id: "queues",
      label: t('callCenter.queues', 'Queues'),
      icon: Users,
      content: (
        <div className="grid gap-4">
          {queues?.filter(q => q.isActive).map((queue) => (
            <Card key={queue.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`card-queue-${queue.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-[#0B1F3B] dark:text-white">{queue.name}</CardTitle>
                  <Badge variant="outline" className="border-green-500 text-green-500 dark:border-green-400 dark:text-green-400">
                    {t('common.active', 'Active')}
                  </Badge>
                </div>
                {queue.description && (
                  <p className="text-sm text-[#64748B]">{queue.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-[#64748B]">
                    <Clock className="h-4 w-4" />
                    {t('callCenter.maxWait', 'Max Wait')}: {queue.maxWaitTime ? `${queue.maxWaitTime}${t('callCenter.secondsShort', 's')}` : t('callCenter.unlimited', 'Unlimited')}
                  </div>
                  <div className="flex items-center gap-1 text-[#64748B]">
                    <Users className="h-4 w-4" />
                    {t('callCenter.callsInQueue', 'Calls in Queue')}: {sessions?.filter(s => s.queueId === queue.id && s.status === 'ringing').length || 0}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
    },
    {
      id: "history",
      label: t('callCenter.history', 'History'),
      icon: MessageSquare,
      content: (
        <div className="grid gap-4">
          {completedSessions.slice(0, 20).map((session) => (
            <Card key={session.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`card-history-${session.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-[#F8FAFC] dark:bg-[#0E1117]">
                      <MessageSquare className="h-5 w-5 text-[#64748B]" />
                    </div>
                    <div>
                      <div className="font-semibold text-[#0B1F3B] dark:text-white">{session.phoneNumber}</div>
                      <div className="text-sm text-[#64748B]">
                        {session.direction === 'inbound' ? t('callCenter.incoming', 'Incoming') : t('callCenter.outgoing', 'Outgoing')} • 
                        {session.startedAt ? new Date(session.startedAt).toLocaleString() : t('common.notAvailable', 'N/A')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                    <div className="text-sm text-[#64748B] mt-1">
                      {t('callCenter.duration', 'Duration')}: {formatDuration(session.duration)}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ),
    },
  ];

  return (
    <>
      <TabsPageLayout
        title={t('callCenter.title', 'Call Center')}
        description={t('callCenter.description', 'Manage customer interactions and call queues')}
        icon={Phone}
        secondaryActions={[
          {
            label: t('callCenter.newQueue', 'New Queue'),
            icon: Users,
            onClick: () => setNewQueueOpen(true),
            testId: "button-create-queue",
          },
          {
            label: t('callCenter.newCall', 'New Call'),
            icon: PhoneCall,
            onClick: () => setNewSessionOpen(true),
            variant: "outline",
            testId: "button-new-call",
          },
        ]}
        headerContent={statsCards}
        tabs={tabs}
        defaultTab="live"
      />
      
      <Dialog open={newQueueOpen} onOpenChange={setNewQueueOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('callCenter.createQueue', 'Create Call Queue')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createQueueMutation.mutate({
                name: formData.get("name") as string,
                description: formData.get("description") as string,
                maxWaitTime: parseInt(formData.get("maxWaitTime") as string),
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="name" className="text-[#0B1F3B] dark:text-white">{t('callCenter.queueName', 'Queue Name')}</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder={t('callCenter.queueNamePlaceholder', 'e.g., Support Queue')}
                data-testid="input-queue-name"
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')}</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t('callCenter.queueDescriptionPlaceholder', 'Queue description...')}
                data-testid="input-queue-description"
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="maxWaitTime" className="text-[#0B1F3B] dark:text-white">{t('callCenter.maxWaitTimeSeconds', 'Max Wait Time (seconds)')}</Label>
              <Input
                id="maxWaitTime"
                name="maxWaitTime"
                type="number"
                defaultValue="300"
                data-testid="input-max-wait-time"
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-submit-queue">
              {t('callCenter.createQueue', 'Create Queue')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('callCenter.initiateCall', 'Initiate Call')}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              createSessionMutation.mutate({
                phoneNumber: formData.get("phoneNumber") as string,
                direction: formData.get("direction") as string,
                queueId: formData.get("queueId") as string || undefined,
              });
            }}
            className="space-y-4"
          >
            <div>
              <Label htmlFor="phoneNumber" className="text-[#0B1F3B] dark:text-white">{t('callCenter.phoneNumber', 'Phone Number')}</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                required
                placeholder="+1234567890"
                data-testid="input-phone-number"
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
              />
            </div>
            <div>
              <Label htmlFor="direction" className="text-[#0B1F3B] dark:text-white">{t('callCenter.direction', 'Direction')}</Label>
              <Select name="direction" defaultValue="outbound">
                <SelectTrigger data-testid="select-direction" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="outbound">{t('callCenter.outbound', 'Outbound')}</SelectItem>
                  <SelectItem value="inbound">{t('callCenter.inbound', 'Inbound')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="queueId" className="text-[#0B1F3B] dark:text-white">{t('callCenter.queueOptional', 'Queue (Optional)')}</Label>
              <Select name="queueId">
                <SelectTrigger data-testid="select-queue" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
                  <SelectValue placeholder={t('callCenter.selectQueue', 'Select queue...')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  {queues?.filter(q => q.isActive).map(queue => (
                    <SelectItem key={queue.id} value={queue.id}>
                      {queue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-submit-call">
              {t('callCenter.initiateCall', 'Initiate Call')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
