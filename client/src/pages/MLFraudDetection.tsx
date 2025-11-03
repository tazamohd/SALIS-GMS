import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, TrendingUp, Activity, CheckCircle } from 'lucide-react';

export default function MLFraudDetection() {
  const { data: fraudCasesResponse, isLoading } = useQuery({ queryKey: ['/api/nextgen/fraud-detection-cases'] });
  const backendCases = fraudCasesResponse?.data || [];

  const fraudStats = [
    { label: 'Cases Detected', value: '12', change: '+3', trend: 'up', color: 'text-red-600' },
    { label: 'Prevented Loss', value: '$8,450', change: '+$1,200', trend: 'up', color: 'text-green-600' },
    { label: 'Detection Rate', value: '94%', change: '+2%', trend: 'up', color: 'text-blue-600' },
    { label: 'False Positives', value: '3%', change: '-1%', trend: 'down', color: 'text-purple-600' },
  ];

  // Use backend data if available, otherwise show demo cases
  const cases = backendCases.length > 0 ? backendCases.map((c: any) => ({
    id: c.id,
    type: c.flagReason || 'Suspicious Activity',
    risk: c.riskScore > 70 ? 'high' : c.riskScore > 40 ? 'medium' : 'low',
    amount: `$${c.transactionAmount || 0}`,
    status: c.status || 'pending',
    detected: new Date(c.detectedAt).toRelativeTimeString?.() || 'Recently',
  })) : [
    { id: 'demo-1', type: 'Payment Anomaly (Demo)', risk: 'high', amount: '$2,450', status: 'investigating', detected: '2 hours ago' },
    { id: 'demo-2', type: 'Duplicate Transaction (Demo)', risk: 'medium', amount: '$890', status: 'resolved', detected: '5 hours ago' },
    { id: 'demo-3', type: 'Unusual Pattern (Demo)', risk: 'low', amount: '$120', status: 'cleared', detected: '1 day ago' },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-['Montserrat'] text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Shield className="h-8 w-8 text-red-600" />
          ML Fraud Detection
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-['Poppins']">
          Machine learning-powered fraud detection with real-time transaction analysis
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {fraudStats.map((stat, index) => (
          <Card key={index} className="bg-white dark:bg-salis-black">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                {stat.trend === 'up' ? (
                  <TrendingUp className={`h-4 w-4 ${stat.color}`} />
                ) : (
                  <Activity className={`h-4 w-4 ${stat.color}`} />
                )}
              </div>
              <p className={`text-3xl font-bold ${stat.color}`} data-testid={`stat-${index}`}>
                {stat.value}
              </p>
              <p className="text-xs text-gray-500 mt-1">{stat.change} from last month</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Cases */}
      <Card className="bg-white dark:bg-salis-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Active Fraud Cases
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse" />
              <p className="text-gray-500 dark:text-gray-400">Loading fraud cases...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((fraudCase) => (
              <div
                key={fraudCase.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                data-testid={`case-${fraudCase.id}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {fraudCase.type}
                      </h4>
                      <Badge className={getRiskColor(fraudCase.risk)}>
                        {fraudCase.risk} risk
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Detected {fraudCase.detected}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600">{fraudCase.amount}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4">
                  <Badge variant="outline" className={
                    fraudCase.status === 'investigating' ? 'border-orange-500 text-orange-700' :
                    fraudCase.status === 'resolved' ? 'border-green-500 text-green-700' :
                    'border-blue-500 text-blue-700'
                  }>
                    {fraudCase.status}
                  </Badge>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" data-testid={`button-view-${fraudCase.id}`}>
                      View Details
                    </Button>
                    {fraudCase.status === 'investigating' && (
                      <Button size="sm" className="bg-red-600 hover:bg-red-700" data-testid={`button-escalate-${fraudCase.id}`}>
                        Escalate
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ML Model Performance */}
      <Card className="mt-6 bg-white dark:bg-salis-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-purple-600" />
            ML Model Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Accuracy</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">96.8%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-blue-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Precision</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">94.2%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <p className="text-sm text-gray-600 dark:text-gray-400">Recall</p>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">92.5%</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-purple-900 dark:text-purple-200 font-semibold mb-2">
              Model Information
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm text-purple-700 dark:text-purple-300">
              <p>Algorithm: Random Forest + Neural Network</p>
              <p>Last Updated: 2 days ago</p>
              <p>Training Data: 50,000+ transactions</p>
              <p>Features: 23 behavioral patterns</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
