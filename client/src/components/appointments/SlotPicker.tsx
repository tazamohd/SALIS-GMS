import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { AvailableSlot } from "@shared/schemas/appointmentReschedule";

interface SlotPickerProps {
  slots: AvailableSlot[];
  selected: string | null;
  onSelect: (slotStart: string) => void;
  emptyLabel: string;
}

/**
 * Feature 001 (T019) — available-slot selector. Unavailable slots are rendered
 * disabled and cannot be chosen (FR-002/FR-006). Date/time formatting is
 * locale-aware via date-fns; the surrounding portal handles RTL.
 */
export function SlotPicker({ slots, selected, onSelect, emptyLabel }: SlotPickerProps) {
  const selectable = slots.filter((s) => s.available);

  if (selectable.length === 0) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="slots-empty">
        {emptyLabel}
      </p>
    );
  }

  return (
    <div
      className="grid grid-cols-2 sm:grid-cols-3 gap-2"
      role="radiogroup"
      data-testid="slot-picker"
    >
      {slots.map((slot) => {
        const isSelected = selected === slot.start;
        const start = new Date(slot.start);
        return (
          <button
            key={slot.start}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={!slot.available}
            onClick={() => onSelect(slot.start)}
            data-testid={`slot-${slot.start}`}
            className={cn(
              "rounded-xl border px-3 py-2 text-sm transition-colors text-start",
              slot.available
                ? "border-purple-200 dark:border-white/15 hover:bg-purple-50 dark:hover:bg-white/10 cursor-pointer"
                : "border-gray-200 dark:border-white/5 opacity-40 cursor-not-allowed",
              isSelected &&
                "bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent",
            )}
          >
            <span className="block font-medium">{format(start, "EEE, MMM d")}</span>
            <span className="block text-xs opacity-80">{format(start, "p")}</span>
          </button>
        );
      })}
    </div>
  );
}
