import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
      toast({ title: "Success", description: "Training module created" });
      setIsModuleDialogOpen(false);
      moduleForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create module", variant: "destructive" });
    }
  });

  const createCertMutation = useMutation({
    mutationFn: (data: CertificationFormData) => apiRequest("POST", "/api/training/certifications", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/certifications"] });
      toast({ title: "Success", description: "Certification created" });
      setIsCertDialogOpen(false);
      certForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create certification", variant: "destructive" });
    }
  });

  const createAttemptMutation = useMutation({
    mutationFn: (data: AttemptFormData) => apiRequest("POST", "/api/training/attempts", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/training/attempts"] });
      toast({ title: "Success", description: "Attempt recorded" });
      setIsAttemptDialogOpen(false);
      attemptForm.reset();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to record attempt", variant: "destructive" });
    }
  });

  const modulesContent = (
    <div className="space-y-4">
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">Training Modules</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                All available training modules and courses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {modulesLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading">Loading modules...</p>
              ) : modules.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-modules">No training modules found</p>
              ) : (
                <div className="grid gap-4">
                  {modules.map((module: any) => (
                    <Card key={module.id} className="border-salis-gray-light dark:border-salis-gray-dark" data-testid={`card-module-${module.id}`}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-montserrat font-medium text-salis-black dark:text-white" data-testid={`text-module-name-${module.id}`}>
                                {module.moduleName}
                              </h3>
                              <Badge className={module.difficulty === "beginner" ? "bg-green-500 text-white" : module.difficulty === "intermediate" ? "bg-yellow-500 text-white" : "bg-red-500 text-white"} data-testid={`badge-difficulty-${module.id}`}>
                                {module.difficulty}
                              </Badge>
                              {module.isActive && (
                                <Badge className="bg-salis-black text-white" data-testid={`badge-active-${module.id}`}>
                                  Active
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-2" data-testid={`text-module-description-${module.id}`}>
                              {module.description || "No description"}
                            </p>
                            <div className="flex gap-4 text-sm text-salis-gray dark:text-salis-gray-light">
                              {module.category && <span data-testid={`text-category-${module.id}`}>Category: {module.category}</span>}
                              {module.duration && <span data-testid={`text-duration-${module.id}`}>Duration: {module.duration} min</span>}
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
          className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
          data-testid="button-create-certification"
        >
          <Award className="mr-2 h-4 w-4" />
          Create Certification
        </Button>
      </div>
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">Certifications</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                Available certifications and their requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              {certificationsLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading-certifications">Loading certifications...</p>
              ) : certifications.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-certifications">No certifications found</p>
              ) : (
                <div className="grid gap-4">
                  {certifications.map((cert: any) => (
                    <Card key={cert.id} className="border-salis-gray-light dark:border-salis-gray-dark" data-testid={`card-certification-${cert.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                          <Award className="h-5 w-5 text-salis-gray dark:text-salis-gray-light" />
                          <h3 className="text-lg font-montserrat font-medium text-salis-black dark:text-white" data-testid={`text-cert-name-${cert.id}`}>
                            {cert.certificationName}
                          </h3>
                          {cert.isActive && (
                            <Badge className="bg-salis-black text-white" data-testid={`badge-cert-active-${cert.id}`}>
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-salis-gray dark:text-salis-gray-light font-poppins mb-2" data-testid={`text-cert-description-${cert.id}`}>
                          {cert.description || "No description"}
                        </p>
                        <div className="flex gap-4 text-sm text-salis-gray dark:text-salis-gray-light">
                          <span data-testid={`text-passing-score-${cert.id}`}>Passing Score: {cert.passingScore}%</span>
                          {cert.validityPeriod && <span data-testid={`text-validity-${cert.id}`}>Valid for: {cert.validityPeriod} days</span>}
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
          className="bg-salis-black hover:bg-salis-gray-dark text-white font-poppins"
          data-testid="button-record-attempt"
        >
          <Users className="mr-2 h-4 w-4" />
          Record Attempt
        </Button>
      </div>
          <Card className="border-salis-gray-light dark:border-salis-gray-dark bg-white dark:bg-[#010101]">
            <CardHeader>
              <CardTitle className="font-montserrat text-salis-black dark:text-white">Certification Attempts</CardTitle>
              <CardDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
                Employee certification attempts and results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {attemptsLoading ? (
                <p className="text-salis-gray font-poppins" data-testid="text-loading-attempts">Loading attempts...</p>
              ) : attempts.length === 0 ? (
                <p className="text-salis-gray font-poppins" data-testid="text-no-attempts">No attempts found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Certification</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attempts.map((attempt: any) => (
                      <TableRow key={attempt.id} data-testid={`row-attempt-${attempt.id}`}>
                        <TableCell className="font-medium" data-testid={`text-user-${attempt.id}`}>{attempt.userId}</TableCell>
                        <TableCell data-testid={`text-cert-${attempt.id}`}>{attempt.certificationId}</TableCell>
                        <TableCell data-testid={`text-score-${attempt.id}`}>{attempt.score}%</TableCell>
                        <TableCell>
                          <Badge className={attempt.passed ? "bg-green-500 text-white" : "bg-red-500 text-white"} data-testid={`badge-result-${attempt.id}`}>
                            {attempt.passed ? "Passed" : "Failed"}
                          </Badge>
                        </TableCell>
                        <TableCell data-testid={`text-date-${attempt.id}`}>
                          {attempt.attemptDate ? new Date(attempt.attemptDate).toLocaleDateString() : "N/A"}
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
        title="Training & Certification LMS"
        description="Manage training modules, certifications, and employee progress"
        icon={GraduationCap}
        primaryAction={{
          label: "Create Module",
          icon: BookMarked,
          onClick: () => setIsModuleDialogOpen(true),
          testId: "button-create-module"
        }}
        tabs={[
          {
            id: "modules",
            label: "Modules",
            icon: BookMarked,
            content: modulesContent
          },
          {
            id: "certifications",
            label: "Certifications",
            icon: Award,
            content: certificationsContent
          },
          {
            id: "attempts",
            label: "Attempts",
            icon: Users,
            content: attemptsContent
          }
        ]}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />
      
      <Dialog open={isModuleDialogOpen} onOpenChange={setIsModuleDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Create Training Module</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Add a new training module
            </DialogDescription>
          </DialogHeader>
          <Form {...moduleForm}>
            <form onSubmit={moduleForm.handleSubmit((data) => createModuleMutation.mutate(data))} className="space-y-4">
              <FormField
                control={moduleForm.control}
                name="moduleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Module Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Safety Procedures 101" data-testid="input-module-name" />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Module description..." data-testid="input-module-description" />
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
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-difficulty">
                            <SelectValue placeholder="Select difficulty" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
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
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-duration"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createModuleMutation.isPending} data-testid="button-submit-module">
                  {createModuleMutation.isPending ? "Creating..." : "Create Module"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isCertDialogOpen} onOpenChange={setIsCertDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Create Certification</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Add a new certification program
            </DialogDescription>
          </DialogHeader>
          <Form {...certForm}>
            <form onSubmit={certForm.handleSubmit((data) => createCertMutation.mutate(data))} className="space-y-4">
              <FormField
                control={certForm.control}
                name="certificationName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certification Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Master Technician" data-testid="input-cert-name" />
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
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Certification description..." data-testid="input-cert-description" />
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
                      <FormLabel>Passing Score (%)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
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
                      <FormLabel>Validity (days)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          data-testid="input-validity"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createCertMutation.isPending} data-testid="button-submit-certification">
                  {createCertMutation.isPending ? "Creating..." : "Create Certification"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isAttemptDialogOpen} onOpenChange={setIsAttemptDialogOpen}>
        <DialogContent className="bg-white dark:bg-salis-black">
          <DialogHeader>
            <DialogTitle className="font-montserrat text-salis-black dark:text-white">Record Certification Attempt</DialogTitle>
            <DialogDescription className="font-poppins text-salis-gray dark:text-salis-gray-light">
              Record an employee's certification attempt
            </DialogDescription>
          </DialogHeader>
          <Form {...attemptForm}>
            <form onSubmit={attemptForm.handleSubmit((data) => createAttemptMutation.mutate(data))} className="space-y-4">
              <FormField
                control={attemptForm.control}
                name="certificationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certification</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-certification">
                          <SelectValue placeholder="Select certification" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {certifications.map((cert: any) => (
                          <SelectItem key={cert.id} value={cert.id}>
                            {cert.certificationName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={attemptForm.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="User identifier" data-testid="input-attempt-user-id" />
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
                    <FormLabel>Score (%)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        data-testid="input-attempt-score"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={createAttemptMutation.isPending} data-testid="button-submit-attempt">
                  {createAttemptMutation.isPending ? "Recording..." : "Record Attempt"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
