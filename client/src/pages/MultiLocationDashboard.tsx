import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, TrendingUp, Users, Wrench, DollarSign } from "lucide-react";

export default function MultiLocationDashboard() {
  const { t } = useTranslation();

  const locations = [
    { id: 1, name: "SALIS AUTO - Riyadh Main", address: "King Fahd Road, Riyadh", status: "active", revenue: 125000, jobs: 45, technicians: 12 },
    { id: 2, name: "SALIS AUTO - Jeddah", address: "Prince Sultan Road, Jeddah", status: "active", revenue: 98000, jobs: 38, technicians: 9 },
    { id: 3, name: "SALIS AUTO - Dammam", address: "King Saud Street, Dammam", status: "active", revenue: 76000, jobs: 28, technicians: 7 },
    { id: 4, name: "SALIS AUTO - Makkah", address: "Al Masjid Al Haram Road, Makkah", status: "maintenance", revenue: 54000, jobs: 15, technicians: 5 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050510] via-[#0a0a1a] to-[#050510] p-6" data-testid="multi-location-dashboard-page">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white" data-testid="page-title">{t('multiLocation.title', 'Multi-Location Dashboard')}</h1>
          <p className="text-gray-400 mt-1" data-testid="page-description">{t('multiLocation.description', 'Monitor and manage all franchise locations from one place')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-total-locations">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-sky-500/20"><Building className="w-5 h-5 text-sky-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-locations">4</p>
                  <p className="text-sm text-gray-400">{t('multiLocation.totalLocations', 'Total Locations')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-total-revenue">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/20"><DollarSign className="w-5 h-5 text-emerald-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-total-revenue">SAR 353K</p>
                  <p className="text-sm text-gray-400">{t('multiLocation.totalRevenue', 'Total Revenue')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-active-jobs">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-500/20"><Wrench className="w-5 h-5 text-orange-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-active-jobs">126</p>
                  <p className="text-sm text-gray-400">{t('multiLocation.activeJobs', 'Active Jobs')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="glass-card border-white/10 bg-white/5 backdrop-blur-xl" data-testid="card-technicians">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20"><Users className="w-5 h-5 text-purple-400" /></div>
                <div>
                  <p className="text-2xl font-bold text-white" data-testid="text-technicians">33</p>
                  <p className="text-sm text-gray-400">{t('multiLocation.technicians', 'Technicians')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {locations.map((location) => (
            <Card key={location.id} data-testid={`card-location-${location.id}`} className="glass-card border-white/10 bg-white/5 backdrop-blur-xl hover:border-sky-500/30 transition-all cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg" data-testid={`text-location-name-${location.id}`}>{location.name}</CardTitle>
                  <Badge data-testid={`status-${location.status}-${location.id}`} className={location.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}>
                    {t(`statusLabels.${location.status}`, location.status)}
                  </Badge>
                </div>
                <CardDescription className="text-gray-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {location.address}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mt-2">
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <p className="text-xl font-bold text-emerald-400" data-testid={`text-revenue-${location.id}`}>SAR {(location.revenue / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-gray-400">{t('multiLocation.revenue', 'Revenue')}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <p className="text-xl font-bold text-sky-400" data-testid={`text-jobs-${location.id}`}>{location.jobs}</p>
                    <p className="text-xs text-gray-400">{t('multiLocation.activeJobs', 'Active Jobs')}</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-white/5">
                    <p className="text-xl font-bold text-purple-400" data-testid={`text-techs-${location.id}`}>{location.technicians}</p>
                    <p className="text-xs text-gray-400">{t('multiLocation.technicians', 'Technicians')}</p>
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
