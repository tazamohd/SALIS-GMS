import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ClipboardList,
  Search,
  Plus,
  Car,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  FileText,
  Save,
  Printer,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: "pending" | "pass" | "fail" | "na";
  notes: string;
}

interface VehicleChecklistData {
  id: number;
  vehicleId: number;
  vehiclePlate: string;
  vehicleMake: string;
  vehicleModel: string;
  technicianName: string;
  checklistDate: string;
  status: "in_progress" | "completed" | "pending_review";
  items: ChecklistItem[];
}

const defaultChecklistItems: ChecklistItem[] = [
  { id: "1", category: "Exterior", item: "Body condition (dents, scratches)", status: "pending", notes: "" },
  { id: "2", category: "Exterior", item: "Windshield and windows", status: "pending", notes: "" },
  { id: "3", category: "Exterior", item: "Headlights and taillights", status: "pending", notes: "" },
  { id: "4", category: "Exterior", item: "Turn signals and hazards", status: "pending", notes: "" },
  { id: "5", category: "Exterior", item: "Mirrors condition", status: "pending", notes: "" },
  { id: "6", category: "Exterior", item: "Tire condition and pressure", status: "pending", notes: "" },
  { id: "7", category: "Exterior", item: "Wheel alignment visual", status: "pending", notes: "" },
  { id: "8", category: "Interior", item: "Dashboard warning lights", status: "pending", notes: "" },
  { id: "9", category: "Interior", item: "Seat belts functionality", status: "pending", notes: "" },
  { id: "10", category: "Interior", item: "Air conditioning system", status: "pending", notes: "" },
  { id: "11", category: "Interior", item: "Heating system", status: "pending", notes: "" },
  { id: "12", category: "Interior", item: "Horn functionality", status: "pending", notes: "" },
  { id: "13", category: "Interior", item: "Wipers and washers", status: "pending", notes: "" },
  { id: "14", category: "Interior", item: "Interior lights", status: "pending", notes: "" },
  { id: "15", category: "Under Hood", item: "Engine oil level", status: "pending", notes: "" },
  { id: "16", category: "Under Hood", item: "Coolant level", status: "pending", notes: "" },
  { id: "17", category: "Under Hood", item: "Brake fluid level", status: "pending", notes: "" },
  { id: "18", category: "Under Hood", item: "Power steering fluid", status: "pending", notes: "" },
  { id: "19", category: "Under Hood", item: "Battery condition", status: "pending", notes: "" },
  { id: "20", category: "Under Hood", item: "Belts and hoses", status: "pending", notes: "" },
  { id: "21", category: "Under Vehicle", item: "Oil leaks", status: "pending", notes: "" },
  { id: "22", category: "Under Vehicle", item: "Exhaust system", status: "pending", notes: "" },
  { id: "23", category: "Under Vehicle", item: "Suspension components", status: "pending", notes: "" },
  { id: "24", category: "Under Vehicle", item: "Brake pads and rotors", status: "pending", notes: "" },
  { id: "25", category: "Safety", item: "Spare tire and jack", status: "pending", notes: "" },
  { id: "26", category: "Safety", item: "First aid kit", status: "pending", notes: "" },
  { id: "27", category: "Safety", item: "Fire extinguisher", status: "pending", notes: "" },
  { id: "28", category: "Safety", item: "Warning triangle", status: "pending", notes: "" },
];

const mockChecklists: VehicleChecklistData[] = [
  {
    id: 1,
    vehicleId: 101,
    vehiclePlate: "ABC-1234",
    vehicleMake: "Toyota",
    vehicleModel: "Camry 2023",
    technicianName: "Ahmed Hassan",
    checklistDate: new Date().toISOString(),
    status: "in_progress",
    items: defaultChecklistItems.map((item, idx) => ({
      ...item,
      status: idx < 10 ? "pass" : "pending",
    })),
  },
  {
    id: 2,
    vehicleId: 102,
    vehiclePlate: "XYZ-5678",
    vehicleMake: "Honda",
    vehicleModel: "Accord 2022",
    technicianName: "Mohammed Ali",
    checklistDate: new Date(Date.now() - 86400000).toISOString(),
    status: "completed",
    items: defaultChecklistItems.map((item) => ({ ...item, status: "pass" as const })),
  },
  {
    id: 3,
    vehicleId: 103,
    vehiclePlate: "DEF-9012",
    vehicleMake: "BMW",
    vehicleModel: "X5 2023",
    technicianName: "Khalid Omar",
    checklistDate: new Date(Date.now() - 172800000).toISOString(),
    status: "pending_review",
    items: defaultChecklistItems.map((item, idx) => ({
      ...item,
      status: idx === 5 ? "fail" : "pass",
      notes: idx === 5 ? "Front left tire needs replacement" : "",
    })),
  },
];

