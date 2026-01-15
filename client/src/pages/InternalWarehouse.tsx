import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TabsPageLayout } from "@/components/layouts";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Warehouse, 
  MapPin, 
  Package, 
  Plus,
  ArrowRightLeft,
  BoxSelect,
  Layers,
  Grid3X3,
  Search,
  Edit,
  Trash2,
  CheckCircle
} from "lucide-react";
import { format } from "date-fns";

const locationSchema = z.object({
  locationCode: z.string().min(1, "Location code is required"),
  locationName: z.string().min(1, "Location name is required"),
  zone: z.string().min(1, "Zone is required"),
  aisle: z.string().optional(),
  rack: z.string().optional(),
  shelf: z.string().optional(),
  bin: z.string().optional(),
  locationType: z.enum(["storage", "receiving", "shipping", "staging", "quarantine", "returns"]),
  capacity: z.string().optional(),
  currentOccupancy: z.string().default("0"),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
});

const transferSchema = z.object({
  partId: z.string().min(1, "Part is required"),
  fromLocationId: z.string().min(1, "Source location is required"),
  toLocationId: z.string().min(1, "Destination location is required"),
  quantity: z.string().min(1, "Quantity is required"),
  reason: z.string().min(1, "Reason is required"),
  notes: z.string().optional(),
});

const zoneSchema = z.object({
  zoneName: z.string().min(1, "Zone name is required"),
  zoneCode: z.string().min(1, "Zone code is required"),
  description: z.string().optional(),
  temperature: z.enum(["ambient", "cold", "frozen"]).default("ambient"),
  isActive: z.boolean().default(true),
});

type LocationFormData = z.infer<typeof locationSchema>;
type TransferFormData = z.infer<typeof transferSchema>;
type ZoneFormData = z.infer<typeof zoneSchema>;

interface WarehouseLocation {
  id: string;
  locationCode: string;
  locationName: string;
  zone: string;
  aisle?: string;
  rack?: string;
  shelf?: string;
  bin?: string;
  locationType: string;
  capacity?: string;
  currentOccupancy: string;
  isActive: boolean;
  notes?: string;
  createdAt: string;
}

interface WarehouseZone {
  id: string;
  zoneName: string;
  zoneCode: string;
  description?: string;
  temperature: string;
  isActive: boolean;
  createdAt: string;
}

interface InventoryTransfer {
  id: string;
  partId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: string;
  reason: string;
  status: string;
  transferredAt: string;
  createdAt: string;
}

