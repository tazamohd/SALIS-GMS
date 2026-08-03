import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  description?: string | null;
  avgRating?: number | null;
  reviewCount?: number;
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
  phone?: string | null;
  address?: string | null;
  workingHours?: string | null;
  services: { id: string; name: string; category: string | null; description: string | null; standardCost: string | null }[];
  offerings: { id: string; kind: string; name: string; category: string | null; description: string | null; price: string | null; currency: string | null }[];
  reviews: { id: string; rating: number; comment: string | null; customerName: string | null; createdAt: string }[];
}

function Stars({ value }: { value: number }) {
  return (
    <span className="text-amber-500" aria-label={`${value} stars`}>
      {"★".repeat(Math.round(value))}{"☆".repeat(5 - Math.round(value))}
    </span>
  );
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
                      {p.avgRating != null && (
                        <div className="text-xs mt-0.5" data-testid={`rating-${p.id}`}>
                          <Stars value={Number(p.avgRating)} />{" "}
                          <span className="text-[#64748B]">{Number(p.avgRating).toFixed(1)} ({p.reviewCount})</span>
                        </div>
                      )}
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
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">{detail.data.providerType}</Badge>
                {detail.data.avgRating != null && (
                  <span className="text-xs"><Stars value={Number(detail.data.avgRating)} /> <span className="text-[#64748B]">{Number(detail.data.avgRating).toFixed(1)} ({detail.data.reviewCount})</span></span>
                )}
                {(detail.data.city || detail.data.country) && (
                  <span className="text-xs text-[#64748B] flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{[detail.data.city, detail.data.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>
              {(detail.data.description || detail.data.phone || detail.data.workingHours || detail.data.address) && (
                <div className="text-xs text-[#64748B] space-y-0.5">
                  {detail.data.description && <p className="text-sm text-[#0B1F3B] dark:text-[#E6EAF0]">{detail.data.description}</p>}
                  {detail.data.phone && <div>☎ {detail.data.phone}</div>}
                  {detail.data.workingHours && <div>🕒 {detail.data.workingHours}</div>}
                  {detail.data.address && <div>📍 {detail.data.address}</div>}
                </div>
              )}
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
              {(detail.data.reviews?.length ?? 0) > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">Reviews</h3>
                  <ul className="space-y-2 max-h-40 overflow-y-auto">
                    {detail.data.reviews.map((r) => (
                      <li key={r.id} className="p-2 rounded border border-[#E2E8F0] dark:border-[#232A36] text-xs">
                        <Stars value={r.rating} /> <span className="font-medium">{r.customerName ?? "Customer"}</span>
                        {r.comment && <p className="mt-0.5 text-[#64748B]">{r.comment}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {user && <ReviewForm providerId={detail.data.id} />}
              {user ? (
                <>
                  {detail.data.offerings.some((o) => o.kind === "product") && (
                    <OrderForm providerId={detail.data.id} products={detail.data.offerings.filter((o) => o.kind === "product")} onDone={() => setSelected(null)} />
                  )}
                  {detail.data.offerings.some((o) => o.kind === "insurance_plan") && (
                    <QuoteForm providerId={detail.data.id} plans={detail.data.offerings.filter((o) => o.kind === "insurance_plan")} onDone={() => setSelected(null)} />
                  )}
                  {detail.data.providerType === "garage" && (
                    <BookingForm providerId={detail.data.id} services={detail.data.services} onDone={() => setSelected(null)} />
                  )}
                </>
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

function OrderForm({ providerId, products, onDone }: { providerId: string; products: { id: string; name: string; price: string | null; currency: string | null }[]; onDone: () => void }) {
  const { toast } = useToast();
  const [qty, setQty] = useState<Record<string, number>>({});
  const items = Object.entries(qty).filter(([, q]) => q > 0).map(([offeringId, quantity]) => ({ offeringId, quantity }));
  const total = items.reduce((s, i) => {
    const p = products.find((x) => x.id === i.offeringId);
    return s + Number(p?.price ?? 0) * i.quantity;
  }, 0);

  const order = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/my/orders", { providerId, items })).json(),
    onSuccess: () => { toast({ title: "Order placed", description: "The store will confirm your order." }); onDone(); },
    onError: (e: Error) => toast({ title: "Could not order", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="border-t border-[#E2E8F0] dark:border-[#232A36] pt-4 space-y-2">
      <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">Order parts</p>
      {products.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-2 text-sm">
          <span>{p.name}{p.price ? ` · ${p.price} ${p.currency ?? "SAR"}` : ""}</span>
          <input
            type="number" min={0} max={999} value={qty[p.id] ?? 0}
            onChange={(e) => setQty((q) => ({ ...q, [p.id]: Math.max(0, parseInt(e.target.value || "0", 10)) }))}
            data-testid={`order-qty-${p.id}`}
            className="w-16 h-8 rounded-md px-2 text-right bg-white dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36]"
          />
        </div>
      ))}
      <Button onClick={() => order.mutate()} disabled={items.length === 0 || order.isPending} data-testid="order-submit"
        className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
        {order.isPending ? "Placing…" : `Place order${total > 0 ? ` (${total.toFixed(2)} SAR)` : ""}`}
      </Button>
    </div>
  );
}

function QuoteForm({ providerId, plans, onDone }: { providerId: string; plans: { id: string; name: string }[]; onDone: () => void }) {
  const { toast } = useToast();
  const [offeringId, setOfferingId] = useState("");
  const [customerVehicleId, setCustomerVehicleId] = useState("");
  const vehicles = useQuery<MyVehicle[]>({
    queryKey: ["/api/my/vehicles"],
    queryFn: async () => (await apiRequest("GET", "/api/my/vehicles")).json(),
  });
  const quote = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/my/quotes", {
      providerId, offeringId: offeringId || undefined, customerVehicleId: customerVehicleId || undefined,
    })).json(),
    onSuccess: () => { toast({ title: "Quote requested", description: "The insurer will send you a premium." }); onDone(); },
    onError: (e: Error) => toast({ title: "Could not request quote", description: e.message, variant: "destructive" }),
  });
  const sel = "w-full h-10 rounded-md px-3 bg-white dark:bg-[#0E1117] border border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white";
  return (
    <div className="border-t border-[#E2E8F0] dark:border-[#232A36] pt-4 space-y-2">
      <p className="text-sm font-semibold text-[#0B1F3B] dark:text-white">Request an insurance quote</p>
      <select className={sel} value={offeringId} onChange={(e) => setOfferingId(e.target.value)} data-testid="quote-plan">
        <option value="">Any plan</option>
        {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
      </select>
      <select className={sel} value={customerVehicleId} onChange={(e) => setCustomerVehicleId(e.target.value)} data-testid="quote-vehicle">
        <option value="">{(vehicles.data?.length ?? 0) === 0 ? "No saved vehicles" : "Select a vehicle"}</option>
        {(vehicles.data ?? []).map((v) => <option key={v.id} value={v.id}>{[v.year, v.make, v.model].filter(Boolean).join(" ")}</option>)}
      </select>
      <Button onClick={() => quote.mutate()} disabled={quote.isPending} data-testid="quote-submit"
        className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
        {quote.isPending ? "Requesting…" : "Request quote"}
      </Button>
    </div>
  );
}

function ReviewForm({ providerId }: { providerId: string }) {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const submit = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/my/reviews", { providerId, rating, comment: comment || undefined })).json(),
    onSuccess: () => {
      toast({ title: "Review submitted", description: "Thanks for the feedback!" });
      qc.invalidateQueries({ queryKey: ["/api/marketplace/providers", providerId] });
      setRating(0); setComment("");
    },
    onError: (e: Error) => {
      let msg = e.message; const m = e.message.match(/\{.*\}/);
      if (m) { try { msg = JSON.parse(m[0]).message || msg; } catch { /* keep */ } }
      toast({ title: "Could not submit review", description: msg, variant: "destructive" });
    },
  });

  return (
    <div className="border-t border-[#E2E8F0] dark:border-[#232A36] pt-3 space-y-2">
      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Rate this provider</p>
      <div className="flex items-center gap-2">
        <div className="flex" data-testid="review-stars">
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" onClick={() => setRating(n)} data-testid={`star-${n}`}
              className={`text-xl leading-none ${n <= rating ? "text-amber-500" : "text-[#CBD5E1] dark:text-[#334155]"}`}>★</button>
          ))}
        </div>
        <Input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Optional comment"
          data-testid="review-comment" className="h-8 text-xs bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" />
        <Button size="sm" className="h-8" disabled={rating === 0 || submit.isPending} onClick={() => submit.mutate()} data-testid="review-submit">
          {submit.isPending ? "…" : "Send"}
        </Button>
      </div>
    </div>
  );
}