export default function VehicleChecklist() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedChecklist, setSelectedChecklist] = useState<VehicleChecklistData | null>(null);
  const [isNewChecklistOpen, setIsNewChecklistOpen] = useState(false);
  const { toast } = useToast();

  const filteredChecklists = mockChecklists.filter((checklist) => {
    const matchesSearch =
      checklist.vehiclePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
      checklist.vehicleMake.toLowerCase().includes(searchQuery.toLowerCase()) ||
      checklist.vehicleModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      checklist.technicianName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || checklist.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, string> = {
      in_progress: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      completed: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
      pending_review: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    };
    return statusMap[status] || "bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300";
  };

  const getStatusLabel = (status: string) => {
    const labelMap: Record<string, string> = {
      in_progress: t('common.inProgress', 'In Progress'),
      completed: t('common.completed', 'Completed'),
      pending_review: t('vehicles.pendingReview', 'Pending Review'),
    };
    return labelMap[status] || status;
  };

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case "pass":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "fail":
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case "na":
        return <Circle className="w-5 h-5 text-gray-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getCompletionStats = (items: ChecklistItem[]) => {
    const total = items.length;
    const completed = items.filter((i) => i.status !== "pending").length;
    const passed = items.filter((i) => i.status === "pass").length;
    const failed = items.filter((i) => i.status === "fail").length;
    return { total, completed, passed, failed, percentage: Math.round((completed / total) * 100) };
  };

  const categories = Array.from(new Set(defaultChecklistItems.map((item) => item.category)));

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-salis-gray-dark/30 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-montserrat font-bold text-2xl text-gray-900 dark:text-white">
            {t('vehicles.vehicleChecklist', 'Vehicle Checklist')}
          </h1>
          <p className="font-poppins text-sm text-gray-600 dark:text-gray-400 mt-1">
            {t('vehicles.comprehensiveVehicleInspectionChecklists', 'Comprehensive vehicle inspection checklists for quality assurance')}
          </p>
        </div>
        <Dialog open={isNewChecklistOpen} onOpenChange={setIsNewChecklistOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
              data-testid="button-new-checklist"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t('vehicles.newChecklist', 'New Checklist')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-montserrat">{t('vehicles.startNewChecklist', 'Start New Checklist')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="font-poppins text-sm text-gray-700 dark:text-gray-300">
                  {t('vehicles.selectVehicle', 'Select Vehicle')}
                </label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('vehicles.chooseVehicle', 'Choose a vehicle')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="v1">ABC-1234 - Toyota Camry 2023</SelectItem>
                    <SelectItem value="v2">XYZ-5678 - Honda Accord 2022</SelectItem>
                    <SelectItem value="v3">DEF-9012 - BMW X5 2023</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="font-poppins text-sm text-gray-700 dark:text-gray-300">
                  {t('vehicles.assignTechnician', 'Assign Technician')}
                </label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder={t('vehicles.chooseTechnician', 'Choose a technician')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="t1">Ahmed Hassan</SelectItem>
                    <SelectItem value="t2">Mohammed Ali</SelectItem>
                    <SelectItem value="t3">Khalid Omar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
                onClick={() => {
                  setIsNewChecklistOpen(false);
                  toast({ title: t('vehicles.checklistCreated', 'Checklist created'), description: t('vehicles.newVehicleChecklistStarted', 'New vehicle checklist has been started') });
                }}
              >
                {t('vehicles.startChecklist', 'Start Checklist')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder={t('vehicles.searchByPlateVehicleTechnician', 'Search by plate, vehicle, or technician...')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 font-poppins"
                data-testid="input-search-checklist"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder={t('vehicles.filterByStatus', 'Filter by status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('vehicles.allStatus', 'All Status')}</SelectItem>
                <SelectItem value="in_progress">{t('common.inProgress', 'In Progress')}</SelectItem>
                <SelectItem value="completed">{t('common.completed', 'Completed')}</SelectItem>
                <SelectItem value="pending_review">{t('vehicles.pendingReview', 'Pending Review')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <h2 className="font-poppins font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            {t('vehicles.recentChecklists', 'Recent Checklists')} ({filteredChecklists.length})
          </h2>
          {filteredChecklists.map((checklist) => {
            const stats = getCompletionStats(checklist.items);
            return (
              <Card
                key={checklist.id}
                className={`bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark cursor-pointer transition-all hover:shadow-md ${
                  selectedChecklist?.id === checklist.id ? "ring-2 ring-gray-900 dark:ring-white" : ""
                }`}
                onClick={() => setSelectedChecklist(checklist)}
                data-testid={`card-checklist-${checklist.id}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      <span className="font-montserrat font-bold text-sm text-gray-900 dark:text-white">
                        {checklist.vehiclePlate}
                      </span>
                    </div>
                    <Badge className={`${getStatusBadge(checklist.status)} text-xs`}>
                      {getStatusLabel(checklist.status)}
                    </Badge>
                  </div>
                  <p className="font-poppins text-sm text-gray-700 dark:text-gray-300">
                    {checklist.vehicleMake} {checklist.vehicleModel}
                  </p>
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-600 dark:text-gray-400">
                    <User className="w-3 h-3" />
                    <span className="font-poppins">{checklist.technicianName}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3 h-3" />
                    <span className="font-poppins">{format(new Date(checklist.checklistDate), "MMM dd, yyyy")}</span>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs font-poppins text-gray-600 dark:text-gray-400 mb-1">
                      <span>{t('vehicles.progress', 'Progress')}</span>
                      <span>{stats.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-salis-gray-dark rounded-full h-2">
                      <div
                        className="bg-gray-900 dark:bg-white rounded-full h-2 transition-all"
                        style={{ width: `${stats.percentage}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          {selectedChecklist ? (
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
              <CardHeader className="border-b border-gray-200 dark:border-salis-gray-dark">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-montserrat text-xl text-gray-900 dark:text-white flex items-center gap-2">
                      <ClipboardList className="w-5 h-5" />
                      {selectedChecklist.vehiclePlate} - {t('vehicles.inspectionChecklist', 'Inspection Checklist')}
                    </CardTitle>
                    <p className="font-poppins text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {selectedChecklist.vehicleMake} {selectedChecklist.vehicleModel}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3"
                      data-testid="button-print-checklist"
                    >
                      <Printer className="w-4 h-4 mr-1" />
                      {t('common.print', 'Print')}
                    </Button>
                    <Button
                      size="sm"
                      className="h-8 px-3 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900"
                      data-testid="button-save-checklist"
                    >
                      <Save className="w-4 h-4 mr-1" />
                      {t('common.save', 'Save')}
                    </Button>
                  </div>
                </div>
                <div className="flex gap-4 mt-4">
                  {(() => {
                    const stats = getCompletionStats(selectedChecklist.items);
                    return (
                      <>
                        <div className="text-center">
                          <div className="font-montserrat font-bold text-2xl text-gray-900 dark:text-white">
                            {stats.completed}/{stats.total}
                          </div>
                          <div className="font-poppins text-xs text-gray-600 dark:text-gray-400">{t('vehicles.inspected', 'Inspected')}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-montserrat font-bold text-2xl text-green-600 dark:text-green-400">
                            {stats.passed}
                          </div>
                          <div className="font-poppins text-xs text-gray-600 dark:text-gray-400">{t('vehicles.passed', 'Passed')}</div>
                        </div>
                        <div className="text-center">
                          <div className="font-montserrat font-bold text-2xl text-red-600 dark:text-red-400">
                            {stats.failed}
                          </div>
                          <div className="font-poppins text-xs text-gray-600 dark:text-gray-400">{t('vehicles.failed', 'Failed')}</div>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </CardHeader>
              <CardContent className="p-4 max-h-[600px] overflow-y-auto">
                {categories.map((category) => (
                  <div key={category} className="mb-6">
                    <h3 className="font-poppins font-semibold text-sm text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-3 pb-2 border-b border-gray-200 dark:border-salis-gray-dark">
                      {category}
                    </h3>
                    <div className="space-y-3">
                      {selectedChecklist.items
                        .filter((item) => item.category === category)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-salis-gray-dark/30 hover:bg-gray-100 dark:hover:bg-salis-gray-dark/50 transition-colors"
                          >
                            <div className="mt-0.5">{getItemStatusIcon(item.status)}</div>
                            <div className="flex-1">
                              <p className="font-poppins text-sm text-gray-900 dark:text-white">
                                {item.item}
                              </p>
                              {item.notes && (
                                <p className="font-poppins text-xs text-red-600 dark:text-red-400 mt-1">
                                  {t('common.notes', 'Note')}: {item.notes}
                                </p>
                              )}
                            </div>
                            <Select defaultValue={item.status}>
                              <SelectTrigger className="w-24 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">{t('common.pending', 'Pending')}</SelectItem>
                                <SelectItem value="pass">{t('vehicles.pass', 'Pass')}</SelectItem>
                                <SelectItem value="fail">{t('vehicles.fail', 'Fail')}</SelectItem>
                                <SelectItem value="na">{t('vehicles.notApplicable', 'N/A')}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark h-full min-h-[400px] flex items-center justify-center">
              <div className="text-center p-8">
                <ClipboardList className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="font-montserrat font-semibold text-lg text-gray-900 dark:text-white mb-2">
                  {t('vehicles.selectChecklist', 'Select a Checklist')}
                </h3>
                <p className="font-poppins text-sm text-gray-600 dark:text-gray-400">
                  {t('vehicles.chooseVehicleChecklistToViewEdit', 'Choose a vehicle checklist from the list to view and edit inspection items')}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
