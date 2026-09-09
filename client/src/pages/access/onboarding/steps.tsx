import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Loader2, Save, Upload, ExternalLink, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { extractApiMessage } from "@/lib/apiError";

export interface InvoiceSettings {
  template?: "classic" | "compact" | "modern";
  paperSize?: "A4" | "A5" | "LETTER" | "THERMAL_80";
  showLogo?: boolean;
  showQrCode?: boolean;
  footerText?: string;
  termsText?: string;
  invoicePrefix?: string;
  quotePrefix?: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  businessType?: string | null;
  description?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  workingHours?: string | null;
  taxNumber?: string | null;
  commercialRegistration?: string | null;
  logoUrl?: string | null;
  brandPrimaryColor?: string | null;
  brandSecondaryColor?: string | null;
  invoiceSettings?: InvoiceSettings | null;
  onboardingStep?: string | null;
  onboardingComplete?: boolean;
}

export interface StepProps {
  profile: BusinessProfile;
  onSave: (patch: Partial<BusinessProfile>) => void;
  saving: boolean;
}

const inputCls =
  "h-11 font-poppins bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-[#E6EAF0]";

/** Largest logo we inline as a data URL — keeps the row (and every print) small. */
const MAX_LOGO_BYTES = 200 * 1024;

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">{label}</Label>
      {children}
      {hint && <p className="text-xs font-poppins text-[#94A3B8]">{hint}</p>}
    </div>
  );
}

function SaveButton({ saving, onClick }: { saving: boolean; onClick: () => void }) {
  const { t } = useTranslation();
  return (
    <Button type="button" onClick={onClick} disabled={saving} data-testid="button-save-step" className="bg-[#0A5ED7] text-white hover:bg-[#0952C0]">
      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
      {saving ? t("common.saving", "Saving…") : t("common.save", "Save")}
    </Button>
  );
}

// ── 1. Identity ─────────────────────────────────────────────────────────────

export function IdentityStep({ profile, onSave, saving }: StepProps) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: profile.name ?? "",
    phone: profile.phone ?? "",
    email: profile.email ?? "",
    address: profile.address ?? "",
    city: profile.city ?? "",
    country: profile.country ?? "",
    taxNumber: profile.taxNumber ?? "",
    commercialRegistration: profile.commercialRegistration ?? "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label={t("onboarding.businessName", "Business name")}>
          <Input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} data-testid="input-name" />
        </Field>
        <Field label={t("common.phone", "Phone")}>
          <Input className={inputCls} value={form.phone} onChange={(e) => set("phone", e.target.value)} data-testid="input-phone" />
        </Field>
        <Field label={t("common.email", "Email")}>
          <Input type="email" className={inputCls} value={form.email} onChange={(e) => set("email", e.target.value)} data-testid="input-email" />
        </Field>
        <Field label={t("common.city", "City")}>
          <Input className={inputCls} value={form.city} onChange={(e) => set("city", e.target.value)} data-testid="input-city" />
        </Field>
        <Field label={t("common.country", "Country")}>
          <Input className={inputCls} value={form.country} onChange={(e) => set("country", e.target.value)} data-testid="input-country" />
        </Field>
        <Field label={t("onboarding.address", "Address")} hint={t("onboarding.addressHint", "Printed on invoices and shown to customers.")}>
          <Input className={inputCls} value={form.address} onChange={(e) => set("address", e.target.value)} data-testid="input-address" />
        </Field>
        <Field label={t("providerSignup.taxNumber", "Tax number (VAT)")} hint={t("providerSignup.taxHint", "15 digits, starts with 3")}>
          <Input className={inputCls} value={form.taxNumber} onChange={(e) => set("taxNumber", e.target.value)} data-testid="input-tax-number" />
        </Field>
        <Field label={t("providerSignup.commercialRegistration", "Commercial registration (Sejel)")} hint={t("providerSignup.crHint", "10 digits")}>
          <Input className={inputCls} value={form.commercialRegistration} onChange={(e) => set("commercialRegistration", e.target.value)} data-testid="input-cr" />
        </Field>
      </div>
      <SaveButton saving={saving} onClick={() => onSave(form)} />
    </div>
  );
}

