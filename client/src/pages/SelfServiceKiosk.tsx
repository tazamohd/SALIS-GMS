import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  TabletSmartphone,
  User,
  Car,
  Clock,
  CheckCircle,
  ArrowLeft,
  Phone,
  Loader2,
  Users,
  Timer,
  Wrench,
  AlertCircle,
  CircleDot,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface KioskTicket {
  ticketId: string;
  ticketNumber: string;
  customerName: string;
  vehiclePlate: string;
  vehicleInfo: string;
  serviceType: string;
  status: "waiting" | "in-progress" | "completed" | "cancelled";
  position: number;
  estimatedWaitMinutes: number;
  type: "appointment" | "walk-in";
  createdAt: string;
}

interface KioskService {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  estimatedDurationMinutes: number;
  priceRange: string;
  priceRangeMin: number;
  priceRangeMax: number;
  currency: string;
  popular: boolean;
}

interface QueueSummary {
  inProgress: number;
  waiting: number;
  completedToday: number;
  totalInQueue: number;
  averageWaitMinutes: number;
}

type Screen =
  | "welcome"
  | "checkin-input"
  | "checkin-result"
  | "walkin-form"
  | "walkin-service"
  | "ticket-issued"
  | "queue-display"
  | "status-check";

// ─── Component ────────────────────────────────────────────────────────────────

