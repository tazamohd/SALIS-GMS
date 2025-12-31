import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Wrench,
  Clock,
  Play,
  Pause,
  CheckCircle,
  AlertCircle,
  Car,
  User,
  Calendar,
  Award,
  GraduationCap,
  Timer,
  FileText,
  Zap,
  RotateCw,
  ArrowRight,
} from "lucide-react";
import { format, differenceInSeconds } from "date-fns";
import type { JobCard, User as UserType, TechnicianProfile } from "@shared/schema";

interface JobTimer {
  jobId: string;
  startTime: Date;
  pausedTime: number;
  isRunning: boolean;
}

interface SkillAchievement {
  id: string;
  name: string;
  category: string;
  level: "bronze" | "silver" | "gold" | "platinum";
  earnedDate: string;
  jobsCompleted: number;
}

export default function TechnicianMobilePortal() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const currentUser = user as UserType | undefined;
  
  const [activeTab, setActiveTab] = useState("jobs");
  const [jobTimers, setJobTimers] = useState<Map<string, JobTimer>>(new Map());
  const [selectedJob, setSelectedJob] = useState<JobCard | null>(null);
  const [isVehicleHistoryOpen, setIsVehicleHistoryOpen] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [, forceUpdate] = useState({});

  const { data: technicianProfile } = useQuery<TechnicianProfile>({
    queryKey: ['/api/technician-profiles', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const { data: jobCards, isLoading } = useQuery<JobCard[]>({
    queryKey: ['/api/job-cards', 'technician', currentUser?.id],
    enabled: !!currentUser?.id,
  });

  const vehicleInfo = selectedJob?.vehicleInfo as { vin?: string; licensePlate?: string } | undefined;
  const { data: vehicleHistory } = useQuery<any[]>({
    queryKey: ['/api/vehicles/history', vehicleInfo?.vin || vehicleInfo?.licensePlate],
    enabled: !!(vehicleInfo?.vin || vehicleInfo?.licensePlate),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return await apiRequest("PATCH", `/api/job-cards/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/job-cards'] });
      toast({
        title: t('common.success', 'Success'),
        description: t('technician.statusUpdated', 'Job status updated'),
      });
    },
  });

  useEffect(() => {
    timerIntervalRef.current = setInterval(() => {
      forceUpdate({});
    }, 1000);
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const startJobTimer = (jobId: string) => {
    const existingTimer = jobTimers.get(jobId);
    if (existingTimer?.isRunning) return;

    const newTimer: JobTimer = {
      jobId,
      startTime: new Date(),
      pausedTime: existingTimer?.pausedTime || 0,
      isRunning: true,
    };
    setJobTimers(prev => {
      const newMap = new Map(prev);
      newMap.set(jobId, newTimer);
      return newMap;
    });
    
    if (!existingTimer) {
      updateStatusMutation.mutate({ id: jobId, status: 'in_progress' });
    }
  };

  const pauseJobTimer = (jobId: string) => {
    const timer = jobTimers.get(jobId);
    if (!timer || !timer.isRunning) return;

    const elapsed = differenceInSeconds(new Date(), timer.startTime);
    const updatedTimer: JobTimer = {
      ...timer,
      pausedTime: timer.pausedTime + elapsed,
      isRunning: false,
    };
    setJobTimers(prev => {
      const newMap = new Map(prev);
      newMap.set(jobId, updatedTimer);
      return newMap;
    });
  };

  const stopJobTimer = (jobId: string) => {
    const timer = jobTimers.get(jobId);
    if (!timer) return;

    const totalSeconds = timer.isRunning
      ? timer.pausedTime + differenceInSeconds(new Date(), timer.startTime)
      : timer.pausedTime;

    toast({
      title: t('technician.jobCompleted', 'Job Completed'),
      description: t('technician.totalWorkTime', 'Total work time: {{time}}', {
        time: formatDuration(totalSeconds),
      }),
    });

    setJobTimers(prev => {
      const newMap = new Map(prev);
      newMap.delete(jobId);
      return newMap;
    });

    updateStatusMutation.mutate({ id: jobId, status: 'completed' });
  };

  const getElapsedTime = (jobId: string): number => {
    const timer = jobTimers.get(jobId);
    if (!timer) return 0;
    
    if (timer.isRunning) {
      return timer.pausedTime + differenceInSeconds(new Date(), timer.startTime);
    }
    return timer.pausedTime;
  };

  const formatDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const sampleAchievements: SkillAchievement[] = [
    { id: "1", name: "Engine Master", category: "Engine", level: "gold", earnedDate: "2024-06-15", jobsCompleted: 150 },
    { id: "2", name: "Brake Specialist", category: "Brakes", level: "platinum", earnedDate: "2024-03-20", jobsCompleted: 200 },
    { id: "3", name: "Electrical Expert", category: "Electrical", level: "silver", earnedDate: "2024-08-10", jobsCompleted: 75 },
    { id: "4", name: "Transmission Pro", category: "Transmission", level: "bronze", earnedDate: "2024-10-01", jobsCompleted: 30 },
    { id: "5", name: "Diagnostic Ace", category: "Diagnostics", level: "gold", earnedDate: "2024-07-22", jobsCompleted: 120 },
  ];

  const getAchievementColor = (level: string) => {
    switch (level) {
      case "platinum": return "bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white";
      case "gold": return "bg-[#0A5ED7]/20 text-[#0A5ED7] border border-[#0A5ED7]";
      case "silver": return "bg-[#9BA4B0]/20 text-[#2A2F3A] dark:text-[#E6EAF0] border border-[#9BA4B0]";
      case "bronze": return "bg-[#C9D1DA] text-[#2A2F3A] dark:bg-[#232A36] dark:text-[#E6EAF0]";
      default: return "bg-[#E6E9ED] text-[#6B7280]";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_progress': return 'bg-[#0A5ED7]/20 text-[#0A5ED7] border border-[#0A5ED7]';
      case 'completed': return 'bg-[#0A5ED7] text-white';
      case 'assigned': return 'bg-[#C9D1DA] text-[#2A2F3A] dark:bg-[#232A36] dark:text-[#E6EAF0]';
      case 'urgent': return 'bg-[#F97316]/20 text-[#F97316] border border-[#F97316]';
      default: return 'bg-[#E6E9ED] text-[#6B7280] dark:bg-[#232A36] dark:text-[#9BA4B0]';
    }
  };

  const assignedJobs = jobCards?.filter(j => j.status === 'assigned' || j.status === 'pending') || [];
  const activeJobs = jobCards?.filter(j => j.status === 'in_progress') || [];
  const completedJobs = jobCards?.filter(j => j.status === 'completed') || [];

  const stats = {
    today: activeJobs.length + assignedJobs.length,
    completed: completedJobs.length,
    avgTime: "2h 15m",
    efficiency: 94,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#E6E9ED] dark:bg-[#0E1117] p-4">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-[#C9D1DA] dark:bg-[#232A36] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E6E9ED] dark:bg-[#0E1117] pb-20">
      <div className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white p-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <User className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold" style={{ fontFamily: 'Inter, sans-serif' }}>
                {currentUser?.fullName || t('technician.technician', 'Technician')}
              </h1>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Badge className={`text-xs ${technicianProfile?.level === 'master' ? 'bg-white/30' : 'bg-white/20'}`}>
                  {technicianProfile?.level || 'Junior'}
                </Badge>
                {technicianProfile?.speciality && (
                  <span>• {technicianProfile.speciality}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              checked={isAvailable}
              onCheckedChange={setIsAvailable}
              className="data-[state=checked]:bg-white/30"
            />
            <span className="text-sm">{isAvailable ? 'Available' : 'Busy'}</span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.today}</p>
            <p className="text-xs text-white/70">Today</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{activeJobs.length}</p>
            <p className="text-xs text-white/70">Active</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-xs text-white/70">Done</p>
          </div>
          <div className="bg-white/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold">{stats.efficiency}%</p>
            <p className="text-xs text-white/70">Efficiency</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-[#151A23] rounded-xl shadow-lg border border-[#C9D1DA] dark:border-[#232A36]">
            <TabsTrigger value="jobs" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white">
              <Wrench className="h-4 w-4 mr-1" />
              Jobs
            </TabsTrigger>
            <TabsTrigger value="timer" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white">
              <Timer className="h-4 w-4 mr-1" />
              Timer
            </TabsTrigger>
            <TabsTrigger value="skills" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white">
              <Award className="h-4 w-4 mr-1" />
              Skills
            </TabsTrigger>
            <TabsTrigger value="schedule" className="text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#0A5ED7] data-[state=active]:to-[#0BB3FF] data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-1" />
              Schedule
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="mt-4 space-y-4">
            {activeJobs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[#6B7280] dark:text-[#9BA4B0] mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-[#0A5ED7]" />
                  Active Jobs ({activeJobs.length})
                </h3>
                {activeJobs.map(job => (
                  <Card
                    key={job.id}
                    className="bg-white dark:bg-[#151A23] border-[#0A5ED7] border-2 mb-3"
                    data-testid={`card-job-${job.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-[#2A2F3A] dark:text-[#E6EAF0]">{job.jobNumber}</h4>
                          <p className="text-sm text-[#6B7280] dark:text-[#9BA4B0]">{job.serviceType}</p>
                        </div>
                        <Badge className={getStatusColor('in_progress')}>In Progress</Badge>
                      </div>
                      
                      <div className="bg-[#E6E9ED] dark:bg-[#0E1117] rounded-lg p-3 mb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Timer className="h-5 w-5 text-[#0A5ED7]" />
                            <span className="text-2xl font-mono font-bold text-[#0A5ED7]">
                              {formatDuration(getElapsedTime(job.id))}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            {jobTimers.get(job.id)?.isRunning ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => pauseJobTimer(job.id)}
                                className="border-[#0A5ED7] text-[#0A5ED7]"
                                data-testid={`button-pause-${job.id}`}
                              >
                                <Pause className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => startJobTimer(job.id)}
                                className="bg-[#0A5ED7] text-white"
                                data-testid={`button-resume-${job.id}`}
                              >
                                <Play className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              onClick={() => stopJobTimer(job.id)}
                              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                              data-testid={`button-complete-${job.id}`}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Done
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-[#6B7280] dark:text-[#9BA4B0]">
                        <button
                          onClick={() => {
                            setSelectedJob(job);
                            setIsVehicleHistoryOpen(true);
                          }}
                          className="flex items-center gap-1 hover:text-[#0A5ED7]"
                          data-testid={`button-vehicle-history-${job.id}`}
                        >
                          <Car className="h-4 w-4" />
                          Vehicle History
                        </button>
                        <span className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          {job.notes ? 'Notes' : 'No Notes'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {assignedJobs.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-[#6B7280] dark:text-[#9BA4B0] mb-2">
                  Assigned Jobs ({assignedJobs.length})
                </h3>
                {assignedJobs.map(job => (
                  <Card
                    key={job.id}
                    className="bg-white dark:bg-[#151A23] border-[#C9D1DA] dark:border-[#232A36] mb-3"
                    data-testid={`card-job-assigned-${job.id}`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-[#2A2F3A] dark:text-[#E6EAF0]">{job.jobNumber}</h4>
                          <p className="text-sm text-[#6B7280] dark:text-[#9BA4B0]">{job.serviceType}</p>
                        </div>
                        <Badge className={getStatusColor('assigned')}>Assigned</Badge>
                      </div>
                      
                      {job.priority === 'urgent' && (
                        <Badge className={`${getStatusColor('urgent')} mb-2`}>
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Urgent
                        </Badge>
                      )}
                      
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2 text-sm text-[#6B7280]">
                          <Clock className="h-4 w-4" />
                          <span>Est: {job.estimatedHours || 2}h</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => startJobTimer(job.id)}
                          className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                          data-testid={`button-start-${job.id}`}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start Job
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {assignedJobs.length === 0 && activeJobs.length === 0 && (
              <Card className="bg-white dark:bg-[#151A23] border-[#C9D1DA] dark:border-[#232A36]">
                <CardContent className="p-8 text-center">
                  <CheckCircle className="h-12 w-12 mx-auto text-[#0A5ED7] mb-3" />
                  <p className="text-[#6B7280] dark:text-[#9BA4B0]">
                    {t('technician.noActiveJobs', 'No active jobs at the moment')}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="timer" className="mt-4 space-y-4">
            <Card className="bg-white dark:bg-[#151A23] border-[#C9D1DA] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-[#2A2F3A] dark:text-[#E6EAF0] flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#0A5ED7]" />
                  {t('technician.workTimer', 'Work Timer')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6">
                  <div className="text-6xl font-mono font-bold bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] bg-clip-text text-transparent mb-4">
                    {format(new Date(), 'HH:mm:ss')}
                  </div>
                  <p className="text-[#6B7280] dark:text-[#9BA4B0]">
                    {format(new Date(), 'EEEE, MMMM d, yyyy')}
                  </p>
                </div>

                {Array.from(jobTimers.entries()).length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="text-sm font-medium text-[#6B7280] dark:text-[#9BA4B0]">Active Timers</h4>
                    {Array.from(jobTimers.entries()).map(([jobId, timer]) => {
                      const job = jobCards?.find(j => j.id === jobId);
                      return (
                        <div
                          key={jobId}
                          className="bg-[#E6E9ED] dark:bg-[#0E1117] rounded-lg p-3 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium text-[#2A2F3A] dark:text-[#E6EAF0]">
                              {job?.jobNumber || 'Job'}
                            </p>
                            <p className="text-sm text-[#6B7280]">{job?.serviceType}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-mono font-bold ${timer.isRunning ? 'text-[#0A5ED7]' : 'text-[#6B7280]'}`}>
                              {formatDuration(getElapsedTime(jobId))}
                            </span>
                            {timer.isRunning && (
                              <span className="w-2 h-2 bg-[#0A5ED7] rounded-full animate-pulse" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-[#E6E9ED] dark:bg-[#0E1117] rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-[#0A5ED7]">7h 45m</p>
                    <p className="text-xs text-[#6B7280]">Today's Total</p>
                  </div>
                  <div className="bg-[#E6E9ED] dark:bg-[#0E1117] rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-[#2A2F3A] dark:text-[#E6EAF0]">38h 20m</p>
                    <p className="text-xs text-[#6B7280]">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="skills" className="mt-4 space-y-4">
            <Card className="bg-white dark:bg-[#151A23] border-[#C9D1DA] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-[#2A2F3A] dark:text-[#E6EAF0] flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-[#0A5ED7]" />
                  {t('technician.skillsAndCertifications', 'Skills & Certifications')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#E6E9ED] dark:bg-[#0E1117] rounded-lg p-3 text-center">
                    <p className="text-3xl font-bold text-[#0A5ED7]">
                      {technicianProfile?.yearsOfExperience || 5}
                    </p>
                    <p className="text-xs text-[#6B7280]">Years Experience</p>
                  </div>
                  <div className="bg-[#E6E9ED] dark:bg-[#0E1117] rounded-lg p-3 text-center">
                    <p className="text-3xl font-bold text-[#2A2F3A] dark:text-[#E6EAF0]">
                      {sampleAchievements.length}
                    </p>
                    <p className="text-xs text-[#6B7280]">Certifications</p>
                  </div>
                </div>

                {technicianProfile?.skills && (
                  <div>
                    <h4 className="text-sm font-medium text-[#6B7280] mb-2">Core Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {technicianProfile.skills.split(',').map((skill, i) => (
                        <Badge key={i} className="bg-[#0A5ED7]/10 text-[#0A5ED7]">
                          {skill.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-medium text-[#6B7280] mb-3">Achievements</h4>
                  <div className="space-y-2">
                    {sampleAchievements.map(achievement => (
                      <div
                        key={achievement.id}
                        className="flex items-center justify-between bg-[#E6E9ED] dark:bg-[#0E1117] rounded-lg p-3"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getAchievementColor(achievement.level)}`}>
                            <Award className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-[#2A2F3A] dark:text-[#E6EAF0] text-sm">
                              {achievement.name}
                            </p>
                            <p className="text-xs text-[#6B7280]">
                              {achievement.jobsCompleted} jobs • {achievement.category}
                            </p>
                          </div>
                        </div>
                        <Badge className={getAchievementColor(achievement.level)}>
                          {achievement.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#6B7280] mb-3">Skill Progress</h4>
                  <div className="space-y-3">
                    {[
                      { name: 'Engine Repair', progress: 85 },
                      { name: 'Brake Systems', progress: 95 },
                      { name: 'Electrical', progress: 70 },
                      { name: 'Transmission', progress: 60 },
                    ].map((skill, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-[#2A2F3A] dark:text-[#E6EAF0]">{skill.name}</span>
                          <span className="text-[#0A5ED7]">{skill.progress}%</span>
                        </div>
                        <Progress value={skill.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="mt-4 space-y-4">
            <Card className="bg-white dark:bg-[#151A23] border-[#C9D1DA] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-[#2A2F3A] dark:text-[#E6EAF0] flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#0A5ED7]" />
                  {t('technician.mySchedule', 'My Schedule')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#E6E9ED] dark:bg-[#0E1117] rounded-lg">
                  <span className="text-[#2A2F3A] dark:text-[#E6EAF0]">Available for Jobs</span>
                  <Switch
                    checked={isAvailable}
                    onCheckedChange={setIsAvailable}
                    data-testid="switch-availability"
                  />
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#6B7280] mb-3">Weekly Schedule</h4>
                  <div className="space-y-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, i) => (
                      <div
                        key={day}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          i < 5
                            ? 'bg-[#0A5ED7]/10 border border-[#0A5ED7]/30'
                            : 'bg-[#E6E9ED] dark:bg-[#0E1117]'
                        }`}
                      >
                        <span className={i < 5 ? 'text-[#0A5ED7] font-medium' : 'text-[#6B7280]'}>
                          {day}
                        </span>
                        <span className={i < 5 ? 'text-[#0A5ED7]' : 'text-[#6B7280]'}>
                          {i < 5 ? '08:00 - 17:00' : 'Off'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#6B7280] mb-3">Upcoming</h4>
                  <div className="space-y-2">
                    {[
                      { time: '09:00', title: 'Oil Change - Toyota Camry', duration: '45m' },
                      { time: '10:30', title: 'Brake Inspection - Honda Civic', duration: '1h' },
                      { time: '14:00', title: 'Engine Diagnostic - Ford F-150', duration: '2h' },
                    ].map((event, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-[#E6E9ED] dark:bg-[#0E1117] rounded-lg"
                      >
                        <div className="text-center min-w-[50px]">
                          <p className="text-sm font-bold text-[#0A5ED7]">{event.time}</p>
                          <p className="text-xs text-[#6B7280]">{event.duration}</p>
                        </div>
                        <div className="w-px h-10 bg-[#C9D1DA] dark:bg-[#232A36]" />
                        <p className="text-sm text-[#2A2F3A] dark:text-[#E6EAF0]">{event.title}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rotation" className="mt-4 pb-20">
            <Card className="bg-white dark:bg-[#151A23] border-[#C9D1DA] dark:border-[#232A36]">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 text-[#2A2F3A] dark:text-[#E6EAF0]">
                  <RotateCw className="h-5 w-5 text-[#0A5ED7]" />
                  {t('technician.featureRotation', 'Feature Rotation')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-[#0A5ED7]/10 to-[#0BB3FF]/10 border border-[#0A5ED7]/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-[#6B7280] uppercase tracking-wide">Current Rotation</span>
                    <Badge className="bg-[#0A5ED7] text-white">Active</Badge>
                  </div>
                  <h3 className="text-lg font-bold text-[#0A5ED7]">Engine Diagnostics</h3>
                  <p className="text-sm text-[#6B7280] mt-1">Jan 1 - Jan 15, 2025</p>
                  <Progress value={60} className="mt-3 h-2" />
                  <p className="text-xs text-[#6B7280] mt-1">9 of 15 days completed</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#6B7280] mb-3">Rotation Schedule</h4>
                  <div className="space-y-2">
                    {[
                      { feature: 'Engine Diagnostics', dates: 'Jan 1-15', status: 'current', progress: 60 },
                      { feature: 'Brake Systems', dates: 'Jan 16-31', status: 'upcoming', progress: 0 },
                      { feature: 'Electrical & Wiring', dates: 'Feb 1-15', status: 'upcoming', progress: 0 },
                      { feature: 'Transmission Service', dates: 'Feb 16-28', status: 'upcoming', progress: 0 },
                    ].map((rotation, i) => (
                      <div
                        key={i}
                        className={`p-3 rounded-lg flex items-center justify-between ${
                          rotation.status === 'current'
                            ? 'bg-[#0A5ED7]/10 border border-[#0A5ED7]/30'
                            : 'bg-[#E6E9ED] dark:bg-[#0E1117]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            rotation.status === 'current' ? 'bg-[#0A5ED7]' : 'bg-[#C9D1DA]'
                          }`} />
                          <div>
                            <p className={`text-sm font-medium ${
                              rotation.status === 'current' 
                                ? 'text-[#0A5ED7]' 
                                : 'text-[#2A2F3A] dark:text-[#E6EAF0]'
                            }`}>
                              {rotation.feature}
                            </p>
                            <p className="text-xs text-[#6B7280]">{rotation.dates}</p>
                          </div>
                        </div>
                        {rotation.status === 'current' && (
                          <span className="text-xs text-[#0A5ED7] font-medium">{rotation.progress}%</span>
                        )}
                        {rotation.status === 'upcoming' && (
                          <ArrowRight className="h-4 w-4 text-[#C9D1DA]" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#6B7280] mb-3">Skills Development</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { skill: 'OBD Scanning', level: 85, trend: '+5%' },
                      { skill: 'Fault Analysis', level: 70, trend: '+12%' },
                      { skill: 'Calibration', level: 45, trend: '+8%' },
                      { skill: 'Reporting', level: 90, trend: '+3%' },
                    ].map((skill, i) => (
                      <div
                        key={i}
                        className="p-3 bg-[#E6E9ED] dark:bg-[#0E1117] rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-medium text-[#2A2F3A] dark:text-[#E6EAF0]">
                            {skill.skill}
                          </span>
                          <span className="text-xs text-[#0A5ED7]">{skill.trend}</span>
                        </div>
                        <Progress value={skill.level} className="h-1.5" />
                        <p className="text-xs text-[#6B7280] mt-1">{skill.level}%</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-[#6B7280] mb-3">Completed Rotations</h4>
                  <div className="space-y-2">
                    {[
                      { feature: 'Oil & Fluids', completedDate: 'Dec 15, 2024', jobsCompleted: 42, rating: 4.8 },
                      { feature: 'Suspension Work', completedDate: 'Nov 30, 2024', jobsCompleted: 35, rating: 4.6 },
                      { feature: 'AC Systems', completedDate: 'Nov 15, 2024', jobsCompleted: 28, rating: 4.9 },
                    ].map((history, i) => (
                      <div
                        key={i}
                        className="p-3 bg-[#E6E9ED] dark:bg-[#0E1117] rounded-lg"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-[#2A2F3A] dark:text-[#E6EAF0]">
                              {history.feature}
                            </p>
                            <p className="text-xs text-[#6B7280]">{history.completedDate}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[#0A5ED7]">{history.jobsCompleted} jobs</p>
                            <p className="text-xs text-[#6B7280]">★ {history.rating}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isVehicleHistoryOpen} onOpenChange={setIsVehicleHistoryOpen}>
        <DialogContent className="bg-white dark:bg-[#151A23] border-[#C9D1DA] dark:border-[#232A36] max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#2A2F3A] dark:text-[#E6EAF0] flex items-center gap-2">
              <Car className="h-5 w-5 text-[#0A5ED7]" />
              Vehicle History
            </DialogTitle>
            <DialogDescription className="text-[#6B7280]">
              Service history for {selectedJob?.jobNumber}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3 p-1">
              {vehicleHistory && vehicleHistory.length > 0 ? (
                vehicleHistory.map((record, i) => (
                  <div
                    key={record.id || i}
                    className="p-3 bg-[#E6E9ED] dark:bg-[#0E1117] rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium text-[#2A2F3A] dark:text-[#E6EAF0]">
                        {record.serviceType || record.service || 'Service'}
                      </span>
                      <span className="text-[#0A5ED7] font-medium">
                        SAR {record.totalAmount || record.cost || '0'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-[#6B7280]">
                      <span>{record.completedAt ? format(new Date(record.completedAt), 'yyyy-MM-dd') : record.date || 'N/A'}</span>
                      <span>By: {record.technicianName || record.technician || 'N/A'}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Car className="h-10 w-10 mx-auto text-[#C9D1DA] mb-2" />
                  <p className="text-sm text-[#6B7280]">
                    {t('technician.noVehicleHistory', 'No service history available for this vehicle')}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#151A23] border-t border-[#C9D1DA] dark:border-[#232A36] px-2 py-2 flex justify-around">
        <button
          onClick={() => setActiveTab('jobs')}
          className={`flex flex-col items-center p-1.5 ${activeTab === 'jobs' ? 'text-[#0A5ED7]' : 'text-[#6B7280]'}`}
          data-testid="nav-jobs"
        >
          <Wrench className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Jobs</span>
        </button>
        <button
          onClick={() => setActiveTab('timer')}
          className={`flex flex-col items-center p-1.5 ${activeTab === 'timer' ? 'text-[#0A5ED7]' : 'text-[#6B7280]'}`}
          data-testid="nav-timer"
        >
          <Timer className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Timer</span>
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          className={`flex flex-col items-center p-1.5 ${activeTab === 'skills' ? 'text-[#0A5ED7]' : 'text-[#6B7280]'}`}
          data-testid="nav-skills"
        >
          <Award className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Skills</span>
        </button>
        <button
          onClick={() => setActiveTab('rotation')}
          className={`flex flex-col items-center p-1.5 ${activeTab === 'rotation' ? 'text-[#0A5ED7]' : 'text-[#6B7280]'}`}
          data-testid="nav-rotation"
        >
          <RotateCw className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Rotation</span>
        </button>
        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex flex-col items-center p-1.5 ${activeTab === 'schedule' ? 'text-[#0A5ED7]' : 'text-[#6B7280]'}`}
          data-testid="nav-schedule"
        >
          <Calendar className="h-5 w-5" />
          <span className="text-[10px] mt-0.5">Schedule</span>
        </button>
      </div>
    </div>
  );
}
