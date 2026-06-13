import { AspectRatio } from "rest-express";
import { Camera, Car } from "lucide-react";

export const VehiclePhoto = () => (
  <div className="p-4" style={{ width: 360 }}>
    <AspectRatio ratio={16 / 9}>
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-md border text-sm"
        style={{
          background:
            "linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--accent)) 100%)",
        }}
      >
        <Car className="h-8 w-8 text-primary" />
        <span className="font-medium">Vehicle photo &middot; 16:9</span>
        <span className="text-xs text-muted-foreground">
          KSA 4821 &mdash; intake inspection
        </span>
      </div>
    </AspectRatio>
  </div>
);

export const DamageShot = () => (
  <div className="p-4" style={{ width: 280 }}>
    <AspectRatio ratio={4 / 3}>
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted text-sm text-muted-foreground">
        <Camera className="h-6 w-6" />
        <span>Add damage photo &middot; 4:3</span>
      </div>
    </AspectRatio>
  </div>
);
