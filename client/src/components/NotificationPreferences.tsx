import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Bell, Save } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface NotificationPreference {
  userId: string;
  channel: string;
  eventMap: string;
  isLockedByAdmin: boolean;
}

interface CategoryPreferences {
  [category: string]: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
}

const NOTIFICATION_CATEGORIES = [
  { key: 'appointment', label: 'Appointments', description: 'Confirmations and reminders' },
  { key: 'invoice', label: 'Invoices', description: 'Billing and payment notifications' },
  { key: 'job_completed', label: 'Job Completion', description: 'Vehicle service completion updates' },
  { key: 'job_update', label: 'Job Updates', description: 'Status changes and progress' },
  { key: 'payment', label: 'Payments', description: 'Payment confirmations' },
  { key: 'estimate', label: 'Estimates', description: 'Quote and estimate notifications' },
  { key: 'feedback_request', label: 'Feedback Requests', description: 'Service feedback requests' },
];

export function NotificationPreferences() {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<CategoryPreferences>({});

  const { data: userPreferences, isLoading } = useQuery<NotificationPreference>({
    queryKey: ['/api/notification-preferences'],
  });

  // Initialize local state from server data
  useEffect(() => {
    if (userPreferences?.eventMap) {
      try {
        const parsed = JSON.parse(userPreferences.eventMap);
        setPreferences(parsed);
      } catch (e) {
        console.error('Failed to parse notification preferences:', e);
      }
    }
  }, [userPreferences]);

  const saveMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/notification-preferences', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notification-preferences'] });
      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save notification preferences.",
        variant: "destructive",
      });
    },
  });

  const handleToggle = (category: string, type: 'email' | 'sms' | 'inApp', value: boolean) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...(prev[category] || { email: false, sms: false, inApp: false }),
        [type]: value,
      },
    }));
  };

  const handleSave = () => {
    const eventMap = JSON.stringify(preferences);
    saveMutation.mutate({ eventMap });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-[#222029]">Notification Preferences</h2>
        <p className="text-[#999999] mt-1">Choose how you want to receive notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Configure which channels you want to use for different types of notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-4 gap-4 pb-3 border-b">
              <div className="col-span-1">
                <p className="text-sm font-medium">Category</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <p className="text-sm font-medium">Email</p>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4" />
                <p className="text-sm font-medium">SMS</p>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                <p className="text-sm font-medium">In-App</p>
              </div>
            </div>

            {NOTIFICATION_CATEGORIES.map((category) => {
              const categoryPrefs = preferences[category.key] || { email: false, sms: false, inApp: false };
              
              return (
                <div key={category.key} className="grid grid-cols-4 gap-4 items-center">
                  <div className="col-span-1">
                    <Label className="text-base">{category.label}</Label>
                    <p className="text-xs text-muted-foreground">{category.description}</p>
                  </div>
                  <div className="flex items-center">
                    <Switch
                      checked={categoryPrefs.email}
                      onCheckedChange={(checked) => handleToggle(category.key, 'email', checked)}
                      data-testid={`switch-email-${category.key}`}
                    />
                  </div>
                  <div className="flex items-center">
                    <Switch
                      checked={categoryPrefs.sms}
                      onCheckedChange={(checked) => handleToggle(category.key, 'sms', checked)}
                      data-testid={`switch-sms-${category.key}`}
                    />
                  </div>
                  <div className="flex items-center">
                    <Switch
                      checked={categoryPrefs.inApp}
                      onCheckedChange={(checked) => handleToggle(category.key, 'inApp', checked)}
                      data-testid={`switch-inapp-${category.key}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 pt-4 border-t flex justify-end">
            <Button 
              onClick={handleSave} 
              disabled={saveMutation.isPending}
              data-testid="button-save-preferences"
            >
              <Save className="w-4 h-4 mr-2" />
              {saveMutation.isPending ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
