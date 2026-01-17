import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StandardPageLayout } from "@/components/layouts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield, Glasses, Radio, Box, Plane, Video, Binary,
  Brain, Fingerprint, Signal, Cpu, Zap, CheckCircle2, Loader2, Database
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function EmergingTechnologies() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('blockchain');
  const { toast } = useToast();

  const seedMutation = useMutation({
    mutationFn: () => apiRequest('/api/emerging-tech/seed', 'POST', {}),
    onSuccess: (data: any) => {
      toast({
        title: t('emergingTech.sampleDataSeeded', 'Sample Data Seeded!'),
        description: t('emergingTech.seedSuccessDesc', 'Successfully created sample data for all 12 modules.'),
      });
      queryClient.invalidateQueries({ queryKey: ['/api/emerging-tech'] });
    },
    onError: (error) => {
      toast({
        title: t('emergingTech.seedingFailed', 'Seeding Failed'),
        description: t('emergingTech.seedFailedDesc', 'Failed to seed sample data. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const { data: blockchainData, isLoading: loadingBlockchain } = useQuery<any[]>({
    queryKey: ['/api/emerging-tech/blockchain'],
  });
  const blockchainRecords = blockchainData ?? [];

  const { data: arGuidesData } = useQuery<any[]>({ queryKey: ['/api/emerging-tech/ar-guides'] });
  const arGuides = arGuidesData ?? [];

  const { data: iotSensorsData } = useQuery<any[]>({ queryKey: ['/api/emerging-tech/iot-sensors'] });
  const iotSensors = iotSensorsData ?? [];

  const { data: models3DData } = useQuery<any[]>({ queryKey: ['/api/emerging-tech/3d-models'] });
  const models3D = models3DData ?? [];

  const { data: droneInspectionsData } = useQuery<any[]>({ queryKey: ['/api/emerging-tech/drone-inspections'] });
  const droneInspections = droneInspectionsData ?? [];

  const { data: aiVideoAnalysesData } = useQuery<any[]>({ queryKey: ['/api/emerging-tech/ai-video'] });
  const aiVideoAnalyses = aiVideoAnalysesData ?? [];

  const { data: digitalTwinsData } = useQuery<any[]>({ queryKey: ['/api/emerging-tech/digital-twins'] });
  const digitalTwins = digitalTwinsData ?? [];

  const { data: fraudCasesData } = useQuery<any[]>({ queryKey: ['/api/emerging-tech/fraud-cases'] });
  const fraudCases = fraudCasesData ?? [];

  const { data: biometricData } = useQuery<any>({ queryKey: ['/api/emerging-tech/biometric-profile'] });
  const biometricProfile = biometricData;

  const { data: collaborationSessionsData } = useQuery<any[]>({ queryKey: ['/api/emerging-tech/collaboration-sessions'] });
  const collaborationSessions = collaborationSessionsData ?? [];

  const { data: edgeDevicesData } = useQuery<any[]>({ queryKey: ['/api/emerging-tech/edge-devices'] });
  const edgeDevices = edgeDevicesData ?? [];

  const { data: pricingOptimizationsData } = useQuery<any[]>({ queryKey: ['/api/emerging-tech/pricing-optimization'] });
  const pricingOptimizations = pricingOptimizationsData ?? [];

  const isLoading = loadingBlockchain;

  const technologies = [
    {
      id: 'blockchain',
      name: t('emergingTech.blockchainVehicleHistory', 'Blockchain Vehicle History'),
      icon: Shield,
      color: 'text-[#0A5ED7]',
      description: t('emergingTech.blockchainDesc', 'Immutable vehicle service records on blockchain for tamper-proof history verification'),
      features: [
        t('emergingTech.ethereumPolygon', 'Ethereum/Polygon integration'),
        t('emergingTech.smartContractTracking', 'Smart contract tracking'),
        t('emergingTech.transactionVerification', 'Transaction verification'),
        t('emergingTech.ownershipTransfers', 'Ownership transfers')
      ],
      status: 'active',
      count: blockchainRecords.length
    },
    {
      id: 'ar-guides',
      name: t('emergingTech.arRepairGuides', 'AR Repair Guides'),
      icon: Glasses,
      color: 'text-[#0BB3FF]',
      description: t('emergingTech.arDesc', 'Augmented reality step-by-step repair instructions with 3D overlays'),
      features: [
        t('emergingTech.interactiveARModels', 'Interactive AR models'),
        t('emergingTech.realTimeGuidance', 'Real-time guidance'),
        t('emergingTech.skillLevelTracking', 'Skill level tracking'),
        t('emergingTech.safetyWarnings', 'Safety warnings')
      ],
      status: 'active',
      count: arGuides.length
    },
    {
      id: 'iot-sensors',
      name: t('emergingTech.iotSensorIntegration', 'IoT Sensor Integration'),
      icon: Radio,
      color: 'text-green-500',
      description: t('emergingTech.iotDesc', 'Real-time vehicle monitoring with connected IoT sensors and predictive alerts'),
      features: [
        t('emergingTech.obd2Integration', 'OBD2 integration'),
        t('emergingTech.tpmsMonitoring', 'TPMS monitoring'),
        t('emergingTech.liveDashboards', 'Live dashboards'),
        t('emergingTech.automatedAlerts', 'Automated alerts')
      ],
      status: 'active',
      count: iotSensors.length
    },
    {
      id: '3d-parts',
      name: t('emergingTech.3dPartsVisualization', '3D Parts Visualization'),
      icon: Box,
      color: 'text-[#F97316]',
      description: t('emergingTech.3dDesc', 'Interactive 3D models of parts for customer approval and technician training'),
      features: [
        t('emergingTech.360PartViews', '360° part views'),
        t('emergingTech.explosionDiagrams', 'Explosion diagrams'),
        t('emergingTech.customerApproval', 'Customer approval'),
        t('emergingTech.arCompatibility', 'AR compatibility')
      ],
      status: 'active',
      count: models3D.length
    },
    {
      id: 'drone-inspection',
      name: t('emergingTech.droneInspectionServices', 'Drone Inspection Services'),
      icon: Plane,
      color: 'text-[#0A5ED7]',
      description: t('emergingTech.droneDesc', 'Aerial vehicle inspections using drones with AI damage detection'),
      features: [
        t('emergingTech.automatedFlightPaths', 'Automated flight paths'),
        t('emergingTech.aiDamageDetection', 'AI damage detection'),
        t('emergingTech.4kImageCapture', '4K image capture'),
        t('emergingTech.detailedReports', 'Detailed reports')
      ],
      status: 'active',
      count: droneInspections.length
    },
    {
      id: 'ai-video',
      name: t('emergingTech.aiVideoAnalysis', 'AI Video Analysis'),
      icon: Video,
      color: 'text-[#0BB3FF]',
      description: t('emergingTech.aiVideoDesc', 'AI-powered video analysis for damage detection and cost estimation'),
      features: [
        t('emergingTech.gpt5Integration', 'GPT-5 integration'),
        t('emergingTech.automatedEstimates', 'Automated estimates'),
        t('emergingTech.customerConsultations', 'Customer consultations'),
        t('emergingTech.videoWalkarounds', 'Video walkarounds')
      ],
      status: 'active',
      count: aiVideoAnalyses.length
    },
    {
      id: 'digital-twin',
      name: t('emergingTech.digitalTwinTechnology', 'Digital Twin Technology'),
      icon: Binary,
      color: 'text-[#0A5ED7]',
      description: t('emergingTech.digitalTwinDesc', 'Real-time digital replicas of vehicles for predictive maintenance'),
      features: [
        t('emergingTech.liveSynchronization', 'Live synchronization'),
        t('emergingTech.predictiveAnalytics', 'Predictive analytics'),
        t('emergingTech.performanceSimulation', 'Performance simulation'),
        t('emergingTech.failurePrediction', 'Failure prediction')
      ],
      status: 'active',
      count: digitalTwins.length
    },
    {
      id: 'fraud-detection',
      name: t('emergingTech.mlFraudDetection', 'ML Fraud Detection'),
      icon: Brain,
      color: 'text-[#F97316]',
      description: t('emergingTech.fraudDesc', 'Machine learning algorithms to detect fraudulent transactions and claims'),
      features: [
        t('emergingTech.riskScoring', 'Risk scoring'),
        t('emergingTech.patternRecognition', 'Pattern recognition'),
        t('emergingTech.realTimeAlerts', 'Real-time alerts'),
        t('emergingTech.investigationWorkflow', 'Investigation workflow')
      ],
      status: 'active',
      count: fraudCases.length
    },
    {
      id: 'biometric-auth',
      name: t('emergingTech.biometricAuthentication', 'Biometric Authentication'),
      icon: Fingerprint,
      color: 'text-[#0BB3FF]',
      description: t('emergingTech.biometricDesc', 'Multi-factor biometric authentication with fingerprint and face recognition'),
      features: [
        t('emergingTech.fingerprintEnrollment', 'Fingerprint enrollment'),
        t('emergingTech.faceRecognition', 'Face recognition'),
        t('emergingTech.accessLogs', 'Access logs'),
        t('emergingTech.qrCodeMfa', 'QR code MFA')
      ],
      status: 'active',
      count: biometricProfile ? 1 : 0
    },
    {
      id: '5g-collaboration',
      name: t('emergingTech.5gRemoteCollaboration', '5G Remote Collaboration'),
      icon: Signal,
      color: 'text-green-500',
      description: t('emergingTech.5gDesc', 'Real-time expert collaboration via 5G with AR annotations and video streaming'),
      features: [
        t('emergingTech.hdVideoStreaming', 'HD video streaming'),
        t('emergingTech.arAnnotations', 'AR annotations'),
        t('emergingTech.screenSharing', 'Screen sharing'),
        t('emergingTech.expertNetwork', 'Expert network')
      ],
      status: 'active',
      count: collaborationSessions.length
    },
    {
      id: 'edge-computing',
      name: t('emergingTech.edgeComputingDiagnostics', 'Edge Computing Diagnostics'),
      icon: Cpu,
      color: 'text-[#0A5ED7]',
      description: t('emergingTech.edgeDesc', 'Local edge processing for instant OBD diagnostics with offline capability'),
      features: [
        t('emergingTech.instantAnalysis', 'Instant analysis'),
        t('emergingTech.offlineDiagnostics', 'Offline diagnostics'),
        t('emergingTech.cloudSync', 'Cloud sync'),
        t('emergingTech.edgeDevices', 'Edge devices')
      ],
      status: 'active',
      count: edgeDevices.length
    },
    {
      id: 'quantum-pricing',
      name: t('emergingTech.quantumPricingOptimization', 'Quantum Pricing Optimization'),
      icon: Zap,
      color: 'text-[#0BB3FF]',
      description: t('emergingTech.quantumPricingDesc', 'Quantum-inspired algorithms for dynamic pricing and profit maximization'),
      features: [
        t('emergingTech.dynamicPricing', 'Dynamic pricing'),
        t('emergingTech.competitorAnalysis', 'Competitor analysis'),
        t('emergingTech.demandForecasting', 'Demand forecasting'),
        t('emergingTech.profitOptimization', 'Profit optimization')
      ],
      status: 'active',
      count: pricingOptimizations.length
    }
  ];

  const selectedTech = technologies.find(t => t.id === activeTab);

  if (isLoading) {
    return (
      <div className="p-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-[#0A5ED7] mx-auto mb-4" />
          <p className="text-[#64748B]">{t('emergingTech.loadingTechnologies', 'Loading emerging technologies...')}</p>
        </div>
      </div>
    );
  }

  return (
    <StandardPageLayout
      title={t('emergingTech.title', 'Emerging Technologies')}
      description={t('emergingTech.description', 'Cutting-edge innovations for next-generation automotive service management')}
      icon={Zap}
      actions={[
        {
          label: seedMutation.isPending ? t('emergingTech.seeding', 'Seeding...') : t('emergingTech.seedSampleData', 'Seed Sample Data'),
          icon: Database,
          onClick: () => seedMutation.mutate(),
          variant: "outline",
          testId: "button-seed-data",
        }
      ]}
    >
      <div className="flex items-center gap-3 mb-6">
        <Badge variant="outline" className="text-green-600 border-green-600">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          {t('emergingTech.modulesActive', '12 Modules Active')}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        {technologies.map((tech) => {
          const Icon = tech.icon;
          return (
            <Card
              key={tech.id}
              className={`cursor-pointer transition-all hover:shadow-lg bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] ${
                activeTab === tech.id ? 'ring-2 ring-[#0A5ED7]' : ''
              }`}
              onClick={() => setActiveTab(tech.id)}
              data-testid={`tech-card-${tech.id}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <Icon className={`w-6 h-6 ${tech.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-sm font-semibold truncate text-[#0B1F3B] dark:text-white">
                      {tech.name}
                    </CardTitle>
                    <p className="text-xs text-[#64748B] mt-1">
                      {tech.count} {tech.count === 1 ? t('emergingTech.record', 'record') : t('emergingTech.records', 'records')}
                    </p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {selectedTech && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              {(() => {
                const Icon = selectedTech.icon;
                return (
                  <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <Icon className={`w-8 h-8 ${selectedTech.color}`} />
                  </div>
                );
              })()}
              <div className="flex-1">
                <CardTitle className="text-2xl text-[#0B1F3B] dark:text-white">{selectedTech.name}</CardTitle>
                <CardDescription className="mt-1 text-[#64748B]">
                  {selectedTech.description}
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                {selectedTech.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-[#0B1F3B] dark:text-white">{t('emergingTech.keyFeatures', 'Key Features')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedTech.features.map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`feature-${idx}`}
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-[#0B1F3B] dark:text-white">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button className="flex-1 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-configure">
                {t('emergingTech.configureModule', 'Configure Module')}
              </Button>
              <Button variant="outline" className="flex-1 border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-view-documentation">
                {t('emergingTech.viewDocumentation', 'View Documentation')}
              </Button>
              <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-test-integration">
                {t('emergingTech.testIntegration', 'Test Integration')}
              </Button>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4">
              <h4 className="font-semibold text-[#0A5ED7] mb-2">
                {t('emergingTech.moduleStatusIntegration', 'Module Status & Integration')}
              </h4>
              <p className="text-sm text-[#64748B]">
                {t('emergingTech.moduleIntegrationDesc', 'This module is fully integrated with the SALIS AUTO platform. All database schemas, API routes, and storage interfaces are configured and ready for deployment. Advanced features and customization options are available through the configuration panel.')}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">{t('emergingTech.technologyStackOverview', 'Technology Stack Overview')}</CardTitle>
          <CardDescription className="text-[#64748B]">
            {t('emergingTech.enterpriseGradeInfrastructure', 'Enterprise-grade infrastructure powering all 12 emerging technology modules')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <h4 className="font-semibold text-[#0B1F3B] dark:text-white">{t('emergingTech.blockchainDistributed', 'Blockchain & Distributed')}</h4>
              <ul className="text-sm text-[#64748B] space-y-1">
                <li>• {t('emergingTech.ethereumPolygonNetworks', 'Ethereum & Polygon Networks')}</li>
                <li>• {t('emergingTech.smartContractIntegration', 'Smart Contract Integration')}</li>
                <li>• {t('emergingTech.ipfsStorage', 'IPFS Decentralized Storage')}</li>
                <li>• {t('emergingTech.web3Wallet', 'Web3 Wallet Support')}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-[#0B1F3B] dark:text-white">{t('emergingTech.aiMachineLearning', 'AI & Machine Learning')}</h4>
              <ul className="text-sm text-[#64748B] space-y-1">
                <li>• {t('emergingTech.openaiGpt5', 'OpenAI GPT-5 Integration')}</li>
                <li>• {t('emergingTech.tensorflowModels', 'TensorFlow ML Models')}</li>
                <li>• {t('emergingTech.computerVisionApis', 'Computer Vision APIs')}</li>
                <li>• {t('emergingTech.predictiveAnalyticsEngine', 'Predictive Analytics Engine')}</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-[#0B1F3B] dark:text-white">{t('emergingTech.hardwareIot', 'Hardware & IoT')}</h4>
              <ul className="text-sm text-[#64748B] space-y-1">
                <li>• {t('emergingTech.industrialIotSensors', 'Industrial IoT Sensors')}</li>
                <li>• {t('emergingTech.4kDroneSystems', '4K Drone Systems')}</li>
                <li>• {t('emergingTech.edgeComputingDevices', 'Edge Computing Devices')}</li>
                <li>• {t('emergingTech.biometricScanners', 'Biometric Scanners')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </StandardPageLayout>
  );
}
