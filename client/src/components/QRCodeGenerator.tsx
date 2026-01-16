import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Download, Mail, MessageSquare } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface QRCodeGeneratorProps {
  appointmentId?: string;
  customerId: string;
  vehicleId?: string;
  onGenerated?: (qrCode: any) => void;
}

export function QRCodeGenerator({ 
  appointmentId, 
  customerId, 
  vehicleId,
  onGenerated 
}: QRCodeGeneratorProps) {
  const { t } = useTranslation();
  const [tokenType, setTokenType] = useState<string>("appointment");
  const [expiresInHours, setExpiresInHours] = useState<number>(24);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQR, setGeneratedQR] = useState<any>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setIsGenerating(true);

    try {
      const qrCode = await apiRequest('POST', '/api/qr-codes/generate', {
        appointmentId,
        customerId,
        vehicleId,
        tokenType,
        expiresInHours,
      });

      setGeneratedQR(qrCode);
      
      queryClient.invalidateQueries({ 
        queryKey: ['/api/qr-codes/customer', customerId] 
      });

      toast({
        title: "QR Code Generated",
        description: "QR code has been successfully generated",
      });

      if (onGenerated) {
        onGenerated(qrCode);
      }
    } catch (error) {
      console.error('QR generation error:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!generatedQR) return;

    const link = document.createElement('a');
    link.href = generatedQR.qrCodeImageUrl;
    link.download = `salis-qr-${generatedQR.id}.png`;
    link.click();
  };

  const handlePrint = () => {
    if (!generatedQR) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>SALIS AUTO - QR Code</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            img {
              max-width: 400px;
              margin: 20px;
            }
            h1 {
              font-size: 24px;
              margin-bottom: 10px;
            }
            p {
              font-size: 14px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <h1>${t('app.name', 'SALIS AUTO')}</h1>
          <p>${t('qrCode.appointmentCheckIn', 'Appointment Check-In QR Code')}</p>
          <img src="${generatedQR.qrCodeImageUrl}" alt="${t('qrCode.qrCode', 'QR Code')}" />
          <p>${t('qrCode.scanUponArrival', 'Scan this code upon arrival')}</p>
          <p>${t('qrCode.expires', 'Expires')}: ${new Date(generatedQR.expiresAt).toLocaleString()}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t('qrCode.generateQRCode', 'Generate QR Code')}</CardTitle>
        <CardDescription>
          {t('qrCode.createQRCodeDescription', 'Create a QR code for quick check-in')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!generatedQR ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="tokenType">QR Code Type</Label>
              <Select value={tokenType} onValueChange={setTokenType}>
                <SelectTrigger data-testid="select-token-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="appointment">{t('qrCode.appointmentCheckIn', 'Appointment Check-In')}</SelectItem>
                  <SelectItem value="vehicle_dropoff">{t('qrCode.vehicleDropoff', 'Vehicle Drop-off')}</SelectItem>
                  <SelectItem value="loyalty_card">{t('qrCode.loyaltyCard', 'Loyalty Card')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiresInHours">{t('qrCode.expiresInHours', 'Expires In (Hours)')}</Label>
              <Input
                id="expiresInHours"
                type="number"
                min="1"
                max="168"
                value={expiresInHours}
                onChange={(e) => setExpiresInHours(parseInt(e.target.value))}
                data-testid="input-expires"
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-salis-black hover:bg-salis-gray text-white"
              data-testid="button-generate-qr"
            >
              {isGenerating ? "Generating..." : "Generate QR Code"}
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center space-y-4">
              <img
                src={generatedQR.qrCodeImageUrl}
                alt="Generated QR Code"
                className="w-64 h-64 border-2 border-gray-300 dark:border-gray-600 rounded-lg"
                data-testid="img-qr-code"
              />
              
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">QR Code Generated</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Expires: {new Date(generatedQR.expiresAt).toLocaleString()}
                </p>
              </div>

              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-1"
                  data-testid="button-download-qr"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  onClick={handlePrint}
                  className="flex-1"
                  data-testid="button-print-qr"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Print
                </Button>
              </div>

              <Button
                variant="outline"
                onClick={() => setGeneratedQR(null)}
                className="w-full"
                data-testid="button-generate-another"
              >
                Generate Another
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