export default function InternalWarehouse() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isZoneDialogOpen, setIsZoneDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);

  const { data: locations = [], isLoading: locationsLoading } = useQuery<WarehouseLocation[]>({
    queryKey: ["/api/warehouse-locations"],
  });

  const { data: zones = [], isLoading: zonesLoading } = useQuery<WarehouseZone[]>({
    queryKey: ["/api/warehouse-zones"],
  });

  const { data: transfers = [], isLoading: transfersLoading } = useQuery<InventoryTransfer[]>({
    queryKey: ["/api/inventory-transfers"],
  });

  const { data: spareParts = [] } = useQuery<any[]>({
    queryKey: ["/api/spare-parts"],
  });

  const locationForm = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      locationCode: "",
      locationName: "",
      zone: "",
      aisle: "",
      rack: "",
      shelf: "",
      bin: "",
      locationType: "storage",
      capacity: "",
      currentOccupancy: "0",
      isActive: true,
      notes: "",
    },
  });

  const zoneForm = useForm<ZoneFormData>({
    resolver: zodResolver(zoneSchema),
    defaultValues: {
      zoneName: "",
      zoneCode: "",
      description: "",
      temperature: "ambient",
      isActive: true,
    },
  });

  const transferForm = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      partId: "",
      fromLocationId: "",
      toLocationId: "",
      quantity: "",
      reason: "",
      notes: "",
    },
  });

  const locationMutation = useMutation({
    mutationFn: async (data: LocationFormData) => {
      if (editingLocationId) {
        return await apiRequest("PATCH", `/api/warehouse-locations/${editingLocationId}`, data);
      }
      return await apiRequest("POST", "/api/warehouse-locations", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouse-locations"] });
      setIsLocationDialogOpen(false);
      setEditingLocationId(null);
      locationForm.reset();
      toast({ title: editingLocationId ? t('inventory.locationUpdated', 'Location updated') : t('inventory.locationCreated', 'Location created') });
    },
    onError: () => {
      toast({ title: t('inventory.errorSavingLocation', 'Error saving location'), variant: "destructive" });
    },
  });

  const zoneMutation = useMutation({
    mutationFn: async (data: ZoneFormData) => {
      return await apiRequest("POST", "/api/warehouse-zones", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/warehouse-zones"] });
      setIsZoneDialogOpen(false);
      zoneForm.reset();
      toast({ title: t('inventory.zoneCreated', 'Zone created') });
    },
    onError: () => {
      toast({ title: t('inventory.errorCreatingZone', 'Error creating zone'), variant: "destructive" });
    },
  });

  const transferMutation = useMutation({
    mutationFn: async (data: TransferFormData) => {
      return await apiRequest("POST", "/api/inventory-transfers", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory-transfers"] });
      queryClient.invalidateQueries({ queryKey: ["/api/warehouse-locations"] });
      setIsTransferDialogOpen(false);
      transferForm.reset();
      toast({ title: t('inventory.transferCompleted', 'Transfer completed') });
    },
    onError: () => {
      toast({ title: t('inventory.errorCompletingTransfer', 'Error completing transfer'), variant: "destructive" });
    },
  });

  const filteredLocations = locations.filter(loc => {
    const matchesSearch = loc.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          loc.locationCode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === "all" || loc.zone === selectedZone;
    return matchesSearch && matchesZone;
  });

  const totalLocations = locations.length;
  const activeLocations = locations.filter(l => l.isActive).length;
  const totalCapacity = locations.reduce((sum, l) => sum + parseInt(l.capacity || "0"), 0);
  const currentOccupancy = locations.reduce((sum, l) => sum + parseInt(l.currentOccupancy || "0"), 0);

  const locationsTab = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#64748B]" />
            <Input
              placeholder={t('inventory.searchLocations', 'Search locations...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
              data-testid="input-search-locations"
            />
          </div>
          <Select value={selectedZone} onValueChange={setSelectedZone}>
            <SelectTrigger className="w-48" data-testid="select-zone-filter">
              <SelectValue placeholder={t('inventory.allZones', 'All Zones')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('inventory.allZones', 'All Zones')}</SelectItem>
              {zones.map((zone) => (
                <SelectItem key={zone.id} value={zone.zoneCode}>
                  {zone.zoneName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" onClick={() => setIsLocationDialogOpen(true)} data-testid="button-add-location">
          <Plus className="h-4 w-4 mr-2" />
          {t('inventory.addLocation', 'Add Location')}
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-locations">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('inventory.totalLocations', 'Total Locations')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{totalLocations}</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-active-locations">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('inventory.activeLocations', 'Active Locations')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeLocations}</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-total-capacity">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('inventory.totalCapacity', 'Total Capacity')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{totalCapacity} {t('inventory.units', 'units')}</div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-occupancy">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">{t('inventory.currentOccupancy', 'Current Occupancy')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0A5ED7]">
              {totalCapacity > 0 ? Math.round((currentOccupancy / totalCapacity) * 100) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {locationsLoading ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="py-8 text-center text-[#64748B]">{t('inventory.loadingLocations', 'Loading locations...')}</CardContent>
        </Card>
      ) : filteredLocations.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="py-8 text-center text-[#64748B]">
            {t('inventory.noWarehouseLocations', 'No warehouse locations found. Add your first location to get started.')}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <Table>
            <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.locationCode', 'Location Code')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.name', 'Name')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.zone', 'Zone')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.position', 'Position')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.type', 'Type')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.capacity', 'Capacity')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('inventory.occupancy', 'Occupancy')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLocations.map((location) => (
                <TableRow key={location.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-location-${location.id}`}>
                  <TableCell className="font-mono font-medium text-[#0B1F3B] dark:text-white">{location.locationCode}</TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{location.locationName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">{location.zone}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-[#64748B]">
                    {[location.aisle, location.rack, location.shelf, location.bin].filter(Boolean).join("-") || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize bg-[#0A5ED7]/10 text-[#0A5ED7] dark:text-[#0BB3FF]">{location.locationType}</Badge>
                  </TableCell>
                  <TableCell className="text-[#0B1F3B] dark:text-white">{location.capacity || "-"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-[#E2E8F0] dark:bg-[#232A36] rounded-full">
                        <div 
                          className="h-2 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] rounded-full" 
                          style={{ 
                            width: `${Math.min(100, (parseInt(location.currentOccupancy) / parseInt(location.capacity || "1")) * 100)}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-[#0B1F3B] dark:text-white">{location.currentOccupancy}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={location.isActive ? "bg-green-600 text-white" : "bg-[#64748B] text-white"}>
                      {location.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingLocationId(location.id);
                          locationForm.reset(location as any);
                          setIsLocationDialogOpen(true);
                        }}
                        data-testid={`button-edit-location-${location.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );

  const zonesTab = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-[#0B1F3B] dark:text-white">{t('inventory.warehouseZones', 'Warehouse Zones')}</h3>
        <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" onClick={() => setIsZoneDialogOpen(true)} data-testid="button-add-zone">
          <Plus className="h-4 w-4 mr-2" />
          {t('inventory.addZone', 'Add Zone')}
        </Button>
      </div>

      {zonesLoading ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="py-8 text-center text-[#64748B]">{t('inventory.loadingZones', 'Loading zones...')}</CardContent>
        </Card>
      ) : zones.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="py-8 text-center text-[#64748B]">
            {t('inventory.noZonesConfigured', 'No zones configured. Add zones to organize your warehouse.')}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {zones.map((zone) => (
            <Card key={zone.id} className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid={`card-zone-${zone.id}`}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                      <Grid3X3 className="h-5 w-5 text-[#0A5ED7]" />
                      {zone.zoneName}
                    </CardTitle>
                    <CardDescription className="text-[#64748B]">{t('inventory.code', 'Code')}: {zone.zoneCode}</CardDescription>
                  </div>
                  <Badge className={zone.isActive ? "bg-green-600 text-white" : "bg-[#64748B] text-white"}>
                    {zone.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">{t('inventory.temperature', 'Temperature')}</span>
                    <span className="capitalize font-medium text-[#0B1F3B] dark:text-white">{zone.temperature}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#64748B]">{t('inventory.locations', 'Locations')}</span>
                    <span className="font-medium text-[#0B1F3B] dark:text-white">
                      {locations.filter(l => l.zone === zone.zoneCode).length}
                    </span>
                  </div>
                  {zone.description && (
                    <p className="text-sm text-[#64748B] mt-2">{zone.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const transfersTab = (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-[#0B1F3B] dark:text-white">Stock Transfers</h3>
        <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" onClick={() => setIsTransferDialogOpen(true)} data-testid="button-new-transfer">
          <ArrowRightLeft className="h-4 w-4 mr-2" />
          New Transfer
        </Button>
      </div>

      {transfersLoading ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="py-8 text-center text-[#64748B]">Loading transfers...</CardContent>
        </Card>
      ) : transfers.length === 0 ? (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardContent className="py-8 text-center text-[#64748B]">
            No stock transfers recorded
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <Table>
            <TableHeader className="bg-[#F8FAFC] dark:bg-[#0E1117]">
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#0B1F3B] dark:text-white">Date</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">Part</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">From</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">To</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">Quantity</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">Reason</TableHead>
                <TableHead className="text-[#0B1F3B] dark:text-white">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transfers.map((transfer) => {
                const fromLocation = locations.find(l => l.id === transfer.fromLocationId);
                const toLocation = locations.find(l => l.id === transfer.toLocationId);
                const part = spareParts.find(p => p.id === transfer.partId);
                return (
                  <TableRow key={transfer.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-transfer-${transfer.id}`}>
                    <TableCell className="text-[#0B1F3B] dark:text-white">{format(new Date(transfer.createdAt), "dd/MM/yyyy HH:mm")}</TableCell>
                    <TableCell className="text-[#0B1F3B] dark:text-white">{part?.partName || transfer.partId}</TableCell>
                    <TableCell className="text-[#64748B]">{fromLocation?.locationCode || transfer.fromLocationId}</TableCell>
                    <TableCell className="text-[#64748B]">{toLocation?.locationCode || transfer.toLocationId}</TableCell>
                    <TableCell className="text-[#0B1F3B] dark:text-white">{transfer.quantity}</TableCell>
                    <TableCell className="text-[#64748B]">{transfer.reason}</TableCell>
                    <TableCell>
                      <Badge className={transfer.status === "completed" ? "bg-green-600 text-white" : "bg-[#64748B] text-white"}>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {transfer.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );

  const layoutTab = (
    <div className="space-y-6">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <CardTitle className="text-[#0B1F3B] dark:text-white">Warehouse Layout</CardTitle>
          <CardDescription className="text-[#64748B]">Visual representation of warehouse zones and locations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {zones.map((zone) => {
              const zoneLocations = locations.filter(l => l.zone === zone.zoneCode);
              return (
                <div key={zone.id} className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4" data-testid={`layout-zone-${zone.id}`}>
                  <h4 className="font-medium mb-2 flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                    <Layers className="h-4 w-4 text-[#0A5ED7]" />
                    {zone.zoneName}
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {zoneLocations.slice(0, 8).map((loc) => (
                      <div 
                        key={loc.id}
                        className={`p-2 text-xs rounded ${
                          loc.isActive ? "bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/30 text-[#0A5ED7] dark:text-[#0BB3FF]" : "bg-[#F8FAFC] dark:bg-[#0E1117] text-[#64748B]"
                        }`}
                      >
                        {loc.locationCode}
                      </div>
                    ))}
                    {zoneLocations.length > 8 && (
                      <div className="p-2 text-xs text-[#64748B]">
                        +{zoneLocations.length - 8} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <TabsPageLayout
        title={t('warehouse.title', 'Internal Warehouse')}
        description={t('warehouse.description', 'Manage warehouse locations, zones, and inventory movements')}
        defaultTab="locations"
        tabs={[
          { id: "locations", label: t('warehouse.locations', 'Locations'), icon: MapPin, content: locationsTab },
          { id: "zones", label: t('warehouse.zones', 'Zones'), icon: Grid3X3, content: zonesTab },
          { id: "transfers", label: t('warehouse.transfers', 'Transfers'), icon: ArrowRightLeft, content: transfersTab },
          { id: "layout", label: t('warehouse.layout', 'Layout'), icon: Layers, content: layoutTab },
        ]}
      />

      <Dialog open={isLocationDialogOpen} onOpenChange={setIsLocationDialogOpen}>
        <DialogContent className="max-w-2xl bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="modal-location">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{editingLocationId ? t('warehouse.editLocation', 'Edit Location') : t('warehouse.addLocation', 'Add Location')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('warehouse.configureLocationDetails', 'Configure warehouse location details')}</DialogDescription>
          </DialogHeader>
          <Form {...locationForm}>
            <form onSubmit={locationForm.handleSubmit((data) => locationMutation.mutate(data))} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={locationForm.control}
                  name="locationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('warehouse.locationCode', 'Location Code')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="A-01-01-01" data-testid="input-location-code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={locationForm.control}
                  name="locationName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('warehouse.locationName', 'Location Name')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder={t('warehouse.mainStorageArea', 'Main Storage Area 1')} data-testid="input-location-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={locationForm.control}
                  name="zone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('warehouse.zone', 'Zone')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-location-zone">
                            <SelectValue placeholder={t('warehouse.selectZone', 'Select Zone')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {zones.map((zone) => (
                            <SelectItem key={zone.id} value={zone.zoneCode}>
                              {zone.zoneName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={locationForm.control}
                  name="locationType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('warehouse.locationType', 'Location Type')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-location-type">
                            <SelectValue placeholder={t('warehouse.selectType', 'Select Type')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="storage">{t('warehouse.storage', 'Storage')}</SelectItem>
                          <SelectItem value="receiving">{t('warehouse.receiving', 'Receiving')}</SelectItem>
                          <SelectItem value="shipping">{t('warehouse.shipping', 'Shipping')}</SelectItem>
                          <SelectItem value="staging">{t('warehouse.staging', 'Staging')}</SelectItem>
                          <SelectItem value="quarantine">{t('warehouse.quarantine', 'Quarantine')}</SelectItem>
                          <SelectItem value="returns">{t('warehouse.returns', 'Returns')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={locationForm.control}
                  name="aisle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('warehouse.aisle', 'Aisle')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="A" data-testid="input-aisle" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={locationForm.control}
                  name="rack"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('warehouse.rack', 'Rack')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="01" data-testid="input-rack" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={locationForm.control}
                  name="shelf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('warehouse.shelf', 'Shelf')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="01" data-testid="input-shelf" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={locationForm.control}
                  name="bin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('warehouse.bin', 'Bin')}</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="01" data-testid="input-bin" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={locationForm.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('warehouse.capacity', 'Capacity')}</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" placeholder="100" data-testid="input-capacity" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={locationForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('warehouse.notes', 'Notes')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('warehouse.additionalNotes', 'Additional notes...')} data-testid="input-location-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsLocationDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={locationMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-save-location">
                  {locationMutation.isPending ? t('common.saving', 'Saving...') : t('warehouse.saveLocation', 'Save Location')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isZoneDialogOpen} onOpenChange={setIsZoneDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="modal-zone">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('warehouse.addZone', 'Add Zone')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('warehouse.createNewZone', 'Create a new warehouse zone')}</DialogDescription>
          </DialogHeader>
          <Form {...zoneForm}>
            <form onSubmit={zoneForm.handleSubmit((data) => zoneMutation.mutate(data))} className="space-y-4">
              <FormField
                control={zoneForm.control}
                name="zoneName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('warehouse.zoneName', 'Zone Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('warehouse.mainStorage', 'Main Storage')} data-testid="input-zone-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={zoneForm.control}
                name="zoneCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('warehouse.zoneCode', 'Zone Code')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="MAIN" data-testid="input-zone-code" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={zoneForm.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('warehouse.temperature', 'Temperature')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-zone-temperature">
                          <SelectValue placeholder={t('warehouse.selectTemperature', 'Select Temperature')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ambient">{t('warehouse.ambient', 'Ambient')}</SelectItem>
                        <SelectItem value="cold">{t('warehouse.cold', 'Cold')}</SelectItem>
                        <SelectItem value="frozen">{t('warehouse.frozen', 'Frozen')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={zoneForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('warehouse.zoneDescription', 'Zone description...')} data-testid="input-zone-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsZoneDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={zoneMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-save-zone">
                  {zoneMutation.isPending ? t('common.saving', 'Saving...') : t('warehouse.saveZone', 'Save Zone')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="modal-transfer">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('warehouse.stockTransfer', 'Stock Transfer')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('warehouse.transferBetweenLocations', 'Transfer inventory between locations')}</DialogDescription>
          </DialogHeader>
          <Form {...transferForm}>
            <form onSubmit={transferForm.handleSubmit((data) => transferMutation.mutate(data))} className="space-y-4">
              <FormField
                control={transferForm.control}
                name="partId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('warehouse.part', 'Part')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-transfer-part">
                          <SelectValue placeholder={t('warehouse.selectPart', 'Select Part')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {spareParts.map((part) => (
                          <SelectItem key={part.id} value={part.id}>
                            {part.partName} ({part.partNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={transferForm.control}
                  name="fromLocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('warehouse.fromLocation', 'From Location')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-from-location">
                            <SelectValue placeholder={t('warehouse.selectSource', 'Select Source')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.filter(l => l.isActive).map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              {loc.locationCode} - {loc.locationName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={transferForm.control}
                  name="toLocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('warehouse.toLocation', 'To Location')}</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-to-location">
                            <SelectValue placeholder={t('warehouse.selectDestination', 'Select Destination')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {locations.filter(l => l.isActive).map((loc) => (
                            <SelectItem key={loc.id} value={loc.id}>
                              {loc.locationCode} - {loc.locationName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={transferForm.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('common.quantity', 'Quantity')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" placeholder="1" data-testid="input-transfer-quantity" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={transferForm.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('warehouse.reason', 'Reason')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('warehouse.reasonForTransfer', 'Reason for transfer')} data-testid="input-transfer-reason" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsTransferDialogOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={transferMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-complete-transfer">
                  {transferMutation.isPending ? t('warehouse.transferring', 'Transferring...') : t('warehouse.completeTransfer', 'Complete Transfer')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
