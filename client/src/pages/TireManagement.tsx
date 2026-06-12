import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { TabsPageLayout } from "@/components/layouts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  CircleDot, 
  Package, 
  RefreshCw, 
  Snowflake, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
} from "lucide-react";

export default function TireManagement() {
  const { t } = useTranslation();
  const [selectedSeason, setSelectedSeason] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: tireInventoryData, isLoading: inventoryLoading } = useQuery({
    queryKey: ["/api/tire-inventory"],
  });

  const { data: serviceRecordsData, isLoading: servicesLoading } = useQuery({
    queryKey: ["/api/tire-services"],
  });

  const { data: storageData, isLoading: storageLoading } = useQuery({
    queryKey: ["/api/tire-storage"],
  });

  const { data: rotationSchedulesData, isLoading: rotationsLoading } = useQuery({
    queryKey: ["/api/tire-rotations"],
  });

  const tireInventory = (tireInventoryData as any[]) || [];
  const serviceRecords = (serviceRecordsData as any[]) || [];
  const storageRecords = (storageData as any[]) || [];
  const rotationSchedules = (rotationSchedulesData as any[]) || [];

  const stats = {
    totalInventory: tireInventory.length || 0,
    lowStock: tireInventory.filter((t: any) => t.quantityInStock <= t.reorderPoint).length || 0,
    servicesThisMonth: serviceRecords.filter((s: any) => {
      if (!s.serviceDate) return false;
      const serviceDate = new Date(s.serviceDate);
      const now = new Date();
      return serviceDate.getMonth() === now.getMonth() && serviceDate.getFullYear() === now.getFullYear();
    }).length || 0,
    activeStorage: storageRecords.filter((s: any) => s.status === 'stored').length || 0,
    overdueRotations: rotationSchedules.filter((r: any) => {
      if (!r.nextRotationDue || r.status !== 'active') return false;
      return new Date(r.nextRotationDue) < new Date();
    }).length || 0,
  };

  const filteredInventory = tireInventory.filter((tire: any) => {
    const matchesSeason = selectedSeason === "all" || tire.season === selectedSeason;
    const matchesSearch = !searchQuery || 
      tire.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tire.model?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tire.size?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeason && matchesSearch;
  });

  const getStockBadge = (tire: any) => {
    if (tire.quantityInStock === 0) {
      return <Badge className="bg-red-500/10 text-red-600 border-0">{t('tireManagement.outOfStock', 'Out of Stock')}</Badge>;
    } else if (tire.quantityInStock <= tire.reorderPoint) {
      return <Badge className="bg-[#F97316]/10 text-[#F97316] border-0">{t('tireManagement.lowStock', 'Low Stock')}</Badge>;
    } 
      return <Badge className="bg-green-500/10 text-green-600 border-0">{t('tireManagement.inStock', 'In Stock')}</Badge>;
    
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'winter':
        return <Snowflake className="h-4 w-4 text-[#0A5ED7]" />;
      case 'summer':
        return <CircleDot className="h-4 w-4 text-[#F97316]" />;
      default:
        return <CircleDot className="h-4 w-4 text-[#64748B]" />;
    }
  };

  const statsContent = (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('tireManagement.totalInventory', 'Total Inventory')}</p>
              <p className="text-3xl font-bold text-[#0B1F3B] dark:text-white mt-2">{stats.totalInventory}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center">
              <Package className="h-6 w-6 text-[#0A5ED7]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('tireManagement.lowStock', 'Low Stock')}</p>
              <p className="text-3xl font-bold text-[#F97316] mt-2">{stats.lowStock}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#F97316]/20 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-[#F97316]" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('tireManagement.servicesThisMonth', 'Services This Month')}</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.servicesThisMonth}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('tireManagement.activeStorage', 'Active Storage')}</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.activeStorage}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
              <Snowflake className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[#64748B]">{t('tireManagement.overdueRotations', 'Overdue Rotations')}</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdueRotations}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const inventoryTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-[#0B1F3B] dark:text-white">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5 text-[#0A5ED7]" />
            {t('tireManagement.tireInventory', 'Tire Inventory')}
          </span>
          <div className="flex gap-2">
            <Input
              placeholder={t('tireManagement.searchTires', 'Search tires...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white"
              data-testid="input-search-tires"
            />
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="w-40 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white" data-testid="select-season">
                <SelectValue placeholder={t('tireManagement.season', 'Season')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="all">{t('tireManagement.allSeasons', 'All Seasons')}</SelectItem>
                <SelectItem value="summer">{t('tireManagement.summer', 'Summer')}</SelectItem>
                <SelectItem value="winter">{t('tireManagement.winter', 'Winter')}</SelectItem>
                <SelectItem value="all_season">{t('tireManagement.allSeason', 'All-Season')}</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white" data-testid="button-add-tire">
              {t('tireManagement.addTire', 'Add Tire')}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inventoryLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Package className="h-8 w-8 text-[#0A5ED7]" />
            </div>
            <p className="text-[#64748B]">{t('tireManagement.loadingInventory', 'Loading inventory...')}</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-[#0A5ED7]" />
            </div>
            <p className="text-[#64748B]">{t('tireManagement.noTiresFound', 'No tires found. Add your first tire to get started.')}</p>
            <Button className="mt-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0952C1] hover:to-[#0AA3E8] text-white" data-testid="button-add-first-tire">
              {t('tireManagement.addTireInventory', 'Add Tire Inventory')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInventory.map((tire: any) => (
              <div
                key={tire.id}
                className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117] hover:shadow-md transition-shadow"
                data-testid={`tire-${tire.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getSeasonIcon(tire.season)}
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                        {tire.brand} {tire.model}
                      </h3>
                      {getStockBadge(tire)}
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-[#64748B]">{t('tireManagement.size', 'Size')}</p>
                        <p className="font-semibold text-[#0B1F3B] dark:text-white">{tire.size}</p>
                      </div>
                      <div>
                        <p className="text-[#64748B]">{t('tireManagement.speedRating', 'Speed Rating')}</p>
                        <p className="font-semibold text-[#0B1F3B] dark:text-white">{tire.speedRating || t('common.notAvailable', 'N/A')}</p>
                      </div>
                      <div>
                        <p className="text-[#64748B]">{t('tireManagement.stock', 'Stock')}</p>
                        <p className="font-semibold text-[#0B1F3B] dark:text-white">
                          {tire.quantityInStock} / {tire.reorderPoint} {t('tireManagement.min', 'min')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[#64748B]">{t('tireManagement.retailPrice', 'Retail Price')}</p>
                        <p className="font-semibold text-[#0B1F3B] dark:text-white">
                          ${Number(tire.retailPrice || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10" data-testid={`button-edit-${tire.id}`}>
                      {t('common.edit', 'Edit')}
                    </Button>
                    <Button variant="outline" size="sm" className="border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10" data-testid={`button-reorder-${tire.id}`}>
                      {t('tireManagement.reorder', 'Reorder')}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const servicesTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-[#0B1F3B] dark:text-white">
          <span className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-green-600" />
            {t('tireManagement.tireServiceRecords', 'Tire Service Records')}
          </span>
          <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white" data-testid="button-add-service">
            {t('tireManagement.recordService', 'Record Service')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {servicesLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-green-600 animate-spin" />
            </div>
            <p className="text-[#64748B]">{t('tireManagement.loadingServiceRecords', 'Loading service records...')}</p>
          </div>
        ) : serviceRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="h-8 w-8 text-[#0A5ED7]" />
            </div>
            <p className="text-[#64748B]">{t('tireManagement.noServiceRecords', 'No service records yet.')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {serviceRecords.slice(0, 10).map((service: any) => (
              <div
                key={service.id}
                className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`service-${service.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-[#0A5ED7]/10 text-[#0A5ED7] border-0">{service.serviceType}</Badge>
                    <span className="text-sm text-[#64748B]">
                      {new Date(service.serviceDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="font-semibold text-green-600">
                    ${Number(service.totalCost || 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-[#64748B]">
                  {service.notes || t('tireManagement.noAdditionalNotes', 'No additional notes')}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const storageTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-[#0B1F3B] dark:text-white">
          <span className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-purple-600" />
            {t('tireManagement.seasonalTireStorage', 'Seasonal Tire Storage')}
          </span>
          <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white" data-testid="button-add-storage">
            {t('tireManagement.storeTires', 'Store Tires')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {storageLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Snowflake className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-[#64748B]">{t('tireManagement.loadingStorageRecords', 'Loading storage records...')}</p>
          </div>
        ) : storageRecords.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4">
              <Snowflake className="h-8 w-8 text-[#0A5ED7]" />
            </div>
            <p className="text-[#64748B]">{t('tireManagement.noTiresInStorage', 'No tires in storage.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storageRecords.map((storage: any) => (
              <div
                key={storage.id}
                className="p-4 border border-[#E2E8F0] dark:border-[#232A36] rounded-lg bg-[#F8FAFC] dark:bg-[#0E1117]"
                data-testid={`storage-${storage.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                    {storage.tireBrand} - {storage.season}
                  </h3>
                  <Badge className={storage.status === 'stored' ? 'bg-purple-500/10 text-purple-600 border-0' : 'bg-[#64748B]/10 text-[#64748B] border-0'}>
                    {storage.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">{t('tireManagement.storageNumber', 'Storage #')}</span>
                    <span className="font-semibold text-[#0B1F3B] dark:text-white">{storage.storageNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">{t('tireManagement.location', 'Location')}</span>
                    <span className="font-semibold text-[#0B1F3B] dark:text-white">{storage.storageLocation || t('common.notAvailable', 'N/A')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">{t('tireManagement.monthlyFee', 'Monthly Fee')}</span>
                    <span className="font-semibold text-purple-600">
                      ${Number(storage.monthlyStorageFee || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-3 border-[#0A5ED7] text-[#0A5ED7] hover:bg-[#0A5ED7]/10" 
                  size="sm"
                  data-testid={`button-retrieve-${storage.id}`}
                >
                  {t('tireManagement.retrieveTires', 'Retrieve Tires')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const rotationsTab = (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-[#0B1F3B] dark:text-white">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-[#F97316]" />
            {t('tireManagement.tireRotationSchedules', 'Tire Rotation Schedules')}
          </span>
          <Button className="bg-gradient-to-r from-[#F97316] to-orange-500 hover:from-orange-600 hover:to-orange-700 text-white" data-testid="button-schedule-rotation">
            {t('tireManagement.scheduleRotation', 'Schedule Rotation')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rotationsLoading ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-[#F97316]/20 flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Calendar className="h-8 w-8 text-[#F97316]" />
            </div>
            <p className="text-[#64748B]">{t('tireManagement.loadingRotationSchedules', 'Loading rotation schedules...')}</p>
          </div>
        ) : rotationSchedules.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#0A5ED7]/20 to-[#0BB3FF]/20 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-[#0A5ED7]" />
            </div>
            <p className="text-[#64748B]">{t('tireManagement.noRotationSchedules', 'No rotation schedules yet.')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {rotationSchedules.map((rotation: any) => {
              const isOverdue = rotation.nextRotationDue && new Date(rotation.nextRotationDue) < new Date();
              return (
                <div
                  key={rotation.id}
                  className={`p-4 border rounded-lg ${
                    isOverdue 
                      ? 'border-[#F97316]/50 bg-[#F97316]/5' 
                      : 'border-[#E2E8F0] dark:border-[#232A36] bg-[#F8FAFC] dark:bg-[#0E1117]'
                  }`}
                  data-testid={`rotation-${rotation.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isOverdue ? (
                        <AlertTriangle className="h-5 w-5 text-[#F97316]" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      <h3 className="font-semibold text-[#0B1F3B] dark:text-white">
                        {t('tireManagement.rotationSchedule', 'Rotation Schedule')} #{rotation.id.slice(0, 8)}
                      </h3>
                    </div>
                    <Badge className={isOverdue ? 'bg-[#F97316]/10 text-[#F97316] border-0' : 'bg-green-500/10 text-green-600 border-0'}>
                      {rotation.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-[#64748B]">{t('tireManagement.pattern', 'Pattern')}</p>
                      <p className="font-semibold text-[#0B1F3B] dark:text-white">
                        {rotation.rotationPattern || t('tireManagement.standard', 'Standard')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#64748B]">{t('tireManagement.nextDue', 'Next Due')}</p>
                      <p className={`font-semibold ${isOverdue ? 'text-[#F97316]' : 'text-[#0B1F3B] dark:text-white'}`}>
                        {rotation.nextRotationDue 
                          ? new Date(rotation.nextRotationDue).toLocaleDateString() 
                          : t('tireManagement.notScheduled', 'Not scheduled')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[#64748B]">{t('tireManagement.mileageDue', 'Mileage Due')}</p>
                      <p className="font-semibold text-[#0B1F3B] dark:text-white">
                        {rotation.nextRotationMileage?.toLocaleString() || t('common.notAvailable', 'N/A')} {t('tireManagement.miles', 'mi')}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <TabsPageLayout
      title={t('tireManagement.title', 'Tire Management System')}
      description={t('tireManagement.description', 'Complete tire inventory, services, rotation scheduling, and seasonal storage')}
      icon={CircleDot}
      headerContent={statsContent}
      tabs={[
        {
          id: "inventory",
          label: t('tireManagement.tireInventory', 'Tire Inventory'),
          content: inventoryTab,
        },
        {
          id: "services",
          label: t('tireManagement.serviceRecords', 'Service Records'),
          content: servicesTab,
        },
        {
          id: "storage",
          label: t('tireManagement.seasonalStorage', 'Seasonal Storage'),
          content: storageTab,
        },
        {
          id: "rotations",
          label: t('tireManagement.rotationSchedules', 'Rotation Schedules'),
          content: rotationsTab,
        },
      ]}
      defaultTab="inventory"
    />
  );
}
