import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DashboardPage } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, Zap, Activity, Database } from 'lucide-react';

export default function EdgeComputingDiagnostics() {
  const { t } = useTranslation();
  const [liveMetrics, setLiveMetrics] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setLiveMetrics(prev => {
        const newData = [
          ...prev,
          {
            time: now.toLocaleTimeString(),
            rpm: 2000 + Math.random() * 1000,
            speed: 45 + Math.random() * 20,
            throttle: 30 + Math.random() * 40,
            temp: 85 + Math.random() * 15,
          }
        ].slice(-15);
        return newData;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const edgeDevices = [
    { id: '1', name: t('edge.nodeAlpha', 'Edge Node Alpha'), status: 'active', load: 67, latency: '12ms' },
    { id: '2', name: t('edge.nodeBeta', 'Edge Node Beta'), status: 'active', load: 45, latency: '8ms' },
    { id: '3', name: t('edge.nodeGamma', 'Edge Node Gamma'), status: 'idle', load: 12, latency: '5ms' },
  ];

  const metrics = [
    { label: t('edge.dataPointsPerSec', 'Data Points/sec'), value: "1,248", icon: Activity, color: "text-purple-500" },
    { label: t('edge.avgLatency', 'Avg Latency'), value: "8ms", icon: Zap, color: "text-emerald-500" },
    { label: t('edge.dataProcessed', 'Data Processed'), value: "2.4 GB", icon: Database, color: "text-[#0A5ED7]" },
    { label: t('edge.uptime', 'Uptime'), value: "99.9%", icon: Cpu, color: "text-[#0BB3FF]" },
  ];

  return (
    <DashboardPage
      title={t('edge.title', 'Edge Computing Diagnostics')}
      description={t('edge.description', 'Real-time OBD-II data processing with edge computing and low-latency analysis')}
      icon={Cpu}
      metrics={metrics}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {edgeDevices.map((device) => (
          <Card key={device.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-[#0A5ED7]" />
                  <h3 className="font-semibold text-[#0B1F3B] dark:text-white">{device.name}</h3>
                </div>
                <Badge className={device.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0' : 'bg-[#F8FAFC] text-[#64748B] dark:bg-[#232A36] border-0'}>
                  {device.status === 'active' ? t('edge.active', 'active') : t('edge.idle', 'idle')}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">{t('edge.cpuLoad', 'CPU Load')}</span>
                  <span className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`load-${device.id}`}>{device.load}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">{t('edge.latency', 'Latency')}</span>
                  <span className="font-semibold text-emerald-500">{device.latency}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <Activity className="h-5 w-5 text-[#0A5ED7]" />
            {t('edge.liveDataStream', 'Live OBD-II Data Stream')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-[#0B1F3B] dark:text-white mb-3">{t('edge.engineRPM', 'Engine RPM')}</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={liveMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="time" style={{ fontSize: '12px' }} stroke="#64748B" />
                  <YAxis style={{ fontSize: '12px' }} stroke="#64748B" />
                  <Tooltip contentStyle={{ backgroundColor: '#151A23', border: '1px solid #232A36', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="rpm" stroke="#0A5ED7" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-sm font-medium text-[#0B1F3B] dark:text-white mb-3">{t('edge.vehicleSpeed', 'Vehicle Speed (mph)')}</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={liveMetrics}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="time" style={{ fontSize: '12px' }} stroke="#64748B" />
                  <YAxis style={{ fontSize: '12px' }} stroke="#64748B" />
                  <Tooltip contentStyle={{ backgroundColor: '#151A23', border: '1px solid #232A36', borderRadius: '8px' }} />
                  <Line type="monotone" dataKey="speed" stroke="#0BB3FF" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <Zap className="h-5 w-5 text-emerald-500 animate-pulse" />
            <p className="text-sm text-emerald-900 dark:text-emerald-200 font-semibold">
              {t('edge.processingAtEdge', 'Processing at edge')}: <span className="text-emerald-500">{t('edge.latencyValue', '3.2ms latency')}</span> ({t('edge.fasterThanCloud', '95% faster than cloud')})
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button className="flex-1 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-start-diagnostic">
              <Activity className="mr-2 h-4 w-4" />
              {t('edge.startDiagnostic', 'Start New Diagnostic')}
            </Button>
            <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-export-data">
              {t('edge.exportData', 'Export Data')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
