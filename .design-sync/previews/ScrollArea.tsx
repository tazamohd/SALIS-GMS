import { ScrollArea, Separator } from "rest-express";

const PARTS: Array<[string, string, string]> = [
  ["BRK-PAD-FR", "Front brake pads", "24 in stock"],
  ["BRK-PAD-RR", "Rear brake pads", "18 in stock"],
  ["ROT-DSC-22", "Brake rotor 22\"", "6 in stock"],
  ["FLT-OIL-T1", "Oil filter Toyota", "42 in stock"],
  ["FLT-AIR-N7", "Air filter Nissan", "15 in stock"],
  ["FLD-DOT4-1L", "Brake fluid DOT4 1L", "30 in stock"],
  ["BAT-12V-70", "Battery 12V 70Ah", "9 in stock"],
  ["SPK-PLG-IR", "Iridium spark plug", "64 in stock"],
  ["BLT-SRP-6PK", "Serpentine belt 6PK", "11 in stock"],
  ["WPR-BLD-22", "Wiper blade 22\"", "27 in stock"],
  ["CLT-KIT-HL", "Clutch kit Hilux", "3 in stock"],
  ["RAD-CLNT-4L", "Coolant 4L", "22 in stock"],
  ["SHK-ABS-FR", "Front shock absorber", "8 in stock"],
  ["TIE-ROD-LC", "Tie rod end LC200", "10 in stock"],
  ["HRN-12V-STD", "Horn 12V standard", "16 in stock"],
];

export const PartsInventory = () => (
  <div className="p-4">
    <ScrollArea
      type="always"
      className="rounded-md border"
      style={{ height: 220, width: 340 }}
    >
      <div className="p-4">
        <h4 className="mb-3 text-sm font-semibold leading-none">
          Spare parts inventory
        </h4>
        {PARTS.map(([sku, name, stock], i) => (
          <div key={sku}>
            {i > 0 && <Separator className="my-2" />}
            <div className="flex items-center justify-between text-sm">
              <div>
                <div className="font-mono text-xs text-muted-foreground">
                  {sku}
                </div>
                <div>{name}</div>
              </div>
              <span className="text-xs text-muted-foreground">{stock}</span>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
);

export const ServiceHistory = () => (
  <div className="p-4">
    <ScrollArea
      type="always"
      className="rounded-md border"
      style={{ height: 180, width: 340 }}
    >
      <div className="p-4 text-sm">
        <h4 className="mb-3 font-semibold leading-none">
          Service history &mdash; KSA 4821
        </h4>
        {[
          ["02 Jun 2026", "Brake overhaul", "SAR 1,485"],
          ["18 Mar 2026", "80,000 km major service", "SAR 2,150"],
          ["05 Jan 2026", "Battery replacement", "SAR 540"],
          ["22 Nov 2025", "AC compressor repair", "SAR 1,720"],
          ["09 Sep 2025", "70,000 km service", "SAR 980"],
          ["14 Jun 2025", "Tire rotation + alignment", "SAR 260"],
          ["30 Mar 2025", "60,000 km service", "SAR 940"],
        ].map(([date, job, total]) => (
          <div
            key={date}
            className="flex items-center justify-between border-b py-2"
          >
            <div>
              <div className="font-medium">{job}</div>
              <div className="text-xs text-muted-foreground">{date}</div>
            </div>
            <span className="tabular-nums text-muted-foreground">{total}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  </div>
);
