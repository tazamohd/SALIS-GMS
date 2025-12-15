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
  Clock,
  Image,
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
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-400" />
                    <CardTitle>Part Information</CardTitle>
                  </div>
                  <CardDescription>معلومات القطعة المطلوبة</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="partNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Part Number (OEM)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. 04465-33450"
                              className="bg-gray-700 border-gray-600"
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
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              min={1}
                              className="bg-gray-700 border-gray-600"
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
                        <FormLabel>Part Name *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g. Front Brake Pads Set"
                            className="bg-gray-700 border-gray-600"
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
                        <FormLabel>Part Name (Arabic)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="مثال: طقم فحمات فرامل أمامي"
                            className="bg-gray-700 border-gray-600 text-right"
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
                        <FormLabel>Preferred Brand</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-700 border-gray-600" data-testid="select-brand">
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
                    <Label>Alternative Brands Accepted</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {alternativeBrands.map((brand) => (
                        <Badge
                          key={brand}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {brand}
                          <button
                            type="button"
                            onClick={() => removeAlternativeBrand(brand)}
                            className="ml-1 hover:text-red-400"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                      <Select onValueChange={addAlternativeBrand}>
                        <SelectTrigger className="w-32 h-7 bg-gray-700 border-gray-600 text-sm">
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
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-green-400" />
                    <CardTitle>Vehicle Information</CardTitle>
                  </div>
                  <CardDescription>معلومات المركبة (للتوافق)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="vehicleMake"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Make</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Toyota"
                              className="bg-gray-700 border-gray-600"
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
                          <FormLabel>Model</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Camry"
                              className="bg-gray-700 border-gray-600"
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
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              placeholder="e.g. 2022"
                              className="bg-gray-700 border-gray-600"
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
                        <FormLabel>VIN (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Vehicle Identification Number"
                            className="bg-gray-700 border-gray-600"
                            data-testid="input-vin"
                          />
                        </FormControl>
                        <FormDescription>
                          For exact part matching
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              {/* Delivery & Notes */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-orange-400" />
                    <CardTitle>Delivery & Notes</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="urgency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Urgency</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-700 border-gray-600" data-testid="select-urgency">
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
                          <FormLabel>Delivery Preference</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-gray-700 border-gray-600" data-testid="select-delivery">
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
                        <FormLabel>Delivery Location</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Address for delivery"
                            className="bg-gray-700 border-gray-600"
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
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any special requirements or notes for suppliers..."
                            className="bg-gray-700 border-gray-600 min-h-24"
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
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-base">Target Regions</CardTitle>
                  <CardDescription>المناطق المستهدفة</CardDescription>
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
                        <Label htmlFor={region} className="text-sm cursor-pointer">
                          {region}
                        </Label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Submit Button */}
              <Card className="bg-blue-900/30 border-blue-700/50">
                <CardContent className="p-6">
                  <Button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700"
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
                  <p className="text-xs text-gray-400 mt-3 text-center">
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
