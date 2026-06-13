import {
  Avatar,
  AvatarFallback,
  Badge,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "rest-express";
import { CalendarDays, Car } from "lucide-react";

export const CustomerSummary = () => (
  <div className="flex justify-center pt-4">
    <HoverCard open>
      <HoverCardTrigger asChild>
        <a className="text-sm font-medium text-primary underline-offset-4 hover:underline" href="#">
          Fahad Al-Otaibi
        </a>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex gap-4">
          <Avatar>
            <AvatarFallback>FA</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold">Fahad Al-Otaibi</h4>
              <Badge variant="secondary">VIP</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              12 visits — SAR 18,640 lifetime spend
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs text-muted-foreground">
              <Car className="h-3.5 w-3.5 shrink-0" />
              <span>2 vehicles on file</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span>Customer since March 2023</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  </div>
);
