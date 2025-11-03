import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Upload, Camera, Eye, AlertTriangle, CheckCircle, Image as ImageIcon, Zap } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

export default function ComputerVisionQC() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const { data: checksResponse } = useQuery({ queryKey: ['/api/nextgen/vision-quality-checks'] });
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
        title: 'Analysis Complete',
        description: `Detected ${data.defects?.length || 0} potential defects using AI vision.`,
      });
    },
    onError: () => {
      toast({
        title: 'Analysis Failed',
        description: 'Failed to analyze image. Please try again.',
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
        title: 'No Image Selected',
        description: 'Please select an image to analyze.',
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
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
    }
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-['Montserrat'] text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Eye className="h-8 w-8 text-blue-600" />
          Computer Vision Quality Control
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-['Poppins']">
          AI-powered visual inspection using advanced computer vision and GPT-5 analysis
        </p>
      </div>

      <Tabs defaultValue="analyze" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analyze" data-testid="tab-analyze">
            <Camera className="h-4 w-4 mr-2" />
            Image Analysis
          </TabsTrigger>
          <TabsTrigger value="history" data-testid="tab-history">
            <ImageIcon className="h-4 w-4 mr-2" />
            Inspection History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analyze">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upload Panel */}
            <Card className="bg-white dark:bg-salis-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-blue-600" />
                  Upload Image for Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
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
                    <Camera className="h-12 w-12 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Click to upload image
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </label>
                </div>

                {previewUrl && (
                  <div className="space-y-3">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      data-testid="img-preview"
                    />
                    <Button
                      onClick={handleAnalyze}
                      disabled={analyzeImageMutation.isPending}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      data-testid="button-analyze"
                    >
                      {analyzeImageMutation.isPending ? (
                        <>
                          <Zap className="mr-2 h-4 w-4 animate-pulse" />
                          Analyzing with AI...
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Analyze with GPT-5 Vision
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="bg-white dark:bg-salis-black">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  AI Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!analysisResult ? (
                  <div className="text-center py-12">
                    <Eye className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500 dark:text-gray-400">
                      Upload an image and click analyze to see AI results
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Overall Score */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Quality Score
                        </span>
                        <Badge className={getSeverityColor(analysisResult.overallQuality)}>
                          {analysisResult.qualityScore || 0}/100
                        </Badge>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${analysisResult.qualityScore || 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Defects Found */}
                    <div>
                      <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        Detected Issues ({analysisResult.defects?.length || 0})
                      </h4>
                      {analysisResult.defects && analysisResult.defects.length > 0 ? (
                        <div className="space-y-2">
                          {analysisResult.defects.map((defect: any, index: number) => (
                            <div
                              key={index}
                              className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                              data-testid={`defect-${index}`}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <span className="font-medium text-sm text-gray-900 dark:text-white">
                                  {defect.type || 'Defect detected'}
                                </span>
                                <Badge variant="outline" className={getSeverityColor(defect.severity)}>
                                  {defect.severity}
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 dark:text-gray-400">
                                {defect.description || 'AI detected an anomaly in this area'}
                              </p>
                              {defect.confidence && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Confidence: {Math.round(defect.confidence * 100)}%
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            No defects detected - Quality passed!
                          </p>
                        </div>
                      )}
                    </div>

                    {/* AI Recommendations */}
                    {analysisResult.recommendations && (
                      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <h4 className="text-sm font-semibold mb-2 text-purple-900 dark:text-purple-200">
                          AI Recommendations
                        </h4>
                        <ul className="space-y-1">
                          {analysisResult.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-xs text-gray-700 dark:text-gray-300 flex items-start gap-2">
                              <CheckCircle className="h-3 w-3 mt-0.5 text-purple-600" />
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
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle>Recent Quality Inspections</CardTitle>
            </CardHeader>
            <CardContent>
              {(!Array.isArray(checks) || checks.length === 0) ? (
                <div className="text-center py-12">
                  <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No inspection history yet
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr className="text-left text-sm">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Quality Score</th>
                        <th className="pb-3">Defects</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {Array.isArray(checks) && checks.map((check: any) => (
                        <tr key={check.id} className="border-b" data-testid={`check-row-${check.id}`}>
                          <td className="py-3">{new Date(check.inspectionDate).toLocaleDateString()}</td>
                          <td className="py-3">{check.checkType}</td>
                          <td className="py-3">
                            <Badge variant="outline">{check.qualityScore}/100</Badge>
                          </td>
                          <td className="py-3">{check.defectsFound || 0}</td>
                          <td className="py-3">
                            <Badge className={check.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                              {check.passed ? 'Passed' : 'Failed'}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
