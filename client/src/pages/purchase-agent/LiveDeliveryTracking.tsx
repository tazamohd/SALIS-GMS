import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Package,
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Phone,
  MessageSquare,
  Navigation,
  Building2,
  User,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
  PackageCheck,
  Timer,
} from "lucide-react";
import { Link, useParams } from "wouter";

type DeliveryStage = "confirmed" | "picked_up" | "in_transit" | "arriving" | "delivered";

interface DeliveryStatus {
  id: string;
  deliveryId: string;
  orderNumber: string;
  partsDescription: string;
  supplierName: string;
  supplierAddress: string;
  destinationGarage: string;
  destinationAddress: string;
  storeKeeperName: string;
  storeKeeperPhone: string;
  driverName: string;
  driverPhone: string;
  driverPhoto: string;
  vehicleNumber: string;
  currentStage: DeliveryStage;
  estimatedArrival: string;
  stages: {
    stage: DeliveryStage;
    label: string;
    time: string | null;
    completed: boolean;
    current: boolean;
  }[];
  liveUpdates: {
    time: string;
    message: string;
    type: "info" | "success" | "warning";
  }[];
}

export default function LiveDeliveryTracking() {
  const params = useParams<{ id: string }>();
  const deliveryId = params.id || "1";

  const { data: delivery, isLoading } = useQuery<DeliveryStatus>({
    queryKey: ["/api/deliveries", deliveryId, "live"],
    enabled: !!deliveryId,
  });

  const [progress, setProgress] = useState(50);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    if (delivery) {
      const completedStages = delivery.stages.filter(s => s.completed).length;
      const currentStageIndex = delivery.stages.findIndex(s => s.current);
      const totalStages = delivery.stages.length;
      const calculatedProgress = ((completedStages + (currentStageIndex >= 0 ? 0.5 : 0)) / totalStages) * 100;
      setProgress(calculatedProgress);
    }
  }, [delivery]);

  const getStageIcon = (stage: DeliveryStage, completed: boolean, current: boolean) => {
    const iconClass = completed 
      ? "h-6 w-6 text-green-500" 
      : current 
        ? "h-6 w-6 text-[#0A5ED7] animate-pulse" 
        : "h-6 w-6 text-[#64748B]";
    
    switch (stage) {
      case "confirmed":
        return <CheckCircle className={iconClass} />;
      case "picked_up":
        return <Package className={iconClass} />;
      case "in_transit":
        return <Truck className={iconClass} />;
      case "arriving":
        return <Navigation className={iconClass} />;
      case "delivered":
        return <PackageCheck className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const handleRefresh = () => {
    setLastUpdate(new Date().toLocaleTimeString());
  };

  const getUpdateIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-[#F97316]" />;
      default:
        return <Clock className="h-4 w-4 text-[#0A5ED7]" />;
    }
  };

  if (isLoading || !delivery) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 text-[#0A5ED7] animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/purchase-agent/delivery">
            <Button variant="ghost" size="icon" data-testid="button-back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <Truck className="h-6 w-6 text-[#0A5ED7]" />
              Live Delivery Tracking
            </h1>
            <p className="text-[#64748B]">
              Order {delivery.orderNumber}
            </p>
          </div>
        </div>
        <Button variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" onClick={handleRefresh} data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-2 border-[#0A5ED7] dark:border-[#0A5ED7]" data-testid="card-eta">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Timer className="h-8 w-8 text-[#0A5ED7]" />
              </div>
              <div>
                <p className="text-sm text-[#64748B]">Estimated Arrival</p>
                <p className="text-3xl font-bold text-[#0A5ED7]">{delivery.estimatedArrival}</p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-[#0A5ED7] dark:bg-blue-900/30 text-lg px-4 py-2">
              {delivery.stages.find(s => s.current)?.label || "Processing"}
            </Badge>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-[#64748B] mt-2 text-right">Last updated: {lastUpdate}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-delivery-stages">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Navigation className="h-5 w-5 text-[#0A5ED7]" />
                Delivery Progress
              </CardTitle>
              <CardDescription className="text-[#64748B]">Track your delivery in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {delivery.stages.map((stage, index) => (
                  <div key={stage.stage} className="flex items-start mb-8 last:mb-0" data-testid={`stage-${stage.stage}`}>
                    <div className="relative flex flex-col items-center mr-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        stage.completed 
                          ? "bg-green-100 dark:bg-green-900/30" 
                          : stage.current 
                            ? "bg-blue-100 dark:bg-blue-900/30 ring-4 ring-blue-200 dark:ring-blue-800" 
                            : "bg-[#F8FAFC] dark:bg-[#0E1117]"
                      }`}>
                        {getStageIcon(stage.stage, stage.completed, stage.current)}
                      </div>
                      {index < delivery.stages.length - 1 && (
                        <div className={`absolute top-12 w-0.5 h-16 ${
                          stage.completed ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"
                        }`} />
                      )}
                    </div>
                    <div className="flex-1 pt-2">
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold ${
                          stage.completed 
                            ? "text-green-600 dark:text-green-400" 
                            : stage.current 
                              ? "text-[#0A5ED7]" 
                              : "text-[#64748B]"
                        }`}>
                          {stage.label}
                        </h3>
                        {stage.time && (
                          <span className="text-sm text-[#64748B]">{stage.time}</span>
                        )}
                      </div>
                      {stage.current && (
                        <p className="text-sm text-[#0A5ED7] mt-1 animate-pulse">
                          In progress...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-live-updates">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <RefreshCw className="h-5 w-5 text-[#0A5ED7]" />
                Live Updates
              </CardTitle>
              <CardDescription className="text-[#64748B]">Real-time delivery status updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {delivery.liveUpdates.map((update, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                    data-testid={`update-${index}`}
                  >
                    {getUpdateIcon(update.type)}
                    <div className="flex-1">
                      <p className="text-sm text-[#0B1F3B] dark:text-white">{update.message}</p>
                      <p className="text-xs text-[#64748B] mt-1">{update.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-driver-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <User className="h-5 w-5 text-[#0A5ED7]" />
                Driver Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={delivery.driverPhoto} />
                  <AvatarFallback className="bg-blue-100 text-[#0A5ED7] text-xl">
                    {delivery.driverName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[#0B1F3B] dark:text-white">{delivery.driverName}</p>
                  <p className="text-sm text-[#64748B]">Vehicle: {delivery.vehicleNumber}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 border-[#E2E8F0] dark:border-[#232A36]" variant="outline" data-testid="button-call-driver">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button className="flex-1 border-[#E2E8F0] dark:border-[#232A36]" variant="outline" data-testid="button-message-driver">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-order-details">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Package className="h-5 w-5 text-[#0A5ED7]" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-[#64748B] mb-1">Parts Being Delivered</p>
                <p className="text-sm font-medium text-[#0B1F3B] dark:text-white">{delivery.partsDescription}</p>
              </div>
              <Separator className="bg-[#E2E8F0] dark:bg-[#232A36]" />
              <div>
                <p className="text-sm text-[#64748B] mb-1">From</p>
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-[#64748B] mt-0.5" />
                  <div>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">{delivery.supplierName}</p>
                    <p className="text-sm text-[#64748B]">{delivery.supplierAddress}</p>
                  </div>
                </div>
              </div>
              <Separator className="bg-[#E2E8F0] dark:bg-[#232A36]" />
              <div>
                <p className="text-sm text-[#64748B] mb-1">To</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">{delivery.destinationGarage}</p>
                    <p className="text-sm text-[#64748B]">{delivery.destinationAddress}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-storekeeper-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <PackageCheck className="h-5 w-5 text-[#0A5ED7]" />
                Store Keeper
              </CardTitle>
              <CardDescription className="text-[#64748B]">Receiving the delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-green-100 text-green-600">
                    {delivery.storeKeeperName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-[#0B1F3B] dark:text-white">{delivery.storeKeeperName}</p>
                  <p className="text-sm text-[#64748B]">{delivery.storeKeeperPhone}</p>
                </div>
              </div>
              <Button className="w-full mt-4 border-[#E2E8F0] dark:border-[#232A36]" variant="outline" data-testid="button-notify-storekeeper">
                <Phone className="h-4 w-4 mr-2" />
                Notify Store Keeper
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
