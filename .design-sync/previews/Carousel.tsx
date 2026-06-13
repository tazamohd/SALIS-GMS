import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "rest-express";
import { Wrench, Droplets, Snowflake, ShieldCheck } from "lucide-react";

const packages = [
  {
    name: "Essential Service",
    price: "SAR 299",
    desc: "Oil change, filter swap, 21-point inspection",
    icon: Droplets,
    tag: "Most booked",
  },
  {
    name: "Full Service",
    price: "SAR 749",
    desc: "Fluids, brakes, suspension check, diagnostics scan",
    icon: Wrench,
    tag: "Recommended",
  },
  {
    name: "AC Refresh",
    price: "SAR 420",
    desc: "Compressor test, refrigerant top-up, cabin filter",
    icon: Snowflake,
    tag: "Summer offer",
  },
  {
    name: "Pre-Trip Check",
    price: "SAR 180",
    desc: "Tyres, battery, lights and coolant before travel",
    icon: ShieldCheck,
    tag: "Quick visit",
  },
];

export const ServicePackages = () => (
  <div className="w-full px-12 py-2">
    <Carousel className="w-full">
      <CarouselContent>
        {packages.map((p) => (
          <CarouselItem key={p.name}>
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{p.name}</CardTitle>
                  <Badge variant="secondary">{p.tag}</Badge>
                </div>
                <CardDescription>{p.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <p.icon className="h-5 w-5 text-muted-foreground" />
                  <span className="text-2xl font-bold font-mono">{p.price}</span>
                  <span className="text-xs text-muted-foreground">incl. VAT</span>
                </div>
              </CardContent>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
    <p className="mt-2 text-center text-xs text-muted-foreground">
      Slide 1 of {packages.length} — SALIS AUTO service packages
    </p>
  </div>
);

export const MultiSlide = () => (
  <div className="w-full px-12 py-2">
    <Carousel className="w-full" opts={{ align: "start" }}>
      <CarouselContent>
        {["Bay 1 — Nissan Patrol 2019", "Bay 2 — Hyundai Sonata 2023", "Bay 3 — Toyota Camry 2021", "Bay 4 — Ford Explorer 2020"].map(
          (bay) => (
            <CarouselItem key={bay} className="basis-1/2">
              <Card>
                <CardContent className="flex h-24 items-center justify-center p-4">
                  <span className="text-center text-sm font-medium">{bay}</span>
                </CardContent>
              </Card>
            </CarouselItem>
          )
        )}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  </div>
);
