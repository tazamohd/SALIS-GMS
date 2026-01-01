import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import {
  LogIn,
  LogOut,
  MapPin,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Navigation,
  Building2,
  Wifi,
  WifiOff,
} from "lucide-react";
import { format } from "date-fns";

interface AttendanceRecord {
  id: number;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  checkInLocation: { lat: number; lng: number } | null;
  checkOutLocation: { lat: number; lng: number } | null;
  status: "present" | "late" | "absent" | "half-day";
  hoursWorked: string;
}

interface GarageLocation {
  name: string;
  lat: number;
  lng: number;
  radius: number;
}

const GARAGE_LOCATIONS: GarageLocation[] = [
  { name: "SALIS AUTO Main Branch", lat: 24.7136, lng: 46.6753, radius: 100 },
  { name: "SALIS AUTO Service Center", lat: 24.7256, lng: 46.6823, radius: 100 },
  { name: "SALIS AUTO Parts Warehouse", lat: 24.7086, lng: 46.6653, radius: 150 },
];

const mockAttendanceHistory: AttendanceRecord[] = [
  {
    id: 1,
    date: "2025-12-15",
    checkIn: "08:02",
    checkOut: "17:05",
    checkInLocation: { lat: 24.7136, lng: 46.6753 },
    checkOutLocation: { lat: 24.7136, lng: 46.6753 },
    status: "present",
    hoursWorked: "9h 3m",
  },
  {
    id: 2,
    date: "2025-12-14",
    checkIn: "08:15",
    checkOut: "17:00",
    checkInLocation: { lat: 24.7136, lng: 46.6753 },
    checkOutLocation: { lat: 24.7136, lng: 46.6753 },
    status: "late",
    hoursWorked: "8h 45m",
  },
  {
    id: 3,
    date: "2025-12-13",
    checkIn: "07:55",
    checkOut: "17:10",
    checkInLocation: { lat: 24.7136, lng: 46.6753 },
    checkOutLocation: { lat: 24.7136, lng: 46.6753 },
    status: "present",
    hoursWorked: "9h 15m",
  },
];

