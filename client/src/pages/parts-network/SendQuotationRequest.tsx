// @ts-nocheck
import PartsNetworkLayout from "./PartsNetworkLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Package,
  Car,
  MapPin,
  Send,
  Plus,
  X,
} from "lucide-react";
import { useState } from "react";

const requestFormSchema = z.object({
  partNumber: z.string().optional(),
  partName: z.string().min(2, "Part name is required"),
  partNameAr: z.string().optional(),
  brand: z.string().optional(),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  vehicleMake: z.string().optional(),
  vehicleModel: z.string().optional(),
  vehicleYear: z.coerce.number().optional(),
  vehicleVin: z.string().optional(),
  urgency: z.enum(["low", "normal", "urgent"]),
  deliveryPreference: z.enum(["pickup", "delivery", "both"]),
  preferredDeliveryLocation: z.string().optional(),
  notes: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

const popularBrands = [
  "Toyota", "Honda", "Nissan", "Hyundai", "Kia", "Ford", "Chevrolet",
  "Mercedes-Benz", "BMW", "Audi", "Lexus", "Mazda", "Mitsubishi",
  "Suzuki", "Isuzu", "GMC", "Jeep", "Dodge", "Volkswagen"
];

const partCategories = [
  "Engine Parts", "Brakes", "Suspension", "Electrical", "Filters",
  "Fluids & Oils", "Body Parts", "Interior", "Exhaust", "Transmission",
  "Cooling System", "Steering", "Fuel System", "Ignition", "Accessories"
];

export default function SendQuotationRequest() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [alternativeBrands, setAlternativeBrands] = useState<string[]>([]);
  const [targetRegions, setTargetRegions] = useState<string[]>(["Riyadh"]);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      quantity: 1,
      urgency: "normal",
      deliveryPreference: "both",
    },
  });

  const createRequest = useMutation({
    mutationFn: async (data: RequestFormValues) => {
      return apiRequest("/api/parts-network/requests", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          alternativeBrands,
          targetRegions,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Request Sent!",
        description: "Your quotation request has been sent to suppliers.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/parts-network/requests"] });
      navigate("/parts-network/my-requests");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RequestFormValues) => {
    createRequest.mutate(data);
  };

  const addAlternativeBrand = (brand: string) => {
    if (brand && !alternativeBrands.includes(brand)) {
      setAlternativeBrands([...alternativeBrands, brand]);
    }
  };

  const removeAlternativeBrand = (brand: string) => {
    setAlternativeBrands(alternativeBrands.filter(b => b !== brand));
  };

  return (
    <PartsNetworkLayout 
      title="Send Quotation Request" 
      description="إرسال طلب عرض أسعار - Request price quotes from suppliers"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Part Information */}
              <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-[#0A5ED7]" />
                    <CardTitle className="text-[#0B1F3B] dark:text-white">Part Information</CardTitle>
                  </div>
                  <CardDescription className="text-[#64748B]">معلومات القطعة المطلوبة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="partNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">Part Number (OEM)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. 04465-33450"
                              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                              data-testid="input-part-number"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">Quantity</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={1}
                              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                              data-testid="input-quantity"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="partName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">Part Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Front Brake Pads Set"
                            className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                            data-testid="input-part-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="partNameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">Part Name (Arabic)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="مثال: طقم فحمات فرامل أمامي"
                            className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-right text-[#0B1F3B] dark:text-white"
                            dir="rtl"
                            data-testid="input-part-name-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brand"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">Preferred Brand</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-brand">
                              <SelectValue placeholder="Select brand" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {popularBrands.map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Alternative Brands */}
                  <div>
                    <Label className="text-[#0B1F3B] dark:text-white">Alternative Brands Accepted</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {alternativeBrands.map((brand) => (
                        <Badge
                          key={brand}
                          variant="secondary"
                          className="flex items-center gap-1 bg-[#F8FAFC] dark:bg-[#0E1117] text-[#0B1F3B] dark:text-white"
                        >
                          {brand}
                          <button
                            type="button"
                            onClick={() => removeAlternativeBrand(brand)}
                            className="ml-1 hover:text-red-500"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      <Select onValueChange={addAlternativeBrand}>
                        <SelectTrigger className="w-32 h-7 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-sm">
                          <Plus className="h-3 w-3 mr-1" />
                          Add
                        </SelectTrigger>
                        <SelectContent>
                          {popularBrands
                            .filter(b => !alternativeBrands.includes(b))
                            .map((brand) => (
                              <SelectItem key={brand} value={brand}>
                                {brand}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Vehicle Information */}
              <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-green-500" />
                    <CardTitle className="text-[#0B1F3B] dark:text-white">Vehicle Information</CardTitle>
                  </div>
                  <CardDescription className="text-[#64748B]">معلومات المركبة (للتوافق)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="vehicleMake"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">Make</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Toyota"
                              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                              data-testid="input-vehicle-make"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehicleModel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">Model</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Camry"
                              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                              data-testid="input-vehicle-model"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="vehicleYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">Year</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="e.g. 2022"
                              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                              data-testid="input-vehicle-year"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="vehicleVin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">VIN (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Vehicle Identification Number"
                            className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                            data-testid="input-vin"
                          />
                        </FormControl>
                        <FormDescription className="text-[#64748B]">
                          For exact part matching
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Delivery & Notes */}
              <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-[#F97316]" />
                    <CardTitle className="text-[#0B1F3B] dark:text-white">Delivery & Notes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">Urgency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-urgency">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low - No Rush</SelectItem>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="deliveryPreference"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[#0B1F3B] dark:text-white">Delivery Preference</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-delivery">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="pickup">Pickup Only</SelectItem>
                              <SelectItem value="delivery">Delivery Only</SelectItem>
                              <SelectItem value="both">Both Options</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="preferredDeliveryLocation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">Delivery Location</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Address for delivery"
                            className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                            data-testid="input-delivery-location"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[#0B1F3B] dark:text-white">Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any special requirements or notes for suppliers..."
                            className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] min-h-24 text-[#0B1F3B] dark:text-white"
                            data-testid="input-notes"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Target Regions */}
              <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <CardHeader>
                  <CardTitle className="text-base text-[#0B1F3B] dark:text-white">Target Regions</CardTitle>
                  <CardDescription className="text-[#64748B]">المناطق المستهدفة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {["Riyadh", "Jeddah", "Dammam", "Makkah", "Madinah"].map((region) => (
                      <div key={region} className="flex items-center gap-2">
                        <Checkbox
                          id={region}
                          checked={targetRegions.includes(region)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setTargetRegions([...targetRegions, region]);
                            } else {
                              setTargetRegions(targetRegions.filter(r => r !== region));
                            }
                          }}
                        />
                        <Label htmlFor={region} className="text-sm cursor-pointer text-[#0B1F3B] dark:text-white">
                          {region}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Card className="bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 border-[#0A5ED7]/30">
                <CardContent className="p-6">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:opacity-90 text-white"
                    size="lg"
                    disabled={createRequest.isPending}
                    data-testid="btn-submit-request"
                  >
                    {createRequest.isPending ? (
                      "Sending..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Request
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-[#64748B] mt-3 text-center">
                    Your request will be sent to all matching suppliers in selected regions
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </Form>
    </PartsNetworkLayout>
  );
}
