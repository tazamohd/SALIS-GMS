import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardTablePage } from "@/components/layouts";
import { Smartphone, Plus, Trash2, Edit, Battery } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Column } from "@/components/DataTable";

const deviceSchema = z.object({
  deviceName: z.string().min(1, "Device name is required"),
  deviceType: z.enum(["tablet", "phone", "scanner"]),
  assignedTo: z.string().optional(),
  status: z.enum(["active", "inactive", "maintenance"]),
});

type Device = {
  id: string;
  deviceName: string;
  deviceType: string;
  assignedTo?: string;
  status: string;
  batteryLevel?: number;
  lastSync?: string;
};

export default function MobileDeviceManagement() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);

  const { data: devices = [], isLoading } = useQuery<Device[]>({
    queryKey: ["/api/mobile-devices"],
  });

  const form = useForm({
    resolver: zodResolver(deviceSchema),
    defaultValues: {
      deviceName: "",
      deviceType: "tablet" as const,
      assignedTo: "",
      status: "active" as const,
    },
  });

  const createDeviceMutation = useMutation({
    mutationFn: async (data: z.infer<typeof deviceSchema>) => {
      return await apiRequest("POST", "/api/mobile-devices", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mobile-devices"] });
      setIsCreateOpen(false);
      form.reset();
      toast({
        title: t('common.success', 'Success'),
        description: t('mdm.deviceCreated', 'Device created successfully'),
      });
    },
  });

  const deleteDeviceMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/mobile-devices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mobile-devices"] });
      toast({
        title: t('common.success', 'Success'),
        description: t('mdm.deviceDeleted', 'Device deleted successfully'),
      });
    },
  });

  const columns: Column<Device>[] = [
    {
      key: "deviceName",
      label: t('mdm.deviceName', 'Device Name'),
      render: (device) => (
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-[#0A5ED7]" />
          <span className="font-medium text-[#0B1F3B] dark:text-white">{device.deviceName}</span>
        </div>
      ),
    },
    {
      key: "deviceType",
      label: t('common.type', 'Type'),
      render: (device) => (
        <Badge variant="outline" className="capitalize border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">
          {device.deviceType === 'tablet' ? t('mdm.tablet', 'Tablet') : 
           device.deviceType === 'phone' ? t('mdm.phone', 'Phone') : 
           t('mdm.scanner', 'Scanner')}
        </Badge>
      ),
    },
    {
      key: "assignedTo",
      label: t('mdm.assignedTo', 'Assigned To'),
      render: (device) => (
        <span className="text-[#64748B]">
          {device.assignedTo || t('mdm.unassigned', 'Unassigned')}
        </span>
      ),
    },
    {
      key: "status",
      label: t('common.status', 'Status'),
      render: (device) => (
        <Badge
          className={
            device.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : device.status === "maintenance"
              ? "bg-[#F97316]/10 text-[#F97316] dark:bg-[#F97316]/20"
              : "bg-[#F8FAFC] text-[#64748B] dark:bg-[#232A36]"
          }
        >
          {device.status === 'active' ? t('common.active', 'Active') : 
           device.status === 'maintenance' ? t('mdm.maintenance', 'Maintenance') : 
           t('common.inactive', 'Inactive')}
        </Badge>
      ),
    },
    {
      key: "batteryLevel",
      label: t('mdm.battery', 'Battery'),
      render: (device) =>
        device.batteryLevel ? (
          <div className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
            <Battery className="h-4 w-4 text-[#64748B]" />
            <span>{device.batteryLevel}%</span>
          </div>
        ) : (
          <span className="text-[#64748B]">{t('drone.na', 'N/A')}</span>
        ),
    },
    {
      key: "actions",
      label: t('common.actions', 'Actions'),
      render: (device) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedDevice(device)}
            className="border-[#E2E8F0] dark:border-[#232A36]"
            data-testid={`button-edit-${device.id}`}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => deleteDeviceMutation.mutate(device.id)}
            data-testid={`button-delete-${device.id}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <StandardTablePage
        title={t('mdm.title', 'Mobile Device Management')}
        description={t('mdm.description', 'Manage tablets, phones, and scanners used by technicians')}
        icon={Smartphone}
        data={devices}
        isLoading={isLoading}
        columns={columns}
        searchPlaceholder={t('mdm.searchDevices', 'Search devices...')}
        actions={[
          {
            label: t('mdm.addDevice', 'Add Device'),
            onClick: () => setIsCreateOpen(true),
            icon: Plus,
          },
        ]}
        emptyState={{
          icon: Smartphone,
          title: t('mdm.noDevicesFound', 'No devices found'),
          description: t('mdm.addFirstDevice', 'Add your first mobile device to get started'),
          actions: [
            {
              label: t('mdm.addDevice', 'Add Device'),
              onClick: () => setIsCreateOpen(true),
              icon: Plus,
            },
          ],
        }}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('mdm.addNewDevice', 'Add New Device')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">{t('mdm.registerNewDevice', 'Register a new mobile device')}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createDeviceMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="deviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('mdm.deviceName', 'Device Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tablet-001" className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-device-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="deviceType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('mdm.deviceType', 'Device Type')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-device-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        <SelectItem value="tablet">{t('mdm.tablet', 'Tablet')}</SelectItem>
                        <SelectItem value="phone">{t('mdm.phone', 'Phone')}</SelectItem>
                        <SelectItem value="scanner">{t('mdm.scanner', 'Scanner')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('mdm.assignedTo', 'Assigned To')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('mdm.technicianName', 'Technician name')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-assigned-to" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.status', 'Status')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                        <SelectItem value="active">{t('common.active', 'Active')}</SelectItem>
                        <SelectItem value="inactive">{t('common.inactive', 'Inactive')}</SelectItem>
                        <SelectItem value="maintenance">{t('mdm.maintenance', 'Maintenance')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid="button-cancel">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" data-testid="button-submit">
                  {t('mdm.addDevice', 'Add Device')}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
