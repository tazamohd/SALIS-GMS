import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Award, Target, TrendingUp, Star, Zap, Medal } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts";

export default function TechnicianLeaderboards() {
  const { t } = useTranslation();
  const { data: usersData } = useQuery({ queryKey: ["/api/users"] });
  const { data: jobCardsData } = useQuery({ queryKey: ["/api/job-cards"] });

  const technicians = ((usersData as any[]) || []).filter((u: any) => u.role === 'technician');
  const jobCards = (jobCardsData as any[]) || [];

  const techStats = technicians.map((tech: any) => {
    const techJobs = jobCards.filter((j: any) => j.technicianId === tech.id);
    const completed = techJobs.filter((j: any) => j.status === 'completed').length;
    const revenue = techJobs.reduce((sum: number, j: any) => sum + (Number(j.laborCost) || 0), 0);
    
    return {
      ...tech,
      jobsCompleted: completed,
      revenue,
      efficiency: Math.min(100, 70 + Math.random() * 30),
      points: completed * 10 + Math.floor(revenue / 10),
      badges: Math.floor(Math.random() * 5),
    };
  }).sort((a, b) => b.points - a.points);

  const badges = [
    { name: t('leaderboards.badges.speedDemon', 'Speed Demon'), icon: Zap, description: t('leaderboards.badges.speedDemonDesc', 'Complete 5 jobs in one day'), color: "text-[#F97316]" },
    { name: t('leaderboards.badges.qualityMaster', 'Quality Master'), icon: Star, description: t('leaderboards.badges.qualityMasterDesc', 'Perfect 5-star rating streak'), color: "text-[#0A5ED7]" },
    { name: t('leaderboards.badges.revenueKing', 'Revenue King'), icon: Trophy, description: t('leaderboards.badges.revenueKingDesc', 'Generate $10k+ in one month'), color: "text-green-500" },
    { name: t('leaderboards.badges.efficiencyExpert', 'Efficiency Expert'), icon: Target, description: t('leaderboards.badges.efficiencyExpertDesc', '95%+ efficiency for 30 days'), color: "text-[#0BB3FF]" },
  ];

  const getRankIcon = (index: number) => {
    if (index === 0) return { icon: Trophy, color: "text-[#F97316]", bg: "bg-[#F97316]/10 dark:bg-[#F97316]/20" };
    if (index === 1) return { icon: Medal, color: "text-[#64748B]", bg: "bg-[#F8FAFC] dark:bg-[#0E1117]" };
    if (index === 2) return { icon: Medal, color: "text-[#0BB3FF]", bg: "bg-[#0BB3FF]/10 dark:bg-[#0BB3FF]/20" };
    return { icon: Award, color: "text-[#64748B]", bg: "bg-[#F8FAFC] dark:bg-[#0E1117]" };
  };

  return (
    <StandardPageLayout
      title={t('leaderboards.title', 'Technician Leaderboards')}
      description={t('leaderboards.description', 'Performance rankings, achievements, badges, and gamification challenges')}
      icon={Trophy}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Trophy className="h-5 w-5 text-[#F97316]" />
                {t('leaderboards.overallLeaderboard', 'Overall Leaderboard')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {techStats.map((tech, index) => {
                  const rank = getRankIcon(index);
                  const RankIcon = rank.icon;
                  
                  return (
                    <div
                      key={tech.id}
                      className={`p-4 ${rank.bg} rounded-lg border border-[#E2E8F0] dark:border-[#232A36]`}
                      data-testid={`leaderboard-${index + 1}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-[#151A23] rounded-full border border-[#E2E8F0] dark:border-[#232A36]">
                          <RankIcon className={`h-6 w-6 ${rank.color}`} />
                        </div>
                        
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white">
                            {tech.name?.substring(0, 2).toUpperCase() || "TN"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                              {tech.name || `${t('leaderboards.technician', 'Technician')} ${index + 1}`}
                            </h3>
                            <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white border-0">#{index + 1}</Badge>
                            {tech.badges > 0 && (
                              <Badge variant="outline" className="flex items-center gap-1 border-[#E2E8F0] dark:border-[#232A36] text-[#64748B]">
                                <Award className="h-3 w-3" />
                                {tech.badges}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-[#64748B]">{t('leaderboards.points', 'Points')}</p>
                              <p className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-points-${tech.id}`}>{tech.points}</p>
                            </div>
                            <div>
                              <p className="text-[#64748B]">{t('leaderboards.jobs', 'Jobs')}</p>
                              <p className="font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-jobs-${tech.id}`}>{tech.jobsCompleted}</p>
                            </div>
                            <div>
                              <p className="text-[#64748B]">{t('leaderboards.revenue', 'Revenue')}</p>
                              <p className="font-semibold text-green-600" data-testid={`text-revenue-${tech.id}`}>${tech.revenue.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-[#64748B] mb-1">{t('leaderboards.efficiency', 'Efficiency')}</p>
                          <div className="flex items-center gap-2">
                            <Progress value={tech.efficiency} className="w-24" />
                            <span className="text-sm font-semibold text-[#0B1F3B] dark:text-white">
                              {tech.efficiency.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Award className="h-5 w-5 text-[#0A5ED7]" />
                {t('leaderboards.achievementBadges', 'Achievement Badges')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {badges.map((badge) => {
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={badge.name}
                      className="p-3 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]"
                      data-testid={`badge-${badge.name}`}
                    >
                      <div className="flex items-start gap-3">
                        <BadgeIcon className={`h-6 w-6 ${badge.color} flex-shrink-0`} />
                        <div>
                          <h4 className="font-semibold text-[#0B1F3B] dark:text-white mb-1">
                            {badge.name}
                          </h4>
                          <p className="text-xs text-[#64748B]">
                            {badge.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                <Target className="h-5 w-5 text-[#F97316]" />
                {t('leaderboards.activeChallenges', 'Active Challenges')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-[#F97316]/10 dark:bg-[#F97316]/20 rounded-lg border border-[#F97316]/20 dark:border-[#F97316]/30">
                  <h4 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">
                    {t('leaderboards.challenges.weekendWarrior', 'Weekend Warrior')}
                  </h4>
                  <p className="text-sm text-[#64748B] mb-2">
                    {t('leaderboards.challenges.weekendWarriorDesc', 'Complete 10 jobs this weekend')}
                  </p>
                  <Progress value={60} className="mb-1" />
                  <p className="text-xs text-[#64748B]">{t('leaderboards.challenges.jobsCompleted', '6/10 jobs completed')}</p>
                </div>

                <div className="p-3 bg-[#0A5ED7]/10 dark:bg-[#0A5ED7]/20 rounded-lg border border-[#0A5ED7]/20 dark:border-[#0A5ED7]/30">
                  <h4 className="font-semibold text-[#0B1F3B] dark:text-white mb-2">
                    {t('leaderboards.challenges.customerSatisfaction', 'Customer Satisfaction')}
                  </h4>
                  <p className="text-sm text-[#64748B] mb-2">
                    {t('leaderboards.challenges.customerSatisfactionDesc', 'Maintain 4.8+ star rating for 7 days')}
                  </p>
                  <Progress value={85} className="mb-1" />
                  <p className="text-xs text-[#64748B]">{t('leaderboards.challenges.dayProgress', 'Day 6/7')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StandardPageLayout>
  );
}
