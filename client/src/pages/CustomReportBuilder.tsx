import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart,
  LineChart,
  Download,
  FileText,
  Table,
  Plus,
  Trash2,
  Eye,
  Save
} from "lucide-react";

export default function CustomReportBuilder() {
  const [reportName, setReportName] = useState("");
  const [dataSource, setDataSource] = useState("invoices");
  const [chartType, setChartType] = useState("bar");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const dataSources = [
    { value: "invoices", label: "Invoices", fields: ["invoiceNumber", "totalAmount", "status", "invoiceDate", "customerId"] },
    { value: "job_cards", label: "Job Cards", fields: ["jobCardNumber", "status", "laborCost", "partsCost", "createdAt"] },
    { value: "customers", label: "Customers", fields: ["name", "email", "phone", "createdAt", "totalSpent"] },
    { value: "spare_parts", label: "Spare Parts", fields: ["partNumber", "name", "stock", "price", "supplier"] },
    { value: "appointments", label: "Appointments", fields: ["scheduledTime", "status", "customerId", "serviceType"] },
  ];

  const chartTypes = [
    { value: "bar", label: "Bar Chart", icon: BarChart3 },
    { value: "pie", label: "Pie Chart", icon: PieChart },
    { value: "line", label: "Line Chart", icon: LineChart },
    { value: "table", label: "Table", icon: Table },
  ];

  const currentDataSource = dataSources.find(ds => ds.value === dataSource);
  const availableFields = currentDataSource?.fields || [];

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  return (
    <div className="flex-1 p-6 bg-gray-50 dark:bg-salis-black min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-['Montserrat'] text-gray-900 dark:text-white mb-2 flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-blue-600" />
          Custom Report Builder
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create custom reports with drag-and-drop fields, choose chart types, and export to PDF/Excel
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Report Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle>Report Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  placeholder="Enter report name..."
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  data-testid="input-report-name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data-source">Data Source</Label>
                <Select value={dataSource} onValueChange={setDataSource}>
                  <SelectTrigger id="data-source" data-testid="select-data-source">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataSources.map(ds => (
                      <SelectItem key={ds.value} value={ds.value}>
                        {ds.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="chart-type">Chart Type</Label>
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger id="chart-type" data-testid="select-chart-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {chartTypes.map(ct => (
                      <SelectItem key={ct.value} value={ct.value}>
                        <div className="flex items-center gap-2">
                          <ct.icon className="h-4 w-4" />
                          {ct.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Available Fields</Label>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableFields.map(field => (
                    <div
                      key={field}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedFields.includes(field)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                      }`}
                      onClick={() => toggleField(field)}
                      data-testid={`field-${field}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {field}
                        </span>
                        {selectedFields.includes(field) && (
                          <Badge className="bg-blue-600">Selected</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-save-report">
                  <Save className="h-4 w-4 mr-2" />
                  Save Report
                </Button>
                <Button variant="outline" className="w-full" data-testid="button-clear-report">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview and Export */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-purple-600" />
                  Report Preview
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" data-testid="button-export-pdf">
                    <FileText className="h-4 w-4 mr-2" />
                    Export PDF
                  </Button>
                  <Button variant="outline" data-testid="button-export-excel">
                    <Download className="h-4 w-4 mr-2" />
                    Export Excel
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedFields.length === 0 ? (
                <div className="text-center py-16">
                  <BarChart3 className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                  <p className="text-gray-500 dark:text-gray-400 mb-2">No fields selected</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Select fields from the left panel to build your report
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {reportName || "Untitled Report"}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Data Source: {currentDataSource?.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Chart Type: {chartTypes.find(ct => ct.value === chartType)?.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Selected Fields: {selectedFields.join(", ")}
                    </p>
                  </div>

                  {chartType === "table" ? (
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-100 dark:bg-gray-800">
                          <tr>
                            {selectedFields.map(field => (
                              <th key={field} className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                                {field}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {[1, 2, 3].map(row => (
                            <tr key={row} className="border-t border-gray-200 dark:border-gray-700">
                              {selectedFields.map(field => (
                                <td key={field} className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                                  Sample {row}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="h-96 flex items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                      {chartType === "bar" && <BarChart3 className="h-32 w-32 text-gray-300 dark:text-gray-600" />}
                      {chartType === "pie" && <PieChart className="h-32 w-32 text-gray-300 dark:text-gray-600" />}
                      {chartType === "line" && <LineChart className="h-32 w-32 text-gray-300 dark:text-gray-600" />}
                      <div className="absolute text-center">
                        <p className="text-gray-500 dark:text-gray-400 mt-36">Chart preview will appear here</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Saved Reports */}
          <Card className="bg-white dark:bg-salis-black">
            <CardHeader>
              <CardTitle>Saved Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Monthly Revenue Report</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Invoices • Bar Chart • Last modified 2 days ago</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" data-testid="button-view-saved-1">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" data-testid="button-download-saved-1">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">Customer Breakdown</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Customers • Pie Chart • Last modified 5 days ago</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" data-testid="button-view-saved-2">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" data-testid="button-download-saved-2">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
