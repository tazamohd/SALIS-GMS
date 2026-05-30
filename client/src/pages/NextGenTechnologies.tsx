import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain, Eye, MessageSquare, Package, MonitorPlay, Glasses, Network, Bot, Plane, FileCode, Leaf, Zap, Recycle, Satellite, Shield } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { StandardPageLayout } from "@/components/layouts";

export default function NextGenTechnologies() {
  const { t } = useTranslation();
  const { toast } = useToast();

  const { data: neuralDiagnostics, isLoading: loadingNeural } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/neural-diagnostics"],
  });

  const { data: neuralTrainingSessions, isLoading: loadingTraining } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/neural-training-sessions"],
  });

  const { data: visionQualityChecks, isLoading: loadingVision } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/vision-quality-checks"],
  });

  const { data: visionDefects, isLoading: loadingDefects } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/vision-defects"],
  });

  const { data: nlpServiceRequests, isLoading: loadingNLP } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/nlp-service-requests"],
  });

  const { data: nlpTrainingData, isLoading: loadingNLPData } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/nlp-training-data"],
  });

  const { data: rlPartsOptimizations, isLoading: loadingRL } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/rl-parts-optimizations"],
  });

  const { data: rlLearningEpisodes, isLoading: loadingRLEpisodes } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/rl-learning-episodes"],
  });

  const { data: metaverseShowrooms, isLoading: loadingMetaverse } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/metaverse-showrooms"],
  });

  const { data: metaverseVisits, isLoading: loadingVisits } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/metaverse-visits"],
  });

  const { data: holographicGuides, isLoading: loadingHolo } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/holographic-guides"],
  });

  const { data: holographicSessions, isLoading: loadingHoloSessions } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/holographic-sessions"],
  });

  const { data: spatialWorkstations, isLoading: loadingSpatial } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/spatial-workstations"],
  });

  const { data: spatialDiagnosticSessions, isLoading: loadingSpatialSessions } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/spatial-diagnostic-sessions"],
  });

  const { data: autonomousRobots, isLoading: loadingRobots } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/autonomous-robots"],
  });

  const { data: robotTasks, isLoading: loadingTasks } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/robot-tasks"],
  });

  const { data: droneFleets, isLoading: loadingDrones } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/drone-fleets"],
  });

  const { data: droneMissions, isLoading: loadingMissions } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/drone-missions"],
  });

  // /api/nextgen/smart-contracts was consolidated into /api/smart-contracts.
  // The new endpoint returns the array directly; wrap for the legacy `data.data` access pattern.
  const { data: smartContractsRaw, isLoading: loadingContracts } = useQuery<any[]>({
    queryKey: ["/api/smart-contracts"],
  });
  const smartContracts = { data: smartContractsRaw ?? [] };

  const { data: contractEvents, isLoading: loadingEvents } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/contract-events"],
  });

  const { data: carbonCredits, isLoading: loadingCarbon } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/carbon-credits"],
  });

  const { data: carbonEmissions, isLoading: loadingEmissions } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/carbon-emissions"],
  });

  const { data: greenEnergyAssets, isLoading: loadingEnergy } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/green-energy-assets"],
  });

  const { data: evChargingStations, isLoading: loadingEV } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/ev-charging-stations"],
  });

  const { data: recycledParts, isLoading: loadingRecycled } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/recycled-parts"],
  });

  const { data: sustainabilityMetrics, isLoading: loadingSustainability } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/sustainability-metrics"],
  });

  const { data: satelliteConnections, isLoading: loadingSatellite } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/satellite-connections"],
  });

  const { data: satelliteUsageLogs, isLoading: loadingSatelliteUsage } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/satellite-usage-logs"],
  });

  const { data: quantumEncryptionKeys, isLoading: loadingQuantum } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/quantum-encryption-keys"],
  });

  const { data: quantumSecureMessages, isLoading: loadingQuantumMessages } = useQuery<{ data: any[] }>({
    queryKey: ["/api/nextgen/quantum-secure-messages"],
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/nextgen/seed", "POST", {});
    },
    onSuccess: () => {
      toast({
        title: t('nextGen.sampleDataSeeded', 'Sample Data Seeded'),
        description: t('nextGen.seedSuccessDesc', 'Successfully populated all 15 next-gen technology modules with realistic data'),
      });
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && key.startsWith('/api/nextgen/');
        }
      });
    },
    onError: (error: any) => {
      toast({
        title: t('nextGen.seedingFailed', 'Seeding Failed'),
        description: error.message || t('nextGen.seedFailedDesc', 'Failed to seed sample data'),
        variant: "destructive",
      });
    },
  });

  const modules = [
    {
      name: t('nextGen.neuralNetworkDiagnostics', 'Neural Network Diagnostics'),
      icon: Brain,
      color: "text-[#0A5ED7]",
      data: [
        { label: t('nextGen.diagnostics', 'Diagnostics'), count: neuralDiagnostics?.data?.length || 0, loading: loadingNeural },
        { label: t('nextGen.trainingSessions', 'Training Sessions'), count: neuralTrainingSessions?.data?.length || 0, loading: loadingTraining },
      ],
    },
    {
      name: t('nextGen.computerVisionQC', 'Computer Vision QC'),
      icon: Eye,
      color: "text-[#0BB3FF]",
      data: [
        { label: t('nextGen.qualityChecks', 'Quality Checks'), count: visionQualityChecks?.data?.length || 0, loading: loadingVision },
        { label: t('nextGen.defectsDetected', 'Defects Detected'), count: visionDefects?.data?.length || 0, loading: loadingDefects },
      ],
    },
    {
      name: t('nextGen.nlpServiceWriter', 'NLP Service Writer'),
      icon: MessageSquare,
      color: "text-green-500",
      data: [
        { label: t('nextGen.serviceRequests', 'Service Requests'), count: nlpServiceRequests?.data?.length || 0, loading: loadingNLP },
        { label: t('nextGen.trainingData', 'Training Data'), count: nlpTrainingData?.data?.length || 0, loading: loadingNLPData },
      ],
    },
    {
      name: t('nextGen.rlPartsOptimizer', 'RL Parts Optimizer'),
      icon: Package,
      color: "text-[#F97316]",
      data: [
        { label: t('nextGen.optimizations', 'Optimizations'), count: rlPartsOptimizations?.data?.length || 0, loading: loadingRL },
        { label: t('nextGen.learningEpisodes', 'Learning Episodes'), count: rlLearningEpisodes?.data?.length || 0, loading: loadingRLEpisodes },
      ],
    },
    {
      name: t('nextGen.metaverseShowroom', 'Metaverse Showroom'),
      icon: MonitorPlay,
      color: "text-[#0A5ED7]",
      data: [
        { label: t('nextGen.showrooms', 'Showrooms'), count: metaverseShowrooms?.data?.length || 0, loading: loadingMetaverse },
        { label: t('nextGen.virtualVisits', 'Virtual Visits'), count: metaverseVisits?.data?.length || 0, loading: loadingVisits },
      ],
    },
    {
      name: t('nextGen.holographicGuides', 'Holographic Guides'),
      icon: Glasses,
      color: "text-[#0BB3FF]",
      data: [
        { label: t('nextGen.repairGuides', 'Repair Guides'), count: holographicGuides?.data?.length || 0, loading: loadingHolo },
        { label: t('nextGen.activeSessions', 'Active Sessions'), count: holographicSessions?.data?.length || 0, loading: loadingHoloSessions },
      ],
    },
    {
      name: t('nextGen.spatialComputing', 'Spatial Computing'),
      icon: Network,
      color: "text-[#0A5ED7]",
      data: [
        { label: t('nextGen.workstations', 'Workstations'), count: spatialWorkstations?.data?.length || 0, loading: loadingSpatial },
        { label: t('nextGen.diagnosticSessions', 'Diagnostic Sessions'), count: spatialDiagnosticSessions?.data?.length || 0, loading: loadingSpatialSessions },
      ],
    },
    {
      name: t('nextGen.autonomousRobots', 'Autonomous Robots'),
      icon: Bot,
      color: "text-[#F97316]",
      data: [
        { label: t('nextGen.robots', 'Robots'), count: autonomousRobots?.data?.length || 0, loading: loadingRobots },
        { label: t('nextGen.tasksCompleted', 'Tasks Completed'), count: robotTasks?.data?.length || 0, loading: loadingTasks },
      ],
    },
    {
      name: t('nextGen.droneFleet', 'Drone Fleet'),
      icon: Plane,
      color: "text-[#0BB3FF]",
      data: [
        { label: t('nextGen.drones', 'Drones'), count: droneFleets?.data?.length || 0, loading: loadingDrones },
        { label: t('nextGen.missions', 'Missions'), count: droneMissions?.data?.length || 0, loading: loadingMissions },
      ],
    },
    {
      name: t('nextGen.smartContracts', 'Smart Contracts'),
      icon: FileCode,
      color: "text-[#0A5ED7]",
      data: [
        { label: t('nextGen.contracts', 'Contracts'), count: smartContracts?.data?.length || 0, loading: loadingContracts },
        { label: t('nextGen.events', 'Events'), count: contractEvents?.data?.length || 0, loading: loadingEvents },
      ],
    },
    {
      name: t('nextGen.carbonCredits', 'Carbon Credits'),
      icon: Leaf,
      color: "text-green-500",
      data: [
        { label: t('nextGen.credits', 'Credits'), count: carbonCredits?.data?.length || 0, loading: loadingCarbon },
        { label: t('nextGen.emissionsTracked', 'Emissions Tracked'), count: carbonEmissions?.data?.length || 0, loading: loadingEmissions },
      ],
    },
    {
      name: t('nextGen.greenEnergy', 'Green Energy'),
      icon: Zap,
      color: "text-[#0BB3FF]",
      data: [
        { label: t('nextGen.energyAssets', 'Energy Assets'), count: greenEnergyAssets?.data?.length || 0, loading: loadingEnergy },
        { label: t('nextGen.evChargingStations', 'EV Charging Stations'), count: evChargingStations?.data?.length || 0, loading: loadingEV },
      ],
    },
    {
      name: t('nextGen.circularEconomy', 'Circular Economy'),
      icon: Recycle,
      color: "text-green-500",
      data: [
        { label: t('nextGen.recycledParts', 'Recycled Parts'), count: recycledParts?.data?.length || 0, loading: loadingRecycled },
        { label: t('nextGen.sustainabilityMetrics', 'Sustainability Metrics'), count: sustainabilityMetrics?.data?.length || 0, loading: loadingSustainability },
      ],
    },
    {
      name: t('nextGen.satelliteConnectivity', 'Satellite Connectivity'),
      icon: Satellite,
      color: "text-[#0A5ED7]",
      data: [
        { label: t('nextGen.connections', 'Connections'), count: satelliteConnections?.data?.length || 0, loading: loadingSatellite },
        { label: t('nextGen.usageLogs', 'Usage Logs'), count: satelliteUsageLogs?.data?.length || 0, loading: loadingSatelliteUsage },
      ],
    },
    {
      name: t('nextGen.quantumEncryption', 'Quantum Encryption'),
      icon: Shield,
      color: "text-[#0BB3FF]",
      data: [
        { label: t('nextGen.encryptionKeys', 'Encryption Keys'), count: quantumEncryptionKeys?.data?.length || 0, loading: loadingQuantum },
        { label: t('nextGen.secureMessages', 'Secure Messages'), count: quantumSecureMessages?.data?.length || 0, loading: loadingQuantumMessages },
      ],
    },
  ];

  return (
    <StandardPageLayout
      title={t('nextGen.title', 'Next-Generation Technologies')}
      description={t('nextGen.description', 'Cutting-edge automotive ERP features powered by AI, XR, blockchain, and quantum computing')}
      icon={Brain}
      actions={[
        {
          label: seedMutation.isPending ? t('nextGen.seeding', 'Seeding...') : t('nextGen.seedSampleData', 'Seed Sample Data'),
          onClick: () => seedMutation.mutate(),
        },
      ]}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {modules.map((module) => (
          <Card
            key={module.name}
            className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0A5ED7] transition-all"
            data-testid={`card-module-${module.name.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <module.icon className={`h-5 w-5 ${module.color}`} />
                <span className="text-[#0B1F3B] dark:text-white">{module.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {module.data.map((item) => (
                <div key={item.label} className="flex justify-between items-center">
                  <span className="text-sm text-[#64748B]">
                    {item.label}
                  </span>
                  {item.loading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#64748B]" />
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

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] mt-6">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('nextGen.phase10Title', 'Phase 10: Next-Generation Features')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#64748B]">
          <div className="space-y-2">
            <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{t('nextGen.aiMachineLearning', 'AI & Machine Learning')}</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('nextGen.neuralNetworkDiagnosticsDesc', 'Neural network vehicle diagnostics with failure prediction')}</li>
              <li>{t('nextGen.computerVisionQCDesc', 'Computer vision quality control for defect detection')}</li>
              <li>{t('nextGen.nlpServiceWriterDesc', 'NLP service writer for automated work orders')}</li>
              <li>{t('nextGen.rlInventoryDesc', 'Reinforcement learning for inventory optimization')}</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{t('nextGen.extendedReality', 'Extended Reality')}</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('nextGen.metaverseShowroomDesc', 'Metaverse virtual showroom for customer experiences')}</li>
              <li>{t('nextGen.holographicGuidesDesc', 'Holographic repair instructions for technicians')}</li>
              <li>{t('nextGen.spatialComputingDesc', 'Spatial computing with Apple Vision Pro integration')}</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{t('nextGen.advancedAutomation', 'Advanced Automation')}</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('nextGen.autonomousRobotsDesc', 'Autonomous robots for parts retrieval and basic maintenance')}</li>
              <li>{t('nextGen.droneFleetDesc', 'Drone fleet for large facility inspections')}</li>
              <li>{t('nextGen.smartContractsDesc', 'Smart contracts for automated warranty processing')}</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{t('nextGen.sustainability', 'Sustainability')}</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('nextGen.carbonCreditDesc', 'Carbon credit trading and emissions tracking')}</li>
              <li>{t('nextGen.greenEnergyDesc', 'Green energy management with solar and EV charging')}</li>
              <li>{t('nextGen.circularEconomyDesc', 'Circular economy with parts recycling tracking')}</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{t('nextGen.advancedInfrastructure', 'Advanced Infrastructure')}</h3>
            <ul className="list-disc list-inside space-y-1">
              <li>{t('nextGen.satelliteConnectivityDesc', 'Satellite connectivity for remote operations')}</li>
              <li>{t('nextGen.quantumEncryptionDesc', 'Quantum-encrypted secure communications')}</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
