import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Trophy, Award, Target, TrendingUp, Star, Zap, Medal } from "lucide-react";

export default function TechnicianLeaderboards() {
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
    { name: "Speed Demon", icon: Zap, description: "Complete 5 jobs in one day", color: "text-yellow-500" },
    { name: "Quality Master", icon: Star, description: "Perfect 5-star rating streak", color: "text-purple-500" },
    { name: "Revenue King", icon: Trophy, description: "Generate $10k+ in one month", color: "text-green-500" },
    { name: "Efficiency Expert", icon: Target, description: "95%+ efficiency for 30 days", color: "text-blue-500" },
  ];

  const getRankIcon = (index: number) => {
    if (index === 0) return { icon: Trophy, color: "text-yellow-500", bg: "bg-yellow-50 dark:bg-yellow-900/20" };
    if (index === 1) return { icon: Medal, color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-800" };
    if (index === 2) return { icon: Medal, color: "text-orange-600", bg: "bg-orange-50 dark:bg-orange-900/20" };
    return { icon: Award, color: "text-gray-400", bg: "bg-gray-50 dark:bg-gray-800" };
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-['Montserrat'] text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          Technician Leaderboards
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Performance rankings, achievements, badges, and gamification challenges
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leaderboard */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                Overall Leaderboard
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
                      className={`p-4 ${rank.bg} rounded-lg border border-gray-200 dark:border-gray-700`}
                      data-testid={`leaderboard-${index + 1}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-12 h-12 bg-white dark:bg-gray-700 rounded-full">
                          <RankIcon className={`h-6 w-6 ${rank.color}`} />
                        </div>
                        
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-600 text-white">
                            {tech.name?.substring(0, 2).toUpperCase() || "TN"}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {tech.name || `Technician ${index + 1}`}
                            </h3>
                            <Badge className="bg-blue-600">#{index + 1}</Badge>
                            {tech.badges > 0 && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                <Award className="h-3 w-3" />
                                {tech.badges}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Points</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{tech.points}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Jobs</p>
                              <p className="font-semibold text-gray-900 dark:text-white">{tech.jobsCompleted}</p>
                            </div>
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Revenue</p>
                              <p className="font-semibold text-green-600">${tech.revenue.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Efficiency</p>
                          <div className="flex items-center gap-2">
                            <Progress value={tech.efficiency} className="w-24" />
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
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

        {/* Badges & Challenges */}
        <div className="space-y-6">
          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Achievement Badges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {badges.map((badge) => {
                  const BadgeIcon = badge.icon;
                  return (
                    <div
                      key={badge.name}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      data-testid={`badge-${badge.name}`}
                    >
                      <div className="flex items-start gap-3">
                        <BadgeIcon className={`h-6 w-6 ${badge.color} flex-shrink-0`} />
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                            {badge.name}
                          </h4>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
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

          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Active Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Weekend Warrior
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Complete 10 jobs this weekend
                  </p>
                  <Progress value={60} className="mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">6/10 jobs completed</p>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Customer Satisfaction
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Maintain 4.8+ star rating for 7 days
                  </p>
                  <Progress value={85} className="mb-1" />
                  <p className="text-xs text-gray-500 dark:text-gray-400">Day 6/7</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
