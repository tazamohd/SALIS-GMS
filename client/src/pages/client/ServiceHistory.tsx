import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, Calendar, DollarSign, Wrench, Filter } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { useState } from "react";

export default function ServiceHistory() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedVehicle, setSelectedVehicle] = useState("all");

  const { data: vehicles } = useQuery({
    queryKey: ["/api/vehicles", user?.id],
    enabled: !!user?.id,
  });

  const { data: jobCards, isLoading } = useQuery({
    queryKey: ["/api/job-cards"],
    enabled: !!user?.id,
  });

  const { data: invoices } = useQuery({
    queryKey: ["/api/invoices"],
    enabled: !!user?.id,
  });

  const myVehicles = Array.isArray(vehicles)
    ? vehicles.filter((v: any) => v.customerId === user?.id)
    : [];

  const myJobCards = Array.isArray(jobCards)
    ? jobCards.filter((jc: any) => {
        const vehicle = myVehicles.find((v: any) => v.id === jc.vehicleId);
        return !!vehicle;
      })
    : [];

  const filteredJobCards = myJobCards.filter((jc: any) => {
    const matchesSearch = searchTerm === "" || 
      jc.jobNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      jc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || jc.status === statusFilter;
    const matchesVehicle = selectedVehicle === "all" || jc.vehicleId === selectedVehicle;
    
    return matchesSearch && matchesStatus && matchesVehicle;
  });

  const getVehicleInfo = (vehicleId: string) => {
    const vehicle = myVehicles.find((v: any) => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} - ${vehicle.licensePlate}` : "Unknown Vehicle";
  };

  const getInvoiceForJob = (jobId: string) => {
    if (!Array.isArray(invoices)) return null;
    return invoices.find((inv: any) => inv.jobCardId === jobId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500 text-white";
      case "in_progress": return "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white";
      case "pending": return "bg-[#F97316] text-white";
      default: return "bg-[#E2E8F0] dark:bg-[#232A36] text-[#0B1F3B] dark:text-white";
    }
  };

  return (
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white" data-testid="text-page-title">
          Service History
        </h1>
        <p className="text-[#64748B] mt-1">
          Complete history of all your vehicle services
        </p>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-filters">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <Filter className="h-5 w-5 text-[#0A5ED7]" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">Search</label>
            <Input
              placeholder="Search by job number or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white placeholder:text-[#64748B]"
              data-testid="input-search"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="all" className="text-[#0B1F3B] dark:text-white">All Status</SelectItem>
                <SelectItem value="completed" className="text-[#0B1F3B] dark:text-white">Completed</SelectItem>
                <SelectItem value="in_progress" className="text-[#0B1F3B] dark:text-white">In Progress</SelectItem>
                <SelectItem value="pending" className="text-[#0B1F3B] dark:text-white">Pending</SelectItem>
                <SelectItem value="cancelled" className="text-[#0B1F3B] dark:text-white">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[#0B1F3B] dark:text-white">Vehicle</label>
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-vehicle">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="all" className="text-[#0B1F3B] dark:text-white">All Vehicles</SelectItem>
                {myVehicles.map((vehicle: any) => (
                  <SelectItem key={vehicle.id} value={vehicle.id} className="text-[#0B1F3B] dark:text-white">
                    {vehicle.make} {vehicle.model} - {vehicle.licensePlate}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-service-records">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">Service Records ({filteredJobCards.length})</CardTitle>
          <CardDescription className="text-[#64748B]">Detailed history of all completed and ongoing services</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 bg-[#E2E8F0] dark:bg-[#232A36]" />
              <Skeleton className="h-32 bg-[#E2E8F0] dark:bg-[#232A36]" />
              <Skeleton className="h-32 bg-[#E2E8F0] dark:bg-[#232A36]" />
            </div>
          ) : filteredJobCards.length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{t('clientPortal.noServiceRecordsFound', 'No service records found')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredJobCards
                .sort((a: any, b: any) => 
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                )
                .map((job: any) => {
                  const invoice = getInvoiceForJob(job.id);
                  return (
                    <div
                      key={job.id}
                      className="p-4 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]"
                      data-testid={`job-card-${job.id}`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10">
                            <Wrench className="h-5 w-5 text-[#0A5ED7]" />
                          </div>
                          <div>
                            <p className="font-medium text-[#0B1F3B] dark:text-white">Job #{job.jobNumber}</p>
                            <p className="text-sm text-[#64748B]">
                              {getVehicleInfo(job.vehicleId)}
                            </p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(job.status)}>
                          {job.status}
                        </Badge>
                      </div>

                      {job.description && (
                        <p className="text-sm mb-3 text-[#0B1F3B] dark:text-white">{job.description}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-[#64748B]" />
                          <div>
                            <p className="text-[#64748B]">Created</p>
                            <p className="font-medium text-[#0B1F3B] dark:text-white">
                              {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {job.completedAt && (
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-[#64748B]" />
                            <div>
                              <p className="text-[#64748B]">Completed</p>
                              <p className="font-medium text-[#0B1F3B] dark:text-white">
                                {new Date(job.completedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        )}

                        {invoice && (
                          <div className="flex items-center gap-2 text-sm">
                            <DollarSign className="h-4 w-4 text-[#64748B]" />
                            <div>
                              <p className="text-[#64748B]">Total</p>
                              <p className="font-medium text-[#0B1F3B] dark:text-white">
                                ${parseFloat(invoice.totalAmount || "0").toFixed(2)}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-[#64748B]" />
                          <div>
                            <p className="text-[#64748B]">Priority</p>
                            <p className="font-medium capitalize text-[#0B1F3B] dark:text-white">{job.priority || "Normal"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-gradient-to-r hover:from-[#0A5ED7]/5 hover:to-[#0BB3FF]/5" data-testid={`button-view-${job.id}`}>
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {invoice && (
                          <Button variant="outline" size="sm" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white hover:bg-gradient-to-r hover:from-[#0A5ED7]/5 hover:to-[#0BB3FF]/5" data-testid={`button-invoice-${job.id}`}>
                            <Download className="h-4 w-4 mr-2" />
                            Download Invoice
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
