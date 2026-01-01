import { useRoute } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, Calendar, Car, AlertCircle, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface TrackingData {
  jobCard: {
    jobNumber: string;
    status: string;
    vehicleInfo: any;
    description: string;
    scheduledDate?: string;
    startedAt?: string;
    estimatedCompletionAt?: string;
    completedAt?: string;
  };
  events: Array<{
    id: string;
    eventType: string;
    title: string;
    description?: string;
    createdAt: string;
  }>;
}

export default function PublicTracking() {
  const { t } = useTranslation();
  const [, params] = useRoute('/track/:token');

  const { data, isLoading: loading, error } = useQuery<TrackingData>({
    queryKey: ['/api/public/track', params?.token],
    enabled: !!params?.token,
    queryFn: async () => {
      const response = await fetch(`/api/public/track/${params?.token}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || t('tracking.failedToLoadData', 'Failed to load tracking data'));
      }
      return response.json();
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'in_progress':
        return 'bg-[#0A5ED7]/10 text-[#0A5ED7] dark:bg-[#0A5ED7]/20 dark:text-[#0BB3FF]';
      case 'assigned':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300';
      case 'pending':
        return 'bg-[#64748B]/10 text-[#64748B] dark:bg-[#64748B]/20 dark:text-[#64748B]';
      case 'cancelled':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default:
        return 'bg-[#64748B]/10 text-[#64748B] dark:bg-[#64748B]/20 dark:text-[#64748B]';
    }
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'status_change':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'eta_update':
        return <Clock className="h-5 w-5 text-[#0A5ED7]" />;
      case 'message':
        return <AlertCircle className="h-5 w-5 text-[#64748B]" />;
      case 'completed_task':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-[#64748B]" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-[#0A5ED7]" />
          <p className="text-[#64748B]">{t('tracking.loadingInfo', 'Loading tracking information...')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117] p-4">
        <Card className="max-w-md w-full bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-[#F97316] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#0B1F3B] dark:text-white mb-2">
                {t('tracking.unableToLoad', 'Unable to Load Tracking')}
              </h2>
              <p className="text-[#64748B] mb-4">
                {error instanceof Error ? error.message : t('tracking.failedToLoadInfo', 'Failed to load tracking information')}
              </p>
              <p className="text-sm text-[#64748B]">
                {t('tracking.linkExpiredOrInvalid', 'This tracking link may have expired or is invalid. Please contact the service center for assistance.')}
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
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white mb-2">
            {t('tracking.serviceTracking', 'Service Tracking')}
          </h1>
          <p className="text-[#64748B]">
            {t('tracking.trackVehicleProgress', "Track your vehicle's service progress in real-time")}
          </p>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-job-overview">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                  <Car className="h-5 w-5 text-[#0A5ED7]" />
                  {t('tracking.jobNumber', 'Job #{{number}}', { number: jobCard.jobNumber })}
                </CardTitle>
                <Badge className={getStatusColor(jobCard.status)}>
                  {jobCard.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">
                  {t('tracking.vehicleInformation', 'Vehicle Information')}
                </h3>
                <p className="text-[#64748B]">
                  {vehicleInfo.make} {vehicleInfo.model} {vehicleInfo.year}
                </p>
                {vehicleInfo.licensePlate && (
                  <p className="text-sm text-[#64748B]">
                    {t('tracking.licensePlate', 'License Plate')}: {vehicleInfo.licensePlate}
                  </p>
                )}
              </div>

              <div>
                <h3 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">
                  {t('tracking.serviceDescription', 'Service Description')}
                </h3>
                <p className="text-[#64748B]">{jobCard.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[#E2E8F0] dark:border-[#232A36]">
                {jobCard.scheduledDate && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-[#64748B] mb-1">
                      <Calendar className="h-4 w-4" />
                      {t('tracking.scheduled', 'Scheduled')}
                    </div>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">
                      {format(new Date(jobCard.scheduledDate), 'PPp')}
                    </p>
                  </div>
                )}

                {jobCard.startedAt && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-[#64748B] mb-1">
                      <Clock className="h-4 w-4" />
                      {t('tracking.started', 'Started')}
                    </div>
                    <p className="font-medium text-[#0B1F3B] dark:text-white">
                      {format(new Date(jobCard.startedAt), 'PPp')}
                    </p>
                  </div>
                )}

                {jobCard.estimatedCompletionAt && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-[#64748B] mb-1">
                      <Clock className="h-4 w-4" />
                      {t('tracking.estimatedCompletion', 'Estimated Completion')}
                    </div>
                    <p className="font-medium text-[#0A5ED7] dark:text-[#0BB3FF]">
                      {format(new Date(jobCard.estimatedCompletionAt), 'PPp')}
                    </p>
                  </div>
                )}

                {jobCard.completedAt && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-[#64748B] mb-1">
                      <CheckCircle2 className="h-4 w-4" />
                      {t('common.completed', 'Completed')}
                    </div>
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {format(new Date(jobCard.completedAt), 'PPp')}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-timeline">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('tracking.serviceTimeline', 'Service Timeline')}</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8 text-[#64748B]">
                  {t('tracking.noUpdatesYet', 'No updates available yet')}
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#E2E8F0] dark:bg-[#232A36]" />
                  <div className="space-y-6">
                    {events.map((event: any, index: number) => (
                      <div key={event.id} className="relative flex gap-4" data-testid={`event-${event.id}`}>
                        <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white dark:bg-[#151A23] border-2 border-[#E2E8F0] dark:border-[#232A36] flex items-center justify-center z-10">
                          {getEventIcon(event.eventType)}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-start justify-between mb-1">
                            <h4 className="font-semibold text-[#0B1F3B] dark:text-white">
                              {event.title}
                            </h4>
                            <span className="text-sm text-[#64748B] ml-4">
                              {format(new Date(event.createdAt), 'PPp')}
                            </span>
                          </div>
                          {event.description && (
                            <p className="text-[#64748B] text-sm">
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

          <div className="text-center text-sm text-[#64748B] pt-4">
            <p>{t('tracking.contactServiceCenter', 'Questions about your service? Contact our service center.')}</p>
            <p className="mt-1">{t('tracking.linkExpiry', 'This tracking link will expire in 7 days.')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
