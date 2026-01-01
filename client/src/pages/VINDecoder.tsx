import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Car, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

export default function VINDecoder() {
  const { t } = useTranslation();
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
    return item?.Value || t('common.notAvailable', 'N/A');
  };

  const results = vehicleData?.Results || [];

  return (
    <StandardPageLayout
      title={t('vinDecoder.title', 'VIN Decoder')}
      description={t('vinDecoder.description', 'Decode vehicle identification numbers to retrieve vehicle specifications and recall information')}
      icon={Car}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('vinDecoder.enterVin', 'Enter VIN')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder={t('vinDecoder.enterVinPlaceholder', 'Enter 17-character VIN')}
                  value={vin}
                  onChange={(e) => setVin(e.target.value.toUpperCase())}
                  maxLength={17}
                  data-testid="input-vin"
                  className="font-mono text-lg bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                />
                <p className="text-xs text-[#64748B]">
                  {vin.length}/17 {t('vinDecoder.characters', 'characters')}
                </p>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white"
                onClick={handleDecode}
                disabled={vin.length !== 17 || decodeMutation.isPending}
                data-testid="button-decode-vin"
              >
                <Search className="h-4 w-4 mr-2" />
                {decodeMutation.isPending ? t('vinDecoder.decoding', 'Decoding...') : t('vinDecoder.decodeVin', 'Decode VIN')}
              </Button>

              <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#232A36]">
                <h3 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">{t('vinDecoder.sampleVins', 'Sample VINs')}</h3>
                <div className="space-y-2">
                  <button
                    className="w-full text-left p-2 text-sm bg-[#F8FAFC] dark:bg-[#0E1117] rounded border border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] font-mono text-[#0B1F3B] dark:text-white transition-colors"
                    onClick={() => setVin("1HGBH41JXMN109186")}
                    data-testid="sample-vin-1"
                  >
                    1HGBH41JXMN109186
                  </button>
                  <button
                    className="w-full text-left p-2 text-sm bg-[#F8FAFC] dark:bg-[#0E1117] rounded border border-[#E2E8F0] dark:border-[#232A36] hover:border-[#0A5ED7] dark:hover:border-[#0BB3FF] font-mono text-[#0B1F3B] dark:text-white transition-colors"
                    onClick={() => setVin("5UXWX7C5*BA")}
                    data-testid="sample-vin-2"
                  >
                    {t('vinDecoder.sampleBmw', 'Sample BMW X3')}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {!vehicleData ? (
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36] h-full flex items-center justify-center min-h-96">
              <CardContent className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4">
                  <Car className="h-8 w-8 text-[#0A5ED7]" />
                </div>
                <p className="text-[#64748B]">{t('vinDecoder.enterVinToSee', 'Enter a VIN to see vehicle details')}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-[#0B1F3B] dark:text-white">
                    <span>{t('vinDecoder.vehicleInformation', 'Vehicle Information')}</span>
                    <Badge className="bg-green-500/10 text-green-600 dark:text-green-400 border-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      {t('vinDecoder.decoded', 'Decoded')}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 rounded-lg border border-[#0A5ED7]/20">
                      <p className="text-sm text-[#64748B]">{t('vehicles.make', 'Make')}</p>
                      <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-make">
                        {extractValue(results, "Make")}
                      </p>
                    </div>
                    <div className="p-4 bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 rounded-lg border border-[#0A5ED7]/20">
                      <p className="text-sm text-[#64748B]">{t('vehicles.model', 'Model')}</p>
                      <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-model">
                        {extractValue(results, "Model")}
                      </p>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-sm text-[#64748B]">{t('vehicles.year', 'Year')}</p>
                      <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-year">
                        {extractValue(results, "Model Year")}
                      </p>
                    </div>
                    <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                      <p className="text-sm text-[#64748B]">{t('vehicles.bodyType', 'Body Type')}</p>
                      <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-body-type">
                        {extractValue(results, "Body Class")}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <p className="text-sm text-[#64748B]">{t('vehicles.engine', 'Engine')}</p>
                      <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-engine">
                        {extractValue(results, "Engine Number of Cylinders")} {t('vehicles.cylinders', 'Cyl')}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <p className="text-sm text-[#64748B]">{t('vehicles.fuelType', 'Fuel Type')}</p>
                      <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-fuel-type">
                        {extractValue(results, "Fuel Type - Primary")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                    <AlertTriangle className="h-5 w-5 text-[#F97316]" />
                    {t('vinDecoder.safetyRecalls', 'Safety & Recalls')}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 bg-[#F97316]/10 rounded-lg border border-[#F97316]/20">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-[#F97316] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-[#0B1F3B] dark:text-white mb-1">
                          {t('vinDecoder.checkNhtsa', 'Check NHTSA for Active Recalls')}
                        </p>
                        <p className="text-sm text-[#64748B]">
                          {t('vinDecoder.visitSaferCar', 'Visit safercar.gov to check for active safety recalls on this vehicle')}
                        </p>
                        <Button 
                          variant="outline" 
                          className="mt-2 border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10" 
                          size="sm" 
                          data-testid="button-check-recalls"
                        >
                          {t('vinDecoder.checkRecalls', 'Check Recalls on NHTSA')}
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
    </StandardPageLayout>
  );
}
