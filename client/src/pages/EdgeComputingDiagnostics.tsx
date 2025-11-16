import { useState, useEffect } from 'react';
import { DashboardPage } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Cpu, Zap, Activity, Database } from 'lucide-react';

export default function EdgeComputingDiagnostics() {
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
    { id: '1', name: 'Edge Node Alpha', status: 'active', load: 67, latency: '12ms' },
    { id: '2', name: 'Edge Node Beta', status: 'active', load: 45, latency: '8ms' },
    { id: '3', name: 'Edge Node Gamma', status: 'idle', load: 12, latency: '5ms' },
  ];

  const metrics = [
    { label: "Data Points/sec", value: "1,248", icon: Activity, color: "text-purple-600" },
    { label: "Avg Latency", value: "8ms", icon: Zap, color: "text-green-600" },
    { label: "Data Processed", value: "2.4 GB", icon: Database, color: "text-blue-600" },
    { label: "Uptime", value: "99.9%", icon: Cpu, color: "text-emerald-600" },
  ];

  return (
    <DashboardPage
      title="Edge Computing Diagnostics"
      description="Real-time OBD-II data processing with edge computing and low-latency analysis"
      icon={Cpu}
      metrics={metrics}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {edgeDevices.map((device) => (
          <Card key={device.id} className="bg-white dark:bg-salis-black">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-emerald-600" />
                  <h3 className="font-semibold text-gray-900 dark:text-white">{device.name}</h3>
                </div>
                <Badge className={device.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                  {device.status}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">CPU Load</span>
                  <span className="font-semibold" data-testid={`load-${device.id}`}>{device.load}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Latency</span>
                  <span className="font-semibold text-green-600">{device.latency}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-white dark:bg-salis-black mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Live OBD-II Data Stream
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Engine RPM</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={liveMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="rpm" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Vehicle Speed (mph)</h4>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={liveMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" style={{ fontSize: '12px' }} />
                  <YAxis style={{ fontSize: '12px' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="speed" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
            <Zap className="h-5 w-5 text-emerald-600 animate-pulse" />
            <p className="text-sm text-emerald-900 dark:text-emerald-200 font-semibold">
              Processing at edge: <span className="text-emerald-600">3.2ms latency</span> (95% faster than cloud)
            </p>
          </div>

          <div className="mt-6 flex gap-3">
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" data-testid="button-start-diagnostic">
              <Activity className="mr-2 h-4 w-4" />
              Start New Diagnostic
            </Button>
            <Button variant="outline" data-testid="button-export-data">
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
