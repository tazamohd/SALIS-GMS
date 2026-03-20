// @ts-nocheck
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Award,
  Briefcase,
  Clock,
  Wrench,
  GraduationCap,
  Star,
} from "lucide-react";
import type { TechnicianProfile } from "@shared/schema";

export default function TechnicianProfile() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery<TechnicianProfile>({
    queryKey: ["/api/technician-profiles", user?.id],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
        <div className="h-8 bg-[#E2E8F0] dark:bg-[#232A36] rounded w-1/4"></div>
        <div className="h-64 bg-[#E2E8F0] dark:bg-[#232A36] rounded"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#F8FAFC] dark:bg-[#0E1117] min-h-screen p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0B1F3B] dark:text-white mb-2">
          My Profile
        </h1>
        <p className="text-[#64748B]">
          Your professional information and credentials
        </p>
      </div>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] flex items-center justify-center">
                <User className="h-8 w-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-[#0B1F3B] dark:text-white text-2xl">
                  {user?.fullName || "Technician"}
                </CardTitle>
                <p className="text-[#64748B] mt-1">
                  {user?.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {profile?.level && (
                <Badge variant="outline" className="text-lg px-4 py-1 border-[#E2E8F0] dark:border-[#232A36]">
                  {profile.level}
                </Badge>
              )}
              {profile?.isLead && (
                <Badge className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-lg px-4 py-1">
                  Lead Technician
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile?.speciality && (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Briefcase className="h-6 w-6 text-[#0A5ED7]" />
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">
                    Speciality
                  </p>
                  <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white">
                    {profile.speciality}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {profile?.yearsOfExperience !== undefined && (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <Clock className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">
                    Experience
                  </p>
                  <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white">
                    {profile.yearsOfExperience} years
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {profile?.maxConcurrentJobs !== undefined && (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <Wrench className="h-6 w-6 text-[#F97316]" />
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">
                    Job Capacity
                  </p>
                  <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white">
                    Up to {profile.maxConcurrentJobs} jobs
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {profile?.rating && (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-sm text-[#64748B] mb-1">
                    Rating
                  </p>
                  <p className="text-lg font-semibold text-[#0B1F3B] dark:text-white">
                    {profile.rating.toFixed(1)} / 5.0
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {profile?.qualifications && (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-[#64748B]" />
                <CardTitle className="text-[#0B1F3B] dark:text-white">
                  Qualifications
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[#0B1F3B] dark:text-gray-300">
                {profile.qualifications}
              </p>
            </CardContent>
          </Card>
        )}

        {profile?.certifications && (
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Award className="h-5 w-5 text-[#64748B]" />
                <CardTitle className="text-[#0B1F3B] dark:text-white">
                  Certifications
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-[#0B1F3B] dark:text-gray-300">
                {profile.certifications}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {profile?.skills && (
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Wrench className="h-5 w-5 text-[#64748B]" />
              <CardTitle className="text-[#0B1F3B] dark:text-white">
                Skills
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-[#0B1F3B] dark:text-gray-300">{profile.skills}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
