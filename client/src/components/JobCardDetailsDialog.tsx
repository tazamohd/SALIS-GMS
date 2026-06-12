import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Wrench,
  Car,
  User,
  Calendar,
  ClipboardList,
  AlertCircle,
  CheckCircle,
  Clock,
  Activity,
  Lightbulb,
  Download,
  Eye,
} from "lucide-react";
import { InvoiceDetailsDialog } from "@/components/InvoiceDetailsDialog";
import { exportPaymentReceiptToPDF } from "@/lib/pdfExport";

interface JobCardDetailsDialogProps {
  jobCardId: string;
  children?: React.ReactNode;
}

export function JobCardDetailsDialog({ jobCardId, children }: JobCardDetailsDialogProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const { data: jobDetails, isLoading } = useQuery<any>({
    queryKey: ['/api/job-cards', jobCardId, 'details'],
    queryFn: async () => {
      const res = await fetch(`/api/job-cards/${jobCardId}/details`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch job details');
      return res.json();
    },
    enabled: open,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 border-[#0A5ED7]/30 text-[#0A5ED7]';
      case 'in_progress':
        return 'bg-[#0BB3FF]/10 dark:bg-[#0BB3FF]/20 border-[#0BB3FF]/30 text-[#0BB3FF]';
      case 'cancelled':
        return 'bg-[#F97316]/10 dark:bg-[#F97316]/20 border-[#F97316]/30 text-[#F97316]';
      default:
        return 'bg-[#64748B]/10 dark:bg-[#64748B]/20 border-[#64748B]/30 text-[#64748B]';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
      case 'urgent':
        return 'bg-[#F97316]/10 text-[#F97316]';
      case 'medium':
        return 'bg-[#0BB3FF]/10 text-[#0BB3FF]';
      default:
        return 'bg-[#64748B]/10 text-[#64748B]';
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button
            size="sm"
            variant="outline"
            className="border-[#E2E8F0] dark:border-[#232A36] hover:bg-gradient-to-r hover:from-[#0A5ED7] hover:to-[#0BB3FF] hover:text-white hover:border-transparent"
            data-testid={`button-view-job-${jobCardId}`}
          >
            <Eye className="h-4 w-4 mr-1" />
            {t('common.viewDetails', 'View Details')}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <DialogHeader>
          <DialogTitle className="font-['Poppins',Helvetica] font-semibold text-xl text-[#0B1F3B] dark:text-white flex items-center gap-2">
            <Wrench className="h-5 w-5 text-[#0A5ED7]" />
            {t('jobCards.serviceHistory', 'Service History Details')}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#0A5ED7] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !jobDetails ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-[#F97316] mx-auto mb-2" />
            <p className="text-[#64748B]">{t('common.errorLoading', 'Error loading data')}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-4 pr-4">
              <Card className="bg-[#F8FAFC] dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-[#64748B]">{t('jobCards.jobNumber', 'Job Number')}</p>
                      <p className="font-semibold text-[#0B1F3B] dark:text-white">{jobDetails.jobNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">{t('common.status', 'Status')}</p>
                      <Badge variant="outline" className={getStatusColor(jobDetails.status)}>
                        {jobDetails.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {jobDetails.status === 'in_progress' && <Clock className="w-3 h-3 mr-1" />}
                        {jobDetails.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">{t('jobCards.serviceType', 'Service Type')}</p>
                      <p className="font-medium text-[#0B1F3B] dark:text-white">{jobDetails.serviceType || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-[#64748B]">{t('common.priority', 'Priority')}</p>
                      <Badge variant="outline" className={getPriorityColor(jobDetails.priority)}>
                        {jobDetails.priority || 'normal'}
                      </Badge>
                    </div>
                  </div>

                  {jobDetails.vehicle && (
                    <div className="mt-4 pt-4 border-t border-[#E2E8F0] dark:border-[#232A36]">
                      <div className="flex items-center gap-2 mb-2">
                        <Car className="w-4 h-4 text-[#0A5ED7]" />
                        <span className="text-sm font-medium text-[#0B1F3B] dark:text-white">
                          {t('vehicles.vehicleInfo', 'Vehicle Information')}
                        </span>
                      </div>
                      <p className="text-sm text-[#64748B]">
                        {jobDetails.vehicle.make} {jobDetails.vehicle.model} ({jobDetails.vehicle.year}) - {jobDetails.vehicle.licensePlate}
                      </p>
                    </div>
                  )}

                  {jobDetails.technician && (
                    <div className="mt-3 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#64748B]" />
                      <span className="text-sm text-[#64748B]">
                        {t('jobCards.technician', 'Technician')}: <span className="text-[#0B1F3B] dark:text-white">{jobDetails.technician.fullName}</span>
                      </span>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#64748B]" />
                    <span className="text-sm text-[#64748B]">
                      {t('common.date', 'Date')}: {jobDetails.createdAt ? new Date(jobDetails.createdAt).toLocaleDateString() : 'N/A'}
                      {jobDetails.completedAt && ` - ${t('common.completed', 'Completed')}: ${new Date(jobDetails.completedAt).toLocaleDateString()}`}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Tabs defaultValue="description" className="w-full">
                <TabsList className="bg-[#F1F5F9] dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]">
                  <TabsTrigger value="description" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white">
                    <ClipboardList className="w-4 h-4 mr-1" />
                    {t('common.description', 'Description')}
                  </TabsTrigger>
                  <TabsTrigger value="diagnostics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white">
                    <Activity className="w-4 h-4 mr-1" />
                    {t('diagnostics.title', 'Diagnostics')} ({jobDetails.diagnostics?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="recommendations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white">
                    <Lightbulb className="w-4 h-4 mr-1" />
                    {t('recommendations.title', 'Advice')} ({jobDetails.recommendations?.length || 0})
                  </TabsTrigger>
                  <TabsTrigger value="invoices" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white">
                    <FileText className="w-4 h-4 mr-1" />
                    {t('invoices.title', 'Invoices')} ({jobDetails.invoices?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="description" className="mt-4">
                  <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-[#0B1F3B] dark:text-white mb-2">{t('jobCards.workDescription', 'Work Description')}</h4>
                      <p className="text-sm text-[#64748B]">{jobDetails.description || t('common.noDescription', 'No description available')}</p>
                      
                      {jobDetails.technicianNotes && (
                        <div className="mt-4 pt-4 border-t border-[#E2E8F0] dark:border-[#232A36]">
                          <h4 className="font-medium text-[#0B1F3B] dark:text-white mb-2">{t('jobCards.technicianNotes', 'Technician Notes')}</h4>
                          <p className="text-sm text-[#64748B]">{jobDetails.technicianNotes}</p>
                        </div>
                      )}

                      {jobDetails.trackingEvents && jobDetails.trackingEvents.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-[#E2E8F0] dark:border-[#232A36]">
                          <h4 className="font-medium text-[#0B1F3B] dark:text-white mb-2">{t('jobCards.serviceTimeline', 'Service Timeline')}</h4>
                          <div className="space-y-2">
                            {jobDetails.trackingEvents.slice(0, 5).map((event: any, idx: number) => (
                              <div key={idx} className="flex items-start gap-2 text-sm">
                                <span className="text-[#64748B] min-w-[80px]">{new Date(event.createdAt).toLocaleString()}</span>
                                <span className="text-[#0B1F3B] dark:text-white">{event.eventType}: {event.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="diagnostics" className="mt-4">
                  <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    <CardContent className="p-4">
                      {(!jobDetails.diagnostics || jobDetails.diagnostics.length === 0) ? (
                        <div className="text-center py-8">
                          <Activity className="w-12 h-12 text-[#64748B] mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('diagnostics.noReports', 'No diagnostic reports available')}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {jobDetails.diagnostics.map((diag: any) => (
                            <div key={diag.id} className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-[#0B1F3B] dark:text-white">{diag.reportType || 'Diagnostic Report'}</h5>
                                <Badge variant="outline" className={diag.severity === 'critical' || diag.severity === 'high' ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#64748B]/10 text-[#64748B]'}>
                                  {diag.severity || 'info'}
                                </Badge>
                              </div>
                              <p className="text-sm text-[#64748B] mb-2">{diag.findings || diag.description}</p>
                              {diag.codes && diag.codes.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {diag.codes.map((code: string, idx: number) => (
                                    <Badge key={idx} variant="outline" className="bg-[#0A5ED7]/10 text-[#0A5ED7] text-xs">
                                      {code}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="recommendations" className="mt-4">
                  <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    <CardContent className="p-4">
                      {(!jobDetails.recommendations || jobDetails.recommendations.length === 0) ? (
                        <div className="text-center py-8">
                          <Lightbulb className="w-12 h-12 text-[#64748B] mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('recommendations.noRecommendations', 'No recommendations available')}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {jobDetails.recommendations.map((rec: any) => (
                            <div key={rec.id} className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-[#0B1F3B] dark:text-white">{rec.title || rec.recommendationType}</h5>
                                <Badge variant="outline" className={rec.priority === 'high' || rec.priority === 'urgent' ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#0A5ED7]/10 text-[#0A5ED7]'}>
                                  {rec.priority || 'normal'}
                                </Badge>
                              </div>
                              <p className="text-sm text-[#64748B]">{rec.description}</p>
                              {rec.estimatedCost && (
                                <p className="text-sm text-[#0A5ED7] mt-2">{t('common.estimatedCost', 'Estimated Cost')}: ${Number(rec.estimatedCost).toFixed(2)}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="invoices" className="mt-4">
                  <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    <CardContent className="p-4">
                      {(!jobDetails.invoices || jobDetails.invoices.length === 0) ? (
                        <div className="text-center py-8">
                          <FileText className="w-12 h-12 text-[#64748B] mx-auto mb-2" />
                          <p className="text-sm text-[#64748B]">{t('invoices.noInvoices', 'No invoices available')}</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {jobDetails.invoices.map((inv: any) => (
                            <div key={inv.id} className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h5 className="font-medium text-[#0B1F3B] dark:text-white">Invoice #{inv.invoiceNumber}</h5>
                                  <p className="text-xs text-[#64748B]">{new Date(inv.invoiceDate).toLocaleDateString()}</p>
                                </div>
                                <Badge variant="outline" className={inv.status === 'paid' ? 'bg-[#0A5ED7]/10 text-[#0A5ED7]' : inv.status === 'overdue' ? 'bg-[#F97316]/10 text-[#F97316]' : 'bg-[#64748B]/10 text-[#64748B]'}>
                                  {inv.status}
                                </Badge>
                              </div>

                              {inv.items && inv.items.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs text-[#64748B] mb-1">{t('invoices.items', 'Items')}:</p>
                                  <div className="space-y-1">
                                    {inv.items.slice(0, 3).map((item: any, idx: number) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-[#64748B]">{item.description}</span>
                                        <span className="text-[#0B1F3B] dark:text-white">${Number(item.total || item.amount || 0).toFixed(2)}</span>
                                      </div>
                                    ))}
                                    {inv.items.length > 3 && (
                                      <p className="text-xs text-[#64748B]">+{inv.items.length - 3} {t('common.more', 'more items')}</p>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0] dark:border-[#232A36]">
                                <span className="text-lg font-bold text-[#0B1F3B] dark:text-white">${Number(inv.totalAmount || 0).toFixed(2)}</span>
                                <div className="flex gap-2">
                                  <InvoiceDetailsDialog invoiceId={inv.id}>
                                    <Button size="sm" variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`button-view-invoice-${inv.id}`}>
                                      <Eye className="h-4 w-4 mr-1" />
                                      {t('common.view', 'View')}
                                    </Button>
                                  </InvoiceDetailsDialog>
                                </div>
                              </div>

                              {inv.payments && inv.payments.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-[#E2E8F0] dark:border-[#232A36]">
                                  <p className="text-xs text-[#64748B] mb-2">{t('payments.paymentHistory', 'Payments')}:</p>
                                  <div className="space-y-2">
                                    {inv.payments.map((payment: any) => (
                                      <div key={payment.id} className="flex items-center justify-between text-sm bg-[#F8FAFC] dark:bg-[#0E1117] p-2 rounded">
                                        <div>
                                          <span className="text-[#0B1F3B] dark:text-white">${Number(payment.amount).toFixed(2)}</span>
                                          <span className="text-[#64748B] ml-2">({payment.paymentMethod})</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs text-[#64748B]">{new Date(payment.paymentDate).toLocaleDateString()}</span>
                                          <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-6 w-6 p-0"
                                            onClick={() => exportPaymentReceiptToPDF({
                                              ...payment,
                                              invoiceNumber: inv.invoiceNumber,
                                              customerName: 'Customer'
                                            })}
                                            data-testid={`button-receipt-${payment.id}`}
                                          >
                                            <Download className="h-3 w-3" />
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