function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function TechnicianAttendance() {
  const { toast } = useToast();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [nearestGarage, setNearestGarage] = useState<GarageLocation | null>(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ lat: latitude, lng: longitude });
        setLocationError(null);
        
        let nearest: GarageLocation | null = null;
        let minDistance = Infinity;
        
        for (const garage of GARAGE_LOCATIONS) {
          const distance = calculateDistance(latitude, longitude, garage.lat, garage.lng);
          if (distance < minDistance) {
            minDistance = distance;
            nearest = garage;
          }
        }
        
        setNearestGarage(nearest);
        setIsWithinRange(nearest ? minDistance <= nearest.radius : false);
        setIsLoadingLocation(false);
      },
      (error) => {
        setLocationError("Unable to retrieve your location. Please enable GPS.");
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleCheckIn = () => {
    if (!isWithinRange) {
      toast({
        title: "Location Error",
        description: "You must be at the garage location to check in.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckedIn(true);
    setCheckInTime(new Date());
    toast({
      title: "Checked In Successfully",
      description: `You checked in at ${format(new Date(), "HH:mm")} at ${nearestGarage?.name}`,
    });
  };

  const handleCheckOut = () => {
    if (!isWithinRange) {
      toast({
        title: "Location Error",
        description: "You must be at the garage location to check out.",
        variant: "destructive",
      });
      return;
    }

    setIsCheckedIn(false);
    toast({
      title: "Checked Out Successfully",
      description: `You checked out at ${format(new Date(), "HH:mm")}`,
    });
  };

  const getStatusBadge = (status: AttendanceRecord["status"]) => {
    switch (status) {
      case "present":
        return <Badge className="bg-green-600">Present</Badge>;
      case "late":
        return <Badge className="bg-[#F97316]">Late</Badge>;
      case "absent":
        return <Badge className="bg-red-600">Absent</Badge>;
      case "half-day":
        return <Badge className="bg-[#F97316]">Half Day</Badge>;
    }
  };

  return (
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white">Attendance</h1>
        <p className="text-[#64748B]">Track your attendance with GPS verification</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <MapPin className="h-5 w-5 text-[#0A5ED7]" />
              Current Location
            </CardTitle>
            <CardDescription className="text-[#64748B]">GPS-verified attendance tracking</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingLocation ? (
              <div className="flex items-center gap-2 text-[#64748B]">
                <Navigation className="h-5 w-5 animate-pulse" />
                <span>Getting your location...</span>
              </div>
            ) : locationError ? (
              <div className="flex items-center gap-2 text-red-500">
                <WifiOff className="h-5 w-5" />
                <span>{locationError}</span>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Wifi className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-[#64748B]">
                    Location: {currentLocation?.lat.toFixed(4)}, {currentLocation?.lng.toFixed(4)}
                  </span>
                </div>
                
                {nearestGarage && (
                  <div className="p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-5 w-5 text-[#0A5ED7]" />
                      <span className="font-medium text-[#0B1F3B] dark:text-white">{nearestGarage.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {isWithinRange ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span className="text-sm text-green-600 dark:text-green-400">Within garage range</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600 dark:text-red-400">Outside garage range</span>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <Button 
              onClick={getCurrentLocation} 
              variant="outline" 
              size="sm"
              className="w-full border-[#E2E8F0] dark:border-[#232A36]"
              data-testid="button-refresh-location"
            >
              <Navigation className="h-4 w-4 mr-2" />
              Refresh Location
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <Clock className="h-5 w-5 text-green-500" />
              Today's Status
            </CardTitle>
            <CardDescription className="text-[#64748B]">{format(new Date(), "EEEE, MMMM d, yyyy")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              {isCheckedIn ? (
                <div className="space-y-2">
                  <Badge className="bg-green-600 text-lg px-4 py-2">Checked In</Badge>
                  <p className="text-sm text-[#64748B]">
                    Since {checkInTime ? format(checkInTime, "HH:mm") : "--:--"}
                  </p>
                </div>
              ) : (
                <Badge variant="outline" className="text-lg px-4 py-2 border-[#E2E8F0] dark:border-[#232A36]">Not Checked In</Badge>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleCheckIn}
                disabled={isCheckedIn || !isWithinRange}
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90"
                data-testid="button-check-in"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Check In
              </Button>
              <Button
                onClick={handleCheckOut}
                disabled={!isCheckedIn || !isWithinRange}
                variant="destructive"
                data-testid="button-check-out"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Check Out
              </Button>
            </div>

            {!isWithinRange && !isLoadingLocation && (
              <p className="text-xs text-center text-[#F97316]">
                You must be at the garage to check in/out
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <Calendar className="h-5 w-5 text-[#0A5ED7]" />
            Attendance History
          </CardTitle>
          <CardDescription className="text-[#64748B]">Your recent attendance records</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">Date</TableHead>
                <TableHead className="text-[#64748B]">Check In</TableHead>
                <TableHead className="text-[#64748B]">Check Out</TableHead>
                <TableHead className="text-[#64748B]">Hours Worked</TableHead>
                <TableHead className="text-[#64748B]">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAttendanceHistory.map((record) => (
                <TableRow key={record.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-attendance-${record.id}`}>
                  <TableCell className="font-medium text-[#0B1F3B] dark:text-white">{format(new Date(record.date), "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-[#64748B]">{record.checkIn || "-"}</TableCell>
                  <TableCell className="text-[#64748B]">{record.checkOut || "-"}</TableCell>
                  <TableCell className="text-[#64748B]">{record.hoursWorked}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <Building2 className="h-5 w-5 text-[#0A5ED7]" />
            Garage Locations
          </CardTitle>
          <CardDescription className="text-[#64748B]">Authorized check-in locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {GARAGE_LOCATIONS.map((garage, index) => (
              <div 
                key={index} 
                className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`card-garage-${index}`}
              >
                <h4 className="font-medium text-[#0B1F3B] dark:text-white mb-2">{garage.name}</h4>
                <p className="text-xs text-[#64748B]">
                  Coordinates: {garage.lat.toFixed(4)}, {garage.lng.toFixed(4)}
                </p>
                <p className="text-xs text-[#64748B]">
                  Range: {garage.radius}m
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
