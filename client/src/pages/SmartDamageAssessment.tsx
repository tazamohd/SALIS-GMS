import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Zap, DollarSign, AlertTriangle, CheckCircle, Loader2, BarChart3, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TabsPageLayout } from "@/components/layouts";

interface DamageDetection {
  type: string;
  severity: "minor" | "moderate" | "severe";
  location: string;
  confidence: number;
  estimatedCost: number;
  repairTime: number;
  parts: string[];
}

export default function SmartDamageAssessment() {
  const { t } = useTranslation();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [detections, setDetections] = useState<DamageDetection[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        analyzeImage();
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    setAnalyzing(true);
    
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockDetections: DamageDetection[] = [
      {
        type: t('smartDamage.dent', 'Dent'),
        severity: "moderate",
        location: t('smartDamage.frontBumperDriver', 'Front bumper - driver side'),
        confidence: 94.5,
        estimatedCost: 450,
        repairTime: 3,
        parts: [t('smartDamage.frontBumperCover', 'Front bumper cover'), t('smartDamage.paintMaterials', 'Paint materials')]
      },
      {
        type: t('smartDamage.scratch', 'Scratch'),
        severity: "minor",
        location: t('smartDamage.rearDoorPanel', 'Rear door panel'),
        confidence: 87.2,
        estimatedCost: 180,
        repairTime: 1.5,
        parts: [t('smartDamage.touchUpPaint', 'Touch-up paint'), t('smartDamage.clearCoat', 'Clear coat')]
      },
      {
        type: t('smartDamage.crack', 'Crack'),
        severity: "severe",
        location: t('smartDamage.headlightAssembly', 'Headlight assembly'),
        confidence: 98.1,
        estimatedCost: 320,
        repairTime: 2,
        parts: [t('smartDamage.ledHeadlightAssembly', 'LED headlight assembly'), t('smartDamage.headlightSeal', 'Headlight seal')]
      }
    ];

    setDetections(mockDetections);
    setAnalyzing(false);
    
    toast({
      title: t('smartDamage.analysisComplete', 'Analysis Complete'),
      description: t('smartDamage.detectedAreas', `Detected ${mockDetections.length} damage areas with AI vision`),
    });
  };

  const totalCost = detections.reduce((sum, d) => sum + d.estimatedCost, 0);
  const totalTime = detections.reduce((sum, d) => sum + d.repairTime, 0);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor": return "bg-[#F97316]/10 text-[#F97316]";
      case "moderate": return "bg-[#F97316]/10 text-[#F97316]";
      case "severe": return "bg-red-500/10 text-red-600 dark:text-red-400";
      default: return "bg-[#64748B]/10 text-[#64748B]";
    }
  };

  const tabsConfig = [
    {
      id: "detection",
      label: t('smartDamage.detection', 'Detection'),
      icon: Camera,
      content: (
        <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Camera className="w-5 h-5 text-[#0A5ED7]" />
              {t('smartDamage.uploadVehicleImage', 'Upload Vehicle Image')}
            </CardTitle>
            <CardDescription className="text-[#64748B]">
              {t('smartDamage.uploadPhotoForAnalysis', 'Upload a photo of the damaged vehicle for AI analysis')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-8 text-center bg-[#F8FAFC] dark:bg-[#0E1117]">
              {selectedImage ? (
                <div className="space-y-4">
                  <img 
                    src={selectedImage} 
                    alt={t('smartDamage.uploadedVehicle', 'Uploaded vehicle')} 
                    className="max-h-96 mx-auto rounded-lg shadow-lg"
                  />
                  {analyzing && (
                    <div className="flex items-center justify-center gap-2 text-[#0A5ED7]">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{t('smartDamage.aiAnalyzing', 'AI analyzing damage patterns...')}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                    <Upload className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-[#0B1F3B] dark:text-white mb-2">
                      {t('smartDamage.dragAndDrop', 'Drag and drop or click to upload')}
                    </p>
                    <p className="text-sm text-[#64748B]">
                      {t('smartDamage.supportsFormats', 'Supports: JPG, PNG (max 10MB)')}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              data-testid="input-damage-image"
            />
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90"
              data-testid="button-upload-image"
            >
              <Upload className="w-4 h-4 mr-2" />
              {selectedImage ? t('smartDamage.uploadDifferentImage', 'Upload Different Image') : t('smartDamage.selectImage', 'Select Image')}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]" data-testid="card-summary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Zap className="w-5 h-5 text-[#F97316]" />
              {t('smartDamage.aiSummary', 'AI Summary')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">{t('smartDamage.detections', 'Detections')}</span>
                <span className="font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-detections-count">{detections.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">{t('smartDamage.totalCost', 'Total Cost')}</span>
                <span className="font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-total-cost">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#64748B]">{t('smartDamage.repairTime', 'Repair Time')}</span>
                <span className="font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-repair-time">
                  {totalTime.toFixed(1)} {t('smartDamage.hrs', 'hrs')}
                </span>
              </div>
            </div>

            {detections.length > 0 && (
              <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#232A36]">
                <h4 className="font-semibold mb-2 text-sm text-[#0B1F3B] dark:text-white">{t('smartDamage.severityBreakdown', 'Severity Breakdown')}</h4>
                <div className="space-y-2">
                  {["severe", "moderate", "minor"].map(severity => {
                    const count = detections.filter(d => d.severity === severity).length;
                    if (count === 0) return null;
                    return (
                      <div key={severity} className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className={getSeverityColor(severity)} data-testid={`badge-severity-${severity}`}>
                          {t(`smartDamage.${severity}`, severity)}
                        </Badge>
                        <span className="text-[#64748B]" data-testid={`text-severity-count-${severity}`}>{count} {t('smartDamage.found', 'found')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {detections.length > 0 && (
              <Button className="w-full mt-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white hover:opacity-90" data-testid="button-generate-estimate">
                <DollarSign className="w-4 h-4 mr-2" />
                {t('smartDamage.generateFullEstimate', 'Generate Full Estimate')}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {detections.length > 0 && (
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('smartDamage.detectedDamageAreas', 'Detected Damage Areas')}</CardTitle>
            <CardDescription className="text-[#64748B]">
              {t('smartDamage.aiIdentifiedDamage', 'AI-identified damage with confidence scores and repair estimates')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-[#F8FAFC] dark:bg-[#0E1117]">
                <TabsTrigger value="all" data-testid="tab-all">{t('common.all', 'All')} ({detections.length})</TabsTrigger>
                <TabsTrigger value="severe" data-testid="tab-severe">{t('smartDamage.severe', 'Severe')}</TabsTrigger>
                <TabsTrigger value="moderate" data-testid="tab-moderate">{t('smartDamage.moderate', 'Moderate')}</TabsTrigger>
                <TabsTrigger value="minor" data-testid="tab-minor">{t('smartDamage.minor', 'Minor')}</TabsTrigger>
              </TabsList>
              
              {["all", "severe", "moderate", "minor"].map(tab => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  {detections
                    .filter(d => tab === "all" || d.severity === tab)
                    .map((detection, idx) => (
                      <Card key={idx} className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]" data-testid={`card-detection-${idx}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-detection-type-${idx}`}>
                                  {detection.type}
                                </h3>
                                <Badge variant="outline" className={getSeverityColor(detection.severity)} data-testid={`badge-detection-severity-${idx}`}>
                                  {t(`smartDamage.${detection.severity}`, detection.severity)}
                                </Badge>
                              </div>
                              <p className="text-sm text-[#64748B]" data-testid={`text-detection-location-${idx}`}>
                                {detection.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid={`text-detection-cost-${idx}`}>
                                ${detection.estimatedCost}
                              </p>
                              <p className="text-sm text-[#64748B]" data-testid={`text-detection-time-${idx}`}>
                                {detection.repairTime} {t('smartDamage.hrs', 'hrs')}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-[#64748B]">{t('smartDamage.aiConfidence', 'AI Confidence')}</span>
                                <span className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-detection-confidence-${idx}`}>
                                  {detection.confidence}%
                                </span>
                              </div>
                              <Progress value={detection.confidence} className="h-2" data-testid={`progress-detection-confidence-${idx}`} />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-[#0B1F3B] dark:text-white mb-2">
                                {t('smartDamage.requiredParts', 'Required Parts')}:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {detection.parts.map((part, i) => (
                                  <Badge key={i} variant="secondary" className="bg-[#0A5ED7]/10 text-[#0A5ED7]" data-testid={`badge-part-${idx}-${i}`}>
                                    {part}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      )}

        </>
      ),
    },
    {
      id: "insights",
      label: t('smartDamage.insights', 'Insights'),
      icon: BarChart3,
      content: (
        <>
          {detections.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-emerald-500/10 dark:from-emerald-500/10 dark:to-emerald-500/5 relative overflow-hidden" data-testid="card-average-confidence">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-emerald-500/10 -mr-10 -mt-10" />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-sm text-[#64748B]">{t('smartDamage.averageConfidence', 'Average Confidence')}</p>
                      <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-average-confidence">
                        {(detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#0A5ED7]/20 bg-gradient-to-br from-[#0A5ED7]/5 to-[#0BB3FF]/10 dark:from-[#0A5ED7]/10 dark:to-[#0BB3FF]/5 relative overflow-hidden" data-testid="card-labor-parts">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[#0A5ED7]/10 -mr-10 -mt-10" />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-8 h-8 text-[#0A5ED7]" />
                    <div>
                      <p className="text-sm text-[#64748B]">{t('smartDamage.laborParts', 'Labor + Parts')}</p>
                      <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-labor-parts-total">
                        ${totalCost.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-[#F97316]/20 bg-gradient-to-br from-[#F97316]/5 to-[#F97316]/10 dark:from-[#F97316]/10 dark:to-[#F97316]/5 relative overflow-hidden" data-testid="card-priority-items">
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-[#F97316]/10 -mr-10 -mt-10" />
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-8 h-8 text-[#F97316]" />
                    <div>
                      <p className="text-sm text-[#64748B]">{t('smartDamage.priorityItems', 'Priority Items')}</p>
                      <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-priority-items-count">
                        {detections.filter(d => d.severity === "severe").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
              <CardContent className="pt-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <p className="text-[#64748B]">{t('smartDamage.noAnalysisData', 'No analysis data available. Upload and analyze a vehicle image in the Detection tab.')}</p>
              </CardContent>
            </Card>
          )}
        </>
      ),
    },
    {
      id: "reports",
      label: t('smartDamage.reports', 'Reports'),
      icon: FileText,
      content: (
        <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('smartDamage.damageAssessmentReports', 'Damage Assessment Reports')}</CardTitle>
            <CardDescription className="text-[#64748B]">
              {t('smartDamage.historicalAssessments', 'Historical damage assessments and generated reports')}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
              <FileText className="w-8 h-8 text-white" />
            </div>
            <p className="text-[#64748B]">{t('smartDamage.noReportsYet', 'No reports available yet. Complete damage assessments to generate reports.')}</p>
          </CardContent>
        </Card>
      ),
    },
  ];

  return (
    <TabsPageLayout
      title={t('smartDamage.title', 'Smart Damage Assessment')}
      description={t('smartDamage.description', 'AI-powered vehicle damage detection with instant cost estimation')}
      icon={Camera}
      tabs={tabsConfig}
    />
  );
}
