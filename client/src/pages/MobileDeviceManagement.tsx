import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { StandardTablePage } from "@/components/layouts";
import { Smartphone, Plus, Trash2, Edit, Shield, Battery, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
        title: "Success",
        description: "Device created successfully",
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
        title: "Success",
        description: "Device deleted successfully",
      });
    },
  });

  const columns: Column<Device>[] = [
    {
      key: "deviceName",
      label: "Device Name",
      render: (device) => (
        <div className="flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-primary" />
          <span className="font-medium">{device.deviceName}</span>
        </div>
      ),
    },
    {
      key: "deviceType",
      label: "Type",
      render: (device) => (
        <Badge variant="outline" className="capitalize">
          {device.deviceType}
        </Badge>
      ),
    },
    {
      key: "assignedTo",
      label: "Assigned To",
      render: (device) => device.assignedTo || "Unassigned",
    },
    {
      key: "status",
      label: "Status",
      render: (device) => (
        <Badge
          className={
            device.status === "active"
              ? "bg-green-100 text-green-700 dark:bg-green-900/30"
              : device.status === "maintenance"
              ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30"
              : "bg-gray-100 text-gray-700 dark:bg-gray-900/30"
          }
        >
          {device.status}
        </Badge>
      ),
    },
    {
      key: "batteryLevel",
      label: "Battery",
      render: (device) =>
        device.batteryLevel ? (
          <div className="flex items-center gap-2">
            <Battery className="h-4 w-4" />
            <span>{device.batteryLevel}%</span>
          </div>
        ) : (
          "N/A"
        ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (device) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedDevice(device)}
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
        title="Mobile Device Management"
        description="Manage tablets, phones, and scanners used by technicians"
        icon={Smartphone}
        data={devices}
        isLoading={isLoading}
        columns={columns}
        searchPlaceholder="Search devices..."
        actions={[
          {
            label: "Add Device",
            onClick: () => setIsCreateOpen(true),
            icon: Plus,
          },
        ]}
        emptyState={{
          icon: Smartphone,
          title: "No devices found",
          description: "Add your first mobile device to get started",
          actions: [
            {
              label: "Add Device",
              onClick: () => setIsCreateOpen(true),
              icon: Plus,
            },
          ],
        }}
      />

      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Device</DialogTitle>
            <DialogDescription>Register a new mobile device</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit((data) => createDeviceMutation.mutate(data))} className="space-y-4">
              <FormField
                control={form.control}
                name="deviceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Device Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Tablet-001" data-testid="input-device-name" />
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
                    <FormLabel>Device Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-device-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tablet">Tablet</SelectItem>
                        <SelectItem value="phone">Phone</SelectItem>
                        <SelectItem value="scanner">Scanner</SelectItem>
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
                    <FormLabel>Assigned To</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Technician name" data-testid="input-assigned-to" />
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
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)} data-testid="button-cancel">
                  Cancel
                </Button>
                <Button type="submit" data-testid="button-submit">
                  Add Device
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