// ── 2. Branding ─────────────────────────────────────────────────────────────

export function BrandingStep({ profile, onSave, saving }: StepProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [logoUrl, setLogoUrl] = useState(profile.logoUrl ?? "");
  const [primary, setPrimary] = useState(profile.brandPrimaryColor ?? "#0A5ED7");
  const [secondary, setSecondary] = useState(profile.brandSecondaryColor ?? "#0BB3FF");

  // Logos are inlined as data URLs: no upload round-trip, no auth on the image,
  // and they render identically in the app and in print.
  const pickLogo = (file: File) => {
    if (file.size > MAX_LOGO_BYTES) {
      toast({
        title: t("onboarding.logoTooBig", "That image is too large"),
        description: t("onboarding.logoTooBigHint", "Use a logo under 200 KB — a PNG or SVG works best."),
        variant: "destructive",
      });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setLogoUrl(String(reader.result ?? ""));
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Field label={t("onboarding.logo", "Logo")} hint={t("onboarding.logoHint", "PNG or SVG, under 200 KB.")}>
            <div className="flex items-center gap-3">
              <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} data-testid="button-pick-logo" className="border-[#E2E8F0] dark:border-[#232A36]">
                <Upload className="h-4 w-4" />
                {t("onboarding.chooseFile", "Choose file")}
              </Button>
              {logoUrl && (
                <button type="button" onClick={() => setLogoUrl("")} className="text-sm font-poppins text-[#64748B] hover:text-red-500" data-testid="button-remove-logo">
                  {t("common.remove", "Remove")}
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) pickLogo(file);
                }}
                data-testid="input-logo-file"
              />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label={t("onboarding.primaryColor", "Primary colour")}>
              <div className="flex items-center gap-2">
                <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} data-testid="input-primary-color" className="h-11 w-14 cursor-pointer rounded border border-[#E2E8F0] dark:border-[#232A36] bg-transparent" />
                <Input className={inputCls} value={primary} onChange={(e) => setPrimary(e.target.value)} />
              </div>
            </Field>
            <Field label={t("onboarding.secondaryColor", "Secondary colour")}>
              <div className="flex items-center gap-2">
                <input type="color" value={secondary} onChange={(e) => setSecondary(e.target.value)} data-testid="input-secondary-color" className="h-11 w-14 cursor-pointer rounded border border-[#E2E8F0] dark:border-[#232A36] bg-transparent" />
                <Input className={inputCls} value={secondary} onChange={(e) => setSecondary(e.target.value)} />
              </div>
            </Field>
          </div>
        </div>

        {/* Live preview so the choice is visible before it is saved. */}
        <div className="rounded-xl border border-[#E2E8F0] dark:border-[#232A36] overflow-hidden" data-testid="branding-preview">
          <div className="h-20 flex items-center gap-3 px-5" style={{ background: `linear-gradient(90deg, ${primary}, ${secondary})` }}>
            {logoUrl ? (
              <img src={logoUrl} alt="" className="h-12 w-auto max-w-[140px] object-contain drop-shadow" />
            ) : (
              <span className="text-white font-montserrat font-bold text-lg">{profile.name}</span>
            )}
          </div>
          <div className="p-5 space-y-3 bg-white dark:bg-[#0E1117]">
            <p className="text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0]">
              {t("onboarding.previewNote", "This is how your header and documents will look.")}
            </p>
            <div className="flex gap-2">
              <span className="rounded px-3 py-1.5 text-xs font-semibold text-white" style={{ background: primary }}>
                {t("onboarding.primaryAction", "Primary action")}
              </span>
              <span className="rounded px-3 py-1.5 text-xs font-semibold text-white" style={{ background: secondary }}>
                {t("onboarding.secondaryAction", "Secondary")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <SaveButton
        saving={saving}
        onClick={() =>
          onSave({
            logoUrl: logoUrl || null,
            brandPrimaryColor: primary,
            brandSecondaryColor: secondary,
          })
        }
      />
    </div>
  );
}

