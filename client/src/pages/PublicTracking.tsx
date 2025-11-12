import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Calendar, Car, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function PublicTracking() {
  const [, params] = useRoute('/track/:token');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (params?.token) {
      fetchTrackingData(params.token);
    }
  }, [params?.token]);

  const fetchTrackingData = async (token: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/public/track/${token}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to load tracking data');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30';
      case 'assigned':
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30';
      case 'pending':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'status_change':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'eta_update':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'message':
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      case 'completed_task':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-salis-black">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-gray-500" />
          <p className="text-gray-600 dark:text-gray-400">Loading tracking information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-salis-black p-4">
        <Card className="max-w-md w-full bg-white dark:bg-salis-black">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Unable to Load Tracking
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                This tracking link may have expired or is invalid. Please contact the service center for assistance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  const { jobCard, events } = data;
  const vehicleInfo = jobCard.vehicleInfo as any;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-salis-black p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Service Tracking
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your vehicle's service progress in real-time
          </p>
        </div>

        <div className="space-y-6">
          {/* Job Overview */}
          <Card className="bg-white dark:bg-salis-black" data-testid="card-job-overview">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Job #{jobCard.jobNumber}
                </CardTitle>
                <Badge className={getStatusColor(jobCard.status)}>
                  {jobCard.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Vehicle Information
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {vehicleInfo.make} {vehicleInfo.model} {vehicleInfo.year}
                </p>
                {vehicleInfo.licensePlate && (
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    License Plate: {vehicleInfo.licensePlate}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Service Description
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{jobCard.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                {jobCard.scheduledDate && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-1">
                      <Calendar className="h-4 w-4" />
                      Scheduled
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(jobCard.scheduledDate), 'PPp')}
                    </p>
                  </div>
                )}

                {jobCard.startedAt && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-1">
                      <Clock className="h-4 w-4" />
                      Started
                    </div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {format(new Date(jobCard.startedAt), 'PPp')}
                    </p>
                  </div>
                )}

                {jobCard.estimatedCompletionAt && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-1">
                      <Clock className="h-4 w-4" />
                      Estimated Completion
                    </div>
                    <p className="font-medium text-blue-600 dark:text-blue-400">
                      {format(new Date(jobCard.estimatedCompletionAt), 'PPp')}
                    </p>
                  </div>
                )}

                {jobCard.completedAt && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 mb-1">
                      <CheckCircle2 className="h-4 w-4" />
                      Completed
                    </div>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {format(new Date(jobCard.completedAt), 'PPp')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card className="bg-white dark:bg-salis-black" data-testid="card-timeline">
            <CardHeader>
              <CardTitle>Service Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No updates available yet
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />
                  <div className="space-y-6">
                    {events.map((event: any, index: number) => (
                      <div key={event.id} className="relative flex gap-4" data-testid={`event-${event.id}`}>
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-salis-black border-2 border-gray-200 dark:border-gray-700 flex items-center justify-center z-10">
                          {getEventIcon(event.eventType)}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white">
                              {event.title}
                            </h4>
                            <span className="text-sm text-gray-500 dark:text-gray-500 ml-4">
                              {format(new Date(event.createdAt), 'PPp')}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                              {event.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-500 pt-4">
            <p>Questions about your service? Contact our service center.</p>
            <p className="mt-1">This tracking link will expire in 7 days.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
