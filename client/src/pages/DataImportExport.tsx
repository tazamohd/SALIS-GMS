import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Upload, Download, FileJson, FileSpreadsheet, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ExportJob } from "@shared/schema";
import { TabsPageLayout } from "@/components/layouts";

export default function DataImportExport() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState("jobCards");
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [garageId, setGarageId] = useState("");

  const { data: garages } = useQuery<any[]>({
    queryKey: ['/api/garages'],
  });

  useEffect(() => {
    if (garages && garages.length > 0 && !garageId) {
      setGarageId(garages[0].id);
    }
  }, [garages, garageId]);

  const { data: exportJobs } = useQuery<ExportJob[]>({
    queryKey: ['/api/export-jobs', { garageId }],
    enabled: !!garageId,
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/export", {
        garageId,
        module: selectedModule,
        format: selectedFormat,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          typeof query.queryKey[0] === 'string' && query.queryKey[0].includes('/api/export-jobs')
      });
      toast({ title: t('dataImportExport.exportStarted', 'Export started successfully') });
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('dataImportExport.exportFailed', 'Failed to start export'), variant: "destructive" });
    },
  });

  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      return apiRequest("POST", "/api/import", {
        garageId,
        module: selectedModule,
        data,
      });
    },
    onSuccess: (result: any) => {
      toast({ 
        title: t('dataImportExport.importCompleted', 'Import completed'), 
        description: t('dataImportExport.importSummary', 'Imported: {{imported}}, Skipped: {{skipped}}, Errors: {{errors}}', {
          imported: result.imported,
          skipped: result.skipped,
          errors: result.errors.length
        })
      });
      setImportFile(null);
      queryClient.invalidateQueries({
        predicate: (query) => {
          const key = query.queryKey[0];
          if (typeof key === 'string') {
            return key.includes(`/api/${selectedModule}`) || 
                   key.includes('/api/job-cards') || 
                   key.includes('/api/customers') || 
                   key.includes('/api/vehicles');
          }
          return false;
        }
      });
    },
    onError: () => {
      toast({ title: t('common.error', 'Error'), description: t('dataImportExport.importFailed', 'Failed to import data'), variant: "destructive" });
    },
  });

  const handleExport = () => {
    if (!garageId) {
      toast({ title: t('common.error', 'Error'), description: t('dataImportExport.selectGarage', 'Please select a garage'), variant: "destructive" });
      return;
    }
    exportMutation.mutate();
  };

  const handleImport = async () => {
    if (!garageId) {
      toast({ title: t('common.error', 'Error'), description: t('dataImportExport.selectGarage', 'Please select a garage'), variant: "destructive" });
      return;
    }
    
    if (!importFile) {
      toast({ title: t('common.error', 'Error'), description: t('dataImportExport.selectFile', 'Please select a file'), variant: "destructive" });
      return;
    }

    try {
      const text = await importFile.text();
      let data: any[] = [];

      if (importFile.name.endsWith('.json')) {
        data = JSON.parse(text);
      } else if (importFile.name.endsWith('.csv')) {
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        
        data = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',');
          const obj: any = {};
          headers.forEach((header, index) => {
            obj[header] = values[index]?.trim();
          });
          return obj;
        });
      }

      if (!Array.isArray(data) || data.length === 0) {
        toast({ title: t('common.error', 'Error'), description: t('dataImportExport.invalidFormat', 'Invalid file format'), variant: "destructive" });
        return;
      }

      importMutation.mutate(data);
    } catch (error) {
      toast({ title: t('common.error', 'Error'), description: t('dataImportExport.parseFailed', 'Failed to parse file'), variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-gray-800 dark:bg-gray-200 text-white dark:text-black"><CheckCircle className="h-3 w-3 mr-1" />{t('common.completed', 'Completed')}</Badge>;
      case 'processing':
        return <Badge className="bg-gray-600 dark:bg-gray-400 text-white dark:text-black">{t('dataImportExport.processing', 'Processing...')}</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />{t('common.failed', 'Failed')}</Badge>;
      default:
        return <Badge variant="outline">{t('common.pending', 'Pending')}</Badge>;
    }
  };

  const modules = [
    { value: "jobCards", label: t('dataImportExport.jobCards', 'Job Cards') },
    { value: "customers", label: t('dataImportExport.customers', 'Customers') },
    { value: "vehicles", label: t('dataImportExport.vehicles', 'Vehicles') },
    { value: "invoices", label: t('dataImportExport.invoices', 'Invoices') },
    { value: "estimates", label: t('dataImportExport.estimates', 'Estimates') },
    { value: "spareParts", label: t('dataImportExport.spareParts', 'Spare Parts') },
  ];

  const exportTab = (
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          {t('dataImportExport.exportData', 'Export Data')}
        </CardTitle>
        <CardDescription className="text-gray-900 dark:text-white/60">{t('dataImportExport.exportDescription', 'Export data from selected module')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t('dataImportExport.module', 'Module')}</Label>
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger data-testid="select-export-module">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modules.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('dataImportExport.format', 'Format')}</Label>
          <Select value={selectedFormat} onValueChange={setSelectedFormat}>
            <SelectTrigger data-testid="select-export-format">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csv">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4" />
                  CSV
                </div>
              </SelectItem>
              <SelectItem value="json">
                <div className="flex items-center gap-2">
                  <FileJson className="h-4 w-4" />
                  JSON
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          className="w-full"
          onClick={handleExport}
          disabled={exportMutation.isPending || !garageId}
          data-testid="button-export"
        >
          <Download className="h-4 w-4 mr-2" />
          {exportMutation.isPending ? t('dataImportExport.startingExport', 'Starting Export...') : t('dataImportExport.exportData', 'Export Data')}
        </Button>
      </CardContent>
    </Card>
  );

  const importTab = (
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          {t('dataImportExport.importData', 'Import Data')}
        </CardTitle>
        <CardDescription className="text-gray-900 dark:text-white/60">{t('dataImportExport.importDescription', 'Import data from CSV or JSON file')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>{t('dataImportExport.module', 'Module')}</Label>
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger data-testid="select-import-module">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {modules.map(({ value, label }) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>{t('dataImportExport.file', 'File')}</Label>
          <Input
            type="file"
            accept=".csv,.json"
            onChange={(e) => setImportFile(e.target.files?.[0] || null)}
            data-testid="input-import-file"
          />
          {importFile && (
            <p className="text-sm text-gray-900 dark:text-white/60">
              {t('dataImportExport.selected', 'Selected')}: {importFile.name}
            </p>
          )}
        </div>

        <Button
          className="w-full"
          onClick={handleImport}
          disabled={importMutation.isPending || !importFile}
          data-testid="button-import"
        >
          <Upload className="h-4 w-4 mr-2" />
          {importMutation.isPending ? t('dataImportExport.importing', 'Importing...') : t('dataImportExport.importData', 'Import Data')}
        </Button>
      </CardContent>
    </Card>
  );

  const historyTab = (
    <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark">
      <CardHeader>
        <CardTitle className="text-gray-900 dark:text-white">{t('dataImportExport.exportHistory', 'Export History')}</CardTitle>
        <CardDescription className="text-gray-900 dark:text-white/60">{t('dataImportExport.recentExportJobs', 'Recent export jobs')}</CardDescription>
      </CardHeader>
      <CardContent>
        {!exportJobs || exportJobs.length === 0 ? (
          <div className="text-center text-gray-900 dark:text-white/60 py-8">
            {t('dataImportExport.noExportHistory', 'No export history')}
          </div>
        ) : (
          <div className="space-y-3">
            {exportJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-salis-gray-dark rounded-lg"
                data-testid={`export-job-${job.id}`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{modules.find(m => m.value === job.module)?.label}</span>
                    <span className="text-sm text-gray-900 dark:text-white/60">({job.format.toUpperCase()})</span>
                  </div>
                  <div className="text-sm text-gray-900 dark:text-white/60">
                    {job.createdAt && new Date(job.createdAt).toLocaleString()}
                    {job.recordCount && ` • ${job.recordCount} ${t('dataImportExport.records', 'records')}`}
                  </div>
                  {job.errorMessage && (
                    <div className="text-sm text-destructive mt-1">
                      {t('common.error', 'Error')}: {job.errorMessage}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(job.status)}
                  {job.status === 'completed' && job.fileUrl && (
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      data-testid={`button-download-${job.id}`}
                    >
                      <a href={job.fileUrl} download={job.fileName}>
                        <Download className="h-4 w-4 mr-2" />
                        {t('common.download', 'Download')}
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <TabsPageLayout
      title={t('dataImportExport.title', 'Data Import/Export')}
      description={t('dataImportExport.pageDescription', 'Import and export data across modules')}
      icon={Upload}
      headerContent={
        garages && garages.length > 0 && (
          <Card className="bg-white dark:bg-salis-black border-gray-200 dark:border-salis-gray-dark mb-6">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white">{t('dataImportExport.selectGarageTitle', 'Select Garage')}</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={garageId} onValueChange={setGarageId}>
                <SelectTrigger data-testid="select-garage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {garages.map((garage: any) => (
                    <SelectItem key={garage.id} value={garage.id}>
                      {garage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )
      }
      tabs={[
        {
          id: "export",
          label: t('common.export', 'Export'),
          icon: Download,
          content: exportTab,
        },
        {
          id: "import",
          label: t('common.import', 'Import'),
          icon: Upload,
          content: importTab,
        },
        {
          id: "history",
          label: t('dataImportExport.historyTab', 'History'),
          content: historyTab,
        },
      ]}
      defaultTab="export"
    />
  );
}
