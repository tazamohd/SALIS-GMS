import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Monitor, Play, Plus, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TabsPageLayout } from "@/components/layouts";

export default function DigitalSignage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [openDisplayDialog, setOpenDisplayDialog] = useState(false);

  const { data: displays = [], isLoading: loadingDisplays } = useQuery({
    queryKey: ["/api/signage/displays"],
  });

  const { data: content = [], isLoading: loadingContent } = useQuery({
    queryKey: ["/api/signage/content"],
  });

  const createDisplayMutation = useMutation({
    mutationFn: async (displayData: {
      name: string;
      location: string;
      displayType: string;
      resolution: string;
    }) => {
      return await apiRequest("/api/signage/displays", {
        method: "POST",
        body: JSON.stringify(displayData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/signage/displays"] });
      toast({
        title: t('common.success', 'Success'),
        description: t('signage.displayCreatedSuccessfully', 'Display created successfully'),
      });
      setOpenDisplayDialog(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: t('common.error', 'Error'),
        description: error.message || t('signage.failedToCreateDisplay', 'Failed to create display'),
      });
    },
  });

  const stats = {
    totalDisplays: displays.length || 0,
    activeDisplays: displays.filter((d: any) => d.isActive).length || 0,
    totalContent: content.length || 0,
    activeContent: content.filter((c: any) => c.isActive).length || 0,
  };

  const handleCreateDisplay = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    createDisplayMutation.mutate({
      name: formData.get("name") as string,
      location: formData.get("location") as string,
      displayType: formData.get("displayType") as string,
      resolution: formData.get("resolution") as string,
    });
  };

  const statsContent = (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('signage.totalDisplays', 'Total Displays')}</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-total-displays">{stats.totalDisplays}</h3>
            </div>
            <Monitor className="h-12 w-12 text-blue-600" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.active', 'Active')}</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-active-displays">{stats.activeDisplays}</h3>
            </div>
            <Play className="h-12 w-12 text-green-600" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('signage.totalContent', 'Total Content')}</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-total-content">{stats.totalContent}</h3>
            </div>
            <Monitor className="h-12 w-12 text-purple-600" />
          </div>
        </CardContent>
      </Card>
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('signage.activeContent', 'Active Content')}</p>
              <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white" data-testid="stat-active-content">{stats.activeContent}</h3>
            </div>
            <Play className="h-12 w-12 text-yellow-600" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const displaysTab = (
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle>{t('signage.displays', 'Displays')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingDisplays ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">{t('signage.loadingDisplays', 'Loading displays...')}</p>
          </div>
        ) : displays.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">{t('signage.noDisplaysConfigured', 'No displays configured yet. Add a display to get started.')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displays.map((display: any) => (
              <div key={display.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`display-${display.id}`}>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{display.displayName}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {display.location}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge>{display.displayType?.replace("_", " ")}</Badge>
                  <Badge variant={display.isActive ? "default" : "secondary"}>
                    {display.isActive ? t('common.active', 'Active') : t('common.inactive', 'Inactive')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const contentTab = (
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
      <CardHeader>
        <CardTitle>{t('signage.content', 'Content')}</CardTitle>
      </CardHeader>
      <CardContent>
        {loadingContent ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">{t('signage.loadingContent', 'Loading content...')}</p>
          </div>
        ) : content.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 dark:text-gray-400">{t('signage.noContentCreated', 'No content created yet. Add content to your displays.')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {content.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`content-${item.id}`}>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{item.title || t('signage.untitledContent', 'Untitled Content')}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {item.displayName} • {item.duration}{t('signage.secondsDuration', 's duration')}
                  </p>
                </div>
                <Badge>{item.contentType?.replace("_", " ")}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <TabsPageLayout
      title={t('signage.digitalSignage', 'Digital Signage')}
      description={t('signage.manageWaitingRoomDisplays', 'Manage waiting room displays and content')}
      icon={Monitor}
      primaryAction={{
        label: t('signage.addDisplay', 'Add Display'),
        icon: Plus,
        onClick: () => setOpenDisplayDialog(true),
        testId: "button-add-display",
      }}
      headerContent={statsContent}
      tabs={[
        {
          id: "displays",
          label: t('signage.displays', 'Displays'),
          icon: Monitor,
          content: displaysTab,
        },
        {
          id: "content",
          label: t('signage.content', 'Content'),
          icon: Play,
          content: contentTab,
        },
        {
          id: "settings",
          label: t('common.settings', 'Settings'),
          icon: Settings,
          content: (
            <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
              <CardContent className="p-6 text-center text-gray-600 dark:text-gray-400">
                {t('common.comingSoon', 'Settings coming soon')}
              </CardContent>
            </Card>
          ),
        },
      ]}
      defaultTab="displays"
    >
      <Dialog open={openDisplayDialog} onOpenChange={setOpenDisplayDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('signage.addNewDisplay', 'Add New Display')}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateDisplay} className="space-y-4">
            <div>
              <Label htmlFor="name">{t('signage.displayName', 'Display Name')}</Label>
              <Input id="name" name="name" required placeholder={t('signage.waitingRoomMain', 'Waiting Room Main')} />
            </div>
            <div>
              <Label htmlFor="location">{t('signage.location', 'Location')}</Label>
              <Input id="location" name="location" required placeholder={t('signage.waitingRoom', 'Waiting Room')} />
            </div>
            <div>
              <Label htmlFor="displayType">{t('signage.displayType', 'Display Type')}</Label>
              <Select name="displayType" required>
                <SelectTrigger>
                  <SelectValue placeholder={t('signage.selectType', 'Select type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixed">{t('signage.mixedContent', 'Mixed Content')}</SelectItem>
                  <SelectItem value="service_status">{t('signage.serviceStatus', 'Service Status')}</SelectItem>
                  <SelectItem value="promotions">{t('signage.promotions', 'Promotions')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="resolution">{t('signage.resolution', 'Resolution')}</Label>
              <Input id="resolution" name="resolution" required placeholder="1920x1080" />
            </div>
            <Button type="submit" disabled={createDisplayMutation.isPending} className="w-full">
              {t('signage.createDisplay', 'Create Display')}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </TabsPageLayout>
  );
}
