import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package, CheckCircle, Brain, DollarSign, Wrench, ShoppingCart, FileText, AlertCircle } from "lucide-react";
import type { AIPartsRecommendation } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { DashboardPage } from "@/components/layouts";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PartRecommendation {
  partName: string;
  partNumber: string;
  category: string;
  confidence: number;
  reason: string;
  estimatedPrice: number;
  inStock: boolean;
  stockQuantity: number;
  alternatives: { name: string; partNumber: string; price: number }[];
}

interface SmartRecommendationResponse {
  recommendations: PartRecommendation[];
  total: number;
}

export default function SmartPartsRecommendations() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [smartResults, setSmartResults] = useState<PartRecommendation[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    vehicleMake: "",
    vehicleModel: "",
    vehicleYear: "",
    serviceType: "",
    description: "",
  });

  const { data: recommendations, isLoading } = useQuery<AIPartsRecommendation[]>({
    queryKey: ["/api/ai/parts-recommendations"],
  });

  const handleGenerateRecommendation = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/ai/parts-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          vehicleMake: formData.vehicleMake,
          vehicleModel: formData.vehicleModel,
          vehicleYear: formData.vehicleYear,
          serviceType: formData.serviceType,
          description: formData.description,
        }),
      });

      const data: SmartRecommendationResponse = await response.json();
      setSmartResults(data.recommendations || []);

      queryClient.invalidateQueries({ queryKey: ["/api/ai/parts-recommendations"] });

      toast({
        title: t('smartParts.recommendationGenerated', 'Recommendation Generated'),
        description: t('smartParts.aiAnalyzedCompatibility', `AI found ${data.total} recommended parts.`),
      });

      setIsGenerateDialogOpen(false);
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: t('smartParts.failedToGenerate', 'Failed to generate parts recommendation. Please try again.'),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddToCart = (part: PartRecommendation) => {
    toast({
      title: "Added to Cart",
      description: `${part.partName} has been added to your cart.`,
    });
  };

  const handleCreatePO = (part: PartRecommendation) => {
    toast({
      title: "Purchase Order",
      description: `Purchase order draft created for ${part.partName}.`,
    });
  };

  const handleApplyToJobCard = async (recommendationId: string) => {
    try {
      await apiRequest(`/api/ai/parts-recommendations/${recommendationId}`, "PATCH", {
        appliedToJobCard: true,
        status: "applied",
      });

      queryClient.invalidateQueries({ queryKey: ["/api/ai/parts-recommendations"] });

      toast({
        title: t('smartParts.appliedToJobCard', 'Applied to Job Card'),
        description: t('smartParts.recommendationApplied', 'The parts recommendation has been applied successfully.'),
      });
    } catch (error) {
      toast({
        title: t('common.error', 'Error'),
        description: t('smartParts.failedToApply', 'Failed to apply recommendation. Please try again.'),
        variant: "destructive",
      });
    }
  };

  const filteredRecommendations = recommendations?.filter((rec) => {
    return statusFilter === "all" || rec.status === statusFilter;
  });

  const stats = {
    total: (recommendations?.length || 0) + (smartResults?.length || 0),
    pending: recommendations?.filter((r) => r.status === "pending").length || 0,
    applied: recommendations?.filter((r) => r.appliedToJobCard).length || 0,
    totalValue: (recommendations?.reduce(
      (sum, r) => sum + (parseFloat(String(r.totalEstimatedCost || 0))),
      0
    ) || 0) + (smartResults?.reduce((sum, r) => sum + r.estimatedPrice, 0) || 0),
  };

  const metrics = [
    { label: t('smartParts.totalRecommendations', 'Total Recommendations'), value: stats.total.toString(), icon: Package },
    { label: t('smartParts.pendingReview', 'Pending Review'), value: stats.pending.toString(), icon: Brain },
    { label: t('smartParts.appliedToJobs', 'Applied to Jobs'), value: stats.applied.toString(), icon: CheckCircle },
    { label: t('smartParts.totalValue', 'Total Value'), value: `$${stats.totalValue.toFixed(2)}`, icon: DollarSign },
  ];

  const categoryColors: Record<string, string> = {
    Engine: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
    Brakes: "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
    Climate: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
    Tires: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
    Drivetrain: "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
    Electrical: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
    Suspension: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400",
    "General Maintenance": "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
    General: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  };

  return (
    <DashboardPage
      title={t('smartParts.title', 'Smart Parts Recommendations')}
      description={t('smartParts.description', 'AI-powered parts recommendations with compatibility checking')}
      icon={Package}
      metrics={metrics}
    >
      <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                data-testid="button-generate-recommendation"
              >
                <Brain className="mr-2 h-4 w-4" />
                {t('smartParts.generateRecommendation', 'Generate Recommendation')}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-white dark:bg-salis-black">
              <DialogHeader>
                <DialogTitle className="text-gray-900 dark:text-white">
                  {t('smartParts.generatePartsRecommendation', 'Generate Parts Recommendation')}
                </DialogTitle>
                <DialogDescription>
                  {t('smartParts.aiWillAnalyze', 'AI will analyze compatibility and suggest the best parts for this vehicle.')}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="vehicleMake">{t('smartParts.make', 'Make')}</Label>
                    <Input
                      id="vehicleMake"
                      value={formData.vehicleMake}
                      onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                      placeholder="Toyota"
                      data-testid="input-vehicle-make"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleModel">{t('smartParts.model', 'Model')}</Label>
                    <Input
                      id="vehicleModel"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                      placeholder="Camry"
                      data-testid="input-vehicle-model"
                    />
                  </div>
                  <div>
                    <Label htmlFor="vehicleYear">{t('smartParts.year', 'Year')}</Label>
                    <Input
                      id="vehicleYear"
                      type="number"
                      value={formData.vehicleYear}
                      onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                      placeholder="2020"
                      data-testid="input-vehicle-year"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="serviceType">{t('smartParts.serviceType', 'Service Type')}</Label>
                  <Input
                    id="serviceType"
                    value={formData.serviceType}
                    onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                    placeholder={t('smartParts.brakeService', 'Brake Service')}
                    data-testid="input-service-type"
                  />
                </div>
                <div>
                  <Label htmlFor="description">{t('smartParts.additionalDetails', 'Additional Details (Optional)')}</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder={t('smartParts.specificRequirements', 'Any specific requirements or issues...')}
                    data-testid="input-description"
                    rows={3}
                  />
                </div>
                <Button
                  onClick={handleGenerateRecommendation}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  data-testid="button-submit-generate"
                >
                  {isSubmitting ? "Generating..." : t('smartParts.generateAIRecommendation', 'Generate AI Recommendation')}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

        {/* Smart Recommendations Results */}
        {smartResults && smartResults.length > 0 && (
          <Card className="bg-white dark:bg-salis-black border-blue-200 dark:border-blue-800">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Smart Recommendations ({smartResults.length} parts found)
              </CardTitle>
              <CardDescription>
                AI-generated parts recommendations based on your query
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {smartResults.map((part, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
                    data-testid={`smart-part-${idx}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {part.partName}
                          </h4>
                          <Badge className={categoryColors[part.category] || categoryColors.General}>
                            {part.category}
                          </Badge>
                          {part.inStock ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              <CheckCircle className="h-3 w-3 mr-1" /> In Stock ({part.stockQuantity})
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                              <AlertCircle className="h-3 w-3 mr-1" /> Out of Stock
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Part #: {part.partNumber}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          {part.reason}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          ${part.estimatedPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Confidence</span>
                        <span>{Math.round(part.confidence * 100)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            part.confidence >= 0.8
                              ? "bg-green-500"
                              : part.confidence >= 0.5
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${part.confidence * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Alternatives */}
                    {part.alternatives && part.alternatives.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                          Alternatives:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {part.alternatives.map((alt, altIdx) => (
                            <span
                              key={altIdx}
                              className="inline-flex items-center text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 rounded"
                            >
                              {alt.name} ({alt.partNumber}) - ${alt.price.toFixed(2)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => handleAddToCart(part)}
                        data-testid={`button-add-cart-${idx}`}
                      >
                        <ShoppingCart className="mr-1 h-3 w-3" />
                        Add to Cart
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCreatePO(part)}
                        data-testid={`button-create-po-${idx}`}
                      >
                        <FileText className="mr-1 h-3 w-3" />
                        Create PO
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">{t('common.filter', 'Filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full md:w-64">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                {t('common.status', 'Status')}
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger data-testid="select-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('smartParts.allStatuses', 'All Statuses')}</SelectItem>
                  <SelectItem value="pending">{t('common.pending', 'Pending')}</SelectItem>
                  <SelectItem value="applied">{t('smartParts.applied', 'Applied')}</SelectItem>
                  <SelectItem value="rejected">{t('smartParts.rejected', 'Rejected')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-24 w-full" />
                </CardContent>
              </Card>
            ))
          ) : filteredRecommendations && filteredRecommendations.length > 0 ? (
            filteredRecommendations.map((recommendation) => {
              const parts = Array.isArray(recommendation.recommendedParts)
                ? recommendation.recommendedParts
                : [];

              return (
                <Card
                  key={recommendation.id}
                  className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow"
                  data-testid={`card-recommendation-${recommendation.id}`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-gray-900 dark:text-white mb-2">
                          {t('smartParts.partsRecommendation', 'Parts Recommendation')} #{recommendation.id.slice(0, 8)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-4 flex-wrap">
                          <Badge
                            variant={recommendation.status === "pending" ? "default" : "outline"}
                            className="text-gray-600 dark:text-gray-400"
                          >
                            {recommendation.status}
                          </Badge>
                          {recommendation.confidence && (
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {t('smartParts.confidence', 'Confidence')}: {recommendation.confidence}%
                            </span>
                          )}
                          {recommendation.totalEstimatedCost && (
                            <span className="text-sm font-medium text-blue-600">
                              {t('smartParts.estimatedCost', 'Est. Cost')}: ${parseFloat(String(recommendation.totalEstimatedCost)).toFixed(2)}
                            </span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {recommendation.reasoning && (
                      <div className="flex items-start gap-3">
                        <Brain className="h-5 w-5 text-purple-600 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                            {t('smartParts.aiAnalysis', 'AI Analysis')}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {String(recommendation.reasoning || t('smartParts.noAnalysis', 'No analysis available'))}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Wrench className="h-5 w-5 text-blue-600 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          {t('smartParts.recommendedParts', 'Recommended Parts')} ({parts.length})
                        </p>
                        <div className="space-y-2">
                          {parts.map((part: any, idx: number) => (
                            <div
                              key={idx}
                              className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {part.name || part.partName || `${t('smartParts.part', 'Part')} ${idx + 1}`}
                                  </p>
                                  {part.partNumber && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {t('smartParts.partNumber', 'Part #')}: {part.partNumber}
                                    </p>
                                  )}
                                  {part.compatibility && (
                                    <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                      {part.compatibility}
                                    </p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    ${parseFloat(part.price || part.cost || 0).toFixed(2)}
                                  </p>
                                  {part.quantity && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {t('common.quantity', 'Qty')}: {part.quantity}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      {!recommendation.appliedToJobCard && recommendation.status === "pending" && (
                        <Button
                          onClick={() => handleApplyToJobCard(recommendation.id)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                          size="sm"
                          data-testid={`button-apply-${recommendation.id}`}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          {t('smartParts.applyToJobCard', 'Apply to Job Card')}
                        </Button>
                      )}
                      {recommendation.appliedToJobCard && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          {t('smartParts.appliedToJobCardBadge', 'Applied to Job Card')}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          ) : (
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-gray-400 mb-4" />
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {t('smartParts.noRecommendations', 'No parts recommendations found.')}
                  <br />
                  {t('smartParts.clickGenerate', 'Click "Generate Recommendation" to create AI-powered parts suggestions.')}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
    </DashboardPage>
  );
}
