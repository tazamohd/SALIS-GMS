import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Mail, Phone, MapPin, Plus } from "lucide-react";

export default function StaffDirectory() {
  const { t } = useTranslation();

  const staff = [
    { id: 1, name: "Ahmed Hassan", role: "Senior Technician", department: "Service", email: "ahmed@salisauto.com", phone: "+966 50 123 4567", status: "active" },
    { id: 2, name: "Mohammed Ali", role: "Technician", department: "Service", email: "mohammed@salisauto.com", phone: "+966 55 234 5678", status: "active" },
    { id: 3, name: "Khalid Omar", role: "Service Advisor", department: "Customer Service", email: "khalid@salisauto.com", phone: "+966 54 345 6789", status: "active" },
    { id: 4, name: "Sara Ahmed", role: "HR Manager", department: "Human Resources", email: "sara@salisauto.com", phone: "+966 56 456 7890", status: "active" },
    { id: 5, name: "Fatima Khalid", role: "Accountant", department: "Finance", email: "fatima@salisauto.com", phone: "+966 50 567 8901", status: "on-leave" },
    { id: 6, name: "Omar Fahad", role: "Parts Manager", department: "Inventory", email: "omar@salisauto.com", phone: "+966 55 678 9012", status: "active" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] p-6" data-testid="staff-directory-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white" data-testid="page-title">{t('staffDirectory.title', 'Staff Directory')}</h1>
            <p className="text-gray-400 mt-1" data-testid="page-description">{t('staffDirectory.description', 'View and manage all employees')}</p>
          </div>
          <Button data-testid="button-add-employee" className="bg-sky-500 hover:bg-sky-600 text-white">
            <Plus className="w-4 h-4 mr-2" />
            {t('staffDirectory.addEmployee', 'Add Employee')}
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input data-testid="input-search" placeholder={t('staffDirectory.searchPlaceholder', 'Search employees...')} className="pl-10 bg-white/5 border-white/10 text-white" />
          </div>
          <Badge data-testid="badge-total-employees" className="bg-sky-500/20 text-sky-400">{staff.length} {t('staffDirectory.employees', 'Employees')}</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((person) => (
            <Card key={person.id} data-testid={`card-employee-${person.id}`} className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:border-sky-500/30 transition-all cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-500 to-purple-500 flex items-center justify-center text-white font-bold">
                      {person.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-white" data-testid={`text-name-${person.id}`}>{person.name}</p>
                      <p className="text-sm text-gray-400" data-testid={`text-role-${person.id}`}>{person.role}</p>
                    </div>
                  </div>
                  <Badge data-testid={`status-${person.status}-${person.id}`} className={person.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}>
                    {t(`staffDirectory.status.${person.status}`, person.status)}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin className="w-4 h-4" />
                    <span data-testid={`text-department-${person.id}`}>{person.department}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Mail className="w-4 h-4" />
                    <span data-testid={`text-email-${person.id}`}>{person.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span data-testid={`text-phone-${person.id}`}>{person.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
