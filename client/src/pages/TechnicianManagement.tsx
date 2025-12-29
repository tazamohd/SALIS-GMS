import { useState } from "react";
import { useQuery, useQueries, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { User, TechnicianProfile, Garage } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Users, Edit, Award, Clock, DollarSign, Briefcase, GraduationCap, UserPlus, Trash2 } from "lucide-react";
import AddTechnicianDialog from "@/components/AddTechnicianDialog";
import { StandardPageLayout } from "@/components/layouts";

export default function TechnicianManagement() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedGarage, setSelectedGarage] = useState<string>("all");
  const [editingTechnician, setEditingTechnician] = useState<User | null>(null);
  const [editingProfile, setEditingProfile] = useState<TechnicianProfile | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [technicianToDelete, setTechnicianToDelete] = useState<User | null>(null);

  const { data: garages, isLoading: garagesLoading } = useQuery<Garage[]>({
    queryKey: ["/api/garages"],
  });

  const { data: technicians, isLoading: techniciansLoading } = useQuery<User[]>({
    queryKey: ["/api/technicians", selectedGarage],
    queryFn: () =>
      fetch(
        `/api/technicians${selectedGarage !== "all" ? `?garage_id=${selectedGarage}` : ""}`
      ).then((r) => r.json()),
  });

  // Fetch all technician profiles using useQueries
  const profileQueries = useQueries({
    queries: (technicians || []).map(technician => ({
      queryKey: ["/api/technician-profiles", technician.id],
      queryFn: () => fetch(`/api/technician-profiles/${technician.id}`).then((r) => r.json()),
      enabled: !!technician.id,
    })),
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: Partial<TechnicianProfile> }) => {
      return apiRequest("PATCH", `/api/technician-profiles/${userId}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/technicians' || 
          query.queryKey[0] === '/api/technician-profiles' ||
          (typeof query.queryKey[0] === 'string' && (
            query.queryKey[0].startsWith('/api/technicians') ||
            query.queryKey[0].startsWith('/api/technician-profiles')
          ))
      });
      setIsEditDialogOpen(false);
      toast({
        title: t('common.success', 'Success'),
        description: t('technician.profileUpdatedSuccess', 'Technician profile updated successfully'),
      });
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('technician.profileUpdateError', 'Failed to update technician profile'),
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/technicians/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey[0] === '/api/technicians' || 
          query.queryKey[0] === '/api/technician-profiles' ||
          (typeof query.queryKey[0] === 'string' && (
            query.queryKey[0].startsWith('/api/technicians') ||
            query.queryKey[0].startsWith('/api/technician-profiles')
          ))
      });
      toast({
        title: t('common.success', 'Success'),
        description: t('technician.deletedSuccess', 'Technician deleted successfully'),
      });
      setDeleteConfirmOpen(false);
      setTechnicianToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: t('common.error', 'Error'),
        description: error.message || t('technician.deleteError', 'Failed to delete technician'),
        variant: "destructive",
      });
    },
  });

  const handleDelete = (technician: User) => {
    setTechnicianToDelete(technician);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (technicianToDelete) {
      deleteMutation.mutate(technicianToDelete.id);
    }
  };

  const loadTechnicianProfile = async (technicianId: string) => {
    try {
      const response = await fetch(`/api/technician-profiles/${technicianId}`);
      if (response.ok) {
        const profile = await response.json();
        setEditingProfile(profile);
      } else {
        // Create default profile if none exists
        setEditingProfile({
          userId: technicianId,
          skills: "",
          certifications: "",
          qualifications: "",
          speciality: "",
          level: "junior",
          yearsOfExperience: 0,
          hourlyRate: "0",
          isLead: false,
          schedule: null,
          maxConcurrentJobs: 3,
        } as TechnicianProfile);
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleEdit = (technician: User) => {
    setEditingTechnician(technician);
    loadTechnicianProfile(technician.id);
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTechnician || !editingProfile) return;

    updateProfileMutation.mutate({
      userId: editingTechnician.id,
      data: editingProfile,
    });
  };

  const getLevelBadgeVariant = (level?: string) => {
    switch (level) {
      case "master":
        return "default";
      case "senior":
        return "secondary";
      case "intermediate":
        return "outline";
      default:
        return "outline";
    }
  };

  return (
    <StandardPageLayout
      title={t('technician.management', 'Technician Management')}
      description={t('technician.managementDescription', 'Manage technician profiles, skills, and assignments')}
      icon={Users}
      actions={[
        {
          label: t('technician.addTechnician', 'Add Technician'),
          onClick: () => setIsAddDialogOpen(true),
          icon: UserPlus,
        },
      ]}
    >

      {/* Filters */}
      <Card data-testid="card-filters">
        <CardHeader>
          <CardTitle className="text-lg">{t('common.filter', 'Filters')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="w-64">
              <Label htmlFor="garage-filter">{t('technician.garage', 'Garage')}</Label>
              <Select value={selectedGarage} onValueChange={setSelectedGarage}>
                <SelectTrigger id="garage-filter" data-testid="select-garage-filter">
                  <SelectValue placeholder={t('technician.selectGarage', 'Select garage')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="option-all-garages">{t('technician.allGarages', 'All Garages')}</SelectItem>
                  {garages?.map((garage) => (
                    <SelectItem key={garage.id} value={garage.id} data-testid={`option-garage-${garage.id}`}>
                      {garage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technicians List */}
      {techniciansLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : technicians && technicians.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {technicians.map((technician: User & { technicianProfile?: TechnicianProfile }, index) => {
            // Get the profile from the pre-fetched queries
            const profile = profileQueries[index]?.data;

            return (
              <Card key={technician.id} data-testid={`card-technician-${technician.id}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-name-${technician.id}`}>
                        {technician.fullName || t('common.unknown', 'Unknown')}
                      </CardTitle>
                      <CardDescription data-testid={`text-email-${technician.id}`}>
                        {technician.email}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(technician)}
                        data-testid={`button-edit-${technician.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(technician)}
                        data-testid={`button-delete-${technician.id}`}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {profile?.level && (
                      <Badge variant={getLevelBadgeVariant(profile.level)} data-testid={`badge-level-${technician.id}`}>
                        {profile.level}
                      </Badge>
                    )}
                    {profile?.isLead && (
                      <Badge variant="default" data-testid={`badge-lead-${technician.id}`}>{t('technician.lead', 'Lead')}</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profile?.speciality && (
                    <div className="flex items-start gap-2" data-testid={`text-speciality-${technician.id}`}>
                      <Briefcase className="h-4 w-4 mt-0.5 text-gray-600 dark:text-gray-400" />
                      <div className="text-sm">
                        <div className="font-medium">{t('technician.speciality', 'Speciality')}</div>
                        <div className="text-gray-600 dark:text-gray-400">{profile.speciality}</div>
                      </div>
                    </div>
                  )}

                  {profile?.yearsOfExperience !== undefined && (
                    <div className="flex items-start gap-2" data-testid={`text-experience-${technician.id}`}>
                      <Clock className="h-4 w-4 mt-0.5 text-gray-600 dark:text-gray-400" />
                      <div className="text-sm">
                        <div className="font-medium">{t('technician.experience', 'Experience')}</div>
                        <div className="text-gray-600 dark:text-gray-400">{t('technician.yearsExperience', '{{count}} years', { count: profile.yearsOfExperience })}</div>
                      </div>
                    </div>
                  )}

                  {profile?.hourlyRate && (
                    <div className="flex items-start gap-2" data-testid={`text-rate-${technician.id}`}>
                      <DollarSign className="h-4 w-4 mt-0.5 text-gray-600 dark:text-gray-400" />
                      <div className="text-sm">
                        <div className="font-medium">{t('technician.hourlyRate', 'Hourly Rate')}</div>
                        <div className="text-gray-600 dark:text-gray-400">${profile.hourlyRate}/{t('technician.hr', 'hr')}</div>
                      </div>
                    </div>
                  )}

                  {profile?.qualifications && (
                    <div className="flex items-start gap-2" data-testid={`text-qualifications-${technician.id}`}>
                      <GraduationCap className="h-4 w-4 mt-0.5 text-gray-600 dark:text-gray-400" />
                      <div className="text-sm">
                        <div className="font-medium">{t('technician.qualifications', 'Qualifications')}</div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">{profile.qualifications}</div>
                      </div>
                    </div>
                  )}

                  {profile?.certifications && (
                    <div className="flex items-start gap-2" data-testid={`text-certifications-${technician.id}`}>
                      <Award className="h-4 w-4 mt-0.5 text-gray-600 dark:text-gray-400" />
                      <div className="text-sm">
                        <div className="font-medium">{t('technician.certifications', 'Certifications')}</div>
                        <div className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2">{profile.certifications}</div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card data-testid="card-empty">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="h-12 w-12 text-gray-600 dark:text-gray-400 mb-4" />
            <p className="text-lg font-medium" data-testid="text-empty">{t('technician.noTechniciansFound', 'No technicians found')}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-empty-subtitle">
              {t('technician.tryAdjustingFilters', 'Try adjusting your filters')}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-edit">
          <DialogHeader>
            <DialogTitle data-testid="text-dialog-title">{t('technician.editProfile', 'Edit Technician Profile')}</DialogTitle>
            <DialogDescription data-testid="text-dialog-subtitle">
              {t('technician.editProfileDescription', 'Update technician information, skills, and qualifications')}
            </DialogDescription>
          </DialogHeader>
          {editingProfile && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="level">{t('technician.level', 'Level')}</Label>
                  <Select
                    value={editingProfile.level || "junior"}
                    onValueChange={(value) =>
                      setEditingProfile({ ...editingProfile, level: value })
                    }
                  >
                    <SelectTrigger id="level" data-testid="select-level">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="junior" data-testid="option-level-junior">{t('technician.levelJunior', 'Junior')}</SelectItem>
                      <SelectItem value="intermediate" data-testid="option-level-intermediate">{t('technician.levelIntermediate', 'Intermediate')}</SelectItem>
                      <SelectItem value="senior" data-testid="option-level-senior">{t('technician.levelSenior', 'Senior')}</SelectItem>
                      <SelectItem value="master" data-testid="option-level-master">{t('technician.levelMaster', 'Master')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">{t('technician.yearsOfExperience', 'Years of Experience')}</Label>
                  <Input
                    id="yearsOfExperience"
                    type="number"
                    min="0"
                    value={editingProfile.yearsOfExperience || 0}
                    onChange={(e) =>
                      setEditingProfile({
                        ...editingProfile,
                        yearsOfExperience: parseInt(e.target.value) || 0,
                      })
                    }
                    data-testid="input-years"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="speciality">{t('technician.speciality', 'Speciality')}</Label>
                <Input
                  id="speciality"
                  value={editingProfile.speciality || ""}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, speciality: e.target.value })
                  }
                  placeholder={t('technician.specialityPlaceholder', 'e.g., Engine Repair & Diagnostics')}
                  data-testid="input-speciality"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourlyRate">{t('technician.hourlyRateDollar', 'Hourly Rate ($)')}</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editingProfile.hourlyRate || "0"}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, hourlyRate: e.target.value })
                  }
                  data-testid="input-rate"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxConcurrentJobs">{t('technician.maxConcurrentJobs', 'Max Concurrent Jobs')}</Label>
                <Input
                  id="maxConcurrentJobs"
                  type="number"
                  min="1"
                  value={editingProfile.maxConcurrentJobs || 3}
                  onChange={(e) =>
                    setEditingProfile({
                      ...editingProfile,
                      maxConcurrentJobs: parseInt(e.target.value) || 3,
                    })
                  }
                  data-testid="input-max-jobs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualifications">{t('technician.qualifications', 'Qualifications')}</Label>
                <Textarea
                  id="qualifications"
                  value={editingProfile.qualifications || ""}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, qualifications: e.target.value })
                  }
                  placeholder={t('technician.qualificationsPlaceholder', 'e.g., ASE Master Certification, Automotive Technology Diploma')}
                  rows={3}
                  data-testid="input-qualifications"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="certifications">{t('technician.certifications', 'Certifications')}</Label>
                <Textarea
                  id="certifications"
                  value={editingProfile.certifications || ""}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, certifications: e.target.value })
                  }
                  placeholder={t('technician.certificationsPlaceholder', 'e.g., ASE Master, HVAC Specialist')}
                  rows={3}
                  data-testid="input-certifications"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">{t('technician.skills', 'Skills')}</Label>
                <Textarea
                  id="skills"
                  value={editingProfile.skills || ""}
                  onChange={(e) =>
                    setEditingProfile({ ...editingProfile, skills: e.target.value })
                  }
                  placeholder={t('technician.skillsPlaceholder', 'e.g., Engine Repair, Diagnostics, Brake Systems')}
                  rows={3}
                  data-testid="input-skills"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button type="submit" disabled={updateProfileMutation.isPending} data-testid="button-save">
                  {updateProfileMutation.isPending ? t('common.saving', 'Saving...') : t('common.saveChanges', 'Save Changes')}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Technician Dialog */}
      <AddTechnicianDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        garages={garages || []}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent data-testid="dialog-delete-confirm">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-confirm-title">{t('technician.deleteTechnician', 'Delete Technician')}</AlertDialogTitle>
            <AlertDialogDescription data-testid="text-confirm-description">
              {t('technician.deleteConfirmation', 'Are you sure you want to delete {{name}}? This action cannot be undone.', { name: technicianToDelete?.fullName })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">{t('common.cancel', 'Cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? t('common.deleting', 'Deleting...') : t('common.delete', 'Delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </StandardPageLayout>
  );
}
