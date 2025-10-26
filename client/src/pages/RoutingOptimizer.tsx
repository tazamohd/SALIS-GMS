import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Truck, Clock, TrendingUp } from "lucide-react";

export default function RoutingOptimizer() {
  const mockRoutes = [
    { id: "1", type: "parts_transfer", stops: 4, distance: 12.5, duration: 45, driver: "Mike Davis", status: "planned" },
    { id: "2", type: "towing", stops: 2, distance: 8.2, duration: 30, driver: "John Smith", status: "in_progress" },
    { id: "3", type: "mobile_service", stops: 3, distance: 15.8, duration: 60, driver: "Emily Brown", status: "completed" },
  ];

  const stats = { totalRoutes: 12, activeRoutes: 3, distanceSaved: 24.5, timeSaved: 180 };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🗺️ Multi-Location Routing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Optimize delivery and service routes</p>
        </div>
        <Button data-testid="button-create-route">Create Route</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Routes</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalRoutes}</h3>
              </div>
              <Truck className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Today</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.activeRoutes}</h3>
              </div>
              <MapPin className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Distance Saved</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.distanceSaved}mi</h3>
              </div>
              <TrendingUp className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Time Saved</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.timeSaved}min</h3>
              </div>
              <Clock className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Today's Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRoutes.map((route) => (
              <div key={route.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`route-${route.id}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge>{route.type.replace("_", " ")}</Badge>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{route.driver}</h3>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span>{route.stops} stops</span>
                    <span>•</span>
                    <span>{route.distance} miles</span>
                    <span>•</span>
                    <span>{route.duration} min</span>
                  </div>
                </div>
                <Badge variant={route.status === "completed" ? "default" : route.status === "in_progress" ? "secondary" : "outline"}>
                  {route.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
