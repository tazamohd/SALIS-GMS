import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { StandardPageLayout } from "@/components/layouts";
import { User as UserIcon, Save, X } from "lucide-react";
import type { User } from "@shared/schema";

export function Profile() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSave = () => {
    toast({
      title: t('common.success', 'Success'),
      description: t('profile.profileUpdatedSuccessfully', 'Profile updated successfully'),
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    toast({
      title: t('common.success', 'Success'),
      description: t('profile.passwordChangedSuccessfully', 'Password changed successfully'),
    });
    setIsChangingPassword(false);
  };

  if (isLoading) {
    return (
      <StandardPageLayout
        title={t('profile.myProfile', 'My Profile')}
        description={t('profile.manageProfileInfo', 'Manage your profile information and settings')}
        icon={UserIcon}
      >
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </StandardPageLayout>
    );
  }

  return (
    <StandardPageLayout
      title={t('profile.myProfile', 'My Profile')}
      description={t('profile.manageProfileInfo', 'Manage your profile information and settings')}
      icon={UserIcon}
      actions={!isChangingPassword ? [
        {
          label: isEditing ? t('common.cancel', 'Cancel') : t('profile.editProfile', 'Edit Profile'),
          onClick: () => setIsEditing(!isEditing),
          variant: 'outline' as const,
          icon: isEditing ? X : undefined,
        },
        ...(isEditing ? [{
          label: t('common.save', 'Save'),
          onClick: handleSave,
          icon: Save,
        }] : [])
      ] : []}
    >

      {/* Personal Details */}
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark border border-gray-200 dark:border-salis-gray-dark mb-6">
        <CardContent className="p-6">
          <h2 className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-900 dark:text-white mb-6">{t('profile.personalDetails', 'Personal Details')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                {t('profile.fullName', 'Full Name')}
              </Label>
              <Input
                defaultValue={user?.fullName || "John Doe"}
                disabled={!isEditing}
                className="border-gray-200 dark:border-salis-gray-dark"
                data-testid="input-full-name"
              />
            </div>

            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                {t('profile.email', 'Email')}
              </Label>
              <Input
                defaultValue={user?.email || "example@email.com"}
                disabled={!isEditing}
                className="border-gray-200 dark:border-salis-gray-dark"
                data-testid="input-email"
              />
            </div>
          </div>

          <div className="mb-4">
            <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
              {t('profile.mobileNumber', 'Mobile Number')}
            </Label>
            <Input
              defaultValue="+971 51 234 5678"
              disabled={!isEditing}
              className="border-gray-200 dark:border-salis-gray-dark"
              data-testid="input-mobile"
            />
          </div>

          <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100" data-testid="button-add-phone">
            + {t('profile.addAdditionalPhone', 'Add an additional phone number')}
          </Button>
        </CardContent>
      </Card>

      {/* Role and Specialization */}
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark border border-gray-200 dark:border-salis-gray-dark mb-6">
        <CardContent className="p-6">
          <h2 className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-900 dark:text-white mb-6">{t('profile.roleAndSpecialization', 'Role and Specialization')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                {t('profile.jobTitle', 'Job Title')}
              </Label>
              <Input
                defaultValue="Senior Mechanic"
                disabled={!isEditing}
                className="border-gray-200 dark:border-salis-gray-dark"
                data-testid="input-job-title"
              />
            </div>

            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                {t('profile.specialization', 'Specialization')}
              </Label>
              <Input
                defaultValue="Engine Repair, Electrical Systems, Diagnostics"
                disabled={!isEditing}
                className="border-gray-200 dark:border-salis-gray-dark"
                data-testid="input-specialization"
              />
            </div>
          </div>

          <div>
            <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
              {t('profile.certifications', 'Certifications')}
            </Label>
            <Input
              defaultValue="ASE, EV Technician"
              disabled={!isEditing}
              className="border-gray-200 dark:border-salis-gray-dark"
              data-testid="input-certifications"
            />
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark border border-gray-200 dark:border-salis-gray-dark mb-6">
        <CardContent className="p-6">
          <h2 className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-900 dark:text-white mb-6">{t('profile.availability', 'Availability')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                {t('common.from', 'From')}
              </Label>
              <Select disabled={!isEditing} defaultValue="sunday">
                <SelectTrigger data-testid="select-from-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">{t('profile.sunday', 'Sunday')}</SelectItem>
                  <SelectItem value="monday">{t('profile.monday', 'Monday')}</SelectItem>
                  <SelectItem value="tuesday">{t('profile.tuesday', 'Tuesday')}</SelectItem>
                  <SelectItem value="wednesday">{t('profile.wednesday', 'Wednesday')}</SelectItem>
                  <SelectItem value="thursday">{t('profile.thursday', 'Thursday')}</SelectItem>
                  <SelectItem value="friday">{t('profile.friday', 'Friday')}</SelectItem>
                  <SelectItem value="saturday">{t('profile.saturday', 'Saturday')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                {t('common.to', 'To')}
              </Label>
              <Select disabled={!isEditing} defaultValue="tuesday">
                <SelectTrigger data-testid="select-to-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">{t('profile.sunday', 'Sunday')}</SelectItem>
                  <SelectItem value="monday">{t('profile.monday', 'Monday')}</SelectItem>
                  <SelectItem value="tuesday">{t('profile.tuesday', 'Tuesday')}</SelectItem>
                  <SelectItem value="wednesday">{t('profile.wednesday', 'Wednesday')}</SelectItem>
                  <SelectItem value="thursday">{t('profile.thursday', 'Thursday')}</SelectItem>
                  <SelectItem value="friday">{t('profile.friday', 'Friday')}</SelectItem>
                  <SelectItem value="saturday">{t('profile.saturday', 'Saturday')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                {t('profile.workHours', 'Work hours')}
              </Label>
              <Input
                defaultValue="ASE, EV Technician"
                disabled={!isEditing}
                className="border-gray-200 dark:border-salis-gray-dark"
                data-testid="input-work-hours"
              />
            </div>

            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                {t('profile.currentStatus', 'Current Status')}
              </Label>
              <Select disabled={!isEditing} defaultValue="available">
                <SelectTrigger data-testid="select-current-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">{t('profile.available', 'Available')}</SelectItem>
                  <SelectItem value="busy">{t('profile.busy', 'Busy')}</SelectItem>
                  <SelectItem value="off">{t('profile.offDuty', 'Off Duty')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark border border-gray-200 dark:border-salis-gray-dark mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Poppins',Helvetica] font-semibold text-lg text-gray-900 dark:text-white">{t('profile.changePassword', 'Change Password')}</h2>
            <Button
              variant="outline"
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              data-testid="button-toggle-password"
            >
              {isChangingPassword ? t('common.cancel', 'Cancel') : t('profile.changePassword', 'Change Password')}
            </Button>
          </div>

          {isChangingPassword && (
            <div className="space-y-4">
              <div>
                <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                  {t('profile.currentPassword', 'Current Password')}
                </Label>
                <Input
                  type="password"
                  placeholder={t('profile.enterCurrentPassword', 'Enter Current password')}
                  className="border-gray-200 dark:border-salis-gray-dark"
                  data-testid="input-current-password"
                />
              </div>

              <div>
                <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                  {t('profile.newPassword', 'New Password')}
                </Label>
                <Input
                  type="password"
                  placeholder="********"
                  className="border-gray-200 dark:border-salis-gray-dark"
                  data-testid="input-new-password"
                />
              </div>

              <div>
                <Label className="font-['Poppins',Helvetica] font-medium text-sm text-gray-900 dark:text-white mb-2 block">
                  {t('profile.confirmPassword', 'Confirm Password')}
                </Label>
                <Input
                  type="password"
                  placeholder="********"
                  className="border-gray-200 dark:border-salis-gray-dark"
                  data-testid="input-confirm-password"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setIsChangingPassword(false)} data-testid="button-cancel-password">
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button onClick={handleChangePassword} data-testid="button-save-password">
                  {t('common.save', 'Save')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </StandardPageLayout>
  );
}