export default function SelfServiceKiosk() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [lookupType, setLookupType] = useState<"phone" | "plate">("phone");
  const [inputValue, setInputValue] = useState("");
  const [currentTicket, setCurrentTicket] = useState<KioskTicket | null>(null);
  const [walkInData, setWalkInData] = useState({
    name: "",
    phone: "",
    vehiclePlate: "",
    vehicleInfo: "",
    serviceType: "",
  });
  const [statusTicketId, setStatusTicketId] = useState("");
  const { toast } = useToast();

  // Auto-return to welcome screen after inactivity
  useEffect(() => {
    if (screen === "welcome") return;
    const timer = setTimeout(() => {
      resetAll();
    }, 120000); // 2 minutes
    return () => clearTimeout(timer);
  }, [screen]);

  const resetAll = useCallback(() => {
    setScreen("welcome");
    setInputValue("");
    setCurrentTicket(null);
    setWalkInData({ name: "", phone: "", vehiclePlate: "", vehicleInfo: "", serviceType: "" });
    setStatusTicketId("");
  }, []);

  // ─── Queries ──────────────────────────────────────────────────────────

  const { data: queueData } = useQuery<{ queue: KioskTicket[]; summary: QueueSummary }>({
    queryKey: ["/api/kiosk/queue"],
    refetchInterval: 15000,
  });

  const { data: servicesData } = useQuery<{ services: KioskService[]; categories: string[] }>({
    queryKey: ["/api/kiosk/services"],
  });

  // ─── Mutations ────────────────────────────────────────────────────────

  const checkInMutation = useMutation({
    mutationFn: async (payload: { phone?: string; plateNumber?: string }) => {
      const res = await apiRequest("POST", "/api/kiosk/check-in", payload);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success && (data.found || data.alreadyCheckedIn)) {
        setCurrentTicket(data.ticket);
        setScreen("checkin-result");
        queryClient.invalidateQueries({ queryKey: ["/api/kiosk/queue"] });
      } else {
        toast({
          title: "Not Found",
          description: data.message || "No appointment found for this information.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Check-in failed. Please try again.", variant: "destructive" });
    },
  });

  const walkInMutation = useMutation({
    mutationFn: async (payload: typeof walkInData) => {
      const res = await apiRequest("POST", "/api/kiosk/walk-in", payload);
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setCurrentTicket(data.ticket);
        setScreen("ticket-issued");
        queryClient.invalidateQueries({ queryKey: ["/api/kiosk/queue"] });
      } else {
        toast({
          title: "Error",
          description: data.message || "Registration failed.",
          variant: "destructive",
        });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Walk-in registration failed.", variant: "destructive" });
    },
  });

  const statusQuery = useQuery<{ success: boolean; ticket: KioskTicket; message: string }>({
    queryKey: ["/api/kiosk/status", statusTicketId],
    enabled: screen === "status-check" && statusTicketId.length > 0,
    refetchInterval: screen === "status-check" ? 10000 : false,
  });

  // ─── Keypad Handler ──────────────────────────────────────────────────

  const handleKeypadPress = (key: string) => {
    if (key === "DEL") {
      setInputValue((prev) => prev.slice(0, -1));
    } else if (key === "CLR") {
      setInputValue("");
    } else {
      setInputValue((prev) => prev + key);
    }
  };

  const handleCheckIn = () => {
    if (!inputValue.trim()) return;
    if (lookupType === "phone") {
      checkInMutation.mutate({ phone: inputValue.trim() });
    } else {
      checkInMutation.mutate({ plateNumber: inputValue.trim() });
    }
  };

  const handleWalkInSubmit = () => {
    if (!walkInData.name || !walkInData.phone || !walkInData.vehiclePlate || !walkInData.serviceType) {
      toast({ title: "Missing Info", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    walkInMutation.mutate(walkInData);
  };

  const summary = queueData?.summary;

  // ─── Render ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col select-none">
      {/* Header */}
      <div className="bg-white border-b shadow-sm px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TabletSmartphone className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Self-Service Kiosk</h1>
        </div>
        <div className="flex items-center gap-4">
          {summary && (
            <div className="flex items-center gap-2 text-lg text-gray-600">
              <Users className="h-5 w-5" />
              <span className="font-semibold">{summary.totalInQueue}</span>
              <span>in queue</span>
            </div>
          )}
          {screen !== "welcome" && (
            <Button
              variant="outline"
              size="lg"
              className="h-12 px-6 text-lg"
              onClick={resetAll}
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Start Over
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex items-center justify-center p-6">
        {/* ── Welcome Screen ─────────────────────────────────── */}
        {screen === "welcome" && (
          <div className="w-full max-w-4xl space-y-8">
            <div className="text-center space-y-4">
              <h2 className="text-5xl font-bold text-gray-900">Welcome</h2>
              <p className="text-2xl text-gray-500">How can we help you today?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Check-In Button */}
              <button
                onClick={() => setScreen("checkin-input")}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl p-10 flex flex-col items-center gap-6 transition-all shadow-lg hover:shadow-xl min-h-[250px] justify-center"
              >
                <CheckCircle className="h-20 w-20" />
                <span className="text-3xl font-bold">Check In</span>
                <span className="text-xl opacity-80">I have an appointment</span>
              </button>

              {/* Walk-In Button */}
              <button
                onClick={() => setScreen("walkin-form")}
                className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-2xl p-10 flex flex-col items-center gap-6 transition-all shadow-lg hover:shadow-xl min-h-[250px] justify-center"
              >
                <Car className="h-20 w-20" />
                <span className="text-3xl font-bold">Walk In</span>
                <span className="text-xl opacity-80">No appointment needed</span>
              </button>
            </div>

            {/* Queue & Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => setScreen("queue-display")}
                className="bg-white hover:bg-gray-50 active:bg-gray-100 border-2 border-gray-200 rounded-2xl p-8 flex items-center gap-6 transition-all shadow min-h-[100px]"
              >
                <Users className="h-12 w-12 text-blue-600" />
                <div className="text-left">
                  <span className="text-2xl font-bold text-gray-900 block">View Queue</span>
                  <span className="text-lg text-gray-500">
                    {summary ? `${summary.totalInQueue} customers waiting` : "See current wait times"}
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  setScreen("status-check");
                  setStatusTicketId("");
                }}
                className="bg-white hover:bg-gray-50 active:bg-gray-100 border-2 border-gray-200 rounded-2xl p-8 flex items-center gap-6 transition-all shadow min-h-[100px]"
              >
                <Clock className="h-12 w-12 text-orange-500" />
                <div className="text-left">
                  <span className="text-2xl font-bold text-gray-900 block">Check Status</span>
                  <span className="text-lg text-gray-500">Look up your ticket</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Check-In Input Screen ──────────────────────────── */}
        {screen === "checkin-input" && (
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold text-gray-900">Check In</h2>
              <p className="text-xl text-gray-500">Enter your phone number or plate number</p>
            </div>

            {/* Toggle Phone / Plate */}
            <div className="flex gap-4 justify-center">
              <Button
                variant={lookupType === "phone" ? "default" : "outline"}
                size="lg"
                className="h-16 px-8 text-xl"
                onClick={() => { setLookupType("phone"); setInputValue(""); }}
              >
                <Phone className="h-6 w-6 mr-3" />
                Phone Number
              </Button>
              <Button
                variant={lookupType === "plate" ? "default" : "outline"}
                size="lg"
                className="h-16 px-8 text-xl"
                onClick={() => { setLookupType("plate"); setInputValue(""); }}
              >
                <Car className="h-6 w-6 mr-3" />
                Plate Number
              </Button>
            </div>

            {/* Input Display */}
            <div className="bg-white rounded-xl border-2 border-gray-300 p-6 text-center">
              <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">
                {lookupType === "phone" ? "Phone Number" : "Plate Number"}
              </p>
              <p className="text-4xl font-mono font-bold text-gray-900 min-h-[3rem] tracking-wider">
                {inputValue || (lookupType === "phone" ? "05XXXXXXXX" : "ABC 1234")}
              </p>
            </div>

            {/* Keypad */}
            <div className="grid grid-cols-3 gap-3 max-w-md mx-auto">
              {(lookupType === "phone"
                ? ["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "DEL"]
                : ["1", "2", "3", "4", "5", "6", "7", "8", "9", "CLR", "0", "DEL"]
              ).map((key) => (
                <button
                  key={key}
                  onClick={() => handleKeypadPress(key)}
                  className={`h-16 rounded-xl text-2xl font-bold transition-all active:scale-95 ${
                    key === "DEL"
                      ? "bg-red-100 text-red-600 hover:bg-red-200"
                      : key === "CLR"
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      : "bg-white border-2 border-gray-200 text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  {key}
                </button>
              ))}
            </div>

            {/* Letter keys for plate number */}
            {lookupType === "plate" && (
              <div className="grid grid-cols-7 gap-2 max-w-lg mx-auto">
                {["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," "].map((key) => (
                  <button
                    key={key === " " ? "SPACE" : key}
                    onClick={() => handleKeypadPress(key)}
                    className="h-12 rounded-lg text-lg font-bold bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 active:scale-95 transition-all"
                  >
                    {key === " " ? "___" : key}
                  </button>
                ))}
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleCheckIn}
              disabled={!inputValue.trim() || checkInMutation.isPending}
              className="w-full h-16 text-2xl font-bold bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {checkInMutation.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin mr-3" />
              ) : (
                <CheckCircle className="h-6 w-6 mr-3" />
              )}
              Check In
            </Button>
          </div>
        )}

        {/* ── Check-In Result Screen ─────────────────────────── */}
        {screen === "checkin-result" && currentTicket && (
          <div className="w-full max-w-2xl space-y-8 text-center">
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-10 space-y-6">
              <CheckCircle className="h-24 w-24 text-green-500 mx-auto" />
              <h2 className="text-4xl font-bold text-green-800">Checked In!</h2>
              <p className="text-2xl text-green-700">
                Welcome, {currentTicket.customerName}
              </p>
            </div>

            <Card className="text-left">
              <CardContent className="p-8 space-y-4">
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-xl text-gray-500">Ticket Number</span>
                  <span className="text-3xl font-bold text-blue-600">{currentTicket.ticketNumber}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-xl text-gray-500">Vehicle</span>
                  <span className="text-xl font-semibold">{currentTicket.vehiclePlate}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-xl text-gray-500">Service</span>
                  <span className="text-xl font-semibold">{currentTicket.serviceType}</span>
                </div>
                <div className="flex justify-between items-center border-b pb-4">
                  <span className="text-xl text-gray-500">Position in Queue</span>
                  <span className="text-3xl font-bold text-orange-500">#{currentTicket.position}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl text-gray-500">Estimated Wait</span>
                  <span className="text-2xl font-bold text-gray-900">
                    ~{currentTicket.estimatedWaitMinutes} min
                  </span>
                </div>
              </CardContent>
            </Card>

            <p className="text-xl text-gray-500">
              Please have a seat in the waiting area. We will call your number.
            </p>

            <Button onClick={resetAll} className="h-16 px-12 text-xl" size="lg">
              Done
            </Button>
          </div>
        )}

        {/* ── Walk-In Form Screen ────────────────────────────── */}
        {screen === "walkin-form" && (
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold text-gray-900">Walk-In Registration</h2>
              <p className="text-xl text-gray-500">Please enter your information</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="text-lg font-semibold text-gray-700 mb-2 block">
                  <User className="inline h-5 w-5 mr-2" />
                  Full Name *
                </label>
                <Input
                  value={walkInData.name}
                  onChange={(e) => setWalkInData({ ...walkInData, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="h-16 text-xl px-6 rounded-xl"
                />
              </div>

              <div>
                <label className="text-lg font-semibold text-gray-700 mb-2 block">
                  <Phone className="inline h-5 w-5 mr-2" />
                  Phone Number *
                </label>
                <Input
                  value={walkInData.phone}
                  onChange={(e) => setWalkInData({ ...walkInData, phone: e.target.value })}
                  placeholder="05XXXXXXXX"
                  className="h-16 text-xl px-6 rounded-xl"
                  type="tel"
                />
              </div>

              <div>
                <label className="text-lg font-semibold text-gray-700 mb-2 block">
                  <Car className="inline h-5 w-5 mr-2" />
                  Vehicle Plate Number *
                </label>
                <Input
                  value={walkInData.vehiclePlate}
                  onChange={(e) => setWalkInData({ ...walkInData, vehiclePlate: e.target.value })}
                  placeholder="ABC 1234"
                  className="h-16 text-xl px-6 rounded-xl"
                />
              </div>

              <div>
                <label className="text-lg font-semibold text-gray-700 mb-2 block">
                  <Car className="inline h-5 w-5 mr-2" />
                  Vehicle Info (optional)
                </label>
                <Input
                  value={walkInData.vehicleInfo}
                  onChange={(e) => setWalkInData({ ...walkInData, vehicleInfo: e.target.value })}
                  placeholder="e.g. 2023 Toyota Camry"
                  className="h-16 text-xl px-6 rounded-xl"
                />
              </div>
            </div>

            <Button
              onClick={() => setScreen("walkin-service")}
              disabled={!walkInData.name || !walkInData.phone || !walkInData.vehiclePlate}
              className="w-full h-16 text-2xl font-bold bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              Next: Select Service
            </Button>
          </div>
        )}

        {/* ── Walk-In Service Selection ──────────────────────── */}
        {screen === "walkin-service" && (
          <div className="w-full max-w-4xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold text-gray-900">Select Service</h2>
              <p className="text-xl text-gray-500">What service do you need today?</p>
            </div>

            {/* Popular Services */}
            {servicesData?.services && (
              <>
                <p className="text-lg font-semibold text-gray-600">Popular Services</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicesData.services
                    .filter((s) => s.popular)
                    .map((svc) => (
                      <button
                        key={svc.id}
                        onClick={() => setWalkInData({ ...walkInData, serviceType: svc.name })}
                        className={`p-6 rounded-xl border-2 text-left transition-all active:scale-[0.98] min-h-[100px] ${
                          walkInData.serviceType === svc.name
                            ? "border-emerald-500 bg-emerald-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xl font-bold text-gray-900">{svc.name}</p>
                            <p className="text-lg text-gray-500 mt-1">{svc.nameAr}</p>
                          </div>
                          {walkInData.serviceType === svc.name && (
                            <CheckCircle className="h-7 w-7 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex gap-4 mt-3 text-base text-gray-500">
                          <span className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            ~{svc.estimatedDurationMinutes} min
                          </span>
                          <span className="flex items-center gap-1">
                            <span>{svc.priceRange}</span>
                          </span>
                        </div>
                      </button>
                    ))}
                </div>

                <p className="text-lg font-semibold text-gray-600 mt-6">All Services</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {servicesData.services
                    .filter((s) => !s.popular)
                    .map((svc) => (
                      <button
                        key={svc.id}
                        onClick={() => setWalkInData({ ...walkInData, serviceType: svc.name })}
                        className={`p-6 rounded-xl border-2 text-left transition-all active:scale-[0.98] min-h-[100px] ${
                          walkInData.serviceType === svc.name
                            ? "border-emerald-500 bg-emerald-50 shadow-md"
                            : "border-gray-200 bg-white hover:border-gray-300 hover:shadow"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-xl font-bold text-gray-900">{svc.name}</p>
                            <p className="text-lg text-gray-500 mt-1">{svc.nameAr}</p>
                          </div>
                          {walkInData.serviceType === svc.name && (
                            <CheckCircle className="h-7 w-7 text-emerald-500 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex gap-4 mt-3 text-base text-gray-500">
                          <span className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            ~{svc.estimatedDurationMinutes} min
                          </span>
                          <span>{svc.priceRange}</span>
                        </div>
                      </button>
                    ))}
                </div>
              </>
            )}

            <Button
              onClick={handleWalkInSubmit}
              disabled={!walkInData.serviceType || walkInMutation.isPending}
              className="w-full h-16 text-2xl font-bold bg-emerald-600 hover:bg-emerald-700"
              size="lg"
            >
              {walkInMutation.isPending ? (
                <Loader2 className="h-6 w-6 animate-spin mr-3" />
              ) : (
                <CheckCircle className="h-6 w-6 mr-3" />
              )}
              Confirm & Get Ticket
            </Button>
          </div>
        )}

        {/* ── Ticket Issued Screen ───────────────────────────── */}
        {screen === "ticket-issued" && currentTicket && (
          <div className="w-full max-w-2xl space-y-8 text-center">
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-10 space-y-6">
              <CheckCircle className="h-24 w-24 text-emerald-500 mx-auto" />
              <h2 className="text-4xl font-bold text-emerald-800">You're All Set!</h2>
            </div>

            <Card>
              <CardContent className="p-10 space-y-6">
                <div className="text-center">
                  <p className="text-lg text-gray-500 mb-2">Your Ticket Number</p>
                  <p className="text-6xl font-bold text-blue-600 tracking-wider">
                    {currentTicket.ticketNumber}
                  </p>
                </div>

                <div className="border-t pt-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl text-gray-500">Name</span>
                    <span className="text-xl font-semibold">{currentTicket.customerName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl text-gray-500">Vehicle</span>
                    <span className="text-xl font-semibold">{currentTicket.vehiclePlate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl text-gray-500">Service</span>
                    <span className="text-xl font-semibold">{currentTicket.serviceType}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl text-gray-500">Position</span>
                    <span className="text-3xl font-bold text-orange-500">#{currentTicket.position}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xl text-gray-500">Est. Wait</span>
                    <span className="text-2xl font-bold">{currentTicket.estimatedWaitMinutes} min</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-xl text-gray-500">
              Please have a seat. Your number will be called when it's your turn.
            </p>

            <Button onClick={resetAll} className="h-16 px-12 text-xl" size="lg">
              Done
            </Button>
          </div>
        )}

        {/* ── Queue Display Screen ───────────────────────────── */}
        {screen === "queue-display" && (
          <div className="w-full max-w-4xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold text-gray-900">Service Queue</h2>
              <p className="text-xl text-gray-500">Current wait times and positions</p>
            </div>

            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6 text-center">
                    <Wrench className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                    <p className="text-4xl font-bold text-blue-600">{summary.inProgress}</p>
                    <p className="text-lg text-gray-500">In Progress</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <Clock className="h-8 w-8 text-orange-500 mx-auto mb-2" />
                    <p className="text-4xl font-bold text-orange-600">{summary.waiting}</p>
                    <p className="text-lg text-gray-500">Waiting</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    <p className="text-4xl font-bold text-green-600">{summary.completedToday}</p>
                    <p className="text-lg text-gray-500">Completed</p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Queue List */}
            <div className="space-y-3">
              {queueData?.queue?.map((ticket) => (
                <Card
                  key={ticket.ticketId}
                  className={`transition-all ${
                    ticket.status === "in-progress"
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <CardContent className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-center min-w-[80px]">
                        <p className="text-2xl font-bold text-gray-900">{ticket.ticketNumber}</p>
                        <Badge
                          variant={ticket.status === "in-progress" ? "default" : "secondary"}
                          className="text-sm mt-1"
                        >
                          {ticket.status === "in-progress" ? "In Progress" : `#${ticket.position}`}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-xl font-semibold text-gray-900">{ticket.customerName}</p>
                        <p className="text-lg text-gray-500">{ticket.serviceType}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {ticket.status === "in-progress" ? (
                        <div className="flex items-center gap-2 text-blue-600">
                          <CircleDot className="h-5 w-5 animate-pulse" />
                          <span className="text-xl font-semibold">Now Serving</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-2xl font-bold text-orange-500">
                            ~{ticket.estimatedWaitMinutes} min
                          </p>
                          <p className="text-base text-gray-400">estimated wait</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}

              {(!queueData?.queue || queueData.queue.length === 0) && (
                <div className="text-center py-16">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-2xl text-gray-400">No one in queue</p>
                  <p className="text-lg text-gray-400 mt-2">Walk in or check in to get started</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Status Check Screen ────────────────────────────── */}
        {screen === "status-check" && (
          <div className="w-full max-w-2xl space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-4xl font-bold text-gray-900">Check Job Status</h2>
              <p className="text-xl text-gray-500">Enter your ticket number</p>
            </div>

            <div className="flex gap-4">
              <Input
                value={statusTicketId}
                onChange={(e) => setStatusTicketId(e.target.value.toUpperCase())}
                placeholder="e.g. Q-1001"
                className="h-16 text-2xl px-6 rounded-xl font-mono text-center tracking-wider"
              />
            </div>

            {statusQuery.data?.success && statusQuery.data.ticket && (
              <Card className="border-2">
                <CardContent className="p-8 space-y-5">
                  <div className="text-center mb-4">
                    {statusQuery.data.ticket.status === "waiting" && (
                      <div className="inline-flex items-center gap-3 bg-orange-50 text-orange-700 px-6 py-3 rounded-full">
                        <Clock className="h-6 w-6" />
                        <span className="text-xl font-bold">Waiting - Position #{statusQuery.data.ticket.position}</span>
                      </div>
                    )}
                    {statusQuery.data.ticket.status === "in-progress" && (
                      <div className="inline-flex items-center gap-3 bg-blue-50 text-blue-700 px-6 py-3 rounded-full">
                        <CircleDot className="h-6 w-6 animate-pulse" />
                        <span className="text-xl font-bold">In Progress</span>
                      </div>
                    )}
                    {statusQuery.data.ticket.status === "completed" && (
                      <div className="inline-flex items-center gap-3 bg-green-50 text-green-700 px-6 py-3 rounded-full">
                        <CheckCircle className="h-6 w-6" />
                        <span className="text-xl font-bold">Completed</span>
                      </div>
                    )}
                    {statusQuery.data.ticket.status === "cancelled" && (
                      <div className="inline-flex items-center gap-3 bg-red-50 text-red-700 px-6 py-3 rounded-full">
                        <AlertCircle className="h-6 w-6" />
                        <span className="text-xl font-bold">Cancelled</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 text-lg">
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-500">Ticket</span>
                      <span className="font-bold text-2xl">{statusQuery.data.ticket.ticketNumber}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-500">Customer</span>
                      <span className="font-semibold">{statusQuery.data.ticket.customerName}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-500">Vehicle</span>
                      <span className="font-semibold">{statusQuery.data.ticket.vehiclePlate}</span>
                    </div>
                    <div className="flex justify-between border-b pb-3">
                      <span className="text-gray-500">Service</span>
                      <span className="font-semibold">{statusQuery.data.ticket.serviceType}</span>
                    </div>
                    {statusQuery.data.ticket.status === "waiting" && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Est. Wait</span>
                        <span className="font-bold text-2xl text-orange-500">
                          ~{statusQuery.data.ticket.estimatedWaitMinutes} min
                        </span>
                      </div>
                    )}
                  </div>

                  <p className="text-center text-lg text-gray-500 pt-4">
                    {statusQuery.data.message}
                  </p>
                </CardContent>
              </Card>
            )}

            {statusQuery.isError && statusTicketId && (
              <div className="text-center py-10">
                <AlertCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-2xl text-gray-400">Ticket not found</p>
                <p className="text-lg text-gray-400 mt-2">Please check your ticket number and try again</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
