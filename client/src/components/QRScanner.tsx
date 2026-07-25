import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Check, X, AlertCircle, QrCode as QrCodeIcon } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface QRScannerProps {
  onScanSuccess?: (result: any) => void;
  onScanError?: (error: string) => void;
  autoCheckIn?: boolean;
}

export function QRScanner({ 
  onScanSuccess, 
  onScanError,
  autoCheckIn = false 
}: QRScannerProps) {
  const [qrCodeData, setQrCodeData] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanError, setScanError] = useState<string>("");
  const { toast } = useToast();

  const handleScan = async () => {
    if (!qrCodeData.trim()) {
      setScanError("Please enter QR code data");
      return;
    }

    setIsScanning(true);
    setScanError("");
    setScanResult(null);

    try {
      const result: any = await apiRequest('POST', '/api/qr-codes/scan', {
        qrCodeData: qrCodeData.trim(),
      });

      setScanResult(result);

      if (result.scanResult === 'success') {
        toast({
          title: "Valid QR Code",
          description: "QR code scanned successfully",
        });

        if (onScanSuccess) {
          onScanSuccess(result);
        }

        // Auto check-in if enabled
        if (autoCheckIn && result.qrToken?.appointmentId) {
          await handleCheckIn(qrCodeData.trim());
        }
      }
    } catch (error: any) {
      const errorMessage = error?.message || "Invalid or expired QR code";
      setScanError(errorMessage);

      toast({
        title: "Scan Failed",
        description: errorMessage,
        variant: "destructive",
      });

      if (onScanError) {
        onScanError(errorMessage);
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleCheckIn = async (qrData?: string) => {
    try {
      const dataToUse = qrData || qrCodeData.trim();
      
      const checkInResult: any = await apiRequest('POST', '/api/qr-codes/check-in', {
        qrCodeData: dataToUse,
      });

      toast({
        title: "Check-In Successful",
        description: "Customer has been checked in for their appointment",
      });

      setScanResult((prevResult: any) => ({
        ...(prevResult || {}),
        checkedIn: true,
        checkInResult,
      }));
    } catch (error: any) {
      toast({
        title: "Check-In Failed",
        description: error?.message || "Failed to process check-in",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setQrCodeData("");
    setScanResult(null);
    setScanError("");
  };

  const getScanStatusIcon = () => {
    if (!scanResult) return null;

    switch (scanResult.scanResult) {
      case 'success':
        return <Check className="w-12 h-12 text-green-500" />;
      case 'expired':
        return <AlertCircle className="w-12 h-12 text-orange-500" />;
      case 'already_used':
        return <AlertCircle className="w-12 h-12 text-yellow-500" />;
      case 'invalid':
        return <X className="w-12 h-12 text-red-500" />;
      default:
        return null;
    }
  };

  const getScanStatusMessage = () => {
    if (!scanResult) return null;

    switch (scanResult.scanResult) {
      case 'success':
        return "QR Code is valid and ready for check-in";
      case 'expired':
        return "This QR code has expired";
      case 'already_used':
        return "This QR code has already been used";
      case 'invalid':
        return "Invalid QR code";
      default:
        return null;
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Scan QR Code</CardTitle>
        <CardDescription>
          Scan or enter the customer's QR code for check-in
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!scanResult ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="qrCodeData">QR Code Data</Label>
              <div className="flex gap-2">
                <Input
                  id="qrCodeData"
                  placeholder="Enter or scan QR code data"
                  value={qrCodeData}
                  onChange={(e) => setQrCodeData(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                  data-testid="input-qr-code"
                />
                <Button
                  variant="outline"
                  size="icon"
                  data-testid="button-scan-icon"
                >
                  <QrCodeIcon className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {scanError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{scanError}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={handleScan}
              disabled={isScanning || !qrCodeData.trim()}
              className="w-full bg-salis-black hover:bg-salis-gray text-white"
              data-testid="button-scan"
            >
              {isScanning ? "Scanning..." : "Scan QR Code"}
            </Button>
          </>
        ) : (
          <>
            <div className="flex flex-col items-center space-y-4 py-4">
              {getScanStatusIcon()}
              
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">
                  {scanResult.scanResult === 'success' ? 'Scan Successful' : 'Scan Failed'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getScanStatusMessage()}
                </p>
              </div>

              {scanResult.scanResult === 'success' && scanResult.qrToken && (
                <div className="w-full space-y-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="font-medium">{scanResult.qrToken.tokenType}</span>
                  </div>
                  {scanResult.qrToken.appointmentId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Appointment:</span>
                      <span className="font-medium">{scanResult.qrToken.appointmentId.substring(0, 8)}...</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Expires:</span>
                    <span className="font-medium">
                      {new Date(scanResult.qrToken.expiresAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}

              {scanResult.scanResult === 'success' && !scanResult.checkedIn && (
                <Button
                  onClick={() => handleCheckIn()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  data-testid="button-check-in"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Check In Customer
                </Button>
              )}

              {scanResult.checkedIn && (
                <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <Check className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 dark:text-green-200">
                    Customer successfully checked in!
                  </AlertDescription>
                </Alert>
              )}

              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full"
                data-testid="button-scan-another"
              >
                Scan Another
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
