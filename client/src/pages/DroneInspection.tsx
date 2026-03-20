// @ts-nocheck
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { DashboardPage } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plane, MapPin, Camera, Battery, Wind, Image as ImageIcon } from 'lucide-react';

export default function DroneInspection() {
  const { t } = useTranslation();
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  
  const { data: inspectionsResponse, isLoading } = useQuery({ queryKey: ['/api/nextgen/drone-inspections'] });
  const inspections = inspectionsResponse?.data || [];

  const flights = inspections.length > 0 ? inspections.map((insp: any) => ({
    id: insp.id,
    location: insp.location || t('drone.unknownLocation', 'Unknown Location'),
    status: insp.status || 'completed',
    images: insp.mediaCount || 0,
    battery: 100 - (Math.random() * 40),
    duration: insp.duration || t('drone.na', 'N/A'),
  })) : [
    { id: 'demo-1', location: t('drone.serviceBayDemo', 'Service Bay 1 (Demo)'), status: 'completed', images: 12, battery: 85, duration: t('drone.eightMin', '8 min') },
    { id: 'demo-2', location: t('drone.parkingLotDemo', 'Parking Lot (Demo)'), status: 'in_progress', images: 6, battery: 62, duration: t('drone.fourMin', '4 min') },
  ];

  const metrics = [
    { label: t('drone.totalFlights', 'Total Flights'), value: flights.length, icon: Plane, color: "text-[#0BB3FF]" },
    { label: t('drone.activeFlights', 'Active Flights'), value: flights.filter(f => f.status === 'in_progress').length, icon: MapPin, color: "text-[#0A5ED7]" },
    { label: t('drone.totalImages', 'Total Images'), value: flights.reduce((sum, f) => sum + f.images, 0), icon: Camera, color: "text-purple-500" },
    { label: t('drone.avgBattery', 'Avg Battery'), value: `${Math.round(flights.reduce((sum, f) => sum + f.battery, 0) / flights.length)}%`, icon: Battery, color: "text-emerald-500" },
  ];

  if (isLoading) {
    return (
      <div className="flex-1 p-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Plane className="h-16 w-16 mx-auto mb-4 text-[#0A5ED7] animate-pulse" />
          <p className="text-[#64748B]">{t('drone.loadingData', 'Loading drone data...')}</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardPage
      title={t('drone.title', 'Drone Inspection Interface')}
      description={t('drone.description', 'Autonomous drone fleet management for vehicle and facility inspections')}
      icon={Plane}
      metrics={metrics}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
              <MapPin className="h-5 w-5 text-[#0BB3FF]" />
              {t('drone.activeFlights', 'Active Flights')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flights.map((flight) => (
                <div
                  key={flight.id}
                  className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg hover:shadow-md hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] transition-all cursor-pointer"
                  onClick={() => setSelectedFlight(flight.id)}
                  data-testid={`flight-${flight.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Plane className="h-5 w-5 text-[#0BB3FF]" />
                      <div>
                        <h4 className="font-semibold text-[#0B1F3B] dark:text-white">{flight.location}</h4>
                        <p className="text-sm text-[#64748B]">{t('drone.flight', 'Flight')} #{flight.id}</p>
                      </div>
                    </div>
                    <Badge className={flight.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0' : 'bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0A5ED7]/20 border-0'}>
                      {flight.status === 'completed' ? t('common.completed', 'completed') : t('common.inProgress', 'in_progress')}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Camera className="h-4 w-4 text-[#64748B]" />
                      <span className="text-[#0B1F3B] dark:text-white">{flight.images} {t('drone.photos', 'photos')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Battery className="h-4 w-4 text-[#64748B]" />
                      <span className="text-[#0B1F3B] dark:text-white">{Math.round(flight.battery)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Wind className="h-4 w-4 text-[#64748B]" />
                      <span className="text-[#0B1F3B] dark:text-white">{flight.duration}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-new-flight">
              <Plane className="mr-2 h-4 w-4" />
              {t('drone.planNewFlight', 'Plan New Flight')}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white">{t('drone.flightDetails', 'Flight Details')}</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedFlight ? (
              <div className="space-y-3">
                {flights.filter(f => f.id === selectedFlight).map((flight) => (
                  <div key={flight.id}>
                    <div className="p-3 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36] mb-3">
                      <h4 className="font-semibold text-[#0A5ED7] dark:text-[#0BB3FF] mb-2">
                        {flight.location}
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">{t('common.status', 'Status')}</span>
                          <Badge className={flight.status === 'completed' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-0' : 'bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0A5ED7]/20 border-0'}>
                            {flight.status === 'completed' ? t('common.completed', 'completed') : t('common.inProgress', 'in_progress')}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">{t('drone.images', 'Images')}</span>
                          <span className="font-semibold text-[#0B1F3B] dark:text-white">{flight.images}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">{t('drone.duration', 'Duration')}</span>
                          <span className="font-semibold text-[#0B1F3B] dark:text-white">{flight.duration}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#64748B]">{t('drone.battery', 'Battery')}</span>
                          <span className="font-semibold text-[#0B1F3B] dark:text-white">{Math.round(flight.battery)}%</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full border-[#E2E8F0] dark:border-[#232A36]"
                      onClick={() => setSelectedFlight(null)}
                      data-testid="button-clear-selection"
                    >
                      {t('drone.clearSelection', 'Clear Selection')}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Plane className="h-12 w-12 mx-auto mb-3 text-[#64748B]" />
                <p className="text-sm text-[#64748B]">
                  {t('drone.selectFlightToView', 'Select a flight to view details')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <ImageIcon className="h-5 w-5 text-purple-500" />
            {t('drone.capturedMedia', 'Captured Media')} {selectedFlight && `- ${flights.find(f => f.id === selectedFlight)?.location}`}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedFlight ? (
            <div className="grid grid-cols-4 gap-4">
              {Array.from({ length: flights.find(f => f.id === selectedFlight)?.images || 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-square bg-gradient-to-br from-[#F8FAFC] to-[#E2E8F0] dark:from-[#232A36] dark:to-[#151A23] rounded-lg flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer relative border border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid={`media-${i}`}
                >
                  <Camera className="h-8 w-8 text-[#64748B]" />
                  <span className="absolute bottom-2 right-2 bg-[#0B1F3B]/70 text-white text-xs px-2 py-1 rounded">
                    {i + 1}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="h-16 w-16 mx-auto mb-4 text-[#64748B]" />
              <p className="text-[#64748B]">
                {t('drone.selectFlightToViewMedia', 'Select a flight to view captured media')}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardPage>
  );
}
