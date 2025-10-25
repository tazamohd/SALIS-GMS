import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Image, Video, FileText, Trash2, Eye, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface MediaGalleryProps {
  relatedType: string;
  relatedId: string;
  showBeforeAfter?: boolean;
  allowDelete?: boolean;
}

interface MediaAttachment {
  id: string;
  mediaType: string;
  fileUrl: string;
  fileName: string;
  category: string;
  description: string;
  thumbnailUrl?: string;
  createdAt: string;
}

export function MediaGallery({ 
  relatedType, 
  relatedId, 
  showBeforeAfter = true,
  allowDelete = true 
}: MediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<MediaAttachment | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'before' | 'after' | 'comparison'>('all');
  const { toast } = useToast();

  const { data: media = [], isLoading } = useQuery<MediaAttachment[]>({
    queryKey: ['/api/media-attachments', relatedType, relatedId],
  });

  const beforeMedia = media.filter(m => m.category === 'before');
  const afterMedia = media.filter(m => m.category === 'after');
  const otherMedia = media.filter(m => m.category !== 'before' && m.category !== 'after');

  const handleDelete = async (id: string) => {
    try {
      await apiRequest('DELETE', `/api/media-attachments/${id}`);

      queryClient.invalidateQueries({ 
        queryKey: ['/api/media-attachments', relatedType, relatedId] 
      });

      toast({
        title: "Media Deleted",
        description: "The media has been removed successfully",
      });
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the media",
        variant: "destructive",
      });
    }
  };

  const getMediaIcon = (mediaType: string) => {
    if (mediaType === 'photo') return <Image className="w-4 h-4" />;
    if (mediaType === 'video') return <Video className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, any> = {
      before: "secondary",
      after: "default",
      damage: "destructive",
      walkaround: "outline",
    };
    return <Badge variant={colors[category] || "secondary"}>{category}</Badge>;
  };

  const MediaCard = ({ item }: { item: MediaAttachment }) => (
    <Card className="overflow-hidden" data-testid={`media-card-${item.id}`}>
      <div className="relative group">
        {item.mediaType === 'photo' && (
          <img
            src={item.thumbnailUrl || item.fileUrl}
            alt={item.fileName}
            className="w-full h-48 object-cover"
          />
        )}
        {item.mediaType === 'video' && (
          <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <Video className="w-16 h-16 text-gray-400" />
          </div>
        )}
        {item.mediaType === 'document' && (
          <div className="w-full h-48 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <FileText className="w-16 h-16 text-gray-400" />
          </div>
        )}
        
        <div className="absolute top-2 right-2 flex gap-1">
          {getCategoryBadge(item.category)}
        </div>

        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => setSelectedMedia(item)}
            data-testid={`button-view-${item.id}`}
          >
            <Eye className="w-4 h-4" />
          </Button>
          {allowDelete && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(item.id)}
              data-testid={`button-delete-${item.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 text-sm">
          {getMediaIcon(item.mediaType)}
          <span className="truncate font-medium">{item.fileName}</span>
        </div>
        {item.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {item.description}
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading media...</div>;
  }

  if (media.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          No media attachments found
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Media Gallery</CardTitle>
              <CardDescription>{media.length} attachment{media.length !== 1 ? 's' : ''}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showBeforeAfter && (beforeMedia.length > 0 || afterMedia.length > 0) ? (
            <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)}>
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="all" data-testid="tab-all">All</TabsTrigger>
                <TabsTrigger value="before" data-testid="tab-before">
                  Before ({beforeMedia.length})
                </TabsTrigger>
                <TabsTrigger value="after" data-testid="tab-after">
                  After ({afterMedia.length})
                </TabsTrigger>
                <TabsTrigger value="comparison" data-testid="tab-comparison">
                  Compare
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {media.map(item => <MediaCard key={item.id} item={item} />)}
                </div>
              </TabsContent>

              <TabsContent value="before" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {beforeMedia.map(item => <MediaCard key={item.id} item={item} />)}
                </div>
              </TabsContent>

              <TabsContent value="after" className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {afterMedia.map(item => <MediaCard key={item.id} item={item} />)}
                </div>
              </TabsContent>

              <TabsContent value="comparison" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Before</h3>
                    <div className="space-y-4">
                      {beforeMedia.map(item => <MediaCard key={item.id} item={item} />)}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">After</h3>
                    <div className="space-y-4">
                      {afterMedia.map(item => <MediaCard key={item.id} item={item} />)}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map(item => <MediaCard key={item.id} item={item} />)}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedMedia} onOpenChange={() => setSelectedMedia(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedMedia?.fileName}</DialogTitle>
          </DialogHeader>
          {selectedMedia && (
            <div className="space-y-4">
              {selectedMedia.mediaType === 'photo' && (
                <img
                  src={selectedMedia.fileUrl}
                  alt={selectedMedia.fileName}
                  className="w-full max-h-[70vh] object-contain"
                />
              )}
              {selectedMedia.mediaType === 'video' && (
                <video controls className="w-full max-h-[70vh]">
                  <source src={selectedMedia.fileUrl} />
                </video>
              )}
              {selectedMedia.description && (
                <div>
                  <h4 className="font-semibold mb-1">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedMedia.description}
                  </p>
                </div>
              )}
              <div className="flex gap-2">
                {getCategoryBadge(selectedMedia.category)}
                <Badge variant="outline">{selectedMedia.mediaType}</Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
