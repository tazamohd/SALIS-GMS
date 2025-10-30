import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Shield, Glasses, Radio, Box, Drone, Video, Binary,
  Brain, Fingerprint, Signal, Cpu, Zap, CheckCircle2
} from 'lucide-react';

export default function EmergingTechnologies() {
  const [activeTab, setActiveTab] = useState('blockchain');

  const technologies = [
    {
      id: 'blockchain',
      name: 'Blockchain Vehicle History',
      icon: Shield,
      color: 'text-blue-500',
      description: 'Immutable vehicle service records on blockchain for tamper-proof history verification',
      features: ['Ethereum/Polygon integration', 'Smart contract tracking', 'Transaction verification', 'Ownership transfers'],
      status: 'active'
    },
    {
      id: 'ar-guides',
      name: 'AR Repair Guides',
      icon: Glasses,
      color: 'text-purple-500',
      description: 'Augmented reality step-by-step repair instructions with 3D overlays',
      features: ['Interactive AR models', 'Real-time guidance', 'Skill level tracking', 'Safety warnings'],
      status: 'active'
    },
    {
      id: 'iot-sensors',
      name: 'IoT Sensor Integration',
      icon: Radio,
      color: 'text-green-500',
      description: 'Real-time vehicle monitoring with connected IoT sensors and predictive alerts',
      features: ['OBD2 integration', 'TPMS monitoring', 'Live dashboards', 'Automated alerts'],
      status: 'active'
    },
    {
      id: '3d-parts',
      name: '3D Parts Visualization',
      icon: Box,
      color: 'text-orange-500',
      description: 'Interactive 3D models of parts for customer approval and technician training',
      features: ['360° part views', 'Explosion diagrams', 'Customer approval', 'AR compatibility'],
      status: 'active'
    },
    {
      id: 'drone-inspection',
      name: 'Drone Inspection Services',
      icon: Drone,
      color: 'text-indigo-500',
      description: 'Aerial vehicle inspections using drones with AI damage detection',
      features: ['Automated flight paths', 'AI damage detection', '4K image capture', 'Detailed reports'],
      status: 'active'
    },
    {
      id: 'ai-video',
      name: 'AI Video Analysis',
      icon: Video,
      color: 'text-pink-500',
      description: 'AI-powered video analysis for damage detection and cost estimation',
      features: ['GPT-5 integration', 'Automated estimates', 'Customer consultations', 'Video walkarounds'],
      status: 'active'
    },
    {
      id: 'digital-twin',
      name: 'Digital Twin Technology',
      icon: Binary,
      color: 'text-cyan-500',
      description: 'Real-time digital replicas of vehicles for predictive maintenance',
      features: ['Live synchronization', 'Predictive analytics', 'Performance simulation', 'Failure prediction'],
      status: 'active'
    },
    {
      id: 'fraud-detection',
      name: 'ML Fraud Detection',
      icon: Brain,
      color: 'text-red-500',
      description: 'Machine learning algorithms to detect fraudulent transactions and claims',
      features: ['Risk scoring', 'Pattern recognition', 'Real-time alerts', 'Investigation workflow'],
      status: 'active'
    },
    {
      id: 'biometric-auth',
      name: 'Biometric Authentication',
      icon: Fingerprint,
      color: 'text-yellow-500',
      description: 'Multi-factor biometric authentication with fingerprint and face recognition',
      features: ['Fingerprint enrollment', 'Face recognition', 'Access logs', 'QR code MFA'],
      status: 'active'
    },
    {
      id: '5g-collaboration',
      name: '5G Remote Collaboration',
      icon: Signal,
      color: 'text-emerald-500',
      description: 'Real-time expert collaboration via 5G with AR annotations and video streaming',
      features: ['HD video streaming', 'AR annotations', 'Screen sharing', 'Expert network'],
      status: 'active'
    },
    {
      id: 'edge-computing',
      name: 'Edge Computing Diagnostics',
      icon: Cpu,
      color: 'text-violet-500',
      description: 'Local edge processing for instant OBD diagnostics with offline capability',
      features: ['Instant analysis', 'Offline diagnostics', 'Cloud sync', 'Edge devices'],
      status: 'active'
    },
    {
      id: 'quantum-pricing',
      name: 'Quantum Pricing Optimization',
      icon: Zap,
      color: 'text-amber-500',
      description: 'Quantum-inspired algorithms for dynamic pricing and profit maximization',
      features: ['Dynamic pricing', 'Competitor analysis', 'Demand forecasting', 'Profit optimization'],
      status: 'active'
    }
  ];

  const selectedTech = technologies.find(t => t.id === activeTab);

  return (
    <div className="p-6 dark:bg-gray-900 min-h-screen" data-testid="page-emerging-technologies">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Emerging Technologies
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Cutting-edge innovations for next-generation automotive service management
            </p>
          </div>
          <Badge variant="outline" className="text-green-600 border-green-600">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            12 Modules Active
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {technologies.map((tech) => {
            const Icon = tech.icon;
            return (
              <Card
                key={tech.id}
                className={`cursor-pointer transition-all hover:shadow-lg dark:bg-gray-800 ${
                  activeTab === tech.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setActiveTab(tech.id)}
                data-testid={`tech-card-${tech.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-700`}>
                      <Icon className={`w-6 h-6 ${tech.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold truncate dark:text-white">
                        {tech.name}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })}
        </div>

        {selectedTech && (
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center gap-4">
                {(() => {
                  const Icon = selectedTech.icon;
                  return (
                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-700">
                      <Icon className={`w-8 h-8 ${selectedTech.color}`} />
                    </div>
                  );
                })()}
                <div className="flex-1">
                  <CardTitle className="text-2xl dark:text-white">{selectedTech.name}</CardTitle>
                  <CardDescription className="mt-1 dark:text-gray-400">
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
                <h3 className="text-lg font-semibold mb-3 dark:text-white">Key Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedTech.features.map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                      data-testid={`feature-${idx}`}
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1" data-testid="button-configure">
                  Configure Module
                </Button>
                <Button variant="outline" className="flex-1" data-testid="button-view-documentation">
                  View Documentation
                </Button>
                <Button variant="outline" data-testid="button-test-integration">
                  Test Integration
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  Module Status & Integration
                </h4>
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  This module is fully integrated with the SALIS AUTO platform. All database schemas, API routes,
                  and storage interfaces are configured and ready for deployment. Advanced features and
                  customization options are available through the configuration panel.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="dark:text-white">Technology Stack Overview</CardTitle>
            <CardDescription className="dark:text-gray-400">
              Enterprise-grade infrastructure powering all 12 emerging technology modules
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">Blockchain & Distributed</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Ethereum & Polygon Networks</li>
                  <li>• Smart Contract Integration</li>
                  <li>• IPFS Decentralized Storage</li>
                  <li>• Web3 Wallet Support</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">AI & Machine Learning</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• OpenAI GPT-5 Integration</li>
                  <li>• TensorFlow ML Models</li>
                  <li>• Computer Vision APIs</li>
                  <li>• Predictive Analytics Engine</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900 dark:text-white">Hardware & IoT</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Industrial IoT Sensors</li>
                  <li>• 4K Drone Systems</li>
                  <li>• Edge Computing Devices</li>
                  <li>• Biometric Scanners</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
