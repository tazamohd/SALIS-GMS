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
      case 'ringing': return 'bg-blue-500 dark:bg-blue-600';
      case 'active': return 'bg-green-500 dark:bg-green-600';
      case 'completed': return 'bg-gray-500 dark:bg-gray-600';
      case 'missed': return 'bg-red-500 dark:bg-red-600';
      case 'abandoned': return 'bg-yellow-500 dark:bg-yellow-600';
      default: return 'bg-gray-400 dark:bg-gray-500';
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
      <div className="p-6">
        <div className="text-center text-muted-foreground">{t('callCenter.loading', 'Loading Call Center...')}</div>
      </div>
    );
  }

  const statsCards = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-card dark:bg-gray-900 border-border dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-foreground dark:text-gray-100">{t('callCenter.activeCalls', 'Active Calls')}</CardTitle>
          <Phone className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground dark:text-gray-50" data-testid="text-active-calls">
            {activeSessions.length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card dark:bg-gray-900 border-border dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-foreground dark:text-gray-100">{t('callCenter.totalQueues', 'Total Queues')}</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground dark:text-gray-50" data-testid="text-total-queues">
            {queues?.filter(q => q.isActive).length || 0}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card dark:bg-gray-900 border-border dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-foreground dark:text-gray-100">{t('callCenter.completedToday', 'Completed Today')}</CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground dark:text-gray-50" data-testid="text-completed-calls">
            {completedToday.length}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card dark:bg-gray-900 border-border dark:border-gray-800">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-foreground dark:text-gray-100">{t('callCenter.avgDurationToday', 'Avg Duration Today')}</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-foreground dark:text-gray-50" data-testid="text-avg-duration">
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
        <Card className="bg-card dark:bg-gray-900 border-border dark:border-gray-800">
          <CardContent className="p-12 text-center">
            <PhoneOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground dark:text-gray-500" />
            <p className="text-muted-foreground dark:text-gray-400">{t('callCenter.noActiveCalls', 'No active calls')}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {activeSessions.map((session) => (
            <Card key={session.id} className="bg-card dark:bg-gray-900 border-border dark:border-gray-800" data-testid={`card-session-${session.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${getStatusColor(session.status)}`}>
                      <Phone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground dark:text-gray-50">{session.phoneNumber}</div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400">
                        {session.direction === 'inbound' ? t('callCenter.incoming', 'Incoming') : t('callCenter.outgoing', 'Outgoing')} • {session.status}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-border dark:border-gray-700 text-foreground dark:text-gray-200">
                      {session.status}
                    </Badge>
                    {session.status === 'ringing' && (
                      <Button
                        size="sm"
                        onClick={() => updateSessionMutation.mutate({ id: session.id, status: 'active' })}
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
            <Card key={queue.id} className="bg-card dark:bg-gray-900 border-border dark:border-gray-800" data-testid={`card-queue-${queue.id}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground dark:text-gray-50">{queue.name}</CardTitle>
                  <Badge variant="outline" className="border-green-500 text-green-500 dark:border-green-600 dark:text-green-400">
                    {t('common.active', 'Active')}
                  </Badge>
                </div>
                {queue.description && (
                  <p className="text-sm text-muted-foreground dark:text-gray-400">{queue.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1 text-muted-foreground dark:text-gray-400">
                    <Clock className="h-4 w-4" />
                    {t('callCenter.maxWait', 'Max Wait')}: {queue.maxWaitTime ? `${queue.maxWaitTime}${t('callCenter.secondsShort', 's')}` : t('callCenter.unlimited', 'Unlimited')}
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground dark:text-gray-400">
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
            <Card key={session.id} className="bg-card dark:bg-gray-900 border-border dark:border-gray-800" data-testid={`card-history-${session.id}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800">
                      <MessageSquare className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground dark:text-gray-50">{session.phoneNumber}</div>
                      <div className="text-sm text-muted-foreground dark:text-gray-400">
                        {session.direction === 'inbound' ? t('callCenter.incoming', 'Incoming') : t('callCenter.outgoing', 'Outgoing')} • 
                        {session.startedAt ? new Date(session.startedAt).toLocaleString() : t('common.notAvailable', 'N/A')}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(session.status)}>
                      {session.status}
                    </Badge>
                    <div className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
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
        <DialogContent className="bg-card dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-gray-50">{t('callCenter.createQueue', 'Create Call Queue')}</DialogTitle>
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
              <Label htmlFor="name" className="text-foreground dark:text-gray-200">{t('callCenter.queueName', 'Queue Name')}</Label>
              <Input
                id="name"
                name="name"
                required
                placeholder={t('callCenter.queueNamePlaceholder', 'e.g., Support Queue')}
                data-testid="input-queue-name"
                className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="description" className="text-foreground dark:text-gray-200">{t('common.description', 'Description')}</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t('callCenter.queueDescriptionPlaceholder', 'Queue description...')}
                data-testid="input-queue-description"
                className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="maxWaitTime" className="text-foreground dark:text-gray-200">{t('callCenter.maxWaitTimeSeconds', 'Max Wait Time (seconds)')}</Label>
              <Input
                id="maxWaitTime"
                name="maxWaitTime"
                type="number"
                defaultValue="300"
                data-testid="input-max-wait-time"
                className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="button-submit-queue">
              {t('callCenter.createQueue', 'Create Queue')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
        <DialogContent className="bg-card dark:bg-gray-900">
          <DialogHeader>
            <DialogTitle className="text-foreground dark:text-gray-50">{t('callCenter.initiateCall', 'Initiate Call')}</DialogTitle>
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
              <Label htmlFor="phoneNumber" className="text-foreground dark:text-gray-200">{t('callCenter.phoneNumber', 'Phone Number')}</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                required
                placeholder="+1234567890"
                data-testid="input-phone-number"
                className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="direction" className="text-foreground dark:text-gray-200">{t('callCenter.direction', 'Direction')}</Label>
              <Select name="direction" defaultValue="outbound">
                <SelectTrigger data-testid="select-direction" className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card dark:bg-gray-900">
                  <SelectItem value="outbound">{t('callCenter.outbound', 'Outbound')}</SelectItem>
                  <SelectItem value="inbound">{t('callCenter.inbound', 'Inbound')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="queueId" className="text-foreground dark:text-gray-200">{t('callCenter.queueOptional', 'Queue (Optional)')}</Label>
              <Select name="queueId">
                <SelectTrigger data-testid="select-queue" className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">
                  <SelectValue placeholder={t('callCenter.selectQueue', 'Select queue...')} />
                </SelectTrigger>
                <SelectContent className="bg-card dark:bg-gray-900">
                  {queues?.filter(q => q.isActive).map(queue => (
                    <SelectItem key={queue.id} value={queue.id}>
                      {queue.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full" data-testid="button-submit-call">
              {t('callCenter.initiateCall', 'Initiate Call')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
