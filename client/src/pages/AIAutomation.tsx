import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain, Clock, Wrench, Package, Calendar, MessageSquare, CheckCircle2, AlertCircle, TrendingUp, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function AIAutomation() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("estimation");

  // Job Estimation State
  const [estimationForm, setEstimationForm] = useState({
    serviceType: "",
    vehicleId: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
  });

  // Maintenance Prediction State
  const [predictionForm, setPredictionForm] = useState({
    vehicleId: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    mileage: "",
  });

  // Parts Recommendation State
  const [partsForm, setPartsForm] = useState({
    serviceType: "",
    vehicleId: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    description: "",
  });

  // Chat State
  const [chatMessage, setChatMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  // Fetch AI Data
  const { data: estimations = [] } = useQuery({
    queryKey: ['/api/ai/job-estimations'],
  });

  const { data: predictions = [] } = useQuery({
    queryKey: ['/api/ai/maintenance-predictions'],
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ['/api/ai/parts-recommendations'],
  });

  const { data: scheduleOpts = [] } = useQuery({
    queryKey: ['/api/ai/schedule-optimizations'],
  });

  const { data: conversations = [] } = useQuery({
    queryKey: ['/api/ai/chat-conversations'],
  });

  const { data: vehicles = [] } = useQuery({
    queryKey: ['/api/vehicles'],
  });

  // Mutations
  const estimateJobMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/ai/estimate-job', 'POST', data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/job-estimations'] });
      if (data?.error) {
        toast({ 
          title: "Estimation completed with warnings", 
          description: data.error,
          variant: "destructive" 
        });
      } else {
        toast({ title: "Job estimation completed", description: "AI has generated time and cost estimates" });
      }
      setEstimationForm({ serviceType: "", vehicleId: "", vehicleMake: "", vehicleModel: "", vehicleYear: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Estimation failed", 
        description: error.message || "Failed to generate AI estimation",
        variant: "destructive" 
      });
    },
  });

  const predictMaintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/ai/predict-maintenance', 'POST', data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/maintenance-predictions'] });
      if (data?.error) {
        toast({ 
          title: "Prediction completed with warnings", 
          description: data.error,
          variant: "destructive" 
        });
      } else {
        toast({ title: "Maintenance prediction created", description: "AI has analyzed the vehicle and made predictions" });
      }
      setPredictionForm({ vehicleId: "", vehicleMake: "", vehicleModel: "", vehicleYear: "", mileage: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Maintenance prediction failed", 
        description: error.message || "Failed to analyze vehicle and predict maintenance issues",
        variant: "destructive" 
      });
    },
  });

  const recommendPartsMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest('/api/ai/recommend-parts', 'POST', data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/parts-recommendations'] });
      if (data?.error) {
        toast({ 
          title: "Recommendation completed with warnings", 
          description: data.error,
          variant: "destructive" 
        });
      } else {
        toast({ title: "Parts recommendation ready", description: "AI has suggested parts for this service" });
      }
      setPartsForm({ serviceType: "", vehicleId: "", vehicleMake: "", vehicleModel: "", vehicleYear: "", description: "" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Parts recommendation failed", 
        description: error.message || "Failed to generate parts recommendations",
        variant: "destructive" 
      });
    },
  });

  const optimizeScheduleMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/ai/optimize-schedule', 'POST', { appointments: [], technicians: [] });
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/schedule-optimizations'] });
      if (data?.error) {
        toast({ 
          title: "Optimization completed with warnings", 
          description: data.error,
          variant: "destructive" 
        });
      } else {
        toast({ title: "Schedule optimized", description: "AI has analyzed your schedule and made optimization suggestions" });
      }
    },
    onError: (error: any) => {
      toast({ 
        title: "Schedule optimization failed", 
        description: error.message || "Failed to optimize schedule",
        variant: "destructive" 
      });
    },
  });

  const chatMutation = useMutation({
    mutationFn: async (data: { message: string; conversationId?: string }) => {
      return await apiRequest('/api/ai/chat', 'POST', data);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/chat-conversations'] });
      if (data?.error) {
        toast({ 
          title: "Chat message completed with warnings", 
          description: data.error,
          variant: "destructive" 
        });
      }
      setChatMessage("");
    },
    onError: (error: any) => {
      toast({ 
        title: "Chat message failed", 
        description: error.message || "Failed to send message to AI chatbot",
        variant: "destructive" 
      });
    },
  });

  const acknowledgePredictionMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest(`/api/ai/maintenance-predictions/${id}/acknowledge`, 'POST', {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai/maintenance-predictions'] });
      toast({ title: "Prediction acknowledged" });
    },
    onError: (error: any) => {
      toast({ 
        title: "Acknowledgement failed", 
        description: error.message || "Failed to acknowledge prediction",
        variant: "destructive" 
      });
    },
  });

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2" data-testid="text-page-title">
            <Brain className="h-8 w-8 text-primary" />
            AI Automation & Insights
          </h1>
          <p className="text-muted-foreground mt-1">Powered by AI to optimize garage operations</p>
        </div>
        <Badge variant="outline" className="text-sm">
          <Sparkles className="h-3 w-3 mr-1" />
          AI Powered
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="estimation" data-testid="tab-estimation">
            <Clock className="h-4 w-4 mr-2" />
            Job Estimation
          </TabsTrigger>
          <TabsTrigger value="maintenance" data-testid="tab-maintenance">
            <Wrench className="h-4 w-4 mr-2" />
            Maintenance Prediction
          </TabsTrigger>
          <TabsTrigger value="parts" data-testid="tab-parts">
            <Package className="h-4 w-4 mr-2" />
            Parts Recommendations
          </TabsTrigger>
          <TabsTrigger value="schedule" data-testid="tab-schedule">
            <Calendar className="h-4 w-4 mr-2" />
            Schedule Optimization
          </TabsTrigger>
          <TabsTrigger value="chat" data-testid="tab-chat">
            <MessageSquare className="h-4 w-4 mr-2" />
            AI Chatbot
          </TabsTrigger>
        </TabsList>

        {/* Job Estimation Tab */}
        <TabsContent value="estimation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Job Time & Cost Estimation</CardTitle>
              <CardDescription>Get AI-powered estimates for job duration and costs based on historical data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-type">Service Type</Label>
                  <Input
                    id="service-type"
                    data-testid="input-service-type"
                    placeholder="e.g., Oil Change, Brake Repair"
                    value={estimationForm.serviceType}
                    onChange={(e) => setEstimationForm({ ...estimationForm, serviceType: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimation-vehicle">Vehicle</Label>
                  <Select value={estimationForm.vehicleId} onValueChange={(value) => {
                    const vehicle = vehicles.find((v: any) => v.id === value);
                    setEstimationForm({
                      ...estimationForm,
                      vehicleId: value,
                      vehicleMake: vehicle?.make || "",
                      vehicleModel: vehicle?.model || "",
                      vehicleYear: vehicle?.year || "",
                    });
                  }}>
                    <SelectTrigger id="estimation-vehicle" data-testid="select-estimation-vehicle">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button
                onClick={() => estimateJobMutation.mutate(estimationForm)}
                disabled={estimateJobMutation.isPending || !estimationForm.serviceType}
                data-testid="button-estimate-job"
              >
                {estimateJobMutation.isPending ? "Estimating..." : "Get AI Estimation"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Estimations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estimations.length === 0 ? (
                  <p className="text-muted-foreground text-sm" data-testid="text-no-estimations">No estimations yet</p>
                ) : (
                  estimations.map((est: any) => (
                    <div key={est.id} className="p-4 border rounded-lg space-y-2" data-testid={`card-estimation-${est.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{est.serviceType}</h4>
                          <p className="text-sm text-muted-foreground">
                            {est.createdAt && format(new Date(est.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge variant={est.confidence && parseFloat(est.confidence) > 0.8 ? "default" : "secondary"}>
                          {est.confidence ? `${(parseFloat(est.confidence) * 100).toFixed(0)}% confident` : "N/A"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Estimated Hours:</span>
                          <span className="ml-2 font-medium">{est.estimatedHours || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Estimated Cost:</span>
                          <span className="ml-2 font-medium">${est.estimatedCost || "N/A"}</span>
                        </div>
                      </div>
                      {est.reasoning && (
                        <p className="text-sm text-muted-foreground mt-2">{est.reasoning}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Prediction Tab */}
        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Predictive Maintenance Analysis</CardTitle>
              <CardDescription>AI analyzes vehicle history to predict potential issues before they occur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prediction-vehicle">Vehicle</Label>
                  <Select value={predictionForm.vehicleId} onValueChange={(value) => {
                    const vehicle = vehicles.find((v: any) => v.id === value);
                    setPredictionForm({
                      ...predictionForm,
                      vehicleId: value,
                      vehicleMake: vehicle?.make || "",
                      vehicleModel: vehicle?.model || "",
                      vehicleYear: vehicle?.year || "",
                    });
                  }}>
                    <SelectTrigger id="prediction-vehicle" data-testid="select-prediction-vehicle">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage">Current Mileage</Label>
                  <Input
                    id="mileage"
                    data-testid="input-mileage"
                    type="number"
                    placeholder="e.g., 50000"
                    value={predictionForm.mileage}
                    onChange={(e) => setPredictionForm({ ...predictionForm, mileage: e.target.value })}
                  />
                </div>
              </div>
              <Button
                onClick={() => predictMaintenanceMutation.mutate(predictionForm)}
                disabled={predictMaintenanceMutation.isPending || !predictionForm.vehicleId}
                data-testid="button-predict-maintenance"
              >
                {predictMaintenanceMutation.isPending ? "Analyzing..." : "Analyze Vehicle"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions.length === 0 ? (
                  <p className="text-muted-foreground text-sm" data-testid="text-no-predictions">No predictions yet</p>
                ) : (
                  predictions.map((pred: any) => (
                    <div key={pred.id} className="p-4 border rounded-lg space-y-2" data-testid={`card-prediction-${pred.id}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-orange-500 mt-0.5" />
                          <div>
                            <h4 className="font-semibold">{pred.predictedIssue}</h4>
                            <p className="text-sm text-muted-foreground">
                              {pred.createdAt && format(new Date(pred.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={pred.status === 'acknowledged' ? "default" : "secondary"}>
                            {pred.status || "pending"}
                          </Badge>
                          {pred.status !== 'acknowledged' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => acknowledgePredictionMutation.mutate(pred.id)}
                              data-testid={`button-acknowledge-${pred.id}`}
                            >
                              <CheckCircle2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {pred.recommendedAction && (
                        <p className="text-sm"><span className="font-medium">Recommended:</span> {pred.recommendedAction}</p>
                      )}
                      {pred.estimatedTimeframe && (
                        <p className="text-sm text-muted-foreground">Timeframe: {pred.estimatedTimeframe}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parts Recommendations Tab */}
        <TabsContent value="parts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Parts Recommendations</CardTitle>
              <CardDescription>Get intelligent parts suggestions based on service type and vehicle</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parts-service-type">Service Type</Label>
                  <Input
                    id="parts-service-type"
                    data-testid="input-parts-service-type"
                    placeholder="e.g., Brake Service"
                    value={partsForm.serviceType}
                    onChange={(e) => setPartsForm({ ...partsForm, serviceType: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parts-vehicle">Vehicle</Label>
                  <Select value={partsForm.vehicleId} onValueChange={(value) => {
                    const vehicle = vehicles.find((v: any) => v.id === value);
                    setPartsForm({
                      ...partsForm,
                      vehicleId: value,
                      vehicleMake: vehicle?.make || "",
                      vehicleModel: vehicle?.model || "",
                      vehicleYear: vehicle?.year || "",
                    });
                  }}>
                    <SelectTrigger id="parts-vehicle" data-testid="select-parts-vehicle">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent>
                      {vehicles.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.id}>
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="parts-description">Additional Details (Optional)</Label>
                <Textarea
                  id="parts-description"
                  data-testid="textarea-parts-description"
                  placeholder="Any specific issues or requirements..."
                  value={partsForm.description}
                  onChange={(e) => setPartsForm({ ...partsForm, description: e.target.value })}
                />
              </div>
              <Button
                onClick={() => recommendPartsMutation.mutate(partsForm)}
                disabled={recommendPartsMutation.isPending || !partsForm.serviceType}
                data-testid="button-recommend-parts"
              >
                {recommendPartsMutation.isPending ? "Analyzing..." : "Get Parts Recommendations"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Parts Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.length === 0 ? (
                  <p className="text-muted-foreground text-sm" data-testid="text-no-recommendations">No recommendations yet</p>
                ) : (
                  recommendations.map((rec: any) => (
                    <div key={rec.id} className="p-4 border rounded-lg space-y-2" data-testid={`card-recommendation-${rec.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">Parts for Job #{rec.jobCardId || "N/A"}</h4>
                          <p className="text-sm text-muted-foreground">
                            {rec.createdAt && format(new Date(rec.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge>{rec.status || "pending"}</Badge>
                      </div>
                      {rec.recommendedParts && (
                        <div className="text-sm space-y-1">
                          <span className="font-medium">Recommended Parts:</span>
                          <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(rec.recommendedParts, null, 2)}
                          </pre>
                        </div>
                      )}
                      {rec.totalEstimatedCost && (
                        <p className="text-sm">
                          <span className="font-medium">Estimated Cost:</span> ${rec.totalEstimatedCost}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Schedule Optimization Tab */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Smart Schedule Optimization</CardTitle>
              <CardDescription>AI analyzes appointments and technician availability to optimize scheduling</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Click to analyze current schedule and get optimization suggestions based on technician skills, appointment urgency, and efficiency.
              </p>
              <Button
                onClick={() => optimizeScheduleMutation.mutate()}
                disabled={optimizeScheduleMutation.isPending}
                data-testid="button-optimize-schedule"
              >
                {optimizeScheduleMutation.isPending ? "Optimizing..." : "Optimize Schedule"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Optimization Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduleOpts.length === 0 ? (
                  <p className="text-muted-foreground text-sm" data-testid="text-no-optimizations">No optimizations yet</p>
                ) : (
                  scheduleOpts.map((opt: any) => (
                    <div key={opt.id} className="p-4 border rounded-lg space-y-2" data-testid={`card-optimization-${opt.id}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          <TrendingUp className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <h4 className="font-semibold">{opt.optimizationType || "Schedule Optimization"}</h4>
                            <p className="text-sm text-muted-foreground">
                              {opt.createdAt && format(new Date(opt.createdAt), 'MMM dd, yyyy')}
                            </p>
                          </div>
                        </div>
                        <Badge variant={opt.status === 'applied' ? "default" : "secondary"}>
                          {opt.status || "pending"}
                        </Badge>
                      </div>
                      {opt.potentialTimeSaved && (
                        <p className="text-sm">
                          <span className="font-medium">Potential Time Saved:</span> {opt.potentialTimeSaved}
                        </p>
                      )}
                      {opt.suggestions && (
                        <div className="text-sm space-y-1">
                          <span className="font-medium">Suggestions:</span>
                          <pre className="bg-muted p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(opt.suggestions, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Chatbot Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Customer Support Chatbot</CardTitle>
              <CardDescription>Intelligent assistant for customer inquiries and support</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chat-message">Message</Label>
                <Textarea
                  id="chat-message"
                  data-testid="textarea-chat-message"
                  placeholder="Type a message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  rows={3}
                />
              </div>
              <Button
                onClick={() => chatMutation.mutate({ message: chatMessage, conversationId: selectedConversation || undefined })}
                disabled={chatMutation.isPending || !chatMessage}
                data-testid="button-send-chat"
              >
                {chatMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chat Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conversations.length === 0 ? (
                  <p className="text-muted-foreground text-sm" data-testid="text-no-conversations">No conversations yet</p>
                ) : (
                  conversations.map((conv: any) => (
                    <div
                      key={conv.id}
                      className={`p-4 border rounded-lg space-y-2 cursor-pointer transition-colors ${
                        selectedConversation === conv.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => setSelectedConversation(conv.id)}
                      data-testid={`card-conversation-${conv.id}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">Conversation #{conv.id.slice(0, 8)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {conv.createdAt && format(new Date(conv.createdAt), 'MMM dd, yyyy HH:mm')}
                          </p>
                        </div>
                        <Badge variant={conv.status === 'active' ? "default" : "secondary"}>
                          {conv.status || "active"}
                        </Badge>
                      </div>
                      {conv.messages && (
                        <div className="text-sm space-y-1">
                          <pre className="bg-muted p-2 rounded text-xs overflow-auto max-h-32">
                            {JSON.stringify(conv.messages, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
