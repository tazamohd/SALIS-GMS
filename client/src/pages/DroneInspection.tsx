import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, MapPin, Camera, Battery, Wind, Image as ImageIcon } from 'lucide-react';

export default function DroneInspection() {
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  
  const { data: inspectionsResponse, isLoading } = useQuery({ queryKey: ['/api/nextgen/drone-inspections'] });
  const inspections = inspectionsResponse?.data || [];

  // Use actual backend data, fall back to mock if empty
  const flights = inspections.length > 0 ? inspections.map((insp: any) => ({
    id: insp.id,
    location: insp.location || 'Unknown Location',
    status: insp.status || 'completed',
    images: insp.mediaCount || 0,
    battery: 100 - (Math.random() * 40), // Simulated battery (would come from real drone)
    duration: insp.duration || 'N/A',
  })) : [
    { id: 'demo-1', location: 'Service Bay 1 (Demo)', status: 'completed', images: 12, battery: 85, duration: '8 min' },
    { id: 'demo-2', location: 'Parking Lot (Demo)', status: 'in_progress', images: 6, battery: 62, duration: '4 min' },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Plane className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse" />
          <p className="text-gray-500 dark:text-gray-400">Loading drone data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-['Montserrat'] text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Plane className="h-8 w-8 text-sky-600" />
          Drone Inspection Interface
        </h1>
        <p className="text-gray-600 dark:text-gray-400 font-['Poppins']">
          Autonomous drone fleet management for vehicle and facility inspections
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Flight Control */}
        <Card className="lg:col-span-2 bg-white dark:bg-salis-black">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-sky-600" />
              Active Flights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flights.map((flight) => (
                <div
                  key={flight.id}
                  className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelectedFlight(flight.id)}
                  data-testid={`flight-${flight.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Plane className="h-5 w-5 text-sky-600" />
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">{flight.location}</h4>
                        <p className="text-sm text-gray-500">Flight #{flight.id}</p>
                      </div>
                    </div>
                    <Badge className={flight.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                      {flight.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-gray-500" />
                      <span>{flight.images} photos</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-gray-500" />
                      <span>{flight.battery}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-gray-500" />
                      <span>{flight.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4 bg-sky-600 hover:bg-sky-700" data-testid="button-new-flight">
              <Plane className="mr-2 h-4 w-4" />
              Plan New Flight
            </Button>
          </CardContent>
        </Card>

        {/* Selected Flight Details */}
        <Card className="bg-white dark:bg-salis-black">
          <CardHeader>
            <CardTitle>Flight Details</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFlight ? (
              <div className="space-y-3">
                {flights.filter(f => f.id === selectedFlight).map((flight) => (
                  <div key={flight.id}>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                        {flight.location}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Status</span>
                          <Badge className={flight.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                            {flight.status}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Images</span>
                          <span className="font-semibold">{flight.images}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Duration</span>
                          <span className="font-semibold">{flight.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Battery</span>
                          <span className="font-semibold">{Math.round(flight.battery)}%</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setSelectedFlight(null)}
                      data-testid="button-clear-selection"
                    >
                      Clear Selection
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Plane className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select a flight to view details
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Media Gallery */}
      <Card className="mt-6 bg-white dark:bg-salis-black">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-purple-600" />
            Captured Media {selectedFlight && `- ${flights.find(f => f.id === selectedFlight)?.location}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedFlight ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: flights.find(f => f.id === selectedFlight)?.images || 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer"
                  data-testid={`media-${i}`}
                >
                  <Camera className="h-8 w-8 text-gray-400" />
                  <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 dark:text-gray-400">
                Select a flight to view captured media
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
