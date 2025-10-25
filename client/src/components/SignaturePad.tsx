import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { X, Check, RotateCcw } from "lucide-react";

export interface SignatureData {
  signatureData: string;
  consentGiven: boolean;
  consentText?: string;
  signatureType: 'customer' | 'technician' | 'manager';
  timestamp: string;
}

interface SignaturePadProps {
  onSign: (data: SignatureData) => void;
  onCancel: () => void;
  title?: string;
  consentText?: string;
  signatureType?: 'customer' | 'technician' | 'manager';
}

export function SignaturePad({ 
  onSign, 
  onCancel, 
  title = "Digital Signature",
  consentText,
  signatureType = 'customer'
}: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [consentGiven, setConsentGiven] = useState(!consentText);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasSignature(true);

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const saveSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas || !hasSignature || (consentText && !consentGiven)) return;

    const signatureImageData = canvas.toDataURL('image/png');
    
    onSign({
      signatureData: signatureImageData,
      consentGiven,
      consentText,
      signatureType: signatureType || 'customer',
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          {signatureType === 'customer' && "Please sign below to authorize this action"}
          {signatureType === 'technician' && "Technician signature required"}
          {signatureType === 'manager' && "Manager approval signature"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white">
          <canvas
            ref={canvasRef}
            width={600}
            height={300}
            className="w-full cursor-crosshair touch-none"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
            data-testid="signature-canvas"
          />
        </div>

        {consentText && (
          <div className="flex items-start space-x-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Checkbox
              id="consent"
              checked={consentGiven}
              onCheckedChange={(checked) => setConsentGiven(checked === true)}
              data-testid="checkbox-consent"
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="consent"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                I consent and agree
              </Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {consentText}
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-between gap-2">
          <Button
            variant="outline"
            onClick={clearSignature}
            disabled={!hasSignature}
            data-testid="button-clear-signature"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onCancel}
              data-testid="button-cancel-signature"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={saveSignature}
              disabled={!hasSignature || (!!consentText && !consentGiven)}
              className="bg-salis-black hover:bg-salis-gray text-white"
              data-testid="button-save-signature"
            >
              <Check className="w-4 h-4 mr-2" />
              Sign & Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
