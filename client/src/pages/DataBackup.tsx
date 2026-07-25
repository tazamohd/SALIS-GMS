// @ts-nocheck
import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Database,
  Download,
  Clock,
  CheckCircle,
  HardDrive,
  Calendar,
  RefreshCw,
  Shield,
  FileText,
  FileSpreadsheet,
  Users,
  Car,
  Wrench,
  Package,
  CalendarDays,
  Receipt,
  BarChart3,
  Printer,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';

// ─── Types ───
type BackupStatus = {
  lastBackupTime: string | null;
  lastBackupSize: number;
  backupCount: number;
  nextScheduled: string | null;
  storageUsed: number;
};

type BackupListItem = {
  id: string;
  createdAt: string;
  size: number;
  type: string;
  totalRecords: number;
};

type BackupCreateResult = {
  success: boolean;
  backup: BackupListItem & { tableCounts: Record<string, number>; metadata: Record<string, any> };
};

// ─── Export type definitions ───
const exportTypes = [
  { id: 'customers', label: 'Customers', description: 'User accounts and profiles', icon: Users },
  { id: 'invoices', label: 'Invoices', description: 'Billing and payment records', icon: Receipt },
  { id: 'job-cards', label: 'Job Cards', description: 'Work orders and repairs', icon: Wrench },
  { id: 'vehicles', label: 'Vehicles', description: 'Vehicle records', icon: Car },
  { id: 'inventory', label: 'Parts & Inventory', description: 'Spare parts catalog', icon: Package },
  { id: 'appointments', label: 'Appointments', description: 'Scheduled bookings', icon: CalendarDays },
];

const reportTypes = [
  { id: 'financial-summary', label: 'Financial Summary', description: 'Revenue, payments, and outstanding balances', icon: BarChart3 },
  { id: 'inventory-report', label: 'Inventory Report', description: 'Stock levels, parts catalog, and value', icon: Package },
  { id: 'customer-list', label: 'Customer List', description: 'All users with contact details', icon: Users },
];

// ─── Helpers ───
function formatFileSize(bytes: number): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}