// ── 3. Documents / printing ─────────────────────────────────────────────────

export function DocumentsStep({ profile, onSave, saving }: StepProps) {
  const { t } = useTranslation();
  const existing = profile.invoiceSettings ?? {};
  const [settings, setSettings] = useState<InvoiceSettings>({
    template: existing.template ?? "classic",
    paperSize: existing.paperSize ?? "A4",
    showLogo: existing.showLogo ?? true,
    showQrCode: existing.showQrCode ?? true,
    footerText: existing.footerText ?? "",
    termsText: existing.termsText ?? "",
    invoicePrefix: existing.invoicePrefix ?? "INV",
    quotePrefix: existing.quotePrefix ?? "QT",
  });
  const set = <K extends keyof InvoiceSettings>(k: K, v: InvoiceSettings[K]) =>
    setSettings((s) => ({ ...s, [k]: v }));

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label={t("onboarding.template", "Document template")}>
          <select value={settings.template} onChange={(e) => set("template", e.target.value as InvoiceSettings["template"])} data-testid="select-template" className={`w-full rounded-md px-3 ${inputCls}`}>
            <option value="classic">{t("onboarding.templateClassic", "Classic")}</option>
            <option value="compact">{t("onboarding.templateCompact", "Compact")}</option>
            <option value="modern">{t("onboarding.templateModern", "Modern")}</option>
          </select>
        </Field>
        <Field label={t("onboarding.paperSize", "Paper size")} hint={t("onboarding.paperHint", "Thermal 80mm is for counter receipt printers.")}>
          <select value={settings.paperSize} onChange={(e) => set("paperSize", e.target.value as InvoiceSettings["paperSize"])} data-testid="select-paper" className={`w-full rounded-md px-3 ${inputCls}`}>
            <option value="A4">A4</option>
            <option value="A5">A5</option>
            <option value="LETTER">Letter</option>
            <option value="THERMAL_80">Thermal 80mm</option>
          </select>
        </Field>
        <Field label={t("onboarding.invoicePrefix", "Invoice number prefix")}>
          <Input className={inputCls} value={settings.invoicePrefix} onChange={(e) => set("invoicePrefix", e.target.value)} data-testid="input-invoice-prefix" />
        </Field>
        <Field label={t("onboarding.quotePrefix", "Quotation prefix")}>
          <Input className={inputCls} value={settings.quotePrefix} onChange={(e) => set("quotePrefix", e.target.value)} data-testid="input-quote-prefix" />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <Toggle label={t("onboarding.showLogo", "Show logo on documents")} checked={settings.showLogo ?? true} onChange={(v) => set("showLogo", v)} testId="toggle-show-logo" />
        <Toggle label={t("onboarding.showQr", "Show ZATCA QR code")} checked={settings.showQrCode ?? true} onChange={(v) => set("showQrCode", v)} testId="toggle-show-qr" />
      </div>

      <Field label={t("onboarding.footerText", "Footer line")} hint={t("onboarding.footerHint", "Appears at the bottom of every printed document.")}>
        <Input className={inputCls} value={settings.footerText} onChange={(e) => set("footerText", e.target.value)} data-testid="input-footer" />
      </Field>
      <Field label={t("onboarding.terms", "Terms & conditions")}>
        <Textarea
          rows={4}
          value={settings.termsText}
          onChange={(e) => set("termsText", e.target.value)}
          data-testid="input-terms"
          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-[#E6EAF0]"
        />
      </Field>

      <SaveButton saving={saving} onClick={() => onSave({ invoiceSettings: settings })} />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  testId,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  testId: string;
}) {
  return (
    <label className="flex items-center gap-2 text-sm font-poppins text-[#0B1F3B] dark:text-[#E6EAF0]">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} data-testid={testId} />
      {label}
    </label>
  );
}

// ── 4. Operations ───────────────────────────────────────────────────────────

