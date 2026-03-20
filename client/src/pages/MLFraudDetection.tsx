// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, TrendingUp, Activity, CheckCircle } from 'lucide-react';
import { AnalyticsPage } from '@/components/layouts';

export default function MLFraudDetection() {
  const { t } = useTranslation();
  const { data: fraudCasesResponse, isLoading } = useQuery({ queryKey: ['/api/nextgen/fraud-detection-cases'] });
  const backendCases = fraudCasesResponse?.data || [];

  const fraudStats = [
    { label: t('mlFraud.casesDetected', 'Cases Detected'), value: '12', change: '+3', trend: 'up', color: 'text-red-600' },
    { label: t('mlFraud.preventedLoss', 'Prevented Loss'), value: '$8,450', change: '+$1,200', trend: 'up', color: 'text-green-600' },
    { label: t('mlFraud.detectionRate', 'Detection Rate'), value: '94%', change: '+2%', trend: 'up', color: 'text-[#0A5ED7]' },
    { label: t('mlFraud.falsePositives', 'False Positives'), value: '3%', change: '-1%', trend: 'down', color: 'text-purple-600' },
  ];

  const cases = backendCases.length > 0 ? backendCases.map((c: any) => ({
    id: c.id,
    type: c.flagReason || t('mlFraud.suspiciousActivity', 'Suspicious Activity'),
    risk: c.riskScore > 70 ? 'high' : c.riskScore > 40 ? 'medium' : 'low',
    amount: `$${c.transactionAmount || 0}`,
    status: c.status || 'pending',
    detected: new Date(c.detectedAt).toRelativeTimeString?.() || t('mlFraud.recently', 'Recently'),
  })) : [
    { id: 'demo-1', type: t('mlFraud.paymentAnomaly', 'Payment Anomaly (Demo)'), risk: 'high', amount: '$2,450', status: 'investigating', detected: t('mlFraud.twoHoursAgo', '2 hours ago') },
    { id: 'demo-2', type: t('mlFraud.duplicateTransaction', 'Duplicate Transaction (Demo)'), risk: 'medium', amount: '$890', status: 'resolved', detected: t('mlFraud.fiveHoursAgo', '5 hours ago') },
    { id: 'demo-3', type: t('mlFraud.unusualPattern', 'Unusual Pattern (Demo)'), risk: 'low', amount: '$120', status: 'cleared', detected: t('mlFraud.oneDayAgo', '1 day ago') },
  ];

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium':
        return 'bg-[#F97316]/10 text-[#F97316] dark:bg-[#F97316]/20 dark:text-[#F97316]';
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
    }
  };

  const getRiskLabel = (risk: string) => {
    switch (risk) {
      case 'high':
        return t('mlFraud.highRisk', 'high risk');
      case 'medium':
        return t('mlFraud.mediumRisk', 'medium risk');
      default:
        return t('mlFraud.lowRisk', 'low risk');
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'investigating':
        return t('mlFraud.statusInvestigating', 'investigating');
      case 'resolved':
        return t('mlFraud.statusResolved', 'resolved');
      case 'cleared':
        return t('mlFraud.statusCleared', 'cleared');
      default:
        return status;
    }
  };

  const metricsCards = fraudStats.map((stat, index) => ({
    title: stat.label,
    value: stat.value,
    change: stat.change,
    trend: stat.trend as 'up' | 'down',
    icon: stat.trend === 'up' ? TrendingUp : Activity,
    description: t('mlFraud.fromLastMonth', 'from last month'),
    testId: `stat-${index}`,
  }));

  const content = (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <AlertTriangle className="h-5 w-5 text-[#F97316]" />
            {t('mlFraud.activeFraudCases', 'Active Fraud Cases')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 mx-auto mb-4 text-[#64748B] animate-pulse" />
              <p className="text-[#64748B]">{t('mlFraud.loadingFraudCases', 'Loading fraud cases...')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cases.map((fraudCase) => (
                <div
                  key={fraudCase.id}
                  className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg hover:shadow-md transition-shadow bg-[#F8FAFC] dark:bg-[#0E1117]"
                  data-testid={`case-${fraudCase.id}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-[#0B1F3B] dark:text-white">
                          {fraudCase.type}
                        </h4>
                        <Badge className={getRiskColor(fraudCase.risk)}>
                          {getRiskLabel(fraudCase.risk)}
                        </Badge>
                      </div>
                      <p className="text-sm text-[#64748B]">
                        {t('mlFraud.detected', 'Detected')} {fraudCase.detected}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-red-600">{fraudCase.amount}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <Badge variant="outline" className={
                      fraudCase.status === 'investigating' ? 'border-[#F97316] text-[#F97316]' :
                      fraudCase.status === 'resolved' ? 'border-green-500 text-green-700 dark:text-green-400' :
                      'border-[#0A5ED7] text-[#0A5ED7]'
                    }>
                      {getStatusLabel(fraudCase.status)}
                    </Badge>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`button-view-${fraudCase.id}`}>
                        {t('mlFraud.viewDetails', 'View Details')}
                      </Button>
                      {fraudCase.status === 'investigating' && (
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white" data-testid={`button-escalate-${fraudCase.id}`}>
                          {t('mlFraud.escalate', 'Escalate')}
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

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <Activity className="h-5 w-5 text-purple-600" />
            {t('mlFraud.mlModelPerformance', 'ML Model Performance')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <p className="text-sm text-[#64748B]">{t('mlFraud.accuracy', 'Accuracy')}</p>
              </div>
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">96.8%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-[#0A5ED7]" />
                <p className="text-sm text-[#64748B]">{t('mlFraud.precision', 'Precision')}</p>
              </div>
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">94.2%</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-purple-500" />
                <p className="text-sm text-[#64748B]">{t('mlFraud.recall', 'Recall')}</p>
              </div>
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white">92.5%</p>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 dark:from-[#0A5ED7]/20 dark:to-[#0BB3FF]/20 rounded-lg border border-[#0A5ED7]/20">
            <p className="text-sm text-[#0A5ED7] dark:text-[#0BB3FF] font-semibold mb-2">
              {t('mlFraud.modelInformation', 'Model Information')}
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm text-[#0B1F3B] dark:text-white">
              <p>{t('mlFraud.algorithm', 'Algorithm')}: {t('mlFraud.algorithmValue', 'Random Forest + Neural Network')}</p>
              <p>{t('mlFraud.lastUpdated', 'Last Updated')}: {t('mlFraud.twoDaysAgo', '2 days ago')}</p>
              <p>{t('mlFraud.trainingData', 'Training Data')}: {t('mlFraud.trainingDataValue', '50,000+ transactions')}</p>
              <p>{t('mlFraud.features', 'Features')}: {t('mlFraud.featuresValue', '23 behavioral patterns')}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <AnalyticsPage
      title={t('mlFraud.title', 'ML Fraud Detection')}
      description={t('mlFraud.description', 'Machine learning-powered fraud detection with real-time transaction analysis')}
      icon={Shield}
      metrics={metricsCards}
    >
      {content}
    </AnalyticsPage>
  );
}
