import { Calendar } from "rest-express";

export const SingleSelected = () => (
  <div className="p-4">
    <p className="text-sm font-medium pb-2">Service appointment</p>
    <Calendar
      mode="single"
      selected={new Date(2026, 5, 15)}
      defaultMonth={new Date(2026, 5, 1)}
      className="rounded-lg border"
    />
  </div>
);

export const RangeSelected = () => (
  <div className="p-4">
    <p className="text-sm font-medium pb-2">Courtesy car booking</p>
    <Calendar
      mode="range"
      selected={{ from: new Date(2026, 5, 10), to: new Date(2026, 5, 17) }}
      defaultMonth={new Date(2026, 5, 1)}
      className="rounded-lg border"
    />
  </div>
);

export const DisabledWeekends = () => (
  <div className="p-4">
    <p className="text-sm font-medium pb-2">
      Drop-off slots (closed Fri–Sat)
    </p>
    <Calendar
      mode="single"
      selected={new Date(2026, 5, 22)}
      defaultMonth={new Date(2026, 5, 1)}
      disabled={{ dayOfWeek: [5, 6] }}
      className="rounded-lg border"
    />
  </div>
);
