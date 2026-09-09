import { useState } from "react";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Car, Mail, Lock, User, Phone, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { AccessShell, accessButtonClass, accessInputClass } from "@/components/access/AccessShell";
import { PORTALS } from "@/config/portals";
import { extractApiMessage } from "@/lib/apiError";

/**
 * Car-owner registration.
 *
 * A customer account is platform-wide (no garage), so the form asks only for
 * identity + contact, plus an OPTIONAL first vehicle — capturing it here saves
 * the new customer a second trip before they can book anything. When a phone
 * number is given we hand off to OTP verification straight after signup.
 */
export default function CustomerRegister() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const portal = PORTALS.customer;

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [vehicleOpen, setVehicleOpen] = useState(false);
  const [vehicle, setVehicle] = useState({ make: "", model: "", year: "", licensePlate: "" });

  const set = (k: keyof typeof form, v: string) => setForm((f) => ({ ...f, [k]: v }));
  const setV = (k: keyof typeof vehicle, v: string) => setVehicle((f) => ({ ...f, [k]: v }));

  const register = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        // Only send a vehicle when the customer actually filled the make in.
        vehicle: vehicle.make.trim()
          ? {
              make: vehicle.make.trim(),
              model: vehicle.model.trim() || undefined,
              year: vehicle.year ? Number(vehicle.year) : undefined,
              licensePlate: vehicle.licensePlate.trim() || undefined,
            }
          : undefined,
      };
      return (await apiRequest("POST", "/api/customer/register", payload)).json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: t("customerSignup.welcome", "Welcome!"),
        description: t("customerSignup.accountReady", "Your account is ready."),
      });
      window.location.href = form.phone
        ? `/otp?phone=${encodeURIComponent(form.phone)}`
        : portal.home;
    },
    onError: (error: Error) => {
      toast({
        title: t("customerSignup.signUpFailed", "Sign up failed"),
        description: extractApiMessage(error),
        variant: "destructive",
      });
    },
  });

  const canSubmit = form.email.trim() !== "" && form.password.length >= 8 && !register.isPending;

  return (
    <AccessShell
      accent={portal.accent}
      icon={<Car className="h-6 w-6" />}
      title={t("customerSignup.title", "Create your account")}
      description={t(
        "customerSignup.subtitle",
        "One account to reach every garage, parts store and insurer on SALIS.",
      )}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          register.mutate();
        }}
        className="space-y-4"
      >
        <FieldWithIcon
          id="fullName"
          label={t("auth.fullName", "Full name")}
          icon={<User className="h-5 w-5 text-[#94A3B8]" />}
        >
          <Input
            id="fullName"
            autoComplete="name"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
            data-testid="input-fullname"
            className={`ps-10 ${accessInputClass}`}
          />
        </FieldWithIcon>

        <FieldWithIcon
          id="email"
          label={`${t("common.email", "Email")} *`}
          icon={<Mail className="h-5 w-5 text-[#94A3B8]" />}
        >
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            data-testid="input-email"
            className={`ps-10 ${accessInputClass}`}
          />
        </FieldWithIcon>

        <FieldWithIcon
          id="phone"
          label={t("common.phone", "Phone")}
          icon={<Phone className="h-5 w-5 text-[#94A3B8]" />}
          hint={t("customerSignup.phoneHint", "We send a one-time code to confirm it — used for booking updates.")}
        >
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+9665XXXXXXXX"
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            data-testid="input-phone"
            className={`ps-10 ${accessInputClass}`}
          />
        </FieldWithIcon>

        <FieldWithIcon
          id="password"
          label={`${t("common.password", "Password")} *`}
          icon={<Lock className="h-5 w-5 text-[#94A3B8]" />}
          hint={t("providerSignup.passwordHint", "min 8 characters")}
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            value={form.password}
            onChange={(e) => set("password", e.target.value)}
            data-testid="input-password"
            className={`ps-10 ${accessInputClass}`}
          />
        </FieldWithIcon>

        {/* Optional first vehicle — collapsed so the required path stays short. */}
        <div className="rounded-xl border border-[#E2E8F0] dark:border-[#232A36]">
          <button
            type="button"
            onClick={() => setVehicleOpen((v) => !v)}
            aria-expanded={vehicleOpen}
            data-testid="toggle-first-vehicle"
            className="flex w-full items-center justify-between px-4 py-3 text-sm font-poppins font-medium text-[#0B1F3B] dark:text-[#E6EAF0]"
          >
            {t("customerSignup.addFirstVehicle", "Add your first vehicle (optional)")}
            <ChevronDown className={`h-4 w-4 transition-transform ${vehicleOpen ? "rotate-180" : ""}`} />
          </button>
          {vehicleOpen && (
            <div className="grid grid-cols-2 gap-3 border-t border-[#E2E8F0] dark:border-[#232A36] p-4">
              <SimpleField label={t("vehicles.make", "Make")}>
                <Input value={vehicle.make} onChange={(e) => setV("make", e.target.value)} data-testid="input-vehicle-make" className={accessInputClass} />
              </SimpleField>
              <SimpleField label={t("vehicles.model", "Model")}>
                <Input value={vehicle.model} onChange={(e) => setV("model", e.target.value)} data-testid="input-vehicle-model" className={accessInputClass} />
              </SimpleField>
              <SimpleField label={t("vehicles.year", "Year")}>
                <Input inputMode="numeric" value={vehicle.year} onChange={(e) => setV("year", e.target.value.replace(/\D/g, "").slice(0, 4))} data-testid="input-vehicle-year" className={accessInputClass} />
              </SimpleField>
              <SimpleField label={t("vehicles.licensePlate", "Plate")}>
                <Input value={vehicle.licensePlate} onChange={(e) => setV("licensePlate", e.target.value)} data-testid="input-vehicle-plate" className={accessInputClass} />
              </SimpleField>
            </div>
          )}
        </div>

        <Button type="submit" disabled={!canSubmit} data-testid="button-signup" className={accessButtonClass(portal.accent)}>
          {register.isPending
            ? t("customerSignup.creating", "Creating…")
            : t("customerSignup.createAccount", "Create account")}
        </Button>

        <p className="text-center text-sm font-poppins text-[#64748B] dark:text-[#9BA4B0] pt-2">
          {t("customerSignup.alreadyHaveAccount", "Already have an account?")}{" "}
          <Link href={portal.loginPath} className="text-[#0A5ED7] dark:text-[#0BB3FF] hover:underline font-semibold" data-testid="link-login">
            {t("auth.signIn", "Sign in")}
          </Link>
        </p>
      </form>
    </AccessShell>
  );
}

function FieldWithIcon({
  id,
  label,
  icon,
  hint,
  children,
}: {
  id: string;
  label: string;
  icon: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="font-poppins text-[#0B1F3B] dark:text-[#E6EAF0] font-medium">
        {label}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</span>
        {children}
      </div>
      {hint && <p className="text-xs font-poppins text-[#94A3B8]">{hint}</p>}
    </div>
  );
}

function SimpleField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-poppins text-[#64748B] dark:text-[#9BA4B0]">{label}</Label>
      {children}
    </div>
  );
}
