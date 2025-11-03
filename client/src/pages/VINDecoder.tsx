import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Car, AlertTriangle, CheckCircle, Info } from "lucide-react";

export default function VINDecoder() {
  const [vin, setVin] = useState("");
  const [vehicleData, setVehicleData] = useState<any>(null);

  const decodeMutation = useMutation({
    mutationFn: async (vinNumber: string) => {
      const response = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVin/${vinNumber}?format=json`);
      return response.json();
    },
    onSuccess: (data) => {
      setVehicleData(data);
    },
  });

  const handleDecode = () => {
    if (vin.length === 17) {
      decodeMutation.mutate(vin);
    }
  };

  const extractValue = (results: any[], variable: string) => {
    const item = results?.find((r: any) => r.Variable === variable);
    return item?.Value || "N/A";
  };

  const results = vehicleData?.Results || [];

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-['Montserrat'] text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Car className="h-8 w-8 text-blue-600" />
          VIN Decoder
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Decode vehicle identification numbers to retrieve vehicle specifications and recall information
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle>Enter VIN</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter 17-character VIN"
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  maxLength={17}
                  data-testid="input-vin"
                  className="font-mono text-lg"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {vin.length}/17 characters
                </p>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleDecode}
                disabled={vin.length !== 17 || decodeMutation.isPending}
                data-testid="button-decode-vin"
              >
                <Search className="h-4 w-4 mr-2" />
                {decodeMutation.isPending ? "Decoding..." : "Decode VIN"}
              </Button>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Sample VINs</h3>
                <div className="space-y-2">
                  <button
                    className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 font-mono"
                    onClick={() => setVin("1HGBH41JXMN109186")}
                    data-testid="sample-vin-1"
                  >
                    1HGBH41JXMN109186
                  </button>
                  <button
                    className="w-full text-left p-2 text-sm bg-gray-50 dark:bg-gray-800 rounded hover:bg-gray-100 dark:hover:bg-gray-700 font-mono"
                    onClick={() => setVin("5UXWX7C5*BA")}
                    data-testid="sample-vin-2"
                  >
                    Sample BMW X3
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {!vehicleData ? (
            <Card className="bg-white dark:bg-salis-black h-full flex items-center justify-center min-h-96">
              <CardContent className="text-center">
                <Car className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">Enter a VIN to see vehicle details</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="bg-white dark:bg-salis-black">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Vehicle Information</span>
                    <Badge className="bg-green-500">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Decoded
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Make</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-make">
                        {extractValue(results, "Make")}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Model</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-model">
                        {extractValue(results, "Model")}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Year</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-year">
                        {extractValue(results, "Model Year")}
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Body Type</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-body-type">
                        {extractValue(results, "Body Class")}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Engine</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-engine">
                        {extractValue(results, "Engine Number of Cylinders")} Cyl
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-400">Fuel Type</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white" data-testid="text-fuel-type">
                        {extractValue(results, "Fuel Type - Primary")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-salis-black">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                    Safety & Recalls
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white mb-1">
                          Check NHTSA for Active Recalls
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Visit safercar.gov to check for active safety recalls on this vehicle
                        </p>
                        <Button variant="outline" className="mt-2" size="sm" data-testid="button-check-recalls">
                          Check Recalls on NHTSA
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
