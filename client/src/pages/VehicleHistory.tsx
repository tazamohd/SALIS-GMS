import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { StandardTablePage } from "@/components/layouts";
import { History, Car, Wrench, Calendar, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VehicleHistoryRecord {
  id: string;
  vehicleId: string;
  vehicleMake: string;
  vehicleModel: string;
  licensePlate: string;
  serviceType: string;
  serviceDate: string;
  mileage: number;
  technician: string;
  status: "completed" | "in_progress" | "cancelled";
  cost: number;
  notes: string;
}

export default function VehicleHistory() {
  const { t } = useTranslation();
  const [vehicleFilter, setVehicleFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");

  const mockHistory: VehicleHistoryRecord[] = [
    {
      id: "1",
      vehicleId: "v1",
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      licensePlate: "ABC-1234",
      serviceType: "Oil Change",
      serviceDate: "2025-01-10",
      mileage: 45000,
      technician: "John Smith",
      status: "completed",
      cost: 89.99,
      notes: "Regular maintenance completed",
    },
    {
      id: "2",
      vehicleId: "v1",
      vehicleMake: "Toyota",
      vehicleModel: "Camry",
      licensePlate: "ABC-1234",
      serviceType: "Brake Inspection",
      serviceDate: "2024-12-15",
      mileage: 42000,
      technician: "Sarah Johnson",
      status: "completed",
      cost: 125.00,
      notes: "Brake pads replaced",
    },
    {
      id: "3",
      vehicleId: "v2",
      vehicleMake: "Honda",
      vehicleModel: "Accord",
      licensePlate: "XYZ-5678",
      serviceType: "Engine Diagnostics",
      serviceDate: "2025-01-14",
      mileage: 62000,
      technician: "Mike Chen",
      status: "completed",
      cost: 150.00,
      notes: "Check engine light diagnosis",
    },
    {
      id: "4",
      vehicleId: "v3",
      vehicleMake: "Ford",
      vehicleModel: "F-150",
      licensePlate: "DEF-9012",
      serviceType: "Tire Rotation",
      serviceDate: "2025-01-15",
      mileage: 38000,
      technician: "Emily Davis",
      status: "in_progress",
      cost: 75.00,
      notes: "In progress",
    },
  ];

  const { data: history = mockHistory, isLoading } = useQuery<VehicleHistoryRecord[]>({
    queryKey: ['/api/vehicle-history', vehicleFilter, serviceTypeFilter],
    queryFn: async () => mockHistory,
  });

  const getStatusBadge = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'in_progress': 'bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 text-[#0A5ED7] dark:text-[#0BB3FF]',
      'cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };
    return statusColors[status] || 'bg-[#64748B]/10 dark:bg-[#64748B]/20 text-[#64748B]';
  };

  const getStatusLabel = (status: string) => {
    const statusLabels: { [key: string]: string } = {
      'completed': t('common.completed', 'Completed'),
      'in_progress': t('common.inProgress', 'In Progress'),
      'cancelled': t('common.cancelled', 'Cancelled'),
    };
    return statusLabels[status] || status;
  };

  const handleViewDetails = (id: string) => {
    console.log("View details for record:", id);
  };

  const columns = [
    {
      key: "vehicleMake",
      label: t('vehicles.vehicle', 'Vehicle'),
      render: (row: VehicleHistoryRecord) => (
        <div data-testid={`vehicle-${row.id}`}>
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-[#0A5ED7]" />
            <span className="font-medium text-[#0B1F3B] dark:text-white">{row.vehicleMake} {row.vehicleModel}</span>
          </div>
          <div className="text-sm text-[#64748B]">{row.licensePlate}</div>
        </div>
      ),
    },
    {
      key: "serviceType",
      label: t('vehicles.serviceType', 'Service Type'),
      render: (row: VehicleHistoryRecord) => (
        <div className="flex items-center gap-2" data-testid={`service-${row.id}`}>
          <Wrench className="w-4 h-4 text-[#64748B]" />
          <span className="text-[#0B1F3B] dark:text-white">{row.serviceType}</span>
        </div>
      ),
    },
    {
      key: "serviceDate",
      label: t('common.date', 'Date'),
      render: (row: VehicleHistoryRecord) => (
        <div className="flex items-center gap-2" data-testid={`date-${row.id}`}>
          <Calendar className="w-4 h-4 text-[#64748B]" />
          <span className="text-[#0B1F3B] dark:text-white">{new Date(row.serviceDate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "mileage",
      label: t('vehicles.mileage', 'Mileage'),
      render: (row: VehicleHistoryRecord) => (
        <span className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`mileage-${row.id}`}>
          {row.mileage.toLocaleString()} km
        </span>
      ),
    },
    {
      key: "technician",
      label: t('vehicles.technician', 'Technician'),
      render: (row: VehicleHistoryRecord) => (
        <span className="text-[#64748B]" data-testid={`tech-${row.id}`}>{row.technician}</span>
      ),
    },
    {
      key: "cost",
      label: t('vehicles.cost', 'Cost'),
      render: (row: VehicleHistoryRecord) => (
        <span className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`cost-${row.id}`}>
          ${row.cost.toFixed(2)}
        </span>
      ),
    },
    {
      key: "status",
      label: t('common.status', 'Status'),
      render: (row: VehicleHistoryRecord) => (
        <Badge className={`${getStatusBadge(row.status)} border-0`} data-testid={`status-${row.id}`}>
          {getStatusLabel(row.status)}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: t('common.actions', 'Actions'),
      render: (row: VehicleHistoryRecord) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewDetails(row.id)}
          className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
          data-testid={`button-view-${row.id}`}
        >
          <FileText className="w-4 h-4 mr-1 text-[#0A5ED7]" />
          {t('common.view', 'View')}
        </Button>
      ),
    },
  ];

  const filters = [
    {
      id: "vehicle",
      label: t('vehicles.vehicle', 'Vehicle'),
      options: [
        { value: "all", label: t('vehicles.allVehicles', 'All Vehicles') },
        { value: "v1", label: "Toyota Camry (ABC-1234)" },
        { value: "v2", label: "Honda Accord (XYZ-5678)" },
        { value: "v3", label: "Ford F-150 (DEF-9012)" },
      ],
      defaultValue: vehicleFilter,
    },
    {
      id: "serviceType",
      label: t('vehicles.serviceType', 'Service Type'),
      options: [
        { value: "all", label: t('vehicles.allServices', 'All Services') },
        { value: "oil_change", label: t('vehicles.oilChange', 'Oil Change') },
        { value: "brake", label: t('vehicles.brakeService', 'Brake Service') },
        { value: "diagnostics", label: t('vehicles.diagnostics', 'Diagnostics') },
        { value: "tire", label: t('vehicles.tireService', 'Tire Service') },
      ],
      defaultValue: serviceTypeFilter,
    },
  ];

  return (
    <StandardTablePage
      title={t('vehicles.vehicleHistory', 'Vehicle History')}
      description={t('vehicles.vehicleHistoryDescription', 'Complete service history and maintenance records for all vehicles')}
      icon={History}
      data={history}
      isLoading={isLoading}
      columns={columns}
      searchPlaceholder={t('vehicles.searchVehicleHistory', 'Search vehicle history...')}
      filters={filters}
      emptyState={{
        icon: History,
        title: t('vehicles.noServiceHistoryFound', 'No service history found'),
        description: t('vehicles.noServiceHistoryDescription', 'No service records available for the selected criteria.'),
      }}
    />
  );
}
