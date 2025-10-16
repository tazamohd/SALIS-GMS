import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, X, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BarcodeScannerProps {
  open: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ open, onClose, onScan }: BarcodeScannerProps) {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scannedCode, setScannedCode] = useState<string>("");
  const scanIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [open]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }

      setIsScanning(true);
      startScanning();
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsScanning(false);
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
  };

  const startScanning = () => {
    // Simple barcode detection using canvas
    // In production, use a library like @zxing/library or quagga2
    scanIntervalRef.current = window.setInterval(() => {
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        if (context && video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Get image data for barcode detection
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          
          // Note: This is a placeholder. In production, integrate a proper barcode library
          // For demo purposes, we'll simulate scanning with a random code
          if (Math.random() > 0.95) {
            const mockBarcode = `BC${Math.floor(Math.random() * 1000000)}`;
            handleBarcodeDetected(mockBarcode);
          }
        }
      }
    }, 100);
  };

  const handleBarcodeDetected = (barcode: string) => {
    setScannedCode(barcode);
    stopCamera();
    
    toast({
      title: "Barcode Scanned",
      description: `Code: ${barcode}`,
    });

    onScan(barcode);
  };

  const handleClose = () => {
    stopCamera();
    setScannedCode("");
    onClose();
  };

  const handleManualEntry = () => {
    const code = prompt("Enter barcode manually:");
    if (code) {
      handleBarcodeDetected(code);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Scan Barcode</DialogTitle>
          <DialogDescription>
            Point your camera at a barcode to scan it
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {scannedCode ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-medium text-green-900">Barcode Detected</p>
                <p className="text-sm text-green-700">{scannedCode}</p>
              </div>
            </div>
          ) : (
            <div className="relative bg-black rounded-lg overflow-hidden" style={{ height: "400px" }}>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-32 border-2 border-blue-500 rounded-lg animate-pulse">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                      Align barcode here
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleManualEntry}
              className="flex-1"
              data-testid="button-manual-entry"
            >
              Manual Entry
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              data-testid="button-close-scanner"
            >
              <X className="mr-2 h-4 w-4" />
              Close
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Note: For production use, integrate a barcode scanning library like @zxing/library or quagga2
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
