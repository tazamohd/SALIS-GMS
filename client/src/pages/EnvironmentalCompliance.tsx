import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Leaf, Droplet, Battery, Recycle } from "lucide-react";

export default function EnvironmentalCompliance() {
  const mockRecords = [
    { id: "1", type: "waste_disposal", wasteType: "Used Oil", quantity: 55, unit: "gallons", disposalCompany: "EcoWaste Inc", date: "2024-10-20", cost: 125 },
    { id: "2", type: "recycling", wasteType: "Scrap Metal", quantity: 450, unit: "lbs", disposalCompany: "Metal Recyclers", date: "2024-10-18", cost: 0 },
    { id: "3", type: "waste_disposal", wasteType: "Batteries", quantity: 12, unit: "units", disposalCompany: "Battery Solutions", date: "2024-10-15", cost: 45 },
  ];

  const stats = { totalDisposals: 24, complianceRate: 100, thisMonthCost: 850, recyclingRate: 78 };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-montserrat text-gray-900 dark:text-white">
            🌱 Environmental Compliance
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track waste disposal and environmental compliance</p>
        </div>
        <Button data-testid="button-add-record">Add Disposal Record</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total This Month</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.totalDisposals}</h3>
              </div>
              <Leaf className="h-12 w-12 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Compliance Rate</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.complianceRate}%</h3>
              </div>
              <Droplet className="h-12 w-12 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Disposal Costs</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">${stats.thisMonthCost}</h3>
              </div>
              <Battery className="h-12 w-12 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Recycling Rate</p>
                <h3 className="text-2xl font-bold mt-2 text-gray-900 dark:text-white">{stats.recyclingRate}%</h3>
              </div>
              <Recycle className="h-12 w-12 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-gray-800">
        <CardHeader>
          <CardTitle>Recent Disposal Records</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg" data-testid={`record-${record.id}`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{record.wasteType}</h3>
                    <Badge>{record.type.replace("_", " ")}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {record.quantity} {record.unit} • {record.disposalCompany}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900 dark:text-white">${record.cost}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{new Date(record.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
