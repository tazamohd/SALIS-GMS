import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarClock, Car, CheckCircle, XCircle } from "lucide-react";

interface Booking {
  id: string; customerId: string; serviceName: string | null; status: string;
  vehicleMake: string | null; vehicleModel: string | null; vehicleYear: number | null; vehiclePlate: string | null;
  preferredDate: string | null; notes: string | null; createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  requested: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  accepted: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  completed: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  declined: "text-red-600 bg-red-50 dark:bg-red-900/20",
  cancelled: "text-slate-500 bg-slate-50 dark:bg-slate-800/40",
};

export default function ProviderBookings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const bookings = useQuery<Booking[]>({
    queryKey: ["/api/provider/bookings"],
    queryFn: async () => (await apiRequest("GET", "/api/provider/bookings")).json(),
  });

  const act = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) =>
      (await apiRequest("PATCH", `/api/provider/bookings/${id}`, { status })).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/provider/bookings"] }); toast({ title: "Booking updated" }); },
    onError: (e: Error) => toast({ title: "Update failed", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white flex items-center gap-2"><CalendarClock className="h-6 w-6 text-[#0A5ED7]" /> Incoming Bookings</h1>
      <Card className="border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader><CardTitle className="text-base">Marketplace requests</CardTitle></CardHeader>
        <CardContent>
          {bookings.isLoading ? <p className="text-sm text-[#64748B]">Loading…</p>
          : (bookings.data?.length ?? 0) === 0 ? <p className="text-sm text-[#64748B]" data-testid="no-provider-bookings">No bookings yet.</p>
          : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead><TableHead>Vehicle</TableHead><TableHead>Preferred</TableHead>
                    <TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.data!.map((b) => (
                    <TableRow key={b.id} data-testid={`pbooking-${b.id}`}>
                      <TableCell className="font-medium">{b.serviceName ?? "General"}</TableCell>
                      <TableCell className="text-xs">
                        <span className="flex items-center gap-1"><Car className="h-3 w-3" />{[b.vehicleYear, b.vehicleMake, b.vehicleModel].filter(Boolean).join(" ") || "—"}</span>
                        {b.vehiclePlate && <span className="text-[#64748B]">{b.vehiclePlate}</span>}
                      </TableCell>
                      <TableCell className="text-xs">{b.preferredDate ? new Date(b.preferredDate).toLocaleString() : "—"}</TableCell>
                      <TableCell><span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLE[b.status] ?? ""}`}>{b.status}</span></TableCell>
                      <TableCell className="text-right space-x-1">
                        {b.status === "requested" && (
                          <>
                            <Button size="sm" data-testid={`accept-${b.id}`} onClick={() => act.mutate({ id: b.id, status: "accepted" })} className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"><CheckCircle className="h-3.5 w-3.5 mr-1" />Accept</Button>
                            <Button size="sm" variant="outline" data-testid={`decline-${b.id}`} onClick={() => act.mutate({ id: b.id, status: "declined" })} className="h-8"><XCircle className="h-3.5 w-3.5 mr-1" />Decline</Button>
                          </>
                        )}
                        {b.status === "accepted" && (
                          <Button size="sm" data-testid={`complete-${b.id}`} onClick={() => act.mutate({ id: b.id, status: "completed" })} className="bg-blue-600 hover:bg-blue-700 text-white h-8">Mark complete</Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
