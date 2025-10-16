import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { ExportJob } from "@shared/schema";

export default function DataImportExport() {
  const { toast } = useToast();
  const [selectedModule, setSelectedModule] = useState("jobCards");
  const [selectedFormat, setSelectedFormat] = useState("csv");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [garageId, setGarageId] = useState("");

  // Get garages
  const { data: garages } = useQuery({
    queryKey: ['/api/garages'],
  });

  useEffect(() => {
    if (garages && garages.length > 0 && !garageId) {
      setGarageId(garages[0].id);
    }
  }, [garages, garageId]);

  // Get export jobs
  const { data: exportJobs } = useQuery<ExportJob[]>({
    queryKey: ['/api/export-jobs', { garageId }],
    enabled: !!garageId,
  });

  // Export mutation
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
      toast({ title: "Export started successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to start export", variant: "destructive" });
    },
  });

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (data: any[]) => {
      return apiRequest("POST", "/api/import", {
        module: selectedModule,
        data,
      });
    },
    onSuccess: (result: any) => {
      toast({ 
        title: "Import completed", 
        description: `Imported: ${result.imported}, Skipped: ${result.skipped}, Errors: ${result.errors.length}` 
      });
      setImportFile(null);
      // Invalidate relevant queries
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
      toast({ title: "Error", description: "Failed to import data", variant: "destructive" });
    },
  });

  const handleExport = () => {
    if (!garageId) {
      toast({ title: "Error", description: "Please select a garage", variant: "destructive" });
      return;
    }
    exportMutation.mutate();
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({ title: "Error", description: "Please select a file", variant: "destructive" });
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
        toast({ title: "Error", description: "Invalid file format", variant: "destructive" });
        return;
      }

      importMutation.mutate(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to parse file", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">Processing...</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const modules = [
    { value: "jobCards", label: "Job Cards" },
    { value: "customers", label: "Customers" },
    { value: "vehicles", label: "Vehicles" },
    { value: "invoices", label: "Invoices" },
    { value: "estimates", label: "Estimates" },
    { value: "spareParts", label: "Spare Parts" },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Import/Export</h1>
        <p className="text-muted-foreground">Import and export data across modules</p>
      </div>

      {garages && garages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Garage</CardTitle>
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
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Export Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Data
            </CardTitle>
            <CardDescription>Export data from selected module</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Module</Label>
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
              <Label>Format</Label>
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
              {exportMutation.isPending ? "Starting Export..." : "Export Data"}
            </Button>
          </CardContent>
        </Card>

        {/* Import Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Import Data
            </CardTitle>
            <CardDescription>Import data from CSV or JSON file</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Module</Label>
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
              <Label>File</Label>
              <Input
                type="file"
                accept=".csv,.json"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                data-testid="input-import-file"
              />
              {importFile && (
                <p className="text-sm text-muted-foreground">
                  Selected: {importFile.name}
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
              {importMutation.isPending ? "Importing..." : "Import Data"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Export Jobs History */}
      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>Recent export jobs</CardDescription>
        </CardHeader>
        <CardContent>
          {!exportJobs || exportJobs.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No export history
            </div>
          ) : (
            <div className="space-y-3">
              {exportJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                  data-testid={`export-job-${job.id}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{modules.find(m => m.value === job.module)?.label}</span>
                      <span className="text-sm text-muted-foreground">({job.format.toUpperCase()})</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(job.createdAt).toLocaleString()}
                      {job.recordCount && ` • ${job.recordCount} records`}
                    </div>
                    {job.errorMessage && (
                      <div className="text-sm text-destructive mt-1">
                        Error: {job.errorMessage}
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
                          Download
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
    </div>
  );
}
