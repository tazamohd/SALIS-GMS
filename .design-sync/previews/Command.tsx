import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "rest-express";
import {
  Car,
  ClipboardList,
  FileText,
  UserRound,
  Wrench,
} from "lucide-react";

export const WorkshopCommandPalette = () => (
  <div className="p-4">
    <Command className="rounded-lg border shadow-md">
      <CommandInput placeholder="Search vehicles, job cards, customers..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Quick Actions">
          <CommandItem>
            <ClipboardList />
            <span>New Job Card</span>
            <CommandShortcut>⌘J</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <FileText />
            <span>Create Invoice</span>
            <CommandShortcut>⌘I</CommandShortcut>
          </CommandItem>
          <CommandItem>
            <Car />
            <span>Register Vehicle</span>
            <CommandShortcut>⌘V</CommandShortcut>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Recent Job Cards">
          <CommandItem>
            <Wrench />
            <span>JC-2031 — Toyota Camry 2022 — Brake Service</span>
          </CommandItem>
          <CommandItem>
            <Wrench />
            <span>JC-2030 — Hyundai Sonata — A/C Repair</span>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Customers">
          <CommandItem>
            <UserRound />
            <span>Abdullah Al-Qahtani</span>
          </CommandItem>
          <CommandItem>
            <UserRound />
            <span>Mohammed Al-Otaibi</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  </div>
);