function downloadFile(url: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = '';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function DataBackup() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // ─── Queries ───
  const { data: status, isLoading: loadingStatus } = useQuery<BackupStatus>({
    queryKey: ['/api/backup/status'],
  });

  const { data: backups = [], isLoading: loadingBackups, refetch: refetchBackups } = useQuery<BackupListItem[]>({
    queryKey: ['/api/backup/list'],
  });

  // ─── Create Backup ───
  const createBackupMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/backup/create', { method: 'POST', credentials: 'include' });
      if (!res.ok) throw new Error('Backup failed');
      return res.json() as Promise<BackupCreateResult>;
    },
    onSuccess: (data) => {
      setIsCreating(false);
      queryClient.invalidateQueries({ queryKey: ['/api/backup/status'] });
      queryClient.invalidateQueries({ queryKey: ['/api/backup/list'] });
      toast({
        title: 'Backup Created',
        description: `Snapshot captured: ${data.backup.totalRecords.toLocaleString()} records across ${Object.keys(data.backup.tableCounts).length} tables.`,
      });
    },
    onError: () => {
      setIsCreating(false);
      toast({ title: 'Backup Failed', description: 'Could not create backup. Please try again.', variant: 'destructive' });
    },
  });

  const handleCreateBackup = () => {
    setIsCreating(true);
    createBackupMutation.mutate();
  };

  return (
    <StandardPageLayout
      title={t('backup.title', 'Data Backup & Export')}
      description={t('backup.description', 'Create backups, export data as CSV/JSON, and generate printable reports')}
      icon={Database}
    >
      <div className="space-y-6">

        {/* ───────── STATUS CARDS ───────── */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">Last Backup</p>
                  <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">
                    {status?.lastBackupTime
                      ? new Date(status.lastBackupTime).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })
                      : 'Never'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-[#F97316]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">Next Scheduled</p>
                  <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">
                    {status?.nextScheduled ?? 'Manual only'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-[#0A5ED7]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">Storage Used</p>
                  <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">
                    {formatFileSize(status?.storageUsed ?? 0)}
                  </p>
                </div>
                <HardDrive className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">Total Backups</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">
                    {status?.backupCount ?? 0}
                  </p>
                </div>
                <Database className="h-8 w-8 text-[#0A5ED7]" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ───────── CREATE BACKUP + HISTORY ───────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Create Backup */}
          <Card className="lg:col-span-1 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#0A5ED7]" />
                Create Backup
              </CardTitle>
              <CardDescription className="text-[#64748B]">
                Snapshot all key tables (users, vehicles, job cards, invoices, appointments, parts, inventory)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
                onClick={handleCreateBackup}
                disabled={isCreating || createBackupMutation.isPending}
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Create Backup Now
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Backup History */}
          <Card className="lg:col-span-2 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#64748B]" />
                  Backup History
                </CardTitle>
                <CardDescription className="text-[#64748B]">
                  Previous backup snapshots
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetchBackups()}
                className="border-[#E2E8F0] dark:border-[#232A36]"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {loadingBackups ? (
                <div className="flex items-center justify-center h-32">
                  <RefreshCw className="h-8 w-8 animate-spin text-[#64748B]" />
                </div>
              ) : backups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-[#64748B]">
                  <Database className="h-12 w-12 mb-4 opacity-50" />
                  <p>No backups yet. Create your first backup above.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                        <TableHead className="text-[#64748B]">Date</TableHead>
                        <TableHead className="text-[#64748B]">Type</TableHead>
                        <TableHead className="text-[#64748B]">Records</TableHead>
                        <TableHead className="text-[#64748B]">Size</TableHead>
                        <TableHead className="text-[#64748B] text-right">Download</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.map((backup) => (
                        <TableRow key={backup.id} className="border-[#E2E8F0] dark:border-[#232A36]">
                          <TableCell className="text-[#0B1F3B] dark:text-white">
                            {new Date(backup.createdAt).toLocaleString('en', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              {backup.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-[#64748B]">{backup.totalRecords.toLocaleString()}</TableCell>
                          <TableCell className="text-[#64748B]">{formatFileSize(backup.size)}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#E2E8F0] dark:border-[#232A36]"
                              onClick={() => {
                                // Export all data as a combined JSON download
                                toast({ title: 'Tip', description: 'Use the Export Data section below to download specific data sets.' });
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ───────── EXPORT DATA ───────── */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <Download className="h-5 w-5 text-[#0A5ED7]" />
              Export Data
            </CardTitle>
            <CardDescription className="text-[#64748B]">
              Download data as CSV spreadsheets or JSON files
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {exportTypes.map((et) => {
                const Icon = et.icon;
                return (
                  <div
                    key={et.id}
                    className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-[#0A5ED7]/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-[#0A5ED7]" />
                      </div>
                      <div>
                        <p className="font-medium text-[#0B1F3B] dark:text-white">{et.label}</p>
                        <p className="text-xs text-[#64748B]">{et.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#E2E8F0] dark:border-[#232A36]"
                        onClick={() => downloadFile(`/api/export/csv/${et.id}`)}
                      >
                        <FileSpreadsheet className="h-4 w-4 mr-1" />
                        CSV
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 border-[#E2E8F0] dark:border-[#232A36]"
                        onClick={() => downloadFile(`/api/backup/export/${et.id}`)}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        JSON
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* ───────── REPORTS ───────── */}
        <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
          <CardHeader>
            <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
              <Printer className="h-5 w-5 text-[#0A5ED7]" />
              Reports
            </CardTitle>
            <CardDescription className="text-[#64748B]">
              Generate printer-friendly HTML reports from live data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {reportTypes.map((rt) => {
                const Icon = rt.icon;
                return (
                  <div
                    key={rt.id}
                    className="border border-[#E2E8F0] dark:border-[#232A36] rounded-lg p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-[#0B1F3B] dark:text-white">{rt.label}</p>
                        <p className="text-xs text-[#64748B]">{rt.description}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-[#E2E8F0] dark:border-[#232A36]"
                      onClick={() => window.open(`/api/export/report/${rt.id}`, '_blank')}
                    >
                      <Printer className="h-4 w-4 mr-1" />
                      Generate Report
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </StandardPageLayout>
  );
}
