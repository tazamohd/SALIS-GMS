import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Car, Plus, Trash2, ScanLine, Search, ShieldCheck } from "lucide-react";
import { vehicleMakes, getModelsForMake, vehicleYears, colors, engineTypes, transmissionTypes } from "@shared/vehicleCatalogs";

interface CustomerVehicle {
  id: string;
  make: string; model: string | null; year: number | null; vin: string | null;
  licensePlate: string | null; color: string | null; mileage: number | null;
  engineType: string | null; transmissionType: string | null;
  insuranceProvider: string | null; insurancePolicyNumber: string | null; insuranceExpiry: string | null;
}

const empty = {
  make: "", model: "", year: "", vin: "", licensePlate: "", color: "", mileage: "",
  engineType: "", transmissionType: "",
  insuranceProvider: "", insurancePolicyNumber: "", insuranceExpiry: "",
};

export default function MyVehicles() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...empty });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const vehicles = useQuery<CustomerVehicle[]>({
    queryKey: ["/api/my/vehicles"],
    queryFn: async () => (await apiRequest("GET", "/api/my/vehicles")).json(),
  });

  const inputCls = "h-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]";
  const selectCls = `w-full rounded-md px-3 ${inputCls}`;

  const models = form.make ? getModelsForMake(vehicleMakes.find((m) => m.name === form.make)?.id ?? "") : [];

  const decodeVin = useMutation({
    mutationFn: async () => (await apiRequest("GET", `/api/vin-decode/${form.vin.trim()}`)).json(),
    onSuccess: (d) => {
      const matchedMake = vehicleMakes.find((m) => m.name.toLowerCase() === String(d.make).toLowerCase());
      setForm((f) => ({
        ...f,
        make: matchedMake?.name ?? f.make,
        model: d.model || f.model,
        year: d.year ? String(d.year) : f.year,
        engineType: d.engineType || f.engineType,
        transmissionType: d.transmissionType || f.transmissionType,
      }));
      toast({ title: t("myVehicles.vinDecoded", "VIN decoded"), description: `${d.year ?? ""} ${d.make ?? ""} ${d.model ?? ""}`.trim() || t("myVehicles.detailsFilled", "Details filled.") });
    },
    onError: () => toast({ title: t("myVehicles.couldNotDecode", "Could not decode VIN"), description: t("myVehicles.couldNotDecodeDesc", "Enter a valid 17-character VIN or fill in details manually."), variant: "destructive" }),
  });

  const scan = useMutation({
    mutationFn: async ({ docType, rawText }: { docType: "license" | "insurance"; rawText: string }) =>
      (await apiRequest("POST", "/api/my/vehicles/scan", { docType, rawText })).json(),
    onSuccess: (r) => {
      const f = r.fields ?? {};
      if (r.ocrAvailable === false || Object.keys(f).length === 0) {
        toast({ title: t("myVehicles.nothingExtracted", "Nothing extracted"), description: r.message ?? t("myVehicles.enterManually", "Please enter the details manually.") });
        return;
      }
      const matchedMake = f.make ? vehicleMakes.find((m) => m.name.toLowerCase() === String(f.make).toLowerCase()) : undefined;
      setForm((cur) => ({
        ...cur,
        make: matchedMake?.name ?? cur.make,
        year: f.year ? String(f.year) : cur.year,
        vin: f.vin ?? cur.vin,
        licensePlate: f.licensePlate ?? cur.licensePlate,
        insuranceProvider: f.insuranceProvider ?? cur.insuranceProvider,
        insurancePolicyNumber: f.insurancePolicyNumber ?? cur.insurancePolicyNumber,
        insuranceExpiry: f.insuranceExpiry ?? cur.insuranceExpiry,
      }));
      toast({ title: t("myVehicles.scanned", "Scanned"), description: t("myVehicles.scannedDesc", "Fields extracted and filled in.") });
    },
  });

  // Capture the document text (client-side OCR can feed this later; for now the
  // user pastes the text from their registration/insurance card) and extract.
  const handleScan = (docType: "license" | "insurance") => {
    const rawText = window.prompt(
      docType === "license"
        ? t("myVehicles.pasteLicense", "Paste the text from your vehicle registration / license document:")
        : t("myVehicles.pasteInsurance", "Paste the text from your insurance document:"),
    );
    if (rawText && rawText.trim()) scan.mutate({ docType, rawText });
  };

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = {
        make: form.make, model: form.model || undefined,
        year: form.year ? Number(form.year) : undefined,
        vin: form.vin || undefined, licensePlate: form.licensePlate || undefined,
        color: form.color || undefined, mileage: form.mileage ? Number(form.mileage) : undefined,
        engineType: form.engineType || undefined, transmissionType: form.transmissionType || undefined,
        insuranceProvider: form.insuranceProvider || undefined,
        insurancePolicyNumber: form.insurancePolicyNumber || undefined,
        insuranceExpiry: form.insuranceExpiry ? new Date(form.insuranceExpiry).toISOString() : undefined,
      };
      return (await apiRequest("POST", "/api/my/vehicles", payload)).json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/my/vehicles"] });
      toast({ title: t("myVehicles.vehicleAdded", "Vehicle added") });
      setForm({ ...empty });
      setOpen(false);
    },
    onError: (e: Error) => toast({ title: t("myVehicles.couldNotAdd", "Could not add vehicle"), description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/my/vehicles/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/my/vehicles"] }); toast({ title: t("myVehicles.vehicleRemoved", "Vehicle removed") }); },
  });

  return (
    <div className="min-h-screen p-6 bg-[#F8FAFC] dark:bg-[#0E1117]">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white flex items-center gap-2"><Car className="h-6 w-6 text-[#0A5ED7]" /> {t("myVehicles.title", "My Vehicles")}</h1>
            <p className="text-[#64748B] text-sm mt-1">{t("myVehicles.subtitle", "Add your cars once and reuse them with any provider.")}</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-vehicle" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"><Plus className="h-4 w-4 me-1" /> {t("myVehicles.addVehicle", "Add vehicle")}</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>{t("myVehicles.addAVehicle", "Add a vehicle")}</DialogTitle></DialogHeader>
              <div className="space-y-4">
                {/* VIN + scan */}
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex-1 min-w-[180px] space-y-1">
                    <Label>VIN</Label>
                    <Input className={inputCls} value={form.vin} onChange={(e) => set("vin", e.target.value)} data-testid="input-vin" placeholder={t("myVehicles.vinPlaceholder", "17-character VIN")} />
                  </div>
                  <Button type="button" variant="outline" onClick={() => decodeVin.mutate()} disabled={form.vin.trim().length !== 17 || decodeVin.isPending} data-testid="button-decode-vin">
                    <Search className="h-4 w-4 me-1" />{decodeVin.isPending ? t("myVehicles.decoding", "Decoding…") : t("myVehicles.decodeVin", "Decode VIN")}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => handleScan("license")} data-testid="button-scan-license"><ScanLine className="h-4 w-4 me-1" />{t("myVehicles.scanLicense", "Scan license")}</Button>
                  <Button type="button" variant="outline" onClick={() => handleScan("insurance")} data-testid="button-scan-insurance"><ShieldCheck className="h-4 w-4 me-1" />{t("myVehicles.scanInsurance", "Scan insurance")}</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Brand dropdown */}
                  <div className="space-y-1">
                    <Label>{t("myVehicles.make", "Make")} *</Label>
                    <select className={selectCls} value={form.make} onChange={(e) => { set("make", e.target.value); set("model", ""); }} data-testid="select-make">
                      <option value="">{t("myVehicles.selectBrand", "Select a brand…")}</option>
                      {vehicleMakes.map((m) => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>{t("myVehicles.model", "Model")}</Label>
                    {models.length > 0 ? (
                      <select className={selectCls} value={form.model} onChange={(e) => set("model", e.target.value)} data-testid="select-model">
                        <option value="">{t("myVehicles.selectModel", "Select a model…")}</option>
                        {models.map((mo) => <option key={mo.id} value={mo.name}>{mo.name}</option>)}
                      </select>
                    ) : (
                      <Input className={inputCls} value={form.model} onChange={(e) => set("model", e.target.value)} data-testid="input-model" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <Label>{t("myVehicles.year", "Year")}</Label>
                    <select className={selectCls} value={form.year} onChange={(e) => set("year", e.target.value)} data-testid="select-year">
                      <option value="">{t("myVehicles.yearEllipsis", "Year…")}</option>
                      {vehicleYears.map((y) => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>{t("myVehicles.color", "Color")}</Label>
                    <select className={selectCls} value={form.color} onChange={(e) => set("color", e.target.value)} data-testid="select-color">
                      <option value="">{t("myVehicles.colorEllipsis", "Color…")}</option>
                      {colors.map((c: any) => <option key={c.id ?? c} value={c.name ?? c}>{c.name ?? c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1"><Label>{t("myVehicles.licensePlate", "License plate")}</Label><Input className={inputCls} value={form.licensePlate} onChange={(e) => set("licensePlate", e.target.value)} data-testid="input-plate" /></div>
                  <div className="space-y-1"><Label>{t("myVehicles.mileage", "Mileage")}</Label><Input type="number" className={inputCls} value={form.mileage} onChange={(e) => set("mileage", e.target.value)} data-testid="input-mileage" /></div>
                  <div className="space-y-1">
                    <Label>{t("myVehicles.engine", "Engine")}</Label>
                    <select className={selectCls} value={form.engineType} onChange={(e) => set("engineType", e.target.value)} data-testid="select-engine">
                      <option value="">{t("myVehicles.engineEllipsis", "Engine…")}</option>
                      {engineTypes.map((t: any) => <option key={t.id ?? t} value={t.name ?? t}>{t.name ?? t}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <Label>{t("myVehicles.transmission", "Transmission")}</Label>
                    <select className={selectCls} value={form.transmissionType} onChange={(e) => set("transmissionType", e.target.value)} data-testid="select-transmission">
                      <option value="">{t("myVehicles.transmissionEllipsis", "Transmission…")}</option>
                      {transmissionTypes.map((t: any) => <option key={t.id ?? t} value={t.name ?? t}>{t.name ?? t}</option>)}
                    </select>
                  </div>
                </div>

                <div className="border-t border-[#E2E8F0] dark:border-[#232A36] pt-3">
                  <p className="text-sm font-medium mb-2 flex items-center gap-1 text-[#0B1F3B] dark:text-white"><ShieldCheck className="h-4 w-4" /> {t("myVehicles.insuranceOptional", "Insurance (optional)")}</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1"><Label>{t("myVehicles.insuranceProvider", "Provider")}</Label><Input className={inputCls} value={form.insuranceProvider} onChange={(e) => set("insuranceProvider", e.target.value)} data-testid="input-ins-provider" /></div>
                    <div className="space-y-1"><Label>{t("myVehicles.policyNumber", "Policy #")}</Label><Input className={inputCls} value={form.insurancePolicyNumber} onChange={(e) => set("insurancePolicyNumber", e.target.value)} data-testid="input-ins-policy" /></div>
                    <div className="space-y-1"><Label>{t("myVehicles.expiry", "Expiry")}</Label><Input type="date" className={inputCls} value={form.insuranceExpiry} onChange={(e) => set("insuranceExpiry", e.target.value)} data-testid="input-ins-expiry" /></div>
                  </div>
                </div>

                <Button onClick={() => save.mutate()} disabled={!form.make || save.isPending} data-testid="button-save-vehicle" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
                  {save.isPending ? t("common.saving", "Saving…") : t("myVehicles.saveVehicle", "Save vehicle")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {vehicles.isLoading ? <p className="text-sm text-[#64748B]">{t("common.loading", "Loading…")}</p>
        : (vehicles.data?.length ?? 0) === 0 ? <p className="text-sm text-[#64748B]" data-testid="no-vehicles">{t("myVehicles.noVehicles", "No vehicles yet. Add your first one.")}</p>
        : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.data!.map((v) => (
              <Card key={v.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`vehicle-${v.id}`}>
                <CardContent className="p-5 flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-[#0B1F3B] dark:text-white">{[v.year, v.make, v.model].filter(Boolean).join(" ")}</div>
                    <div className="text-xs text-[#64748B] mt-1 space-y-0.5">
                      {v.licensePlate && <div>{t("myVehicles.plate", "Plate")}: {v.licensePlate}</div>}
                      {v.vin && <div>VIN: {v.vin}</div>}
                      {v.insuranceProvider && <div className="flex items-center gap-1"><ShieldCheck className="h-3 w-3" />{v.insuranceProvider}{v.insurancePolicyNumber ? ` · ${v.insurancePolicyNumber}` : ""}</div>}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {v.color && <Badge variant="outline" className="text-xs">{v.color}</Badge>}
                      {v.engineType && <Badge variant="outline" className="text-xs">{v.engineType}</Badge>}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove.mutate(v.id)} data-testid={`remove-${v.id}`} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
