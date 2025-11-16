import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
      'in_progress': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
      'cancelled': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    };
    return statusColors[status] || 'bg-gray-100 dark:bg-gray-800';
  };

  const handleViewDetails = (id: string) => {
    console.log("View details for record:", id);
  };

  const columns = [
    {
      header: "Vehicle",
      accessorKey: "vehicleMake",
      cell: (row: VehicleHistoryRecord) => (
        <div data-testid={`vehicle-${row.id}`}>
          <div className="flex items-center gap-2">
            <Car className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <span className="font-medium">{row.vehicleMake} {row.vehicleModel}</span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">{row.licensePlate}</div>
        </div>
      ),
    },
    {
      header: "Service Type",
      accessorKey: "serviceType",
      cell: (row: VehicleHistoryRecord) => (
        <div className="flex items-center gap-2" data-testid={`service-${row.id}`}>
          <Wrench className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span>{row.serviceType}</span>
        </div>
      ),
    },
    {
      header: "Date",
      accessorKey: "serviceDate",
      cell: (row: VehicleHistoryRecord) => (
        <div className="flex items-center gap-2" data-testid={`date-${row.id}`}>
          <Calendar className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <span>{new Date(row.serviceDate).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      header: "Mileage",
      accessorKey: "mileage",
      cell: (row: VehicleHistoryRecord) => (
        <span className="font-medium" data-testid={`mileage-${row.id}`}>
          {row.mileage.toLocaleString()} km
        </span>
      ),
    },
    {
      header: "Technician",
      accessorKey: "technician",
      cell: (row: VehicleHistoryRecord) => (
        <span data-testid={`tech-${row.id}`}>{row.technician}</span>
      ),
    },
    {
      header: "Cost",
      accessorKey: "cost",
      cell: (row: VehicleHistoryRecord) => (
        <span className="font-semibold" data-testid={`cost-${row.id}`}>
          ${row.cost.toFixed(2)}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row: VehicleHistoryRecord) => (
        <Badge className={`${getStatusBadge(row.status)} border-0 capitalize`} data-testid={`status-${row.id}`}>
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: (row: VehicleHistoryRecord) => (
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleViewDetails(row.id)}
          data-testid={`button-view-${row.id}`}
        >
          <FileText className="w-4 h-4 mr-1" />
          View
        </Button>
      ),
    },
  ];

  const filters = [
    {
      id: "vehicle",
      label: "Vehicle",
      options: [
        { value: "all", label: "All Vehicles" },
        { value: "v1", label: "Toyota Camry (ABC-1234)" },
        { value: "v2", label: "Honda Accord (XYZ-5678)" },
        { value: "v3", label: "Ford F-150 (DEF-9012)" },
      ],
      defaultValue: vehicleFilter,
    },
    {
      id: "serviceType",
      label: "Service Type",
      options: [
        { value: "all", label: "All Services" },
        { value: "oil_change", label: "Oil Change" },
        { value: "brake", label: "Brake Service" },
        { value: "diagnostics", label: "Diagnostics" },
        { value: "tire", label: "Tire Service" },
      ],
      defaultValue: serviceTypeFilter,
    },
  ];

  return (
    <StandardTablePage
      title="Vehicle History"
      description="Complete service history and maintenance records for all vehicles"
      icon={History}
      data={history}
      isLoading={isLoading}
      columns={columns}
      searchPlaceholder="Search vehicle history..."
      filters={filters}
      emptyState={{
        icon: History,
        title: "No service history found",
        description: "No service records available for the selected criteria.",
      }}
    />
  );
}
