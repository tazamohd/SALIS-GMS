import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Zap, DollarSign, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { StandardPageLayout } from "@/components/layouts";

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
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const mockDetections: DamageDetection[] = [
      {
        type: "Dent",
        severity: "moderate",
        location: "Front bumper - driver side",
        confidence: 94.5,
        estimatedCost: 450,
        repairTime: 3,
        parts: ["Front bumper cover", "Paint materials"]
      },
      {
        type: "Scratch",
        severity: "minor",
        location: "Rear door panel",
        confidence: 87.2,
        estimatedCost: 180,
        repairTime: 1.5,
        parts: ["Touch-up paint", "Clear coat"]
      },
      {
        type: "Crack",
        severity: "severe",
        location: "Headlight assembly",
        confidence: 98.1,
        estimatedCost: 320,
        repairTime: 2,
        parts: ["LED headlight assembly", "Headlight seal"]
      }
    ];

    setDetections(mockDetections);
    setAnalyzing(false);
    
    toast({
      title: "Analysis Complete",
      description: `Detected ${mockDetections.length} damage areas with AI vision`,
    });
  };

  const totalCost = detections.reduce((sum, d) => sum + d.estimatedCost, 0);
  const totalTime = detections.reduce((sum, d) => sum + d.repairTime, 0);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "minor": return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
      case "moderate": return "bg-orange-500/10 text-orange-700 dark:text-orange-400";
      case "severe": return "bg-red-500/10 text-red-700 dark:text-red-400";
      default: return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
    }
  };

  return (
    <StandardPageLayout
      title="Smart Damage Assessment"
      description="AI-powered vehicle damage detection with instant cost estimation"
      icon={Camera}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <Card className="lg:col-span-2 border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Upload Vehicle Image
            </CardTitle>
            <CardDescription>
              Upload a photo of the damaged vehicle for AI analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              {selectedImage ? (
                <div className="space-y-4">
                  <img 
                    src={selectedImage} 
                    alt="Uploaded vehicle" 
                    className="max-h-96 mx-auto rounded-lg shadow-lg"
                  />
                  {analyzing && (
                    <div className="flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>AI analyzing damage patterns...</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-16 h-16 mx-auto text-gray-400" />
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                      Drag and drop or click to upload
                    </p>
                    <p className="text-sm text-gray-500">
                      Supports: JPG, PNG (max 10MB)
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
              className="w-full"
              data-testid="button-upload-image"
            >
              <Upload className="w-4 h-4 mr-2" />
              {selectedImage ? "Upload Different Image" : "Select Image"}
            </Button>
          </CardContent>
        </Card>

        {/* Summary Card */}
        <Card className="border-gray-200 dark:border-gray-800" data-testid="card-summary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-500" />
              AI Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Detections</span>
                <span className="font-semibold text-gray-900 dark:text-white" data-testid="text-detections-count">{detections.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Total Cost</span>
                <span className="font-semibold text-gray-900 dark:text-white" data-testid="text-total-cost">
                  ${totalCost.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Repair Time</span>
                <span className="font-semibold text-gray-900 dark:text-white" data-testid="text-repair-time">
                  {totalTime.toFixed(1)} hrs
                </span>
              </div>
            </div>

            {detections.length > 0 && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <h4 className="font-semibold mb-2 text-sm text-gray-900 dark:text-white">Severity Breakdown</h4>
                <div className="space-y-2">
                  {["severe", "moderate", "minor"].map(severity => {
                    const count = detections.filter(d => d.severity === severity).length;
                    if (count === 0) return null;
                    return (
                      <div key={severity} className="flex items-center justify-between text-sm">
                        <Badge variant="outline" className={getSeverityColor(severity)} data-testid={`badge-severity-${severity}`}>
                          {severity}
                        </Badge>
                        <span className="text-gray-600 dark:text-gray-400" data-testid={`text-severity-count-${severity}`}>{count} found</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {detections.length > 0 && (
              <Button className="w-full mt-4" data-testid="button-generate-estimate">
                <DollarSign className="w-4 h-4 mr-2" />
                Generate Full Estimate
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detections List */}
      {detections.length > 0 && (
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle>Detected Damage Areas</CardTitle>
            <CardDescription>
              AI-identified damage with confidence scores and repair estimates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all" data-testid="tab-all">All ({detections.length})</TabsTrigger>
                <TabsTrigger value="severe" data-testid="tab-severe">Severe</TabsTrigger>
                <TabsTrigger value="moderate" data-testid="tab-moderate">Moderate</TabsTrigger>
                <TabsTrigger value="minor" data-testid="tab-minor">Minor</TabsTrigger>
              </TabsList>
              
              {["all", "severe", "moderate", "minor"].map(tab => (
                <TabsContent key={tab} value={tab} className="space-y-4">
                  {detections
                    .filter(d => tab === "all" || d.severity === tab)
                    .map((detection, idx) => (
                      <Card key={idx} className="border-gray-200 dark:border-gray-700" data-testid={`card-detection-${idx}`}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-gray-900 dark:text-white" data-testid={`text-detection-type-${idx}`}>
                                  {detection.type}
                                </h3>
                                <Badge variant="outline" className={getSeverityColor(detection.severity)} data-testid={`badge-detection-severity-${idx}`}>
                                  {detection.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400" data-testid={`text-detection-location-${idx}`}>
                                {detection.location}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid={`text-detection-cost-${idx}`}>
                                ${detection.estimatedCost}
                              </p>
                              <p className="text-sm text-gray-500" data-testid={`text-detection-time-${idx}`}>
                                {detection.repairTime} hrs
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600 dark:text-gray-400">AI Confidence</span>
                                <span className="font-medium text-gray-900 dark:text-white" data-testid={`text-detection-confidence-${idx}`}>
                                  {detection.confidence}%
                                </span>
                              </div>
                              <Progress value={detection.confidence} className="h-2" data-testid={`progress-detection-confidence-${idx}`} />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Required Parts:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {detection.parts.map((part, i) => (
                                  <Badge key={i} variant="secondary" data-testid={`badge-part-${idx}-${i}`}>
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

      {/* AI Insights */}
      {detections.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-green-200 dark:border-green-900 bg-green-50/50 dark:bg-green-950/20" data-testid="card-average-confidence">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Average Confidence</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-average-confidence">
                    {(detections.reduce((sum, d) => sum + d.confidence, 0) / detections.length).toFixed(1)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20" data-testid="card-labor-parts">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Labor + Parts</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-labor-parts-total">
                    ${totalCost.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-orange-200 dark:border-orange-900 bg-orange-50/50 dark:bg-orange-950/20" data-testid="card-priority-items">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-orange-600 dark:text-orange-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Priority Items</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-priority-items-count">
                    {detections.filter(d => d.severity === "severe").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </StandardPageLayout>
  );
}