export function OperationsStep({ profile, onSave, saving }: StepProps) {
  const { t } = useTranslation();
  const [workingHours, setWorkingHours] = useState(profile.workingHours ?? "");
  const [description, setDescription] = useState(profile.description ?? "");

  return (
    <div className="space-y-5">
      <Field label={t("onboarding.workingHours", "Working hours")} hint={t("onboarding.hoursHint", "Shown on your marketplace profile and used for booking slots.")}>
        <Input className={inputCls} placeholder="Sat–Thu 08:00–20:00" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} data-testid="input-working-hours" />
      </Field>
      <Field label={t("onboarding.description", "How you describe your business")}>
        <Textarea
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          data-testid="input-description"
          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-[#E6EAF0]"
        />
      </Field>

      <LinkOut
        href="/service-templates"
        title={t("onboarding.checklists", "Service checklists & templates")}
        blurb={t("onboarding.checklistsBlurb", "Set up the inspection checklists and standard jobs your team will use.")}
      />

      <SaveButton saving={saving} onClick={() => onSave({ workingHours, description })} />
    </div>
  );
}

// ── 5. Integrations ─────────────────────────────────────────────────────────

export function IntegrationsStep(_props: StepProps) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <p className="font-poppins text-[#64748B] dark:text-[#9BA4B0]">
        {t(
          "onboarding.integrationsIntro",
          "Connect the services you already use. Each one can be added now or any time later — nothing here blocks you from starting.",
        )}
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <LinkOut href="/integrations" title={t("onboarding.paymentsTitle", "Payments")} blurb={t("onboarding.paymentsBlurb", "Card and online payment gateways.")} />
        <LinkOut href="/whatsapp-integration" title={t("onboarding.whatsappTitle", "WhatsApp & SMS")} blurb={t("onboarding.whatsappBlurb", "Booking confirmations and service reminders.")} />
        <LinkOut href="/accounting-integration" title={t("onboarding.accountingTitle", "Accounting")} blurb={t("onboarding.accountingBlurb", "Sync invoices to your accounting system.")} />
        <LinkOut href="/google-my-business" title={t("onboarding.gmbTitle", "Google Business Profile")} blurb={t("onboarding.gmbBlurb", "Reviews and business hours.")} />
      </div>
    </div>
  );
}

function LinkOut({ href, title, blurb }: { href: string; title: string; blurb: string }) {
  return (
    <a
      href={href}
      className="flex items-start justify-between gap-3 rounded-xl border border-[#E2E8F0] dark:border-[#232A36] p-4 transition-colors hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF]"
      data-testid={`link-${href.replace(/\W+/g, "-")}`}
    >
      <span>
        <span className="block font-poppins font-semibold text-[#0B1F3B] dark:text-white">{title}</span>
        <span className="block text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0]">{blurb}</span>
      </span>
      <ExternalLink className="h-4 w-4 shrink-0 text-[#94A3B8]" />
    </a>
  );
}

// ── 6. Import ───────────────────────────────────────────────────────────────

const IMPORT_MODULES = [
  { id: "customers", label: "Customers", columns: "fullName, email, phone" },
  { id: "vehicles", label: "Vehicles", columns: "make, model, year, licensePlate, vin" },
  { id: "spareParts", label: "Spare parts", columns: "partNumber, name, sellingPrice, stockQuantity" },
];

/**
 * CSV import. The file is parsed in the browser and posted as rows to the
 * existing `/api/import` endpoint, which owns the per-module mapping and forces
 * the tenant from the session.
 */
