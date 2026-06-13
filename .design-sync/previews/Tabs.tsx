import { Tabs, TabsContent, TabsList, TabsTrigger } from "rest-express";

export const JobCardDetail = () => (
  <div className="w-96 p-4">
    <Tabs defaultValue="overview">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="parts">Parts &amp; Labor</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
      </TabsList>
      <TabsContent value="overview">
        <div className="space-y-1 rounded-md border p-4">
          <p className="text-sm font-medium">JC-2031 — Toyota Camry 2022</p>
          <p className="text-sm text-muted-foreground">
            Brake service in Bay 3. Technician: Faisal Al-Harbi. Promised
            delivery today at 5:30 PM.
          </p>
        </div>
      </TabsContent>
      <TabsContent value="parts">
        <p className="text-sm text-muted-foreground">Parts list.</p>
      </TabsContent>
      <TabsContent value="invoices">
        <p className="text-sm text-muted-foreground">Invoices.</p>
      </TabsContent>
    </Tabs>
  </div>
);

export const FullWidthSecondActive = () => (
  <div className="w-96 p-4">
    <Tabs defaultValue="parts">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="parts">Parts &amp; Labor</TabsTrigger>
        <TabsTrigger value="invoices">Invoices</TabsTrigger>
      </TabsList>
      <TabsContent value="parts">
        <div className="rounded-md border p-4 text-sm">
          <div className="flex items-center justify-between">
            <span>Brake Pads (Front) × 1</span>
            <span className="font-medium">SAR 320.00</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-muted-foreground">
            <span>Labor — Brake Service (1.5 hrs)</span>
            <span>SAR 225.00</span>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </div>
);

export const WithDisabledTab = () => (
  <div className="w-96 p-4">
    <Tabs defaultValue="estimate">
      <TabsList>
        <TabsTrigger value="estimate">Estimate</TabsTrigger>
        <TabsTrigger value="approval">Approval</TabsTrigger>
        <TabsTrigger value="invoice" disabled>
          Invoice
        </TabsTrigger>
      </TabsList>
      <TabsContent value="estimate">
        <p className="text-sm text-muted-foreground">
          Estimate EST-104 pending customer approval — invoicing unlocks after
          approval.
        </p>
      </TabsContent>
    </Tabs>
  </div>
);
