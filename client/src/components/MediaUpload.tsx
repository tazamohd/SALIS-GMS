import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Image, Video, FileText } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MediaUploadProps {
  relatedType: string;
  relatedId: string;
  category?: 'before' | 'after' | 'damage' | 'walkaround' | 'invoice' | 'estimate';
  onUploadComplete?: () => void;
  onCancel?: () => void;
}

export function MediaUpload({ 
  relatedType, 
  relatedId, 
  category,
  onUploadComplete,
  onCancel 
}: MediaUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>(category || "");
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
      toast({
        title: "File too large",
        description: "Please select a file smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        
        const mediaType = file.type.startsWith('image/') ? 'photo' : 
                         file.type.startsWith('video/') ? 'video' : 'document';

        const mediaData = {
          relatedType,
          relatedId,
          mediaType,
          fileUrl: base64Data,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          category: selectedCategory,
          description,
          thumbnailUrl: mediaType === 'photo' ? base64Data : undefined,
        };

        await apiRequest('POST', '/api/media-attachments', mediaData);

        queryClient.invalidateQueries({ 
          queryKey: ['/api/media-attachments', relatedType, relatedId] 
        });

        toast({
          title: "Upload Successful",
          description: `${file.name} has been uploaded`,
        });

        setFile(null);
        setDescription("");
        setPreviewUrl("");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        if (onUploadComplete) {
          onUploadComplete();
        }
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload Failed",
        description: "Failed to upload the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = () => {
    if (!file) return <Upload className="w-12 h-12 text-gray-400" />;
    if (file.type.startsWith('image/')) return <Image className="w-12 h-12 text-blue-500" />;
    if (file.type.startsWith('video/')) return <Video className="w-12 h-12 text-purple-500" />;
    return <FileText className="w-12 h-12 text-gray-500" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Upload Media</CardTitle>
        <CardDescription>Upload photos, videos, or documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger data-testid="select-category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="before">Before</SelectItem>
              <SelectItem value="after">After</SelectItem>
              <SelectItem value="damage">Damage</SelectItem>
              <SelectItem value="walkaround">Vehicle Walkaround</SelectItem>
              <SelectItem value="invoice">Invoice</SelectItem>
              <SelectItem value="estimate">Estimate</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="file">File</Label>
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            onClick={() => fileInputRef.current?.click()}
            data-testid="file-drop-zone"
          >
            {previewUrl ? (
              <div className="space-y-2">
                <img src={previewUrl} alt="Preview" className="max-h-48 mx-auto rounded" />
                <p className="text-sm text-gray-600 dark:text-gray-400">{file?.name}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {getFileIcon()}
                <div>
                  <p className="text-sm font-medium">
                    {file ? file.name : "Click to upload or drag and drop"}
                  </p>
                  <p className="text-xs text-gray-500">
                    Images, videos, or documents (max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            id="file"
            type="file"
            className="hidden"
            accept="image/*,video/*,.pdf,.doc,.docx"
            onChange={handleFileSelect}
            data-testid="input-file"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add a description or notes about this media"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            data-testid="textarea-description"
          />
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} data-testid="button-cancel-upload">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}
          <Button
            onClick={handleUpload}
            disabled={!file || !selectedCategory || isUploading}
            className="bg-salis-black hover:bg-salis-gray text-white"
            data-testid="button-upload"
          >
            <Upload className="w-4 h-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
