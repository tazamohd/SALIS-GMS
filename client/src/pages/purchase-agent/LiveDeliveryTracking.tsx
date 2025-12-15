import { useState, useEffect } from "react";
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
  id: number;
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

const mockDeliveries: DeliveryStatus[] = [
  {
    id: 1,
    orderNumber: "PO-2024-001",
    partsDescription: "Front Brake Pads (x4), Rear Brake Pads (x4)",
    supplierName: "AutoParts Plus",
    supplierAddress: "Industrial City, Riyadh",
    destinationGarage: "SALIS AUTO - Main Warehouse",
    destinationAddress: "Industrial City, Building 45, Riyadh",
    storeKeeperName: "Mohammed Al-Rashid",
    storeKeeperPhone: "+966 55 123 4567",
    driverName: "Ahmed Al-Qahtani",
    driverPhone: "+966 55 987 6543",
    driverPhoto: "",
    vehicleNumber: "KSA 1234 ABC",
    currentStage: "in_transit",
    estimatedArrival: "15 mins",
    stages: [
      { stage: "confirmed", label: "Order Confirmed", time: "10:30 AM", completed: true, current: false },
      { stage: "picked_up", label: "Parts Picked Up", time: "11:15 AM", completed: true, current: false },
      { stage: "in_transit", label: "In Transit", time: "11:45 AM", completed: false, current: true },
      { stage: "arriving", label: "Arriving Soon", time: null, completed: false, current: false },
      { stage: "delivered", label: "Delivered to Store Keeper", time: null, completed: false, current: false },
    ],
    liveUpdates: [
      { time: "11:45 AM", message: "Driver has departed from supplier location", type: "info" },
      { time: "11:30 AM", message: "All parts verified and loaded into vehicle", type: "success" },
      { time: "11:15 AM", message: "Driver arrived at AutoParts Plus", type: "info" },
      { time: "10:45 AM", message: "Driver assigned: Ahmed Al-Qahtani", type: "info" },
      { time: "10:30 AM", message: "Delivery order confirmed by supplier", type: "success" },
    ],
  },
  {
    id: 2,
    orderNumber: "PO-2024-002",
    partsDescription: "Universal Oil Filter (x50), BMW Oil Filter (x20)",
    supplierName: "Gulf Auto Supplies",
    supplierAddress: "Industrial Area, Jeddah",
    destinationGarage: "SALIS AUTO - Jeddah Branch",
    destinationAddress: "Port Area, Warehouse 12, Jeddah",
    storeKeeperName: "Khalid Al-Faisal",
    storeKeeperPhone: "+966 55 456 7890",
    driverName: "Omar Al-Hassan",
    driverPhone: "+966 55 321 6549",
    driverPhoto: "",
    vehicleNumber: "KSA 5678 XYZ",
    currentStage: "picked_up",
    estimatedArrival: "45 mins",
    stages: [
      { stage: "confirmed", label: "Order Confirmed", time: "08:00 AM", completed: true, current: false },
      { stage: "picked_up", label: "Parts Picked Up", time: "09:30 AM", completed: false, current: true },
      { stage: "in_transit", label: "In Transit", time: null, completed: false, current: false },
      { stage: "arriving", label: "Arriving Soon", time: null, completed: false, current: false },
      { stage: "delivered", label: "Delivered to Store Keeper", time: null, completed: false, current: false },
    ],
    liveUpdates: [
      { time: "09:30 AM", message: "Driver collecting packages from warehouse", type: "info" },
      { time: "09:00 AM", message: "Driver arrived at Gulf Auto Supplies", type: "info" },
      { time: "08:30 AM", message: "Driver assigned: Omar Al-Hassan", type: "info" },
      { time: "08:00 AM", message: "Delivery order confirmed by supplier", type: "success" },
    ],
  },
  {
    id: 4,
    orderNumber: "PO-2024-004",
    partsDescription: "Premium Tires - Michelin (x8)",
    supplierName: "Premium Parts KSA",
    supplierAddress: "King Abdullah Road, Riyadh",
    destinationGarage: "SALIS AUTO - Main Warehouse",
    destinationAddress: "Industrial City, Building 45, Riyadh",
    storeKeeperName: "Mohammed Al-Rashid",
    storeKeeperPhone: "+966 55 123 4567",
    driverName: "Faisal Al-Otaibi",
    driverPhone: "+966 55 789 0123",
    driverPhoto: "",
    vehicleNumber: "KSA 9012 DEF",
    currentStage: "arriving",
    estimatedArrival: "5 mins",
    stages: [
      { stage: "confirmed", label: "Order Confirmed", time: "07:00 AM", completed: true, current: false },
      { stage: "picked_up", label: "Parts Picked Up", time: "08:00 AM", completed: true, current: false },
      { stage: "in_transit", label: "In Transit", time: "08:30 AM", completed: true, current: false },
      { stage: "arriving", label: "Arriving Soon", time: "10:55 AM", completed: false, current: true },
      { stage: "delivered", label: "Delivered to Store Keeper", time: null, completed: false, current: false },
    ],
    liveUpdates: [
      { time: "10:55 AM", message: "Driver is 5 minutes away from destination", type: "info" },
      { time: "10:30 AM", message: "Driver taking exit to Industrial City", type: "info" },
      { time: "08:30 AM", message: "Driver has departed for destination", type: "info" },
      { time: "08:00 AM", message: "All tires loaded and secured", type: "success" },
      { time: "07:00 AM", message: "Delivery order confirmed by supplier", type: "success" },
    ],
  },
];

