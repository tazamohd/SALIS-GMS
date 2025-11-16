import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsPageLayout, TabConfig } from "@/components/layouts/TabsPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Brain, Clock, Wrench, Package, Calendar, MessageSquare, CheckCircle2, AlertCircle, Sparkles } from "lucide-react";
import { format } from "date-fns";

export default function AIAutomation() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("estimation");

  const [estimationForm, setEstimationForm] = useState({
    serviceType: "",
    vehicleId: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
  });

  const [predictionForm, setPredictionForm] = useState({
    vehicleId: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    mileage: "",
  });

  const [partsForm, setPartsForm] = useState({
    serviceType: "",
    vehicleId: "",
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    description: "",
  });

  const [chatMessage, setChatMessage] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

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

  const tabs: TabConfig[] = [
    {
      id: "estimation",
      label: "Job Estimation",
      icon: Clock,
      content: (
        <div className="space-y-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">AI Job Time & Cost Estimation</CardTitle>
              <CardDescription className="text-gray-900 dark:text-white/60">Get AI-powered estimates for job duration and costs based on historical data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="service-type" className="text-gray-900 dark:text-white">Service Type</Label>
                  <Input
                    id="service-type"
                    data-testid="input-service-type"
                    placeholder="e.g., Oil Change, Brake Repair"
                    value={estimationForm.serviceType}
                    onChange={(e) => setEstimationForm({ ...estimationForm, serviceType: e.target.value })}
                    className="bg-gray-100 dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white placeholder:text-gray-900 dark:text-white/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="estimation-vehicle" className="text-gray-900 dark:text-white">Vehicle</Label>
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
                    <SelectTrigger id="estimation-vehicle" data-testid="select-estimation-vehicle" className="bg-gray-100 dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                      {vehicles.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.id} className="text-gray-900 dark:text-white">
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

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Recent Estimations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {estimations.length === 0 ? (
                  <p className="text-gray-900 dark:text-white/50 text-sm" data-testid="text-no-estimations">No estimations yet</p>
                ) : (
                  estimations.map((est: any) => (
                    <div key={est.id} className="p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg space-y-2" data-testid={`card-estimation-${est.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{est.serviceType}</h4>
                          <p className="text-sm text-gray-900 dark:text-white/60">
                            {est.createdAt && format(new Date(est.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge variant={est.confidence && parseFloat(est.confidence) > 0.8 ? "default" : "secondary"}>
                          {est.confidence ? `${(parseFloat(est.confidence) * 100).toFixed(0)}% confident` : "N/A"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-900 dark:text-white/60">Estimated Hours:</span>
                          <span className="ml-2 font-medium">{est.estimatedHours || "N/A"}</span>
                        </div>
                        <div>
                          <span className="text-gray-900 dark:text-white/60">Estimated Cost:</span>
                          <span className="ml-2 font-medium">${est.estimatedCost || "N/A"}</span>
                        </div>
                      </div>
                      {est.reasoning && (
                        <p className="text-sm text-gray-900 dark:text-white/60 mt-2">{est.reasoning}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "maintenance",
      label: "Maintenance Prediction",
      icon: Wrench,
      content: (
        <div className="space-y-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Predictive Maintenance Analysis</CardTitle>
              <CardDescription className="text-gray-900 dark:text-white/60">AI analyzes vehicle history to predict potential issues before they occur</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="prediction-vehicle" className="text-gray-900 dark:text-white">Vehicle</Label>
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
                    <SelectTrigger id="prediction-vehicle" data-testid="select-prediction-vehicle" className="bg-gray-100 dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white">
                      <SelectValue placeholder="Select vehicle" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
                      {vehicles.map((vehicle: any) => (
                        <SelectItem key={vehicle.id} value={vehicle.id} className="text-gray-900 dark:text-white">
                          {vehicle.year} {vehicle.make} {vehicle.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mileage" className="text-gray-900 dark:text-white">Current Mileage</Label>
                  <Input
                    id="mileage"
                    data-testid="input-mileage"
                    type="number"
                    placeholder="e.g., 50000"
                    value={predictionForm.mileage}
                    onChange={(e) => setPredictionForm({ ...predictionForm, mileage: e.target.value })}
                    className="bg-gray-100 dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white placeholder:text-gray-900 dark:text-white/50"
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

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Maintenance Predictions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {predictions.length === 0 ? (
                  <p className="text-gray-900 dark:text-white/60 text-sm" data-testid="text-no-predictions">No predictions yet</p>
                ) : (
                  predictions.map((pred: any) => (
                    <div key={pred.id} className="p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg space-y-2" data-testid={`card-prediction-${pred.id}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-5 w-5 text-gray-700 dark:text-gray-300 mt-0.5" />
                          <div>
                            <h4 className="font-semibold">{pred.predictedIssue}</h4>
                            <p className="text-sm text-gray-900 dark:text-white/60">
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
                        <p className="text-sm text-gray-900 dark:text-white/60">Timeframe: {pred.estimatedTimeframe}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "parts",
      label: "Parts Recommendations",
      icon: Package,
      content: (
        <div className="space-y-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">AI Parts Recommendations</CardTitle>
              <CardDescription className="text-gray-900 dark:text-white/60">Get intelligent parts suggestions based on service type and vehicle</CardDescription>
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
                  data-testid="input-parts-description"
                  placeholder="Describe any specific requirements..."
                  value={partsForm.description}
                  onChange={(e) => setPartsForm({ ...partsForm, description: e.target.value })}
                />
              </div>
              <Button
                onClick={() => recommendPartsMutation.mutate(partsForm)}
                disabled={recommendPartsMutation.isPending || !partsForm.serviceType}
                data-testid="button-recommend-parts"
              >
                {recommendPartsMutation.isPending ? "Analyzing..." : "Get Recommendations"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Parts Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recommendations.length === 0 ? (
                  <p className="text-gray-900 dark:text-white/50 text-sm" data-testid="text-no-recommendations">No recommendations yet</p>
                ) : (
                  recommendations.map((rec: any) => (
                    <div key={rec.id} className="p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg space-y-2" data-testid={`card-recommendation-${rec.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{rec.partName}</h4>
                          <p className="text-sm text-gray-900 dark:text-white/60">{rec.serviceType}</p>
                        </div>
                        <Badge>{rec.priority || "standard"}</Badge>
                      </div>
                      {rec.estimatedCost && (
                        <p className="text-sm"><span className="font-medium">Estimated Cost:</span> ${rec.estimatedCost}</p>
                      )}
                      {rec.reasoning && (
                        <p className="text-sm text-gray-900 dark:text-white/60">{rec.reasoning}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "schedule",
      label: "Schedule Optimization",
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">AI Schedule Optimization</CardTitle>
              <CardDescription className="text-gray-900 dark:text-white/60">Let AI analyze and optimize your appointment schedule</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-900 dark:text-white/60">
                The AI will analyze your current appointments and technician availability to suggest optimizations
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

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Optimization Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {scheduleOpts.length === 0 ? (
                  <p className="text-gray-900 dark:text-white/50 text-sm" data-testid="text-no-optimizations">No optimization results yet</p>
                ) : (
                  scheduleOpts.map((opt: any) => (
                    <div key={opt.id} className="p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg space-y-2" data-testid={`card-optimization-${opt.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">{opt.suggestion}</h4>
                          <p className="text-sm text-gray-900 dark:text-white/60">
                            {opt.createdAt && format(new Date(opt.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge variant={opt.implemented ? "default" : "secondary"}>
                          {opt.implemented ? "Implemented" : "Suggested"}
                        </Badge>
                      </div>
                      {opt.reasoning && (
                        <p className="text-sm text-gray-900 dark:text-white/60">{opt.reasoning}</p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    },
    {
      id: "chat",
      label: "AI Chatbot",
      icon: MessageSquare,
      content: (
        <div className="space-y-4">
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">AI Chat Assistant</CardTitle>
              <CardDescription className="text-gray-900 dark:text-white/60">Chat with AI for quick answers and assistance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chat-conversation">Select Conversation</Label>
                <Select value={selectedConversation || ""} onValueChange={setSelectedConversation}>
                  <SelectTrigger id="chat-conversation" data-testid="select-conversation">
                    <SelectValue placeholder="New conversation" />
                  </SelectTrigger>
                  <SelectContent>
                    {conversations.map((conv: any) => (
                      <SelectItem key={conv.id} value={conv.id}>
                        {conv.title || `Conversation ${conv.id.substring(0, 8)}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="chat-message">Message</Label>
                <Textarea
                  id="chat-message"
                  data-testid="input-chat-message"
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
              </div>
              <Button
                onClick={() => chatMutation.mutate({ message: chatMessage, conversationId: selectedConversation || undefined })}
                disabled={chatMutation.isPending || !chatMessage.trim()}
                data-testid="button-send-message"
              >
                {chatMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">Recent Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {conversations.length === 0 ? (
                  <p className="text-gray-900 dark:text-white/50 text-sm" data-testid="text-no-conversations">No conversations yet</p>
                ) : (
                  conversations.map((conv: any) => (
                    <div key={conv.id} className="p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg" data-testid={`card-conversation-${conv.id}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {conv.title || `Conversation ${conv.id.substring(0, 8)}`}
                          </h4>
                          <p className="text-sm text-gray-900 dark:text-white/60">
                            {conv.createdAt && format(new Date(conv.createdAt), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <Badge>{conv.status || "active"}</Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
  ];

  const headerContent = (
    <Badge variant="outline" className="text-sm bg-gray-100 dark:bg-salis-gray-dark border-gray-200 dark:border-salis-gray-dark text-gray-900 dark:text-white">
      <Sparkles className="h-3 w-3 mr-1" />
      AI Powered
    </Badge>
  );

  return (
    <TabsPageLayout
      title="AI Automation & Insights"
      description="Powered by AI to optimize garage operations"
      icon={Brain}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      headerContent={headerContent}
    />
  );
}
