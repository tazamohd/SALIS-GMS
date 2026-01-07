import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, Zap, Target, TrendingUp, Activity, Settings } from "lucide-react";

export default function QuantumComputingOptimization() {
  const { t } = useTranslation();

  const algorithms = ["Route Optimization (QAOA)", "Schedule Optimization (VQE)", "Parts Allocation (Grover)", "Demand Forecasting (QSVM)"];
  const tasks = [
    { task: "Fleet Route Optimization", improvement: "+35%", time: "0.8ms" },
    { task: "Technician Scheduling", improvement: "+42%", time: "1.1ms" },
    { task: "Parts Inventory Allocation", improvement: "+28%", time: "0.9ms" },
    { task: "Demand Prediction Model", improvement: "+45%", time: "1.5ms" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] p-6" data-testid="quantum-computing-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="page-title">{t('quantum.title', 'Quantum Computing Optimization')}</h1>
            <p className="text-gray-400 mt-1" data-testid="page-description">{t('quantum.description', 'Advanced quantum algorithms for route and schedule optimization')}</p>
          </div>
          <Badge data-testid="status-ready-quantum-0" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            <Zap className="w-3 h-3 mr-1" /> Quantum Ready
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-qubits">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20"><Cpu className="w-5 h-5 text-purple-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-qubits">128</p>
                  <p className="text-sm text-gray-400">Qubits Available</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-accuracy">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/20"><Target className="w-5 h-5 text-sky-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-accuracy">99.2%</p>
                  <p className="text-sm text-gray-400">Optimization Accuracy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-efficiency">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-efficiency">40%</p>
                  <p className="text-sm text-gray-400">Efficiency Gain</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-compute-time">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20"><Activity className="w-5 h-5 text-orange-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-compute-time">1.2ms</p>
                  <p className="text-sm text-gray-400">Avg Compute Time</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-algorithms">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Cpu className="w-5 h-5 text-purple-400" /> Quantum Algorithms</CardTitle>
              <CardDescription className="text-gray-400">Advanced optimization algorithms powered by quantum computing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {algorithms.map((algo, idx) => (
                <div key={idx} data-testid={`algorithm-row-${idx}`} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-sm font-bold">{idx + 1}</div>
                    <span className="text-white" data-testid={`text-algorithm-${idx}`}>{algo}</span>
                  </div>
                  <Badge data-testid={`status-active-algorithm-${idx}`} className="bg-emerald-500/20 text-emerald-400">Active</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-tasks">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2"><Settings className="w-5 h-5 text-sky-400" /> Optimization Tasks</CardTitle>
              <CardDescription className="text-gray-400">Recent quantum optimization results</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {tasks.map((task, idx) => (
                <div key={idx} data-testid={`task-row-${idx}`} className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-white" data-testid={`text-task-${idx}`}>{task.task}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-400 font-bold" data-testid={`text-improvement-${idx}`}>{task.improvement}</span>
                    <span className="text-gray-400 text-sm" data-testid={`text-time-${idx}`}>{task.time}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
