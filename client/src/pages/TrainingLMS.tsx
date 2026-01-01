import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GraduationCap, BookMarked, Award, Users } from "lucide-react";
import { TabsPageLayout } from "@/components/layouts/TabsPageLayout";

const moduleSchema = z.object({
  moduleName: z.string().min(1, "Module name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  duration: z.number().min(0).optional(),
  difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
  content: z.string().optional(),
  videoUrl: z.string().optional(),
  isActive: z.boolean().default(true),
});

const certificationSchema = z.object({
  certificationName: z.string().min(1, "Certification name is required"),
  description: z.string().optional(),
  requiredModuleIds: z.array(z.string()).optional(),
  validityPeriod: z.number().min(0).optional(),
  passingScore: z.number().min(0).max(100).default(70),
  isActive: z.boolean().default(true),
});

const attemptSchema = z.object({
  certificationId: z.string().min(1, "Certification is required"),
  userId: z.string().min(1, "User is required"),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
  notes: z.string().optional(),
});

type ModuleFormData = z.infer<typeof moduleSchema>;
type CertificationFormData = z.infer<typeof certificationSchema>;
type AttemptFormData = z.infer<typeof attemptSchema>;

export default function TrainingLMS() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState("modules");
  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [isCertDialogOpen, setIsCertDialogOpen] = useState(false);
  const [isAttemptDialogOpen, setIsAttemptDialogOpen] = useState(false);

  const { data: modules = [], isLoading: modulesLoading } = useQuery<any[]>({
    queryKey: ["/api/training/modules"],
  });

  const { data: certifications = [], isLoading: certificationsLoading } = useQuery<any[]>({
    queryKey: ["/api/training/certifications"],
  });

  const { data: attempts = [], isLoading: attemptsLoading } = useQuery<any[]>({
    queryKey: ["/api/training/attempts"],
  });

  const moduleForm = useForm<ModuleFormData>({
    resolver: zodResolver(moduleSchema),
    defaultValues: {
      moduleName: "",
      description: "",
      category: "",
      duration: 0,
      difficulty: "beginner",
      content: "",
      videoUrl: "",
      isActive: true,
    }
  });

  const certForm = useForm<CertificationFormData>({
    resolver: zodResolver(certificationSchema),
    defaultValues: {
      certificationName: "",
      description: "",
      requiredModuleIds: [],
      validityPeriod: 365,
      passingScore: 70,
      isActive: true,
    }
  });

  const attemptForm = useForm<AttemptFormData>({
    resolver: zodResolver(attemptSchema),
    defaultValues: {
      certificationId: "",
      userId: "",
      score: 0,
      passed: false,
      notes: "",
    }
  });

  const createModuleMutation = useMutation({
    mutationFn: (data: ModuleFormData) => apiRequest("POST", "/api/training/modules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/modules"] });
      toast({ title: t('common.success', 'Success'), description: t('training.moduleCreated', 'Training module created') });
      setIsModuleDialogOpen(false);
      moduleForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('training.failedToCreateModule', 'Failed to create module'), variant: "destructive" });
    }
  });

  const createCertMutation = useMutation({
    mutationFn: (data: CertificationFormData) => apiRequest("POST", "/api/training/certifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/certifications"] });
      toast({ title: t('common.success', 'Success'), description: t('training.certificationCreated', 'Certification created') });
      setIsCertDialogOpen(false);
      certForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('training.failedToCreateCertification', 'Failed to create certification'), variant: "destructive" });
    }
  });

  const createAttemptMutation = useMutation({
    mutationFn: (data: AttemptFormData) => apiRequest("POST", "/api/training/attempts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/attempts"] });
      toast({ title: t('common.success', 'Success'), description: t('training.attemptRecorded', 'Attempt recorded') });
      setIsAttemptDialogOpen(false);
      attemptForm.reset();
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('training.failedToRecordAttempt', 'Failed to record attempt'), variant: "destructive" });
    }
  });

  const modulesContent = (
    <div className="space-y-4">
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('training.trainingModules', 'Training Modules')}</CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('training.allAvailableModules', 'All available training modules and courses')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modulesLoading ? (
                <p className="text-[#64748B]" data-testid="text-loading">{t('training.loadingModules', 'Loading modules...')}</p>
              ) : modules.length === 0 ? (
                <p className="text-[#64748B]" data-testid="text-no-modules">{t('training.noModulesFound', 'No training modules found')}</p>
              ) : (
                <div className="grid gap-4">
                  {modules.map((module: any) => (
                    <Card key={module.id} className="border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`card-module-${module.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-module-name-${module.id}`}>
                                {module.moduleName}
                              </h3>
                              <Badge className={module.difficulty === "beginner" ? "bg-emerald-500 text-white" : module.difficulty === "intermediate" ? "bg-amber-500 text-white" : "bg-[#F97316] text-white"} data-testid={`badge-difficulty-${module.id}`}>
                                {module.difficulty === "beginner" ? t('training.difficulty.beginner', 'Beginner') : module.difficulty === "intermediate" ? t('training.difficulty.intermediate', 'Intermediate') : t('training.difficulty.advanced', 'Advanced')}
                              </Badge>
                              {module.isActive && (
                                <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0" data-testid={`badge-active-${module.id}`}>
                                  {t('common.active', 'Active')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-[#64748B] mb-2" data-testid={`text-module-description-${module.id}`}>
                              {module.description || t('training.noDescription', 'No description')}
                            </p>
                            <div className="flex gap-4 text-sm text-[#64748B]">
                              {module.category && <span data-testid={`text-category-${module.id}`}>{t('common.category', 'Category')}: {module.category}</span>}
                              {module.duration && <span data-testid={`text-duration-${module.id}`}>{t('training.duration', 'Duration')}: {module.duration} {t('training.minutes', 'min')}</span>}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  );

  const certificationsContent = (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsCertDialogOpen(true)}
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
          data-testid="button-create-certification"
        >
          <Award className="mr-2 h-4 w-4" />
          {t('training.createCertification', 'Create Certification')}
        </Button>
      </div>
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('training.certifications', 'Certifications')}</CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('training.availableCertifications', 'Available certifications and their requirements')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificationsLoading ? (
                <p className="text-[#64748B]" data-testid="text-loading-certifications">{t('training.loadingCertifications', 'Loading certifications...')}</p>
              ) : certifications.length === 0 ? (
                <p className="text-[#64748B]" data-testid="text-no-certifications">{t('training.noCertificationsFound', 'No certifications found')}</p>
              ) : (
                <div className="grid gap-4">
                  {certifications.map((cert: any) => (
                    <Card key={cert.id} className="border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]" data-testid={`card-certification-${cert.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Award className="h-5 w-5 text-[#0A5ED7]" />
                          <h3 className="text-lg font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-cert-name-${cert.id}`}>
                            {cert.certificationName}
                          </h3>
                          {cert.isActive && (
                            <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0" data-testid={`badge-cert-active-${cert.id}`}>
                              {t('common.active', 'Active')}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-[#64748B] mb-2" data-testid={`text-cert-description-${cert.id}`}>
                          {cert.description || t('training.noDescription', 'No description')}
                        </p>
                        <div className="flex gap-4 text-sm text-[#64748B]">
                          <span data-testid={`text-passing-score-${cert.id}`}>{t('training.passingScore', 'Passing Score')}: {cert.passingScore}%</span>
                          {cert.validityPeriod && <span data-testid={`text-validity-${cert.id}`}>{t('training.validFor', 'Valid for')}: {cert.validityPeriod} {t('training.days', 'days')}</span>}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
    </div>
  );

  const attemptsContent = (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => setIsAttemptDialogOpen(true)}
          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
          data-testid="button-record-attempt"
        >
          <Users className="mr-2 h-4 w-4" />
          {t('training.recordAttempt', 'Record Attempt')}
        </Button>
      </div>
          <Card className="border-[#E2E8F0] dark:border-[#232A36] bg-white dark:bg-[#151A23]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white">{t('training.certificationAttempts', 'Certification Attempts')}</CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('training.employeeCertificationAttempts', 'Employee certification attempts and results')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attemptsLoading ? (
                <p className="text-[#64748B]" data-testid="text-loading-attempts">{t('training.loadingAttempts', 'Loading attempts...')}</p>
              ) : attempts.length === 0 ? (
                <p className="text-[#64748B]" data-testid="text-no-attempts">{t('training.noAttemptsFound', 'No attempts found')}</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                      <TableHead className="text-[#64748B]">{t('training.user', 'User')}</TableHead>
                      <TableHead className="text-[#64748B]">{t('training.certification', 'Certification')}</TableHead>
                      <TableHead className="text-[#64748B]">{t('training.score', 'Score')}</TableHead>
                      <TableHead className="text-[#64748B]">{t('training.result', 'Result')}</TableHead>
                      <TableHead className="text-[#64748B]">{t('common.date', 'Date')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((attempt: any) => (
                      <TableRow key={attempt.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-attempt-${attempt.id}`}>
                        <TableCell className="font-medium text-[#0B1F3B] dark:text-white" data-testid={`text-user-${attempt.id}`}>{attempt.userId}</TableCell>
                        <TableCell className="text-[#0B1F3B] dark:text-white" data-testid={`text-cert-${attempt.id}`}>{attempt.certificationId}</TableCell>
                        <TableCell className="text-[#0B1F3B] dark:text-white" data-testid={`text-score-${attempt.id}`}>{attempt.score}%</TableCell>
                        <TableCell>
                          <Badge className={attempt.passed ? "bg-emerald-500 text-white" : "bg-[#F97316] text-white"} data-testid={`badge-result-${attempt.id}`}>
                            {attempt.passed ? t('training.passed', 'Passed') : t('training.failed', 'Failed')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-[#64748B]" data-testid={`text-date-${attempt.id}`}>
                          {attempt.attemptDate ? new Date(attempt.attemptDate).toLocaleDateString() : t('common.na', 'N/A')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
    </div>
  );

  return (
    <>
      <TabsPageLayout
        title={t('training.title', 'Training & Certification LMS')}
        description={t('training.description', 'Manage training modules, certifications, and employee progress')}
        icon={GraduationCap}
        primaryAction={{
          label: t('training.createModule', 'Create Module'),
          icon: BookMarked,
          onClick: () => setIsModuleDialogOpen(true),
          testId: "button-create-module"
        }}
        tabs={[
          {
            id: "modules",
            label: t('training.modules', 'Modules'),
            icon: BookMarked,
            content: modulesContent
          },
          {
            id: "certifications",
            label: t('training.certifications', 'Certifications'),
            icon: Award,
            content: certificationsContent
          },
          {
            id: "attempts",
            label: t('training.attempts', 'Attempts'),
            icon: Users,
            content: attemptsContent
          }
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />
      
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('training.createTrainingModule', 'Create Training Module')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {t('training.addNewModule', 'Add a new training module')}
            </DialogDescription>
          </DialogHeader>
          <Form {...moduleForm}>
            <form onSubmit={moduleForm.handleSubmit((data) => createModuleMutation.mutate(data))} className="space-y-4">
              <FormField
                control={moduleForm.control}
                name="moduleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('training.moduleName', 'Module Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('training.moduleNamePlaceholder', 'Safety Procedures 101')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-module-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={moduleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('training.moduleDescriptionPlaceholder', 'Module description...')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-module-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={moduleForm.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('training.difficultyLabel', 'Difficulty')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-difficulty">
                            <SelectValue placeholder={t('training.selectDifficulty', 'Select difficulty')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                          <SelectItem value="beginner">{t('training.difficulty.beginner', 'Beginner')}</SelectItem>
                          <SelectItem value="intermediate">{t('training.difficulty.intermediate', 'Intermediate')}</SelectItem>
                          <SelectItem value="advanced">{t('training.difficulty.advanced', 'Advanced')}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={moduleForm.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('training.durationMinutes', 'Duration (minutes)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                          data-testid="input-duration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createModuleMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-submit-module">
                  {createModuleMutation.isPending ? t('training.creating', 'Creating...') : t('training.createModule', 'Create Module')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCertDialogOpen} onOpenChange={setIsCertDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('training.createCertification', 'Create Certification')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {t('training.addNewCertification', 'Add a new certification program')}
            </DialogDescription>
          </DialogHeader>
          <Form {...certForm}>
            <form onSubmit={certForm.handleSubmit((data) => createCertMutation.mutate(data))} className="space-y-4">
              <FormField
                control={certForm.control}
                name="certificationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('training.certificationName', 'Certification Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('training.certNamePlaceholder', 'Master Technician')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-cert-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={certForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('common.description', 'Description')}</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder={t('training.certDescriptionPlaceholder', 'Certification description...')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-cert-description" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={certForm.control}
                  name="passingScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('training.passingScore', 'Passing Score (%)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                          data-testid="input-passing-score"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={certForm.control}
                  name="validityPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#0B1F3B] dark:text-white">{t('training.validityDays', 'Validity (days)')}</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                          data-testid="input-validity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createCertMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-submit-cert">
                  {createCertMutation.isPending ? t('training.creating', 'Creating...') : t('training.createCertification', 'Create Certification')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAttemptDialogOpen} onOpenChange={setIsAttemptDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <DialogHeader>
            <DialogTitle className="text-[#0B1F3B] dark:text-white">{t('training.recordAttempt', 'Record Attempt')}</DialogTitle>
            <DialogDescription className="text-[#64748B]">
              {t('training.recordCertificationAttempt', 'Record a certification attempt')}
            </DialogDescription>
          </DialogHeader>
          <Form {...attemptForm}>
            <form onSubmit={attemptForm.handleSubmit((data) => createAttemptMutation.mutate(data))} className="space-y-4">
              <FormField
                control={attemptForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('training.userId', 'User ID')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('training.enterUserId', 'Enter user ID')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-user-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={attemptForm.control}
                name="certificationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('training.certificationId', 'Certification ID')}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t('training.enterCertId', 'Enter certification ID')} className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="input-cert-id" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={attemptForm.control}
                name="score"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[#0B1F3B] dark:text-white">{t('training.score', 'Score (%)')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
                        data-testid="input-score"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createAttemptMutation.isPending} className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" data-testid="button-submit-attempt">
                  {createAttemptMutation.isPending ? t('training.recording', 'Recording...') : t('training.recordAttempt', 'Record Attempt')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
