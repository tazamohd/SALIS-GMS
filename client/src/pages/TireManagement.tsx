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
      return <Badge variant="destructive">{t('tireManagement.outOfStock', 'Out of Stock')}</Badge>;
    } else if (tire.quantityInStock <= tire.reorderPoint) {
      return <Badge className="bg-orange-500">{t('tireManagement.lowStock', 'Low Stock')}</Badge>;
    } else {
      return <Badge className="bg-green-500">{t('tireManagement.inStock', 'In Stock')}</Badge>;
    }
  };

  const getSeasonIcon = (season: string) => {
    switch (season) {
      case 'winter':
        return <Snowflake className="h-4 w-4 text-blue-500" />;
      case 'summer':
        return <CircleDot className="h-4 w-4 text-orange-500" />;
      default:
        return <CircleDot className="h-4 w-4 text-gray-500" />;
    }
  };

  const statsContent = (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      <Card className="bg-white dark:bg-salis-black">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('tireManagement.totalInventory', 'Total Inventory')}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{stats.totalInventory}</p>
            </div>
            <Package className="h-12 w-12 text-blue-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('tireManagement.lowStock', 'Low Stock')}</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.lowStock}</p>
            </div>
            <AlertTriangle className="h-12 w-12 text-orange-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('tireManagement.servicesThisMonth', 'Services This Month')}</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.servicesThisMonth}</p>
            </div>
            <RefreshCw className="h-12 w-12 text-green-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('tireManagement.activeStorage', 'Active Storage')}</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.activeStorage}</p>
            </div>
            <Snowflake className="h-12 w-12 text-purple-600 opacity-20" />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-salis-black">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('tireManagement.overdueRotations', 'Overdue Rotations')}</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.overdueRotations}</p>
            </div>
            <Clock className="h-12 w-12 text-red-600 opacity-20" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const inventoryTab = (
    <Card className="bg-white dark:bg-salis-black">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            {t('tireManagement.tireInventory', 'Tire Inventory')}
          </span>
          <div className="flex gap-2">
            <Input
              placeholder={t('tireManagement.searchTires', 'Search tires...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64"
              data-testid="input-search-tires"
            />
            <Select value={selectedSeason} onValueChange={setSelectedSeason}>
              <SelectTrigger className="w-40" data-testid="select-season">
                <SelectValue placeholder={t('tireManagement.season', 'Season')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('tireManagement.allSeasons', 'All Seasons')}</SelectItem>
                <SelectItem value="summer">{t('tireManagement.summer', 'Summer')}</SelectItem>
                <SelectItem value="winter">{t('tireManagement.winter', 'Winter')}</SelectItem>
                <SelectItem value="all_season">{t('tireManagement.allSeason', 'All-Season')}</SelectItem>
              </SelectContent>
            </Select>
            <Button className="bg-blue-600 hover:bg-blue-700" data-testid="button-add-tire">
              {t('tireManagement.addTire', 'Add Tire')}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {inventoryLoading ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse" />
            <p className="text-gray-500 dark:text-gray-400">{t('tireManagement.loadingInventory', 'Loading inventory...')}</p>
          </div>
        ) : filteredInventory.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">{t('tireManagement.noTiresFound', 'No tires found. Add your first tire to get started.')}</p>
            <Button className="mt-4 bg-blue-600 hover:bg-blue-700" data-testid="button-add-first-tire">
              {t('tireManagement.addTireInventory', 'Add Tire Inventory')}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredInventory.map((tire: any) => (
              <div
                key={tire.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-shadow"
                data-testid={`tire-${tire.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {getSeasonIcon(tire.season)}
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {tire.brand} {tire.model}
                      </h3>
                      {getStockBadge(tire)}
                    </div>
                    <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">{t('tireManagement.size', 'Size')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{tire.size}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">{t('tireManagement.speedRating', 'Speed Rating')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">{tire.speedRating || t('common.notAvailable', 'N/A')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">{t('tireManagement.stock', 'Stock')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {tire.quantityInStock} / {tire.reorderPoint} {t('tireManagement.min', 'min')}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">{t('tireManagement.retailPrice', 'Retail Price')}</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${Number(tire.retailPrice || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" data-testid={`button-edit-${tire.id}`}>
                      {t('common.edit', 'Edit')}
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`button-reorder-${tire.id}`}>
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
    <Card className="bg-white dark:bg-salis-black">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-green-600" />
            {t('tireManagement.tireServiceRecords', 'Tire Service Records')}
          </span>
          <Button className="bg-green-600 hover:bg-green-700" data-testid="button-add-service">
            {t('tireManagement.recordService', 'Record Service')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {servicesLoading ? (
          <div className="text-center py-12">
            <RefreshCw className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400">{t('tireManagement.loadingServiceRecords', 'Loading service records...')}</p>
          </div>
        ) : serviceRecords.length === 0 ? (
          <div className="text-center py-12">
            <RefreshCw className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">{t('tireManagement.noServiceRecords', 'No service records yet.')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {serviceRecords.slice(0, 10).map((service: any) => (
              <div
                key={service.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                data-testid={`service-${service.id}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge>{service.serviceType}</Badge>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(service.serviceDate).toLocaleDateString()}
                    </span>
                  </div>
                  <span className="font-semibold text-green-600">
                    ${Number(service.totalCost || 0).toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
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
    <Card className="bg-white dark:bg-salis-black">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-purple-600" />
            {t('tireManagement.seasonalTireStorage', 'Seasonal Tire Storage')}
          </span>
          <Button className="bg-purple-600 hover:bg-purple-700" data-testid="button-add-storage">
            {t('tireManagement.storeTires', 'Store Tires')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {storageLoading ? (
          <div className="text-center py-12">
            <Snowflake className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse" />
            <p className="text-gray-500 dark:text-gray-400">{t('tireManagement.loadingStorageRecords', 'Loading storage records...')}</p>
          </div>
        ) : storageRecords.length === 0 ? (
          <div className="text-center py-12">
            <Snowflake className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">{t('tireManagement.noTiresInStorage', 'No tires in storage.')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storageRecords.map((storage: any) => (
              <div
                key={storage.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                data-testid={`storage-${storage.id}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {storage.tireBrand} - {storage.season}
                  </h3>
                  <Badge className={storage.status === 'stored' ? 'bg-purple-500' : 'bg-gray-500'}>
                    {storage.status}
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('tireManagement.storageNumber', 'Storage #')}</span>
                    <span className="font-semibold">{storage.storageNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('tireManagement.location', 'Location')}</span>
                    <span className="font-semibold">{storage.storageLocation || t('common.notAvailable', 'N/A')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">{t('tireManagement.monthlyFee', 'Monthly Fee')}</span>
                    <span className="font-semibold text-purple-600">
                      ${Number(storage.monthlyStorageFee || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-3" 
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
    <Card className="bg-white dark:bg-salis-black">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-orange-600" />
            {t('tireManagement.tireRotationSchedules', 'Tire Rotation Schedules')}
          </span>
          <Button className="bg-orange-600 hover:bg-orange-700" data-testid="button-schedule-rotation">
            {t('tireManagement.scheduleRotation', 'Schedule Rotation')}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rotationsLoading ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400 animate-pulse" />
            <p className="text-gray-500 dark:text-gray-400">{t('tireManagement.loadingRotationSchedules', 'Loading rotation schedules...')}</p>
          </div>
        ) : rotationSchedules.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">{t('tireManagement.noRotationSchedules', 'No rotation schedules yet.')}</p>
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
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  data-testid={`rotation-${rotation.id}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {isOverdue ? (
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {t('tireManagement.rotationSchedule', 'Rotation Schedule')} #{rotation.id.slice(0, 8)}
                      </h3>
                    </div>
                    <Badge className={isOverdue ? 'bg-red-500' : 'bg-green-500'}>
                      {rotation.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">{t('tireManagement.pattern', 'Pattern')}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {rotation.rotationPattern || t('tireManagement.standard', 'Standard')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">{t('tireManagement.nextDue', 'Next Due')}</p>
                      <p className={`font-semibold ${isOverdue ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
                        {rotation.nextRotationDue 
                          ? new Date(rotation.nextRotationDue).toLocaleDateString() 
                          : t('tireManagement.notScheduled', 'Not scheduled')}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400">{t('tireManagement.mileageDue', 'Mileage Due')}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
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
