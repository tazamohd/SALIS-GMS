import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Clock, Calendar, DollarSign, Star, GraduationCap, Plus, Play, Pause, StopCircle } from "lucide-react";
import { format } from "date-fns";

export default function HRManagement() {
  const { user } = useAuth();
  const garageId = user?.garageId;
  const [selectedTab, setSelectedTab] = useState("attendance");

  if (!garageId) {
    return (
      <div className="p-6">
        <div className="text-center">Please log in to access HR Management.</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="heading-hr">HR Management</h1>
        <p className="text-muted-foreground">Manage employees, attendance, shifts, commissions, reviews, and training</p>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="attendance" data-testid="tab-attendance">
            <Clock className="h-4 w-4 mr-2" />
            Attendance
          </TabsTrigger>
          <TabsTrigger value="shifts" data-testid="tab-shifts">
            <Calendar className="h-4 w-4 mr-2" />
            Shifts
          </TabsTrigger>
          <TabsTrigger value="commissions" data-testid="tab-commissions">
            <DollarSign className="h-4 w-4 mr-2" />
            Commissions
          </TabsTrigger>
          <TabsTrigger value="reviews" data-testid="tab-reviews">
            <Star className="h-4 w-4 mr-2" />
            Reviews
          </TabsTrigger>
          <TabsTrigger value="training" data-testid="tab-training">
            <GraduationCap className="h-4 w-4 mr-2" />
            Training
          </TabsTrigger>
        </TabsList>

        <TabsContent value="attendance" className="space-y-4">
          <AttendanceTab garageId={garageId} />
        </TabsContent>

        <TabsContent value="shifts" className="space-y-4">
          <ShiftsTab garageId={garageId} />
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <CommissionsTab garageId={garageId} />
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <ReviewsTab garageId={garageId} />
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <TrainingTab garageId={garageId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AttendanceTab({ garageId }: { garageId: string }) {
  const { user } = useAuth();
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  
  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["/api/hr/attendance", garageId, selectedEmployee],
    queryFn: () => apiRequest(`/api/hr/attendance?garageId=${garageId}${selectedEmployee ? `&employeeId=${selectedEmployee}` : ""}`),
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["/api/technicians", garageId],
  });

  const clockInMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/hr/clock-in", {
        method: "POST",
        body: JSON.stringify({ employeeId: user?.id, garageId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/attendance"] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: async (attendanceId: string) => {
      return await apiRequest(`/api/hr/clock-out/${attendanceId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/attendance"] });
    },
  });

  const startBreakMutation = useMutation({
    mutationFn: async (attendanceId: string) => {
      return await apiRequest(`/api/hr/break-start/${attendanceId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/attendance"] });
    },
  });

  const endBreakMutation = useMutation({
    mutationFn: async (attendanceId: string) => {
      return await apiRequest(`/api/hr/break-end/${attendanceId}`, {
        method: "POST",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/attendance"] });
    },
  });

  const todayAttendance = attendance.find((a: any) => 
    a.employeeId === user?.id && 
    new Date(a.date).toDateString() === new Date().toDateString() &&
    !a.clockOut
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage your attendance</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-2">
          {!todayAttendance ? (
            <Button 
              onClick={() => clockInMutation.mutate()}
              disabled={clockInMutation.isPending}
              data-testid="button-clock-in"
            >
              <Play className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          ) : (
            <>
              <Button 
                onClick={() => clockOutMutation.mutate(todayAttendance.id)}
                disabled={clockOutMutation.isPending}
                variant="destructive"
                data-testid="button-clock-out"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
              {!todayAttendance.breakStart || todayAttendance.breakEnd ? (
                <Button 
                  onClick={() => startBreakMutation.mutate(todayAttendance.id)}
                  disabled={startBreakMutation.isPending}
                  variant="outline"
                  data-testid="button-start-break"
                >
                  <Pause className="h-4 w-4 mr-2" />
                  Start Break
                </Button>
              ) : (
                <Button 
                  onClick={() => endBreakMutation.mutate(todayAttendance.id)}
                  disabled={endBreakMutation.isPending}
                  variant="outline"
                  data-testid="button-end-break"
                >
                  <Play className="h-4 w-4 mr-2" />
                  End Break
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attendance Records</CardTitle>
          <div className="flex gap-2 items-center">
            <Label htmlFor="employee-filter">Filter by Employee:</Label>
            <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
              <SelectTrigger className="w-[200px]" data-testid="select-employee-filter">
                <SelectValue placeholder="All Employees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Employees</SelectItem>
                {employees.map((emp: any) => (
                  <SelectItem key={emp.id} value={emp.id}>{emp.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Clock In</TableHead>
                  <TableHead>Clock Out</TableHead>
                  <TableHead>Total Hours</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendance.map((record: any) => (
                  <TableRow key={record.id} data-testid={`attendance-row-${record.id}`}>
                    <TableCell>{record.employeeId}</TableCell>
                    <TableCell>{format(new Date(record.date), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{format(new Date(record.clockIn), "hh:mm a")}</TableCell>
                    <TableCell>{record.clockOut ? format(new Date(record.clockOut), "hh:mm a") : "-"}</TableCell>
                    <TableCell>{record.totalHours || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "present" ? "default" : "secondary"}>
                        {record.status}
                      </Badge>
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
}

function ShiftsTab({ garageId }: { garageId: string }) {
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ["/api/hr/shift-templates", garageId],
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Shift Templates</CardTitle>
            <CardDescription>Manage shift schedules</CardDescription>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button data-testid="button-create-shift">
                <Plus className="h-4 w-4 mr-2" />
                Create Shift
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Shift Template</DialogTitle>
                <DialogDescription>Define a new shift template</DialogDescription>
              </DialogHeader>
              <ShiftTemplateForm garageId={garageId} />
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template: any) => (
              <Card key={template.id} data-testid={`shift-template-${template.id}`}>
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>
                    {template.startTime} - {template.endTime} ({template.breakDuration}min break)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {template.daysOfWeek?.map((day: string) => (
                      <Badge key={day} variant="outline">{day}</Badge>
                    ))}
                  </div>
                  <Badge className="mt-2" variant={template.isActive ? "default" : "secondary"}>
                    {template.isActive ? "Active" : "Inactive"}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ShiftTemplateForm({ garageId }: { garageId: string }) {
  const [formData, setFormData] = useState({
    name: "",
    startTime: "09:00",
    endTime: "17:00",
    breakDuration: "60",
    daysOfWeek: [] as string[],
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/hr/shift-templates", {
        method: "POST",
        body: JSON.stringify({ ...data, garageId }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/hr/shift-templates"] });
    },
  });

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="shift-name">Shift Name</Label>
        <Input
          id="shift-name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          data-testid="input-shift-name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-time">Start Time</Label>
          <Input
            id="start-time"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            data-testid="input-start-time"
          />
        </div>
        <div>
          <Label htmlFor="end-time">End Time</Label>
          <Input
            id="end-time"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            data-testid="input-end-time"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="break-duration">Break Duration (minutes)</Label>
        <Input
          id="break-duration"
          type="number"
          value={formData.breakDuration}
          onChange={(e) => setFormData({ ...formData, breakDuration: e.target.value })}
          data-testid="input-break-duration"
        />
      </div>
      <div>
        <Label>Days of Week</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {days.map((day) => (
            <Button
              key={day}
              type="button"
              variant={formData.daysOfWeek.includes(day) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setFormData({
                  ...formData,
                  daysOfWeek: formData.daysOfWeek.includes(day)
                    ? formData.daysOfWeek.filter((d) => d !== day)
                    : [...formData.daysOfWeek, day],
                });
              }}
              data-testid={`button-day-${day}`}
            >
              {day.slice(0, 3)}
            </Button>
          ))}
        </div>
      </div>
      <Button
        onClick={() => createMutation.mutate({
          ...formData,
          breakDuration: parseInt(formData.breakDuration),
        })}
        disabled={createMutation.isPending}
        className="w-full"
        data-testid="button-submit-shift"
      >
        Create Shift Template
      </Button>
    </div>
  );
}

function CommissionsTab({ garageId }: { garageId: string }) {
  const { data: commissions = [], isLoading } = useQuery({
    queryKey: ["/api/hr/commissions", garageId],
  });

  const { data: rules = [] } = useQuery({
    queryKey: ["/api/hr/commission-rules", garageId],
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Commission Rules</CardTitle>
              <CardDescription>Define commission calculation rules</CardDescription>
            </div>
            <Button data-testid="button-create-rule">
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {rules.map((rule: any) => (
              <Card key={rule.id} data-testid={`commission-rule-${rule.id}`}>
                <CardHeader>
                  <CardTitle>{rule.name}</CardTitle>
                  <CardDescription>{rule.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>Type: <Badge>{rule.ruleType}</Badge></div>
                    {rule.basePercentage && (
                      <div>Rate: {rule.basePercentage}%</div>
                    )}
                    {rule.fixedAmount && (
                      <div>Fixed Amount: ${rule.fixedAmount}</div>
                    )}
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commissions</CardTitle>
          <CardDescription>Track technician commissions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Technician</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Base Amount</TableHead>
                  <TableHead>Commission</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission: any) => (
                  <TableRow key={commission.id} data-testid={`commission-${commission.id}`}>
                    <TableCell>{commission.technicianId}</TableCell>
                    <TableCell>{commission.period}</TableCell>
                    <TableCell>${commission.baseAmount}</TableCell>
                    <TableCell className="font-semibold">${commission.commissionAmount}</TableCell>
                    <TableCell>{commission.commissionRate}%</TableCell>
                    <TableCell>
                      <Badge variant={commission.status === "paid" ? "default" : "secondary"}>
                        {commission.status}
                      </Badge>
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
}

function ReviewsTab({ garageId }: { garageId: string }) {
  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["/api/hr/performance-reviews", garageId],
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Performance Reviews</CardTitle>
            <CardDescription>Employee performance evaluations</CardDescription>
          </div>
          <Button data-testid="button-create-review">
            <Plus className="h-4 w-4 mr-2" />
            Create Review
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {reviews.map((review: any) => (
              <Card key={review.id} data-testid={`review-${review.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{review.employeeId}</span>
                    <Badge>{review.reviewPeriod}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Reviewed by {review.reviewerId}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-2xl font-bold">{review.overallRating}</span>
                    <span className="text-muted-foreground">/5.00</span>
                  </div>
                  <div className="text-sm space-y-1">
                    {review.technicalSkills && (
                      <div>Technical Skills: {review.technicalSkills}/5</div>
                    )}
                    {review.customerService && (
                      <div>Customer Service: {review.customerService}/5</div>
                    )}
                    {review.teamwork && (
                      <div>Teamwork: {review.teamwork}/5</div>
                    )}
                  </div>
                  <Badge variant={review.status === "acknowledged" ? "default" : "secondary"}>
                    {review.status}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TrainingTab({ garageId }: { garageId: string }) {
  const { data: trainings = [], isLoading: loadingTrainings } = useQuery({
    queryKey: ["/api/hr/trainings", garageId],
  });

  const { data: employeeTrainings = [], isLoading: loadingEmployeeTrainings } = useQuery({
    queryKey: ["/api/hr/employee-trainings", garageId],
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Training Programs</CardTitle>
              <CardDescription>Available training and certifications</CardDescription>
            </div>
            <Button data-testid="button-create-training">
              <Plus className="h-4 w-4 mr-2" />
              Add Training
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingTrainings ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {trainings.map((training: any) => (
                <Card key={training.id} data-testid={`training-${training.id}`}>
                  <CardHeader>
                    <CardTitle>{training.name}</CardTitle>
                    <CardDescription>{training.provider}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Badge>{training.trainingType}</Badge>
                    {training.duration && (
                      <div className="text-sm">Duration: {training.duration} hours</div>
                    )}
                    {training.cost && (
                      <div className="text-sm">Cost: ${training.cost}</div>
                    )}
                    {training.validityPeriod && (
                      <div className="text-sm">Valid for: {training.validityPeriod} months</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Employee Training Records</CardTitle>
          <CardDescription>Track employee certifications and training progress</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingEmployeeTrainings ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Training</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Enrolled</TableHead>
                  <TableHead>Completed</TableHead>
                  <TableHead>Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeTrainings.map((record: any) => (
                  <TableRow key={record.id} data-testid={`employee-training-${record.id}`}>
                    <TableCell>{record.employeeId}</TableCell>
                    <TableCell>{record.trainingId}</TableCell>
                    <TableCell>
                      <Badge variant={record.status === "completed" ? "default" : "secondary"}>
                        {record.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(record.enrolledDate), "MMM dd, yyyy")}</TableCell>
                    <TableCell>{record.completedDate ? format(new Date(record.completedDate), "MMM dd, yyyy") : "-"}</TableCell>
                    <TableCell>{record.expiryDate ? format(new Date(record.expiryDate), "MMM dd, yyyy") : "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
