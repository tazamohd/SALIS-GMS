import {
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "rest-express";
import { Printer } from "lucide-react";

export const PrintHint = () => (
  <TooltipProvider>
    <div className="flex items-end justify-center" style={{ minHeight: 130 }}>
      <Tooltip open>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Print job card">
            <Printer />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Print job card JC-1042</TooltipContent>
      </Tooltip>
    </div>
  </TooltipProvider>
);
