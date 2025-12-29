import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  PieChart,
  LineChart,
  Download,
  FileText,
  Table,
  Trash2,
  Eye,
  Save,
  Settings
} from "lucide-react";
import { TabsPageLayout } from "@/components/layouts";

export default function CustomReportBuilder() {
  const { t } = useTranslation();
  const [reportName, setReportName] = useState("");
  const [dataSource, setDataSource] = useState("invoices");
  const [chartType, setChartType] = useState("bar");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const dataSources = [
    { value: "invoices", label: t('reportBuilder.dataSources.invoices', 'Invoices'), fields: ["invoiceNumber", "totalAmount", "status", "invoiceDate", "customerId"] },
    { value: "job_cards", label: t('reportBuilder.dataSources.jobCards', 'Job Cards'), fields: ["jobCardNumber", "status", "laborCost", "partsCost", "createdAt"] },
    { value: "customers", label: t('reportBuilder.dataSources.customers', 'Customers'), fields: ["name", "email", "phone", "createdAt", "totalSpent"] },
    { value: "spare_parts", label: t('reportBuilder.dataSources.spareParts', 'Spare Parts'), fields: ["partNumber", "name", "stock", "price", "supplier"] },
    { value: "appointments", label: t('reportBuilder.dataSources.appointments', 'Appointments'), fields: ["scheduledTime", "status", "customerId", "serviceType"] },
  ];

  const chartTypes = [
    { value: "bar", label: t('reportBuilder.chartTypes.barChart', 'Bar Chart'), icon: BarChart3 },
    { value: "pie", label: t('reportBuilder.chartTypes.pieChart', 'Pie Chart'), icon: PieChart },
    { value: "line", label: t('reportBuilder.chartTypes.lineChart', 'Line Chart'), icon: LineChart },
    { value: "table", label: t('reportBuilder.chartTypes.table', 'Table'), icon: Table },
  ];

  const currentDataSource = dataSources.find(ds => ds.value === dataSource);
  const availableFields = currentDataSource?.fields || [];

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field) ? prev.filter(f => f !== field) : [...prev, field]
    );
  };

  const configurationTab = (
    <Card className="bg-white dark:bg-salis-black">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          {t('reportBuilder.reportConfiguration', 'Report Configuration')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="report-name">{t('reportBuilder.reportName', 'Report Name')}</Label>
          <Input
            id="report-name"
            placeholder={t('reportBuilder.enterReportName', 'Enter report name...')}
            value={reportName}
            onChange={(e) => setReportName(e.target.value)}
            data-testid="input-report-name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="data-source">{t('reportBuilder.dataSource', 'Data Source')}</Label>
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
          <Label htmlFor="chart-type">{t('reportBuilder.chartType', 'Chart Type')}</Label>
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
          <Label>{t('reportBuilder.availableFields', 'Available Fields')}</Label>
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
                    <Badge className="bg-blue-600">{t('reportBuilder.selected', 'Selected')}</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          <Button className="w-full bg-blue-600 hover:bg-blue-700" data-testid="button-save-report">
            <Save className="h-4 w-4 mr-2" />
            {t('reportBuilder.saveReport', 'Save Report')}
          </Button>
          <Button variant="outline" className="w-full" data-testid="button-clear-report">
            <Trash2 className="h-4 w-4 mr-2" />
            {t('common.clear', 'Clear')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const previewTab = (
    <Card className="bg-white dark:bg-salis-black">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            {t('reportBuilder.reportPreview', 'Report Preview')}
          </span>
          <div className="flex gap-2">
            <Button variant="outline" data-testid="button-export-pdf">
              <FileText className="h-4 w-4 mr-2" />
              {t('reportBuilder.exportPDF', 'Export PDF')}
            </Button>
            <Button variant="outline" data-testid="button-export-excel">
              <Download className="h-4 w-4 mr-2" />
              {t('reportBuilder.exportExcel', 'Export Excel')}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedFields.length === 0 ? (
          <div className="text-center py-16">
            <BarChart3 className="h-20 w-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">{t('reportBuilder.noFieldsSelected', 'No fields selected')}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              {t('reportBuilder.selectFieldsHint', 'Select fields from the Configuration tab to build your report')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {reportName || t('reportBuilder.untitledReport', 'Untitled Report')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('reportBuilder.dataSourceLabel', 'Data Source')}: {currentDataSource?.label}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('reportBuilder.chartTypeLabel', 'Chart Type')}: {chartTypes.find(ct => ct.value === chartType)?.label}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('reportBuilder.selectedFieldsLabel', 'Selected Fields')}: {selectedFields.join(", ")}
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
                            {t('reportBuilder.sample', 'Sample')} {row}
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
                  <p className="text-gray-500 dark:text-gray-400 mt-36">{t('reportBuilder.chartPreviewHere', 'Chart preview will appear here')}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );

  const savedReportsTab = (
    <Card className="bg-white dark:bg-salis-black">
      <CardHeader>
        <CardTitle>{t('reportBuilder.savedReports', 'Saved Reports')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center justify-between hover:shadow-md transition-shadow">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white">{t('reportBuilder.monthlyRevenueReport', 'Monthly Revenue Report')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('reportBuilder.dataSources.invoices', 'Invoices')} • {t('reportBuilder.chartTypes.barChart', 'Bar Chart')} • {t('reportBuilder.lastModified', 'Last modified')} 2 {t('reportBuilder.daysAgo', 'days ago')}</p>
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
              <h4 className="font-semibold text-gray-900 dark:text-white">{t('reportBuilder.customerBreakdown', 'Customer Breakdown')}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t('reportBuilder.dataSources.customers', 'Customers')} • {t('reportBuilder.chartTypes.pieChart', 'Pie Chart')} • {t('reportBuilder.lastModified', 'Last modified')} 5 {t('reportBuilder.daysAgo', 'days ago')}</p>
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
  );

  return (
    <TabsPageLayout
      title={t('reportBuilder.title', 'Custom Report Builder')}
      description={t('reportBuilder.description', 'Create custom reports with drag-and-drop fields, choose chart types, and export to PDF/Excel')}
      icon={BarChart3}
      tabs={[
        {
          id: "configuration",
          label: t('reportBuilder.tabs.configuration', 'Configuration'),
          icon: Settings,
          content: configurationTab,
        },
        {
          id: "preview",
          label: t('reportBuilder.tabs.preview', 'Preview'),
          icon: Eye,
          content: previewTab,
        },
        {
          id: "saved",
          label: t('reportBuilder.tabs.savedReports', 'Saved Reports'),
          icon: Save,
          content: savedReportsTab,
        },
      ]}
      defaultTab="configuration"
    />
  );
}
