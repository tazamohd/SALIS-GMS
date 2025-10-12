import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

export function Profile() {
  const { toast } = useToast();
  const { data: user, isLoading } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSave = () => {
    toast({
      title: "Success",
      description: "Profile updated successfully",
    });
    setIsEditing(false);
  };

  const handleChangePassword = () => {
    toast({
      title: "Success",
      description: "Password changed successfully",
    });
    setIsChangingPassword(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-8 bg-white">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 bg-white">
      <div className="mb-8">
        <h1 className="font-['Poppins',Helvetica] font-semibold text-2xl text-[#222029]">My Profile</h1>
      </div>

      {/* Personal Details */}
      <Card className="border border-[#e6e6e6] mb-6">
        <CardContent className="p-6">
          <h2 className="font-['Poppins',Helvetica] font-semibold text-lg text-[#222029] mb-6">Personal Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
                Full Name
              </Label>
              <Input
                defaultValue={user?.fullName || "John Doe"}
                disabled={!isEditing}
                className="border-[#e6e6e6]"
                data-testid="input-full-name"
              />
            </div>

            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
                Email
              </Label>
              <Input
                defaultValue={user?.email || "example@email.com"}
                disabled={!isEditing}
                className="border-[#e6e6e6]"
                data-testid="input-email"
              />
            </div>
          </div>

          <div className="mb-4">
            <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
              Mobile Number
            </Label>
            <Input
              defaultValue="+971 51 234 5678"
              disabled={!isEditing}
              className="border-[#e6e6e6]"
              data-testid="input-mobile"
            />
          </div>

          <Button variant="ghost" className="text-blue-600 hover:text-blue-700" data-testid="button-add-phone">
            + Add an additional phone number
          </Button>
        </CardContent>
      </Card>

      {/* Role and Specialization */}
      <Card className="border border-[#e6e6e6] mb-6">
        <CardContent className="p-6">
          <h2 className="font-['Poppins',Helvetica] font-semibold text-lg text-[#222029] mb-6">Role and Specialization</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
                Job Title
              </Label>
              <Input
                defaultValue="Senior Mechanic"
                disabled={!isEditing}
                className="border-[#e6e6e6]"
                data-testid="input-job-title"
              />
            </div>

            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
                Specialization
              </Label>
              <Input
                defaultValue="Engine Repair, Electrical Systems, Diagnostics"
                disabled={!isEditing}
                className="border-[#e6e6e6]"
                data-testid="input-specialization"
              />
            </div>
          </div>

          <div>
            <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
              Certifications
            </Label>
            <Input
              defaultValue="ASE, EV Technician"
              disabled={!isEditing}
              className="border-[#e6e6e6]"
              data-testid="input-certifications"
            />
          </div>
        </CardContent>
      </Card>

      {/* Availability */}
      <Card className="border border-[#e6e6e6] mb-6">
        <CardContent className="p-6">
          <h2 className="font-['Poppins',Helvetica] font-semibold text-lg text-[#222029] mb-6">Availability</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
                From
              </Label>
              <Select disabled={!isEditing} defaultValue="sunday">
                <SelectTrigger data-testid="select-from-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
                To
              </Label>
              <Select disabled={!isEditing} defaultValue="tuesday">
                <SelectTrigger data-testid="select-to-day">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sunday">Sunday</SelectItem>
                  <SelectItem value="monday">Monday</SelectItem>
                  <SelectItem value="tuesday">Tuesday</SelectItem>
                  <SelectItem value="wednesday">Wednesday</SelectItem>
                  <SelectItem value="thursday">Thursday</SelectItem>
                  <SelectItem value="friday">Friday</SelectItem>
                  <SelectItem value="saturday">Saturday</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
                Work hours
              </Label>
              <Input
                defaultValue="ASE, EV Technician"
                disabled={!isEditing}
                className="border-[#e6e6e6]"
                data-testid="input-work-hours"
              />
            </div>

            <div>
              <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
                Current Status
              </Label>
              <Select disabled={!isEditing} defaultValue="available">
                <SelectTrigger data-testid="select-current-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="off">Off Duty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card className="border border-[#e6e6e6] mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-['Poppins',Helvetica] font-semibold text-lg text-[#222029]">Change Password</h2>
            <Button
              variant="outline"
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              data-testid="button-toggle-password"
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </Button>
          </div>

          {isChangingPassword && (
            <div className="space-y-4">
              <div>
                <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
                  Current Password
                </Label>
                <Input
                  type="password"
                  placeholder="Enter Current password"
                  className="border-[#e6e6e6]"
                  data-testid="input-current-password"
                />
              </div>

              <div>
                <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
                  New Password
                </Label>
                <Input
                  type="password"
                  placeholder="********"
                  className="border-[#e6e6e6]"
                  data-testid="input-new-password"
                />
              </div>

              <div>
                <Label className="font-['Poppins',Helvetica] font-medium text-sm text-[#222029] mb-2 block">
                  Confirm Password
                </Label>
                <Input
                  type="password"
                  placeholder="********"
                  className="border-[#e6e6e6]"
                  data-testid="input-confirm-password"
                />
              </div>

              <div className="flex gap-4 pt-4">
                <Button variant="outline" onClick={() => setIsChangingPassword(false)} data-testid="button-cancel-password">
                  Cancel
                </Button>
                <Button onClick={handleChangePassword} data-testid="button-save-password">
                  Save
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {!isChangingPassword && (
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => setIsEditing(!isEditing)}
            data-testid="button-edit-profile"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
          {isEditing && (
            <Button onClick={handleSave} data-testid="button-save-profile">
              Save
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