export function ImportStep(_props: StepProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [module, setModule] = useState(IMPORT_MODULES[0].id);
  const [rows, setRows] = useState<Record<string, string>[]>([]);
  const [fileName, setFileName] = useState("");
  const [imported, setImported] = useState<{ imported: number; skipped: number } | null>(null);

  const parseCsv = (text: string): Record<string, string>[] => {
    const lines = text.split(/\r?\n/).filter((l) => l.trim() !== "");
    if (lines.length < 2) return [];
    const headers = splitCsvLine(lines[0]);
    return lines.slice(1, 1001).map((line) => {
      const cells = splitCsvLine(line);
      return Object.fromEntries(headers.map((h, i) => [h, cells[i] ?? ""]));
    });
  };

  const runImport = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/import", { module, data: rows })).json(),
    onSuccess: (result) => {
      setImported({ imported: result.imported ?? 0, skipped: result.skipped ?? 0 });
      toast({
        title: t("onboarding.importDone", "Import finished"),
        description: t("onboarding.importCount", "{{count}} rows imported.", { count: result.imported ?? 0 }),
      });
    },
    onError: (error: Error) => {
      toast({ title: t("onboarding.importFailed", "Import failed"), description: extractApiMessage(error), variant: "destructive" });
    },
  });

  const selected = IMPORT_MODULES.find((m) => m.id === module)!;

  return (
    <div className="space-y-5">
      <p className="font-poppins text-[#64748B] dark:text-[#9BA4B0]">
        {t("onboarding.importIntro", "Export a CSV from your old system, pick what it contains, and upload it. Up to 1000 rows per file.")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label={t("onboarding.importWhat", "What are you importing?")} hint={t("onboarding.importColumns", "Expected columns: {{columns}}", { columns: selected.columns })}>
          <select
            value={module}
            onChange={(e) => {
              setModule(e.target.value);
              setRows([]);
              setFileName("");
              setImported(null);
            }}
            data-testid="select-import-module"
            className={`w-full rounded-md px-3 ${inputCls}`}
          >
            {IMPORT_MODULES.map((m) => (
              <option key={m.id} value={m.id}>
                {t(`onboarding.import.${m.id}`, m.label)}
              </option>
            ))}
          </select>
        </Field>

        <Field label={t("onboarding.csvFile", "CSV file")}>
          <Input
            type="file"
            accept=".csv,text/csv"
            data-testid="input-csv"
            className={inputCls}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setFileName(file.name);
              setImported(null);
              const parsed = parseCsv(await file.text());
              setRows(parsed);
              if (parsed.length === 0) {
                toast({
                  title: t("onboarding.emptyCsv", "Nothing to import"),
                  description: t("onboarding.emptyCsvHint", "The file needs a header row and at least one data row."),
                  variant: "destructive",
                });
              }
            }}
          />
        </Field>
      </div>

      {rows.length > 0 && (
        <div className="rounded-xl border border-[#E2E8F0] dark:border-[#232A36] p-4" data-testid="import-preview">
          <p className="flex items-center gap-2 text-sm font-poppins font-medium text-[#0B1F3B] dark:text-white">
            <FileSpreadsheet className="h-4 w-4 text-[#0A5ED7] dark:text-[#0BB3FF]" />
            {fileName} — {t("onboarding.rowsReady", "{{count}} rows ready", { count: rows.length })}
          </p>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-xs font-poppins">
              <thead>
                <tr className="text-left text-[#64748B] dark:text-[#9BA4B0]">
                  {Object.keys(rows[0]).slice(0, 6).map((h) => (
                    <th key={h} className="pb-2 pe-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 3).map((row, i) => (
                  <tr key={i} className="text-[#0B1F3B] dark:text-[#E6EAF0]">
                    {Object.keys(rows[0]).slice(0, 6).map((h) => (
                      <td key={h} className="py-1 pe-4">{row[h]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {imported && (
        <p className="flex items-center gap-2 text-sm font-poppins text-emerald-600 dark:text-emerald-400" data-testid="import-result">
          <CheckCircle2 className="h-4 w-4" />
          {t("onboarding.importedSummary", "{{imported}} imported, {{skipped}} skipped.", imported)}
        </p>
      )}

      <Button
        type="button"
        disabled={rows.length === 0 || runImport.isPending}
        onClick={() => runImport.mutate()}
        data-testid="button-run-import"
        className="bg-[#0A5ED7] text-white hover:bg-[#0952C0]"
      >
        {runImport.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {runImport.isPending ? t("onboarding.importing", "Importing…") : t("onboarding.runImport", "Import rows")}
      </Button>
    </div>
  );
}

/** Minimal CSV cell splitter: handles quoted cells and escaped quotes. */
function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
}
