import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Plus, Trash2 } from "lucide-react";

interface Offering {
  id: string; kind: string; name: string; category: string | null;
  description: string | null; price: string | null; currency: string | null; isActive: boolean;
}

const KIND_LABEL: Record<string, { key: string; label: string }> = {
  service: { key: "myOfferings.kindService", label: "Service" },
  product: { key: "myOfferings.kindProduct", label: "Product" },
  insurance_plan: { key: "myOfferings.kindInsurancePlan", label: "Insurance plan" },
};

export default function MyOfferings() {
  const { t } = useTranslation();
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kind: "product", name: "", category: "", description: "", price: "" });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const offerings = useQuery<Offering[]>({
    queryKey: ["/api/provider/offerings"],
    queryFn: async () => (await apiRequest("GET", "/api/provider/offerings")).json(),
  });

  const save = useMutation({
    mutationFn: async () =>
      (await apiRequest("POST", "/api/provider/offerings", {
        kind: form.kind, name: form.name, category: form.category || undefined,
        description: form.description || undefined, price: form.price || undefined,
      })).json(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/provider/offerings"] });
      toast({ title: t("myOfferings.offeringAdded", "Offering added") });
      setForm({ kind: "product", name: "", category: "", description: "", price: "" });
      setOpen(false);
    },
    onError: (e: Error) => toast({ title: t("myOfferings.couldNotAdd", "Could not add"), description: e.message, variant: "destructive" }),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => apiRequest("DELETE", `/api/provider/offerings/${id}`),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["/api/provider/offerings"] }); toast({ title: t("myOfferings.removed", "Removed") }); },
  });

  const inputCls = "h-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]";

  return (
    <div className="p-6 space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0B1F3B] dark:text-white flex items-center gap-2"><Package className="h-6 w-6 text-[#0A5ED7]" /> {t("myOfferings.title", "My Offerings")}</h1>
          <p className="text-sm text-[#64748B] mt-1">{t("myOfferings.subtitle", "Products, plans and services you present in the marketplace.")}</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-offering" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"><Plus className="h-4 w-4 me-1" />{t("myOfferings.addOffering", "Add offering")}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{t("myOfferings.addAnOffering", "Add an offering")}</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>{t("myOfferings.type", "Type")}</Label>
                <select className={`w-full rounded-md px-3 ${inputCls}`} value={form.kind} onChange={(e) => set("kind", e.target.value)} data-testid="select-offering-kind">
                  <option value="product">{t("myOfferings.optProduct", "Product (parts store)")}</option>
                  <option value="insurance_plan">{t("myOfferings.kindInsurancePlan", "Insurance plan")}</option>
                  <option value="service">{t("myOfferings.kindService", "Service")}</option>
                </select>
              </div>
              <div className="space-y-1"><Label>{t("myOfferings.name", "Name")} *</Label><Input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="input-offering-name" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label>{t("myOfferings.category", "Category")}</Label><Input className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)} data-testid="input-offering-category" /></div>
                <div className="space-y-1"><Label>{t("myOfferings.priceSar", "Price (SAR)")}</Label><Input type="number" className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} data-testid="input-offering-price" /></div>
              </div>
              <div className="space-y-1"><Label>{t("myOfferings.description", "Description")}</Label><Input className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="input-offering-description" /></div>
              <Button onClick={() => save.mutate()} disabled={!form.name || save.isPending} data-testid="button-save-offering" className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
                {save.isPending ? t("common.saving", "Saving…") : t("myOfferings.saveOffering", "Save offering")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ProfileCard />

      <Card className="border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader><CardTitle className="text-base">{t("myOfferings.yourOfferings", "Your offerings")}</CardTitle></CardHeader>
        <CardContent>
          {offerings.isLoading ? <p className="text-sm text-[#64748B]">{t("common.loading", "Loading…")}</p>
          : (offerings.data?.length ?? 0) === 0 ? <p className="text-sm text-[#64748B]" data-testid="no-offerings">{t("myOfferings.noOfferings", "No offerings yet. Add products or plans customers can find.")}</p>
          : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {offerings.data!.map((o) => (
                <div key={o.id} className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#232A36] flex items-start justify-between" data-testid={`offering-${o.id}`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-[#0B1F3B] dark:text-white">{o.name}</span>
                      <Badge variant="outline" className="text-xs">{KIND_LABEL[o.kind] ? t(KIND_LABEL[o.kind].key, KIND_LABEL[o.kind].label) : o.kind}</Badge>
                    </div>
                    <div className="text-xs text-[#64748B]">{o.category}{o.price ? ` · ${o.price} ${o.currency ?? "SAR"}` : ""}</div>
                    {o.description && <div className="text-xs text-[#94A3B8] mt-1">{o.description}</div>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => remove.mutate(o.id)} data-testid={`remove-offering-${o.id}`} className="text-red-500 hover:text-red-600"><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ProfileCard() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const qc = useQueryClient();
  const profile = useQuery<any>({
    queryKey: ["/api/provider/profile"],
    queryFn: async () => (await apiRequest("GET", "/api/provider/profile")).json(),
  });
  const [form, setForm] = useState({ description: "", phone: "", email: "", address: "", workingHours: "" });
  const [loaded, setLoaded] = useState(false);
  if (profile.data && !loaded) {
    setForm({
      description: profile.data.description ?? "",
      phone: profile.data.phone ?? "",
      email: profile.data.email ?? "",
      address: profile.data.address ?? "",
      workingHours: profile.data.workingHours ?? "",
    });
    setLoaded(true);
  }
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const save = useMutation({
    mutationFn: async () => (await apiRequest("PATCH", "/api/provider/profile", form)).json(),
    onSuccess: () => { toast({ title: t("myOfferings.profileSaved", "Profile saved"), description: t("myOfferings.profileSavedDesc", "Customers now see the updated details.") }); qc.invalidateQueries({ queryKey: ["/api/provider/profile"] }); },
    onError: (e: Error) => toast({ title: t("myOfferings.couldNotSave", "Could not save"), description: e.message, variant: "destructive" }),
  });

  const inputCls = "h-10 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]";

  return (
    <Card className="border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="text-base">{t("myOfferings.publicProfile", "Public profile")}</CardTitle>
        <p className="text-xs text-[#64748B]">{t("myOfferings.publicProfileDesc", "What customers see on your marketplace page.")}</p>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2 space-y-1"><Label>{t("myOfferings.description", "Description")}</Label><Input className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} data-testid="profile-description" /></div>
        <div className="space-y-1"><Label>{t("common.phone", "Phone")}</Label><Input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="profile-phone" /></div>
        <div className="space-y-1"><Label>{t("common.email", "Email")}</Label><Input className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="profile-email" /></div>
        <div className="space-y-1"><Label>{t("myOfferings.workingHours", "Working hours")}</Label><Input className={inputCls} placeholder="Sat–Thu 8:00–20:00" value={form.workingHours} onChange={(e) => set("workingHours", e.target.value)} data-testid="profile-hours" /></div>
        <div className="space-y-1"><Label>{t("myOfferings.address", "Address")}</Label><Input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} data-testid="profile-address" /></div>
        <div className="md:col-span-2">
          <Button onClick={() => save.mutate()} disabled={save.isPending} data-testid="profile-save" className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
            {save.isPending ? t("common.saving", "Saving…") : t("myOfferings.saveProfile", "Save profile")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