export default function LiveDeliveryTracking() {
  const params = useParams<{ id: string }>();
  const deliveryId = parseInt(params.id || "1", 10);
  const foundDelivery = mockDeliveries.find(d => d.id === deliveryId) || mockDeliveries[0];
  const [delivery, setDelivery] = useState<DeliveryStatus>(foundDelivery);
  const [progress, setProgress] = useState(50);
  const [lastUpdate, setLastUpdate] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const completedStages = delivery.stages.filter(s => s.completed).length;
    const currentStageIndex = delivery.stages.findIndex(s => s.current);
    const totalStages = delivery.stages.length;
    const calculatedProgress = ((completedStages + (currentStageIndex >= 0 ? 0.5 : 0)) / totalStages) * 100;
    setProgress(calculatedProgress);
  }, [delivery]);

  const getStageIcon = (stage: DeliveryStage, completed: boolean, current: boolean) => {
    const iconClass = completed 
      ? "h-6 w-6 text-green-500" 
      : current 
        ? "h-6 w-6 text-blue-500 animate-pulse" 
        : "h-6 w-6 text-gray-400";
    
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
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Truck className="h-6 w-6" />
              Live Delivery Tracking
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Order {delivery.orderNumber}
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={handleRefresh} data-testid="button-refresh">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="border-2 border-blue-200 dark:border-blue-800" data-testid="card-eta">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Timer className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Estimated Arrival</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{delivery.estimatedArrival}</p>
              </div>
            </div>
            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 text-lg px-4 py-2">
              {delivery.stages.find(s => s.current)?.label || "Processing"}
            </Badge>
          </div>
          <div className="mt-4">
            <Progress value={progress} className="h-3" />
            <p className="text-xs text-gray-500 mt-2 text-right">Last updated: {lastUpdate}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card data-testid="card-delivery-stages">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Delivery Progress
              </CardTitle>
              <CardDescription>Track your delivery in real-time</CardDescription>
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
                            : "bg-gray-100 dark:bg-gray-800"
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
                              ? "text-blue-600 dark:text-blue-400" 
                              : "text-gray-500"
                        }`}>
                          {stage.label}
                        </h3>
                        {stage.time && (
                          <span className="text-sm text-gray-500">{stage.time}</span>
                        )}
                      </div>
                      {stage.current && (
                        <p className="text-sm text-blue-600 dark:text-blue-400 mt-1 animate-pulse">
                          In progress...
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-live-updates">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Live Updates
              </CardTitle>
              <CardDescription>Real-time delivery status updates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {delivery.liveUpdates.map((update, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                    data-testid={`update-${index}`}
                  >
                    {getUpdateIcon(update.type)}
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 dark:text-white">{update.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{update.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card data-testid="card-driver-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Driver Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={delivery.driverPhoto} />
                  <AvatarFallback className="bg-blue-100 text-blue-600 text-xl">
                    {delivery.driverName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{delivery.driverName}</p>
                  <p className="text-sm text-gray-500">Vehicle: {delivery.vehicleNumber}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" variant="outline" data-testid="button-call-driver">
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </Button>
                <Button className="flex-1" variant="outline" data-testid="button-message-driver">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-order-details">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Parts Being Delivered</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{delivery.partsDescription}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-1">From</p>
                <div className="flex items-start gap-2">
                  <Building2 className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{delivery.supplierName}</p>
                    <p className="text-sm text-gray-500">{delivery.supplierAddress}</p>
                  </div>
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-gray-500 mb-1">To</p>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{delivery.destinationGarage}</p>
                    <p className="text-sm text-gray-500">{delivery.destinationAddress}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="card-storekeeper-info">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5" />
                Store Keeper
              </CardTitle>
              <CardDescription>Receiving the delivery</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-green-100 text-green-600">
                    {delivery.storeKeeperName.split(" ").map(n => n[0]).join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">{delivery.storeKeeperName}</p>
                  <p className="text-sm text-gray-500">{delivery.storeKeeperPhone}</p>
                </div>
              </div>
              <Button className="w-full mt-4" variant="outline" data-testid="button-notify-storekeeper">
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
