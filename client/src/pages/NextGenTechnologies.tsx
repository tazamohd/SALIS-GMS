import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Eye, MessageSquare, Package, MonitorPlay, Glasses, Network, Bot, Plane, FileCode, Leaf, Zap, Recycle, Satellite, Shield } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function NextGenTechnologies() {
  const { toast } = useToast();

  // Neural Diagnostics
  const { data: neuralDiagnostics, isLoading: loadingNeural } = useQuery({
    queryKey: ["/api/nextgen/neural-diagnostics"],
  });

  const { data: neuralTrainingSessions, isLoading: loadingTraining } = useQuery({
    queryKey: ["/api/nextgen/neural-training-sessions"],
  });

  // Computer Vision
  const { data: visionQualityChecks, isLoading: loadingVision } = useQuery({
    queryKey: ["/api/nextgen/vision-quality-checks"],
  });

  const { data: visionDefects, isLoading: loadingDefects } = useQuery({
    queryKey: ["/api/nextgen/vision-defects"],
  });

  // NLP Service Writer
  const { data: nlpServiceRequests, isLoading: loadingNLP } = useQuery({
    queryKey: ["/api/nextgen/nlp-service-requests"],
  });

  const { data: nlpTrainingData, isLoading: loadingNLPData } = useQuery({
    queryKey: ["/api/nextgen/nlp-training-data"],
  });

  // Reinforcement Learning
  const { data: rlPartsOptimizations, isLoading: loadingRL } = useQuery({
    queryKey: ["/api/nextgen/rl-parts-optimizations"],
  });

  const { data: rlLearningEpisodes, isLoading: loadingRLEpisodes } = useQuery({
    queryKey: ["/api/nextgen/rl-learning-episodes"],
  });

  // Metaverse Showroom
  const { data: metaverseShowrooms, isLoading: loadingMetaverse } = useQuery({
    queryKey: ["/api/nextgen/metaverse-showrooms"],
  });

  const { data: metaverseVisits, isLoading: loadingVisits } = useQuery({
    queryKey: ["/api/nextgen/metaverse-visits"],
  });

  // Holographic Guides
  const { data: holographicGuides, isLoading: loadingHolo } = useQuery({
    queryKey: ["/api/nextgen/holographic-guides"],
  });

  const { data: holographicSessions, isLoading: loadingHoloSessions } = useQuery({
    queryKey: ["/api/nextgen/holographic-sessions"],
  });

  // Spatial Computing
  const { data: spatialWorkstations, isLoading: loadingSpatial } = useQuery({
    queryKey: ["/api/nextgen/spatial-workstations"],
  });

  const { data: spatialDiagnosticSessions, isLoading: loadingSpatialSessions } = useQuery({
    queryKey: ["/api/nextgen/spatial-diagnostic-sessions"],
  });

  // Autonomous Robots
  const { data: autonomousRobots, isLoading: loadingRobots } = useQuery({
    queryKey: ["/api/nextgen/autonomous-robots"],
  });

  const { data: robotTasks, isLoading: loadingTasks } = useQuery({
    queryKey: ["/api/nextgen/robot-tasks"],
  });

  // Drone Fleet
  const { data: droneFleets, isLoading: loadingDrones } = useQuery({
    queryKey: ["/api/nextgen/drone-fleets"],
  });

  const { data: droneMissions, isLoading: loadingMissions } = useQuery({
    queryKey: ["/api/nextgen/drone-missions"],
  });

  // Smart Contracts
  const { data: smartContracts, isLoading: loadingContracts } = useQuery({
    queryKey: ["/api/nextgen/smart-contracts"],
  });

  const { data: contractEvents, isLoading: loadingEvents } = useQuery({
    queryKey: ["/api/nextgen/contract-events"],
  });

  // Carbon Credits
  const { data: carbonCredits, isLoading: loadingCarbon } = useQuery({
    queryKey: ["/api/nextgen/carbon-credits"],
  });

  const { data: carbonEmissions, isLoading: loadingEmissions } = useQuery({
    queryKey: ["/api/nextgen/carbon-emissions"],
  });

  // Green Energy
  const { data: greenEnergyAssets, isLoading: loadingEnergy } = useQuery({
    queryKey: ["/api/nextgen/green-energy-assets"],
  });

  const { data: evChargingStations, isLoading: loadingEV } = useQuery({
    queryKey: ["/api/nextgen/ev-charging-stations"],
  });

  // Circular Economy
  const { data: recycledParts, isLoading: loadingRecycled } = useQuery({
    queryKey: ["/api/nextgen/recycled-parts"],
  });

  const { data: sustainabilityMetrics, isLoading: loadingSustainability } = useQuery({
    queryKey: ["/api/nextgen/sustainability-metrics"],
  });

  // Satellite Connectivity
  const { data: satelliteConnections, isLoading: loadingSatellite } = useQuery({
    queryKey: ["/api/nextgen/satellite-connections"],
  });

  const { data: satelliteUsageLogs, isLoading: loadingSatelliteUsage } = useQuery({
    queryKey: ["/api/nextgen/satellite-usage-logs"],
  });

  // Quantum Encryption
  const { data: quantumEncryptionKeys, isLoading: loadingQuantum } = useQuery({
    queryKey: ["/api/nextgen/quantum-encryption-keys"],
  });

  const { data: quantumSecureMessages, isLoading: loadingQuantumMessages } = useQuery({
    queryKey: ["/api/nextgen/quantum-secure-messages"],
  });

  // Seed data mutation
  const seedMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/nextgen/seed", "POST", {});
    },
    onSuccess: () => {
      toast({
        title: "Sample Data Seeded",
        description: "Successfully populated all 15 next-gen technology modules with realistic data",
      });
      // Invalidate all queries to refetch
      queryClient.invalidateQueries({ queryKey: ["/api/nextgen/"] });
    },
    onError: (error: any) => {
      toast({
        title: "Seeding Failed",
        description: error.message || "Failed to seed sample data",
        variant: "destructive",
      });
    },
  });

  const modules = [
    {
      name: "Neural Network Diagnostics",
      icon: Brain,
      color: "text-purple-500 dark:text-purple-400",
      data: [
        { label: "Diagnostics", count: neuralDiagnostics?.data?.length || 0, loading: loadingNeural },
        { label: "Training Sessions", count: neuralTrainingSessions?.data?.length || 0, loading: loadingTraining },
      ],
    },
    {
      name: "Computer Vision QC",
      icon: Eye,
      color: "text-blue-500 dark:text-blue-400",
      data: [
        { label: "Quality Checks", count: visionQualityChecks?.data?.length || 0, loading: loadingVision },
        { label: "Defects Detected", count: visionDefects?.data?.length || 0, loading: loadingDefects },
      ],
    },
    {
      name: "NLP Service Writer",
      icon: MessageSquare,
      color: "text-green-500 dark:text-green-400",
      data: [
        { label: "Service Requests", count: nlpServiceRequests?.data?.length || 0, loading: loadingNLP },
        { label: "Training Data", count: nlpTrainingData?.data?.length || 0, loading: loadingNLPData },
      ],
    },
    {
      name: "RL Parts Optimizer",
      icon: Package,
      color: "text-orange-500 dark:text-orange-400",
      data: [
        { label: "Optimizations", count: rlPartsOptimizations?.data?.length || 0, loading: loadingRL },
        { label: "Learning Episodes", count: rlLearningEpisodes?.data?.length || 0, loading: loadingRLEpisodes },
      ],
    },
    {
      name: "Metaverse Showroom",
      icon: MonitorPlay,
      color: "text-pink-500 dark:text-pink-400",
      data: [
        { label: "Showrooms", count: metaverseShowrooms?.data?.length || 0, loading: loadingMetaverse },
        { label: "Virtual Visits", count: metaverseVisits?.data?.length || 0, loading: loadingVisits },
      ],
    },
    {
      name: "Holographic Guides",
      icon: Glasses,
      color: "text-cyan-500 dark:text-cyan-400",
      data: [
        { label: "Repair Guides", count: holographicGuides?.data?.length || 0, loading: loadingHolo },
        { label: "Active Sessions", count: holographicSessions?.data?.length || 0, loading: loadingHoloSessions },
      ],
    },
    {
      name: "Spatial Computing",
      icon: Network,
      color: "text-indigo-500 dark:text-indigo-400",
      data: [
        { label: "Workstations", count: spatialWorkstations?.data?.length || 0, loading: loadingSpatial },
        { label: "Diagnostic Sessions", count: spatialDiagnosticSessions?.data?.length || 0, loading: loadingSpatialSessions },
      ],
    },
    {
      name: "Autonomous Robots",
      icon: Bot,
      color: "text-red-500 dark:text-red-400",
      data: [
        { label: "Robots", count: autonomousRobots?.data?.length || 0, loading: loadingRobots },
        { label: "Tasks Completed", count: robotTasks?.data?.length || 0, loading: loadingTasks },
      ],
    },
    {
      name: "Drone Fleet",
      icon: Plane,
      color: "text-sky-500 dark:text-sky-400",
      data: [
        { label: "Drones", count: droneFleets?.data?.length || 0, loading: loadingDrones },
        { label: "Missions", count: droneMissions?.data?.length || 0, loading: loadingMissions },
      ],
    },
    {
      name: "Smart Contracts",
      icon: FileCode,
      color: "text-amber-500 dark:text-amber-400",
      data: [
        { label: "Contracts", count: smartContracts?.data?.length || 0, loading: loadingContracts },
        { label: "Events", count: contractEvents?.data?.length || 0, loading: loadingEvents },
      ],
    },
    {
      name: "Carbon Credits",
      icon: Leaf,
      color: "text-emerald-500 dark:text-emerald-400",
      data: [
        { label: "Credits", count: carbonCredits?.data?.length || 0, loading: loadingCarbon },
        { label: "Emissions Tracked", count: carbonEmissions?.data?.length || 0, loading: loadingEmissions },
      ],
    },
    {
      name: "Green Energy",
      icon: Zap,
      color: "text-yellow-500 dark:text-yellow-400",
      data: [
        { label: "Energy Assets", count: greenEnergyAssets?.data?.length || 0, loading: loadingEnergy },
        { label: "EV Charging Stations", count: evChargingStations?.data?.length || 0, loading: loadingEV },
      ],
    },
    {
      name: "Circular Economy",
      icon: Recycle,
      color: "text-teal-500 dark:text-teal-400",
      data: [
        { label: "Recycled Parts", count: recycledParts?.data?.length || 0, loading: loadingRecycled },
        { label: "Sustainability Metrics", count: sustainabilityMetrics?.data?.length || 0, loading: loadingSustainability },
      ],
    },
    {
      name: "Satellite Connectivity",
      icon: Satellite,
      color: "text-violet-500 dark:text-violet-400",
      data: [
        { label: "Connections", count: satelliteConnections?.data?.length || 0, loading: loadingSatellite },
        { label: "Usage Logs", count: satelliteUsageLogs?.data?.length || 0, loading: loadingSatelliteUsage },
      ],
    },
    {
      name: "Quantum Encryption",
      icon: Shield,
      color: "text-fuchsia-500 dark:text-fuchsia-400",
      data: [
        { label: "Encryption Keys", count: quantumEncryptionKeys?.data?.length || 0, loading: loadingQuantum },
        { label: "Secure Messages", count: quantumSecureMessages?.data?.length || 0, loading: loadingQuantumMessages },
      ],
    },
  ];

  return (
    <div className="p-6 space-y-6 bg-background dark:bg-gray-950">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white">
            Next-Generation Technologies
          </h1>
          <p className="text-muted-foreground dark:text-gray-400 mt-2">
            Cutting-edge automotive ERP features powered by AI, XR, blockchain, and quantum computing
          </p>
        </div>
        <Button
          onClick={() => seedMutation.mutate()}
          disabled={seedMutation.isPending}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          data-testid="button-seed-nextgen"
        >
          {seedMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Seed Sample Data
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card
            key={module.name}
            className="bg-card dark:bg-gray-900 border-border dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-all"
            data-testid={`card-module-${module.name.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <module.icon className={`h-5 w-5 ${module.color}`} />
                <span className="text-foreground dark:text-white">{module.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {module.data.map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground dark:text-gray-400">
                    {item.label}
                  </span>
                  {item.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  ) : (
                    <span className={`text-lg font-bold ${module.color}`} data-testid={`count-${item.label.toLowerCase().replace(/\s+/g, "-")}`}>
                      {item.count}
                    </span>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-card dark:bg-gray-900 border-border dark:border-gray-800">
        <CardHeader>
          <CardTitle className="text-foreground dark:text-white">Phase 10: Next-Generation Features</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground dark:text-gray-400">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground dark:text-white">AI & Machine Learning</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Neural network vehicle diagnostics with failure prediction</li>
              <li>Computer vision quality control for defect detection</li>
              <li>NLP service writer for automated work orders</li>
              <li>Reinforcement learning for inventory optimization</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground dark:text-white">Extended Reality</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Metaverse virtual showroom for customer experiences</li>
              <li>Holographic repair instructions for technicians</li>
              <li>Spatial computing with Apple Vision Pro integration</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground dark:text-white">Advanced Automation</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Autonomous robots for parts retrieval and basic maintenance</li>
              <li>Drone fleet for large facility inspections</li>
              <li>Smart contracts for automated warranty processing</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground dark:text-white">Sustainability</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Carbon credit trading and emissions tracking</li>
              <li>Green energy management with solar and EV charging</li>
              <li>Circular economy with parts recycling tracking</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground dark:text-white">Advanced Infrastructure</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>Satellite connectivity for remote operations</li>
              <li>Quantum-encrypted secure communications</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
