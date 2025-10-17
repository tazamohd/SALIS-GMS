import { useState } from "react";
import { FileText, Plus, Search, Building2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateEstimateDialog } from "@/components/CreateEstimateDialog";
import { EstimateDetailsDialog } from "@/components/EstimateDetailsDialog";
import type { Estimate, Garage, User } from "@shared/schema";

export function Estimates() {
  const [selectedGarageId, setSelectedGarageId] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const { data: garages } = useQuery<Garage[]>({
    queryKey: ['/api/garages'],
  });

  const estimateUrl = `/api/estimates${
    selectedGarageId !== "all" || statusFilter !== "all"
      ? `?${new URLSearchParams({
          ...(selectedGarageId !== "all" && { garage_id: selectedGarageId }),
          ...(statusFilter !== "all" && { status: statusFilter }),
        })}`
      : ""
  }`;

  const { data: estimates, isLoading } = useQuery<Estimate[]>({
    queryKey: [estimateUrl],
  });

  const { data: customers } = useQuery<User[]>({
    queryKey: ['/api/customers'],
  });

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-dark-steel/30 text-gray-800",
      sent: "bg-blue-100 text-blue-800",
      accepted: "bg-green-100 text-green-800",
      declined: "bg-red-100 text-red-800",
      expired: "bg-dark-steel/30 text-gray-600",
    };
    return colors[status] || "bg-dark-steel/30 text-gray-800";
  };

  const filteredEstimates = (estimates ?? []).filter((estimate) => {
    if (!searchTerm) return true;
    const customer = customers?.find(c => c.id === estimate.customerId);
    const searchLower = searchTerm.toLowerCase();
    return (
      estimate.estimateNumber.toLowerCase().includes(searchLower) ||
      customer?.fullName?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-['Poppins',Helvetica] font-bold text-3xl text-chrome-silver">
            Estimates & Quotes
          </h1>
          <p className="font-['Poppins',Helvetica] font-normal text-sm text-chrome-silver/60 mt-1">
            Create and manage customer estimates
          </p>
        </div>
        <div className="flex gap-2">
          <CreateEstimateDialog />
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-chrome-silver/50" />
          <Input
            placeholder="Search estimates..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="input-search-estimates"
          />
        </div>
        <Select value={selectedGarageId} onValueChange={setSelectedGarageId}>
          <SelectTrigger className="w-[200px]" data-testid="select-garage-filter">
            <Building2 className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Garages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Garages</SelectItem>
            {(garages ?? []).map((garage) => (
              <SelectItem key={garage.id} value={garage.id}>
                {garage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[200px]" data-testid="select-status-filter">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="accepted">Accepted</SelectItem>
            <SelectItem value="declined">Declined</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-midnight-blue border-dark-steel bg-midnight-blue border-dark-steel">
        <CardContent className="p-6">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-chrome-silver/60">Loading estimates...</p>
            </div>
          ) : filteredEstimates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-600 mb-2">
                No Estimates
              </h3>
              <p className="text-sm text-chrome-silver/50 mb-4">
                {searchTerm
                  ? "No estimates match your search"
                  : "Create your first estimate to start quoting customers"}
              </p>
              {!searchTerm && <CreateEstimateDialog />}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEstimates.map((estimate) => {
                const customer = customers?.find(c => c.id === estimate.customerId);
                return (
                  <EstimateDetailsDialog key={estimate.id} estimateId={estimate.id}>
                    <Card className="bg-midnight-blue border-dark-steel p-4 cursor-pointer hover:shadow-md transition-shadow" data-testid={`card-estimate-${estimate.id}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <FileText className="w-5 h-5 text-chrome-silver/50" />
                            <div>
                              <p className="font-['Poppins',Helvetica] font-semibold text-sm text-chrome-silver" data-testid={`text-estimate-number-${estimate.id}`}>
                                {estimate.estimateNumber}
                              </p>
                              <p className="font-['Poppins',Helvetica] font-normal text-xs text-chrome-silver/60" data-testid={`text-customer-${estimate.id}`}>
                                {customer?.fullName || "Unknown Customer"}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="font-['Poppins',Helvetica] font-bold text-sm text-chrome-silver" data-testid={`text-amount-${estimate.id}`}>
                              ${estimate.totalAmount}
                            </p>
                            {estimate.validUntil && (
                              <p className="font-['Poppins',Helvetica] font-normal text-xs text-chrome-silver/60">
                                Valid until {new Date(estimate.validUntil).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              estimate.status
                            )}`}
                            data-testid={`status-${estimate.id}`}
                          >
                            {estimate.status}
                          </span>
                        </div>
                      </div>
                    </Card>
                  </EstimateDetailsDialog>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
