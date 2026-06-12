import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Camera, Eye, AlertTriangle, CheckCircle, Image as ImageIcon, Zap } from 'lucide-react';
import { queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { TabsPageLayout, TabConfig } from '@/components/layouts';

export default function ComputerVisionQC() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const { data: checksResponse } = useQuery<{ data: any[] }>({ queryKey: ['/api/nextgen/vision-quality-checks'] });
  const checks = checksResponse?.data || [];

  const analyzeImageMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/vision/analyze-image', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Analysis failed');
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      queryClient.invalidateQueries({ queryKey: ['/api/nextgen/vision-quality-checks'] });
      toast({
        title: t('vision.analysisComplete', 'Analysis Complete'),
        description: t('vision.detectedDefects', 'Detected {{count}} potential defects using AI vision.', { count: data.defects?.length || 0 }),
      });
    },
    onError: () => {
      toast({
        title: t('vision.analysisFailed', 'Analysis Failed'),
        description: t('vision.analysisFailedDesc', 'Failed to analyze image. Please try again.'),
        variant: 'destructive',
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setAnalysisResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      toast({
        title: t('vision.noImageSelected', 'No Image Selected'),
        description: t('vision.pleaseSelectImage', 'Please select an image to analyze.'),
        variant: 'destructive',
      });
      return;
    }

    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('checkType', 'paint_inspection');
    formData.append('vehicleId', 'demo-vehicle-001');

    analyzeImageMutation.mutate(formData);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity?.toLowerCase()) {
      case 'critical':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'major':
        return 'bg-orange-100 text-[#F97316] dark:bg-orange-900/30 dark:text-orange-300';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
    }
  };

  const tabs: TabConfig[] = [
    {
      id: "analyze",
      label: t('vision.imageAnalysis', 'Image Analysis'),
      icon: Camera,
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Upload className="h-5 w-5 text-[#0A5ED7]" />
                {t('vision.uploadImage', 'Upload Image for Analysis')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-8 text-center hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="image-upload"
                  data-testid="input-image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center gap-3"
                >
                  <Camera className="h-12 w-12 text-[#64748B]" />
                  <div>
                    <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                      {t('vision.clickToUpload', 'Click to upload image')}
                    </p>
                    <p className="text-xs text-[#64748B]">
                      {t('vision.fileFormats', 'PNG, JPG up to 10MB')}
                    </p>
                  </div>
                </label>
              </div>

              {previewUrl && (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt={t('vision.preview', 'Preview')}
                    className="w-full h-64 object-cover rounded-lg border border-[#E2E8F0] dark:border-[#232A36]"
                    data-testid="img-preview"
                  />
                  <Button
                    onClick={handleAnalyze}
                    disabled={analyzeImageMutation.isPending}
                    className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
                    data-testid="button-analyze"
                  >
                    {analyzeImageMutation.isPending ? (
                      <>
                        <Zap className="mr-2 h-4 w-4 animate-pulse" />
                        {t('vision.analyzingWithAI', 'Analyzing with AI...')}
                      </>
                    ) : (
                      <>
                        <Eye className="mr-2 h-4 w-4" />
                        {t('vision.analyzeWithGPT', 'Analyze with GPT-5 Vision')}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Zap className="h-5 w-5 text-purple-500" />
                {t('vision.aiResults', 'AI Analysis Results')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!analysisResult ? (
                <div className="text-center py-12">
                  <Eye className="h-16 w-16 mx-auto mb-4 text-[#64748B]" />
                  <p className="text-[#64748B]">
                    {t('vision.uploadPrompt', 'Upload an image and click analyze to see AI results')}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                        {t('vision.qualityScore', 'Quality Score')}
                      </span>
                      <Badge className={getSeverityColor(analysisResult.overallQuality)}>
                        {analysisResult.qualityScore || 0}/100
                      </Badge>
                    </div>
                    <div className="w-full bg-[#E2E8F0] dark:bg-[#232A36] rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] h-2 rounded-full transition-all"
                        style={{ width: `${analysisResult.qualityScore || 0}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                      <AlertTriangle className="h-4 w-4 text-[#F97316]" />
                      {t('vision.detectedIssues', 'Detected Issues')} ({analysisResult.defects?.length || 0})
                    </h4>
                    {analysisResult.defects && analysisResult.defects.length > 0 ? (
                      <div className="space-y-2">
                        {analysisResult.defects.map((defect: any, index: number) => (
                          <div
                            key={index}
                            className="p-3 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-white dark:bg-[#151A23]"
                            data-testid={`defect-${index}`}
                          >
                            <div className="flex items-start justify-between mb-1">
                              <span className="font-medium text-sm text-[#0B1F3B] dark:text-white">
                                {defect.type || t('vision.defectDetected', 'Defect detected')}
                              </span>
                              <Badge variant="outline" className={getSeverityColor(defect.severity)}>
                                {defect.severity}
                              </Badge>
                            </div>
                            <p className="text-xs text-[#64748B]">
                              {defect.description || t('vision.aiDetectedAnomaly', 'AI detected an anomaly in this area')}
                            </p>
                            {defect.confidence && (
                              <p className="text-xs text-[#64748B] mt-1">
                                {t('vision.confidence', 'Confidence')}: {Math.round(defect.confidence * 100)}%
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-500" />
                        <p className="text-sm text-[#64748B]">
                          {t('vision.noDefects', 'No defects detected - Quality passed!')}
                        </p>
                      </div>
                    )}
                  </div>

                  {analysisResult.recommendations && (
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                      <h4 className="text-sm font-semibold mb-2 text-purple-900 dark:text-purple-200">
                        {t('vision.aiRecommendations', 'AI Recommendations')}
                      </h4>
                      <ul className="space-y-1">
                        {analysisResult.recommendations.map((rec: string, index: number) => (
                          <li key={index} className="text-xs text-[#64748B] dark:text-gray-300 flex items-start gap-2">
                            <CheckCircle className="h-3 w-3 mt-0.5 text-purple-500" />
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ),
    },
    {
      id: "history",
      label: t('vision.inspectionHistory', 'Inspection History'),
      icon: ImageIcon,
      content: (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vision.recentInspections', 'Recent Quality Inspections')}</CardTitle>
          </CardHeader>
          <CardContent>
            {(!Array.isArray(checks) || checks.length === 0) ? (
              <div className="text-center py-12">
                <ImageIcon className="h-16 w-16 mx-auto mb-4 text-[#64748B]" />
                <p className="text-[#64748B]">
                  {t('vision.noHistory', 'No inspection history yet')}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[#E2E8F0] dark:border-[#232A36]">
                    <tr className="text-left text-sm">
                      <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('vision.date', 'Date')}</th>
                      <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('vision.type', 'Type')}</th>
                      <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('vision.qualityScore', 'Quality Score')}</th>
                      <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('vision.defects', 'Defects')}</th>
                      <th className="pb-3 text-[#0B1F3B] dark:text-white">{t('vision.status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {Array.isArray(checks) && checks.map((check: any) => (
                      <tr key={check.id} className="border-b border-[#E2E8F0] dark:border-[#232A36]" data-testid={`check-row-${check.id}`}>
                        <td className="py-3 text-[#0B1F3B] dark:text-white">{new Date(check.inspectionDate).toLocaleDateString()}</td>
                        <td className="py-3 text-[#0B1F3B] dark:text-white">{check.checkType}</td>
                        <td className="py-3">
                          <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">{check.qualityScore}/100</Badge>
                        </td>
                        <td className="py-3 text-[#0B1F3B] dark:text-white">{check.defectsFound || 0}</td>
                        <td className="py-3">
                          <Badge className={check.passed ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0'}>
                            {check.passed ? t('vision.passed', 'Passed') : t('vision.failed', 'Failed')}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title={t('vision.title', 'Computer Vision Quality Control')}
      description={t('vision.description', 'AI-powered visual inspection using advanced computer vision and GPT-5 analysis')}
      icon={Eye}
      tabs={tabs}
      defaultTab="analyze"
    />
  );
}
