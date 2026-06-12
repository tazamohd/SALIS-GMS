import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { CalendarClock } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts";
import { SlotPicker } from "@/components/appointments/SlotPicker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type {
  AvailableSlotsResponse,
  RescheduleErrorCode,
} from "@shared/schemas/appointmentReschedule";

/**
 * Feature 001 (T018) — Customer self-service reschedule page. Reached from an
 * opened appointment in the existing portal (FR-001). All strings go through
 * i18n with English fallback (FR-012); the portal applies RTL when Arabic is
 * active. Errors are localized by code (FR-014).
 */
export function CustomerAppointmentReschedule() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [selected, setSelected] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const slotsUrl = `/api/portal/appointments/${id}/available-slots`;
  const { data, isLoading } = useQuery<AvailableSlotsResponse>({
    queryKey: [slotsUrl],
    enabled: Boolean(id),
  });

  const reschedule = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/portal/appointments/${id}/reschedule`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ newSlotStart: selected, reason: reason || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const code: RescheduleErrorCode = body?.error?.code ?? "validation_error";
        throw Object.assign(new Error(code), { code });
      }
      return body;
    },
    onSuccess: () => {
      toast({ title: t("reschedule.success", "Appointment rescheduled") });
      queryClient.invalidateQueries({ queryKey: ["/api/portal/appointments"] });
      queryClient.invalidateQueries({ queryKey: [slotsUrl] });
      navigate("/portal/appointments");
    },
    onError: (err: unknown) => {
      const code = ((err as { code?: RescheduleErrorCode })?.code ??
        "validation_error") as RescheduleErrorCode;
      toast({
        variant: "destructive",
        title: t("reschedule.errorTitle", "Could not reschedule"),
        description: t(`reschedule.errors.${code}`, code),
      });
    },
  });

  return (
    <StandardPageLayout
      title={t("reschedule.title", "Reschedule appointment")}
      description={t(
        "reschedule.description",
        "Choose a new time for your upcoming service visit.",
      )}
      icon={CalendarClock}
    >
      <div className="max-w-2xl space-y-6">
        <div>
          <Label className="mb-2 block">
            {t("reschedule.selectSlot", "Select a new time slot")}
          </Label>
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2" data-testid="slots-loading">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : (
            <SlotPicker
              slots={data?.slots ?? []}
              selected={selected}
              onSelect={setSelected}
              emptyLabel={t(
                "reschedule.noSlots",
                "No open slots are available. Please contact the garage.",
              )}
            />
          )}
        </div>

        <div>
          <Label htmlFor="reschedule-reason" className="mb-2 block">
            {t("reschedule.reasonLabel", "Reason (optional)")}
          </Label>
          <Textarea
            id="reschedule-reason"
            value={reason}
            maxLength={500}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("reschedule.reasonPlaceholder", "Let the garage know why…")}
            data-testid="reschedule-reason"
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/portal/appointments")}
            data-testid="reschedule-back"
          >
            {t("reschedule.cancel", "Back")}
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                disabled={!selected || reschedule.isPending}
                data-testid="reschedule-confirm-open"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
              >
                {t("reschedule.confirmCta", "Reschedule")}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {t("reschedule.confirmTitle", "Confirm new time")}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {t(
                    "reschedule.confirmBody",
                    "Your appointment will be moved to the selected slot.",
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t("reschedule.cancel", "Back")}</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => reschedule.mutate()}
                  data-testid="reschedule-confirm"
                >
                  {t("reschedule.confirmCta", "Reschedule")}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </StandardPageLayout>
  );
}

export default CustomerAppointmentReschedule;
