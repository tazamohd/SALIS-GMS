import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Search, MapPin, Wrench, Store, Shield } from "lucide-react";

interface Provider {
  id: string;
  name: string;
  city: string | null;
  country: string | null;
  providerType: string;
}
interface ServiceHit {
  id: string;
  name: string;
  category: string | null;
  standardCost: string | null;
  providerId: string;
  providerName: string;
  providerCity: string | null;
}
interface ProviderDetail extends Provider {
  services: { id: string; name: string; category: string | null; description: string | null; standardCost: string | null }[];
  offerings: { id: string; kind: string; name: string; category: string | null; description: string | null; price: string | null; currency: string | null }[];
}

const TYPES = [
  { id: "", label: "All", icon: Search },
  { id: "garage", label: "Garages", icon: Wrench },
  { id: "parts_store", label: "Parts Stores", icon: Store },
  { id: "insurance", label: "Insurance", icon: Shield },
];

export default function Marketplace() {
  const { user } = useAuth();
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const providers = useQuery<Provider[]>({
    queryKey: ["/api/marketplace/providers", type, q],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (type) params.set("type", type);
      if (q) params.set("q", q);
      return (await apiRequest("GET", `/api/marketplace/providers?${params.toString()}`)).json();
    },
  });

  const search = useQuery<{ providers: Provider[]; services: ServiceHit[] }>({
    queryKey: ["/api/marketplace/find", q],
    queryFn: async () => (await apiRequest("GET", `/api/marketplace/find?q=${encodeURIComponent(q)}`)).json(),
    enabled: q.trim().length >= 2,
  });

  const detail = useQuery<ProviderDetail>({
    queryKey: ["/api/marketplace/providers", selected],
    queryFn: async () => (await apiRequest("GET", `/api/marketplace/providers/${selected}`)).json(),
    enabled: !!selected,
  });

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0E1117]">
      <header className="border-b border-[#E2E8F0] dark:border-[#232A36] bg-white/70 dark:bg-[#151A23]/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-extrabold text-[#0B1F3B] dark:text-white">SALIS Marketplace</h1>
          <div className="flex items-center gap-3">
            <Link href="/my-vehicles" className="text-sm text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline">My vehicles</Link>
            <Link href="/my-bookings" className="text-sm text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline">My bookings</Link>
            <Link href="/customer-signup"><Button size="sm" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">Sign up</Button></Link>
            <Link href="/login" className="text-sm text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline">Sign in</Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search a service (e.g. brakes) or a business name…"
              data-testid="input-search"
              className="pl-9 h-11 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {TYPES.map((t) => (
              <Button
                key={t.id}
                size="sm"
                variant={type === t.id ? "default" : "outline"}
                onClick={() => setType(t.id)}
                data-testid={`filter-${t.id || "all"}`}
                className={type === t.id ? "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white" : ""}
              >
                <t.icon className="h-3.5 w-3.5 mr-1" />{t.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Smart-search service matches */}
        {q.trim().length >= 2 && (search.data?.services?.length ?? 0) > 0 && (
          <Card className="border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader><CardTitle className="text-base">Services matching “{q}”</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {search.data!.services.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelected(s.providerId)}
                  data-testid={`service-hit-${s.id}`}
                  className="text-left p-3 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] transition"
                >
                  <div className="font-medium text-[#0B1F3B] dark:text-white">{s.name}</div>
                  <div className="text-xs text-[#64748B]">{s.category} · offered by {s.providerName}{s.providerCity ? ` · ${s.providerCity}` : ""}</div>
                  {s.standardCost && <div className="text-xs text-emerald-600 mt-1">from {s.standardCost}</div>}
                </button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Provider directory */}
        <div>
          <h2 className="text-sm font-semibold text-[#64748B] dark:text-[#9BA4B0] mb-3 uppercase tracking-wide">Providers</h2>
          {providers.isLoading ? <p className="text-sm text-[#64748B]">Loading…</p>
          : (providers.data?.length ?? 0) === 0 ? <p className="text-sm text-[#64748B]" data-testid="no-providers">No providers found.</p>
          : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {providers.data!.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id)}
                  data-testid={`provider-card-${p.id}`}
                  className="text-left"
                >
                  <Card className="h-full border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] hover:shadow-lg transition">
                    <CardContent className="p-5">
                      <Badge variant="outline" className="mb-2">{p.providerType}</Badge>
                      <div className="font-semibold text-[#0B1F3B] dark:text-white">{p.name}</div>
                      {(p.city || p.country) && (
                        <div className="text-xs text-[#64748B] flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3" />{[p.city, p.country].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Provider detail */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{detail.data?.name ?? "Provider"}</DialogTitle></DialogHeader>
          {detail.isLoading ? <p className="text-sm text-[#64748B]">Loading…</p> : detail.data && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline">{detail.data.providerType}</Badge>
                {(detail.data.city || detail.data.country) && (
                  <span className="text-xs text-[#64748B] flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{[detail.data.city, detail.data.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
              {(detail.data.services.length > 0 || detail.data.offerings.length === 0) && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Services</h3>
                  {detail.data.services.length === 0 ? <p className="text-sm text-[#64748B]">No services listed yet.</p> : (
                    <ul className="space-y-2">
                      {detail.data.services.map((s) => (
                        <li key={s.id} className="p-2 rounded border border-[#E2E8F0] dark:border-[#232A36]">
                          <div className="font-medium text-sm">{s.name}</div>
                          <div className="text-xs text-[#64748B]">{s.category}{s.standardCost ? ` · from ${s.standardCost}` : ""}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {detail.data.offerings.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Products &amp; plans</h3>
                  <ul className="space-y-2">
                    {detail.data.offerings.map((o) => (
                      <li key={o.id} className="p-2 rounded border border-[#E2E8F0] dark:border-[#232A36] flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">{o.name}</div>
                          <div className="text-xs text-[#64748B]">{o.category}{o.price ? ` · ${o.price} ${o.currency ?? "SAR"}` : ""}</div>
                        </div>
                        <Badge variant="outline" className="text-xs">{o.kind === "insurance_plan" ? "plan" : o.kind}</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {user ? (
                <BookingForm providerId={detail.data.id} services={detail.data.services} onDone={() => setSelected(null)} />
              ) : (
                <Link href="/customer-signup">
                  <Button className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">Sign up to book</Button>
                </Link>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface MyVehicle { id: string; make: string; model: string | null; year: number | null; licensePlate: string | null; }

function BookingForm({ providerId, services, onDone }: { providerId: string; services: { id: string; name: string }[]; onDone: () => void }) {
  const { toast } = useToast();
  const [serviceTemplateId, setServiceTemplateId] = useState("");
  const [customerVehicleId, setCustomerVehicleId] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");

  const vehicles = useQuery<MyVehicle[]>({
    queryKey: ["/api/my/vehicles"],
    queryFn: async () => (await apiRequest("GET", "/api/my/vehicles")).json(),
  });

  const book = useMutation({
    mutationFn: async () =>
      (await apiRequest("POST", "/api/my/bookings", {
        providerId,
        serviceTemplateId: serviceTemplateId || undefined,
        customerVehicleId: customerVehicleId || undefined,
        preferredDate: preferredDate ? new Date(preferredDate).toISOString() : undefined,
        notes: notes || undefined,
      })).json(),
    onSuccess: () => { toast({ title: "Booking requested", description: "The provider will confirm your request." }); onDone(); },
    onError: (e: Error) => {
      let msg = e.message; const m = e.message.match(/\{.*\}/);
      if (m) { try { msg = JSON.parse(m[0]).message || msg; } catch { /* keep */ } }
      toast({ title: "Could not book", description: msg, variant: "destructive" });
    },
  });

  const sel = "w-full h-10 rounded-md px-3 bg-white dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white";

  return (
    <div className="border-t border-[#E2E8F0] dark:border-[#232A36] pt-4 space-y-3">
      <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">Book this provider</p>
      {services.length > 0 && (
        <div className="space-y-1">
          <Label className="text-xs">Service</Label>
          <select className={sel} value={serviceTemplateId} onChange={(e) => setServiceTemplateId(e.target.value)} data-testid="booking-service">
            <option value="">Any / general</option>
            {services.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
      )}
      <div className="space-y-1">
        <Label className="text-xs">Vehicle</Label>
        <select className={sel} value={customerVehicleId} onChange={(e) => setCustomerVehicleId(e.target.value)} data-testid="booking-vehicle">
          <option value="">{(vehicles.data?.length ?? 0) === 0 ? "No saved vehicles — add one first" : "Select a vehicle"}</option>
          {(vehicles.data ?? []).map((v) => <option key={v.id} value={v.id}>{[v.year, v.make, v.model].filter(Boolean).join(" ")}{v.licensePlate ? ` (${v.licensePlate})` : ""}</option>)}
        </select>
        {(vehicles.data?.length ?? 0) === 0 && <Link href="/my-vehicles" className="text-xs text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline">Add a vehicle</Link>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <div className="space-y-1"><Label className="text-xs">Preferred date</Label><Input type="datetime-local" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} data-testid="booking-date" className="h-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" /></div>
        <div className="space-y-1"><Label className="text-xs">Notes</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} data-testid="booking-notes" className="h-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" /></div>
      </div>
      <Button onClick={() => book.mutate()} disabled={book.isPending} data-testid="booking-submit" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
        {book.isPending ? "Requesting…" : "Request booking"}
      </Button>
    </div>
  );
}
