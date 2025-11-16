import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, PhoneCall, PhoneOff, Users, Clock, TrendingUp, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useCallCenterWebSocket } from "@/hooks/useCallCenterWebSocket";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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
      toast({ title: "Queue created successfully" });
      setNewQueueOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create queue", variant: "destructive" });
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
      toast({ title: "Call session initiated" });
      setNewSessionOpen(false);
    },
    onError: () => {
      toast({ title: "Failed to create call session", variant: "destructive" });
    },
  });

  const updateSessionMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/call-center/sessions/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/call-center/sessions"] });
      toast({ title: "Call status updated" });
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
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (queuesLoading || sessionsLoading) {
    return (
      <div className="p-6">
        <div className="text-center text-muted-foreground">Loading Call Center...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-background dark:bg-gray-950">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground dark:text-gray-50">Call Center</h1>
          <p className="text-muted-foreground dark:text-gray-400">Manage customer interactions and call queues</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={newQueueOpen} onOpenChange={setNewQueueOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-create-queue">
                <Users className="h-4 w-4 mr-2" />
                New Queue
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card dark:bg-gray-900">
              <DialogHeader>
                <DialogTitle className="text-foreground dark:text-gray-50">Create Call Queue</DialogTitle>
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
                  <Label htmlFor="name" className="text-foreground dark:text-gray-200">Queue Name</Label>
                  <Input
                    id="name"
                    name="name"
                    required
                    placeholder="e.g., Support Queue"
                    data-testid="input-queue-name"
                    className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="description" className="text-foreground dark:text-gray-200">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Queue description..."
                    data-testid="input-queue-description"
                    className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100"
                  />
                </div>
                <div>
                  <Label htmlFor="maxWaitTime" className="text-foreground dark:text-gray-200">Max Wait Time (seconds)</Label>
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
                  Create Queue
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={newSessionOpen} onOpenChange={setNewSessionOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="button-new-call">
                <PhoneCall className="h-4 w-4 mr-2" />
                New Call
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card dark:bg-gray-900">
              <DialogHeader>
                <DialogTitle className="text-foreground dark:text-gray-50">Initiate Call</DialogTitle>
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
                  <Label htmlFor="phoneNumber" className="text-foreground dark:text-gray-200">Phone Number</Label>
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
                  <Label htmlFor="direction" className="text-foreground dark:text-gray-200">Direction</Label>
                  <Select name="direction" defaultValue="outbound">
                    <SelectTrigger data-testid="select-direction" className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card dark:bg-gray-900">
                      <SelectItem value="outbound">Outbound</SelectItem>
                      <SelectItem value="inbound">Inbound</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="queueId" className="text-foreground dark:text-gray-200">Queue (Optional)</Label>
                  <Select name="queueId">
                    <SelectTrigger data-testid="select-queue" className="bg-background dark:bg-gray-800 text-foreground dark:text-gray-100">
                      <SelectValue placeholder="Select queue..." />
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
                  Initiate Call
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card dark:bg-gray-900 border-border dark:border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-foreground dark:text-gray-100">Active Calls</CardTitle>
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
            <CardTitle className="text-sm font-medium text-foreground dark:text-gray-100">Total Queues</CardTitle>
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
            <CardTitle className="text-sm font-medium text-foreground dark:text-gray-100">Completed Today</CardTitle>
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
            <CardTitle className="text-sm font-medium text-foreground dark:text-gray-100">Avg Duration Today</CardTitle>
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
                : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="live" className="space-y-4">
        <TabsList className="bg-muted dark:bg-gray-800">
          <TabsTrigger value="live" data-testid="tab-live-calls">Live Calls</TabsTrigger>
          <TabsTrigger value="queues" data-testid="tab-queues">Queues</TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          {activeSessions.length === 0 ? (
            <Card className="bg-card dark:bg-gray-900 border-border dark:border-gray-800">
              <CardContent className="p-12 text-center">
                <PhoneOff className="h-12 w-12 mx-auto mb-4 text-muted-foreground dark:text-gray-500" />
                <p className="text-muted-foreground dark:text-gray-400">No active calls</p>
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
                            {session.direction === 'inbound' ? 'Incoming' : 'Outgoing'} • {session.status}
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
                            Answer
                          </Button>
                        )}
                        {session.status === 'active' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateSessionMutation.mutate({ id: session.id, status: 'completed' })}
                            data-testid={`button-end-${session.id}`}
                          >
                            End Call
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="queues" className="space-y-4">
          <div className="grid gap-4">
            {queues?.filter(q => q.isActive).map((queue) => (
              <Card key={queue.id} className="bg-card dark:bg-gray-900 border-border dark:border-gray-800" data-testid={`card-queue-${queue.id}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground dark:text-gray-50">{queue.name}</CardTitle>
                    <Badge variant="outline" className="border-green-500 text-green-500 dark:border-green-600 dark:text-green-400">
                      Active
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
                      Max Wait: {queue.maxWaitTime ? `${queue.maxWaitTime}s` : 'Unlimited'}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground dark:text-gray-400">
                      <Users className="h-4 w-4" />
                      Calls in Queue: {sessions?.filter(s => s.queueId === queue.id && s.status === 'ringing').length || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
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
                          {session.direction === 'inbound' ? 'Incoming' : 'Outgoing'} • 
                          {session.startedAt ? new Date(session.startedAt).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(session.status)}>
                        {session.status}
                      </Badge>
                      <div className="text-sm text-muted-foreground dark:text-gray-400 mt-1">
                        Duration: {formatDuration(session.duration)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
