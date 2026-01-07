import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronLeft, ChevronRight, Plus } from "lucide-react";

export default function StaffScheduling() {
  const { t } = useTranslation();

  const schedule = [
    { name: "Ahmed Hassan", shifts: ["08:00-16:00", "08:00-16:00", "OFF", "08:00-16:00", "08:00-16:00", "08:00-14:00", "OFF"] },
    { name: "Mohammed Ali", shifts: ["14:00-22:00", "14:00-22:00", "14:00-22:00", "OFF", "14:00-22:00", "OFF", "14:00-22:00"] },
    { name: "Khalid Omar", shifts: ["08:00-16:00", "OFF", "08:00-16:00", "08:00-16:00", "OFF", "08:00-16:00", "08:00-16:00"] },
    { name: "Omar Fahad", shifts: ["OFF", "08:00-16:00", "08:00-16:00", "14:00-22:00", "14:00-22:00", "OFF", "OFF"] },
  ];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] p-6" data-testid="staff-scheduling-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="page-title">{t('staffScheduling.title', 'Staff Scheduling')}</h1>
            <p className="text-gray-400 mt-1" data-testid="page-description">{t('staffScheduling.description', 'Manage employee work schedules and shifts')}</p>
          </div>
          <Button data-testid="button-add-shift" className="bg-sky-500 hover:bg-sky-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Shift
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button data-testid="button-prev-week" variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-white font-medium" data-testid="text-week-range">January 5 - 11, 2026</span>
            <Button data-testid="button-next-week" variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <div className="flex gap-4">
            <Badge data-testid="badge-morning" className="bg-sky-500/20 text-sky-400"><Clock className="w-3 h-3 mr-1" /> Morning: 08:00-16:00</Badge>
            <Badge data-testid="badge-evening" className="bg-purple-500/20 text-purple-400"><Clock className="w-3 h-3 mr-1" /> Evening: 14:00-22:00</Badge>
          </div>
        </div>

        <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-schedule-table">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left p-4 text-gray-400 font-medium w-48">Employee</th>
                    {days.map((day, idx) => (
                      <th key={idx} data-testid={`header-day-${idx}`} className="text-center p-4 text-gray-400 font-medium">{day}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {schedule.map((emp, idx) => (
                    <tr key={idx} data-testid={`row-employee-${idx}`} className="border-b border-white/10 hover:bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-500/20 flex items-center justify-center text-sky-400 text-sm font-bold">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="text-white" data-testid={`text-employee-name-${idx}`}>{emp.name}</span>
                        </div>
                      </td>
                      {emp.shifts.map((shift, i) => (
                        <td key={i} className="p-4 text-center">
                          {shift === "OFF" ? (
                            <Badge data-testid={`shift-off-${idx}-${i}`} variant="outline" className="border-gray-600 text-gray-500">OFF</Badge>
                          ) : (
                            <Badge data-testid={`shift-${idx}-${i}`} className={shift.startsWith("08") ? "bg-sky-500/20 text-sky-400" : "bg-purple-500/20 text-purple-400"}>
                              {shift}
                            </Badge>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
