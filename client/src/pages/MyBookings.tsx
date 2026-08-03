import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { CalendarClock, Car } from "lucide-react";

interface MyNotification {
  id: string; title: string; message: string; status: string; createdAt: string;
}

interface Booking {
  id: string; providerId: string; serviceName: string | null; status: string;
  vehicleMake: string | null; vehicleModel: string | null; vehicleYear: number | null; vehiclePlate: string | null;
  preferredDate: string | null; notes: string | null; providerNotes: string | null; createdAt: string;
}

const STATUS_STYLE: Record<string, string> = {
  requested: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
  accepted: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20",
  completed: "text-blue-600 bg-blue-50 dark:bg-blue-900/20",
  declined: "text-red-600 bg-red-50 dark:bg-red-900/20",
  cancelled: "text-slate-500 bg-slate-50 dark:bg-slate-800/40",
};

export default function MyBookings() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const bookings = useQuery<Booking[]>({
    queryKey: ["/api/my/bookings"],
    queryFn: async () => (await apiRequest("GET", "/api/my/bookings")).json(),
  });

  const cancel = useMutation({
    mutationFn: async (id: string) => (await apiRequest("POST", `/api/my/bookings/${id}/cancel`, {})).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/my/bookings"] }); toast({ title: "Booking cancelled" }); },
    onError: (e: Error) => toast({ title: "Could not cancel", description: e.message, variant: "destructive" }),
  });

  const orders = useQuery<any[]>({
    queryKey: ["/api/my/orders"],
    queryFn: async () => (await apiRequest("GET", "/api/my/orders")).json(),
  });
  const cancelOrder = useMutation({
    mutationFn: async (id: string) => (await apiRequest("POST", `/api/my/orders/${id}/cancel`, {})).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/my/orders"] }); toast({ title: "Order cancelled" }); },
  });

  const quotes = useQuery<any[]>({
    queryKey: ["/api/my/quotes"],
    queryFn: async () => (await apiRequest("GET", "/api/my/quotes")).json(),
  });
  const decideQuote = useMutation({
    mutationFn: async ({ id, d }: { id: string; d: "accept" | "cancel" }) =>
      (await apiRequest("POST", `/api/my/quotes/${id}/${d}`, {})).json(),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/my/quotes"] }); toast({ title: "Updated" }); },
    onError: (e: Error) => toast({ title: "Could not update", description: e.message, variant: "destructive" }),
  });

  const notifications = useQuery<MyNotification[]>({
    queryKey: ["/api/my/notifications"],
    queryFn: async () => (await apiRequest("GET", "/api/my/notifications")).json(),
  });
  const markRead = useMutation({
    mutationFn: async (id: string) => apiRequest("POST", `/api/my/notifications/${id}/read`, {}),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["/api/my/notifications"] }),
  });
  const unread = (notifications.data ?? []).filter((n) => n.status !== "read");

  return (
    <div className="min-h-screen p-6 bg-[#F8FAFC] dark:bg-[#0E1117]">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white flex items-center gap-2"><CalendarClock className="h-6 w-6 text-[#0A5ED7]" /> My Bookings</h1>
          <Link href="/marketplace"><Button variant="outline">Find a provider</Button></Link>
        </div>

        {unread.length > 0 && (
          <Card className="border-[#0A5ED7]/30 bg-[#0A5ED7]/5 dark:bg-[#0A5ED7]/10">
            <CardContent className="p-4 space-y-2">
              {unread.slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-start justify-between gap-3" data-testid={`notif-${n.id}`}>
                  <div>
                    <div className="text-sm font-medium text-[#0B1F3B] dark:text-white">{n.title}</div>
                    <div className="text-xs text-[#64748B]">{n.message}</div>
                  </div>
                  <Button size="sm" variant="ghost" className="text-xs" onClick={() => markRead.mutate(n.id)} data-testid={`notif-read-${n.id}`}>Dismiss</Button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {bookings.isLoading ? <p className="text-sm text-[#64748B]">Loading…</p>
        : (bookings.data?.length ?? 0) === 0 ? (
          <p className="text-sm text-[#64748B]" data-testid="no-bookings">No bookings yet. <Link href="/marketplace" className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline">Browse providers</Link>.</p>
        ) : (
          <div className="space-y-3">
            {bookings.data!.map((b) => (
              <Card key={b.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`booking-${b.id}`}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0B1F3B] dark:text-white">{b.serviceName ?? "Service request"}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLE[b.status] ?? ""}`} data-testid={`status-${b.id}`}>{b.status}</span>
                    </div>
                    {(b.vehicleMake || b.vehiclePlate) && (
                      <div className="text-xs text-[#64748B] flex items-center gap-1"><Car className="h-3 w-3" />{[b.vehicleYear, b.vehicleMake, b.vehicleModel].filter(Boolean).join(" ")}{b.vehiclePlate ? ` · ${b.vehiclePlate}` : ""}</div>
                    )}
                    {b.preferredDate && <div className="text-xs text-[#64748B]">Preferred: {new Date(b.preferredDate).toLocaleString()}</div>}
                    {b.providerNotes && <div className="text-xs text-[#0A5ED7] dark:text-[#0BB3FF]">Provider: {b.providerNotes}</div>}
                  </div>
                  {(b.status === "requested" || b.status === "accepted") && (
                    <Button size="sm" variant="outline" onClick={() => cancel.mutate(b.id)} data-testid={`cancel-${b.id}`}>Cancel</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Product orders */}
        {(orders.data?.length ?? 0) > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">My Orders</h2>
            {orders.data!.map((o: any) => (
              <Card key={o.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`order-${o.id}`}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0B1F3B] dark:text-white">{o.totalAmount} {o.currency}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLE[o.status] ?? "text-slate-500 bg-slate-50 dark:bg-slate-800/40"}`}>{o.status}</span>
                    </div>
                    <div className="text-xs text-[#64748B]">
                      {(o.items ?? []).map((i: any) => `${i.quantity}× ${i.name}`).join(", ")}
                    </div>
                    {o.providerNotes && <div className="text-xs text-[#0A5ED7] dark:text-[#0BB3FF]">Store: {o.providerNotes}</div>}
                  </div>
                  {(o.status === "pending" || o.status === "confirmed") && (
                    <Button size="sm" variant="outline" onClick={() => cancelOrder.mutate(o.id)} data-testid={`cancel-order-${o.id}`}>Cancel</Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Insurance quotes */}
        {(quotes.data?.length ?? 0) > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-[#64748B] uppercase tracking-wide">My Insurance Quotes</h2>
            {quotes.data!.map((qt: any) => (
              <Card key={qt.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`quote-${qt.id}`}>
                <CardContent className="p-4 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0B1F3B] dark:text-white">{qt.planName ?? "Insurance quote"}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${STATUS_STYLE[qt.status] ?? "text-slate-500 bg-slate-50 dark:bg-slate-800/40"}`}>{qt.status}</span>
                    </div>
                    {(qt.vehicleMake || qt.vehicleModel) && (
                      <div className="text-xs text-[#64748B]">{[qt.vehicleYear, qt.vehicleMake, qt.vehicleModel].filter(Boolean).join(" ")}</div>
                    )}
                    {qt.quotedPremium && <div className="text-xs text-emerald-600 font-medium">Premium: {qt.quotedPremium} {qt.currency}</div>}
                    {qt.quoteNotes && <div className="text-xs text-[#0A5ED7] dark:text-[#0BB3FF]">{qt.quoteNotes}</div>}
                  </div>
                  <div className="flex gap-1">
                    {qt.status === "quoted" && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => decideQuote.mutate({ id: qt.id, d: "accept" })} data-testid={`accept-quote-${qt.id}`}>Accept</Button>
                    )}
                    {(qt.status === "pending" || qt.status === "quoted") && (
                      <Button size="sm" variant="outline" onClick={() => decideQuote.mutate({ id: qt.id, d: "cancel" })} data-testid={`cancel-quote-${qt.id}`}>Cancel</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
