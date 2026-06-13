import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "rest-express";
import { Car, TrendingUp, Wrench } from "lucide-react";

export const TodaysRevenue = () => (
  <div className="p-4" style={{ width: 320 }}>
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>Today&apos;s Revenue</CardDescription>
        <CardTitle className="text-3xl tabular-nums">SAR 12,480</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <TrendingUp className="h-4 w-4 text-primary" />
          <span>+18% vs yesterday &middot; 14 invoices settled</span>
        </div>
      </CardContent>
    </Card>
  </div>
);

export const VehicleSummary = () => (
  <div className="p-4" style={{ width: 360 }}>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Toyota Land Cruiser 2022
          </CardTitle>
          <Badge variant="secondary">KSA 4821</Badge>
        </div>
        <CardDescription>
          Owner: Fahad Al-Otaibi &middot; Last visit 02 Jun 2026
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground">Odometer</div>
          <div className="font-medium tabular-nums">84,210 km</div>
        </div>
        <div>
          <div className="text-muted-foreground">Open job cards</div>
          <div className="font-medium">2 active</div>
        </div>
      </CardContent>
      <CardFooter className="gap-2">
        <Button size="sm">Open Job Card</Button>
        <Button size="sm" variant="outline">
          Service History
        </Button>
      </CardFooter>
    </Card>
  </div>
);

export const JobCardStatus = () => (
  <div className="p-4" style={{ width: 340 }}>
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Job Card #JC-1042</CardTitle>
          <Badge>In Progress</Badge>
        </div>
        <CardDescription>Brake overhaul &middot; Bay 3</CardDescription>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <div className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-muted-foreground" />
          <span>Technician: Imran Shaikh</span>
        </div>
        <div className="text-muted-foreground">
          Parts: front pads, rotors (2), brake fluid DOT4
        </div>
      </CardContent>
      <CardFooter>
        <span className="text-sm text-muted-foreground">ETA 4:30 PM</span>
        <Button size="sm" variant="secondary" className="ml-auto">
          Mark Complete
        </Button>
      </CardFooter>
    </Card>
  </div>
);
