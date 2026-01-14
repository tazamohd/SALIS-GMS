import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { StandardPageLayout } from '@/components/layouts/StandardPageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Database, 
  Download, 
  Upload, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  HardDrive,
  Calendar,
  Trash2,
  RefreshCw,
  Shield,
  Settings
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type BackupJob = {
  id: string;
  garageId: string;
  jobType: string;
  status: string;
  fileName: string | null;
  fileSize: number | null;
  dataTypes: any;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  createdBy: string | null;
  createdAt: string;
};

type BackupStats = {
  totalBackups: number;
  completedBackups: number;
  failedBackups: number;
  totalStorageUsed: number;
  lastBackupDate: string | null;
};

const dataTypeOptions = [
  { id: 'all', label: 'All Data', description: 'Complete system backup' },
  { id: 'customers', label: 'Customers', description: 'Customer profiles and history' },
  { id: 'vehicles', label: 'Vehicles', description: 'Vehicle records and service history' },
  { id: 'job_cards', label: 'Job Cards', description: 'Work orders and repairs' },
  { id: 'inventory', label: 'Inventory', description: 'Parts and stock levels' },
  { id: 'financial', label: 'Financial', description: 'Invoices and payments' },
  { id: 'settings', label: 'Settings', description: 'System configuration' },
];

export default function DataBackup() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['all']);
  const [backupType, setBackupType] = useState('full');
  const [schedule, setSchedule] = useState('manual');
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  const { data: backups = [], isLoading: loadingBackups, refetch: refetchBackups } = useQuery<BackupJob[]>({
    queryKey: ['/api/backups'],
  });

  const { data: stats, isLoading: loadingStats } = useQuery<BackupStats>({
    queryKey: ['/api/backups/stats'],
  });

  const { data: latestBackup } = useQuery<BackupJob | null>({
    queryKey: ['/api/backups/latest'],
  });

  const [activeBackupId, setActiveBackupId] = useState<string | null>(null);

  const { data: activeBackupStatus } = useQuery<BackupJob>({
    queryKey: ['/api/backups/status', activeBackupId] as const,
    queryFn: async ({ queryKey }) => {
      const backupId = queryKey[1];
      if (!backupId) throw new Error('No backup ID');
      const response = await fetch(`/api/backups/${backupId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch backup status');
      return response.json();
    },
    enabled: !!activeBackupId && isCreatingBackup,
    refetchInterval: isCreatingBackup ? 2000 : false,
  });

  useEffect(() => {
    if (activeBackupStatus && isCreatingBackup) {
      if (activeBackupStatus.status === 'completed') {
        setIsCreatingBackup(false);
        setActiveBackupId(null);
        queryClient.invalidateQueries({ queryKey: ['/api/backups'] });
        queryClient.invalidateQueries({ queryKey: ['/api/backups/stats'] });
        toast({
          title: t('backup.success', 'Backup Completed'),
          description: t('backup.successDesc', 'Your data has been backed up successfully.'),
        });
      } else if (activeBackupStatus.status === 'failed') {
        setIsCreatingBackup(false);
        setActiveBackupId(null);
        toast({
          title: t('backup.failed', 'Backup Failed'),
          description: activeBackupStatus.errorMessage || t('backup.failedDesc', 'Failed to create backup. Please try again.'),
          variant: "destructive",
        });
      }
    }
  }, [activeBackupStatus, isCreatingBackup, t, toast]);

  const createBackupMutation = useMutation({
    mutationFn: async (data: { jobType: string; dataTypes: string[] }) => {
      return apiRequest('/api/backups', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: (response: any) => {
      setIsCreatingBackup(true);
      if (response?.id) {
        setActiveBackupId(response.id);
      }
      toast({
        title: t('backup.started', 'Backup Started'),
        description: t('backup.startedDesc', 'Your backup is being created. This may take a few moments.'),
      });
      refetchBackups();
    },
    onError: () => {
      toast({
        title: t('backup.failed', 'Backup Failed'),
        description: t('backup.failedDesc', 'Failed to create backup. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const [isRestoring, setIsRestoring] = useState(false);
  const [activeRestoreId, setActiveRestoreId] = useState<string | null>(null);

  const { data: activeRestoreStatus } = useQuery<BackupJob>({
    queryKey: ['/api/backups/restore-status', activeRestoreId] as const,
    queryFn: async ({ queryKey }) => {
      const restoreId = queryKey[1];
      if (!restoreId) throw new Error('No restore ID');
      const response = await fetch(`/api/backups/${restoreId}`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch restore status');
      return response.json();
    },
    enabled: !!activeRestoreId && isRestoring,
    refetchInterval: isRestoring ? 2000 : false,
  });

  useEffect(() => {
    if (activeRestoreStatus && isRestoring) {
      if (activeRestoreStatus.status === 'completed') {
        setIsRestoring(false);
        setActiveRestoreId(null);
        queryClient.invalidateQueries({ queryKey: ['/api/backups'] });
        toast({
          title: t('backup.restoreSuccess', 'Restore Completed'),
          description: t('backup.restoreSuccessDesc', 'Your data has been restored successfully.'),
        });
      } else if (activeRestoreStatus.status === 'failed') {
        setIsRestoring(false);
        setActiveRestoreId(null);
        toast({
          title: t('backup.restoreFailed', 'Restore Failed'),
          description: activeRestoreStatus.errorMessage || t('backup.restoreFailedDesc', 'Failed to restore backup. Please try again.'),
          variant: "destructive",
        });
      }
    }
  }, [activeRestoreStatus, isRestoring, t, toast]);

  const restoreBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      return apiRequest(`/api/backups/${backupId}/restore`, {
        method: 'POST',
      });
    },
    onSuccess: (response: any) => {
      setIsRestoring(true);
      if (response?.id) {
        setActiveRestoreId(response.id);
      }
      toast({
        title: t('backup.restoreStarted', 'Restore Started'),
        description: t('backup.restoreStartedDesc', 'Data restoration is in progress. This may take a few moments.'),
      });
      refetchBackups();
    },
    onError: () => {
      toast({
        title: t('backup.restoreFailed', 'Restore Failed'),
        description: t('backup.restoreFailedDesc', 'Failed to restore backup. Please try again.'),
        variant: "destructive",
      });
    },
  });

  const deleteBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      return apiRequest(`/api/backups/${backupId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/backups'] });
      queryClient.invalidateQueries({ queryKey: ['/api/backups/stats'] });
      toast({
        title: t('dataBackup.backupDeleted', 'تم حذف النسخة الاحتياطية'),
        description: t('dataBackup.backupRemoved', 'تمت إزالة النسخة الاحتياطية.'),
      });
    },
    onError: () => {
      toast({
        title: t('dataBackup.deleteFailed', 'فشل الحذف'),
        description: t('dataBackup.deleteFailedDesc', 'فشل في حذف النسخة الاحتياطية. يرجى المحاولة مرة أخرى.'),
        variant: "destructive",
      });
    },
  });

  const handleDataTypeToggle = (dataType: string) => {
    if (dataType === 'all') {
      setSelectedDataTypes(['all']);
    } else {
      const newSelection = selectedDataTypes.filter(dt => dt !== 'all');
      if (selectedDataTypes.includes(dataType)) {
        setSelectedDataTypes(newSelection.filter(dt => dt !== dataType));
      } else {
        setSelectedDataTypes([...newSelection, dataType]);
      }
    }
  };

  const handleCreateBackup = () => {
    createBackupMutation.mutate({
      jobType: backupType,
      dataTypes: selectedDataTypes,
    });
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return 'N/A';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"><CheckCircle className="w-3 h-3 mr-1" />{t('dataBackup.completed', 'مكتمل')}</Badge>;
      case 'pending':
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"><Clock className="w-3 h-3 mr-1" />{t('dataBackup.inProgress', 'قيد التنفيذ')}</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"><XCircle className="w-3 h-3 mr-1" />{t('dataBackup.failed', 'فشل')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <StandardPageLayout
      title={t('backup.title', 'Data Backup & Restore')}
      description={t('backup.description', 'Manage automated backups and restore your data')}
      icon={Database}
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="stat-total-backups">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">{t('backup.totalBackups', 'Total Backups')}</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{stats?.totalBackups || 0}</p>
                </div>
                <Database className="h-8 w-8 text-[#0A5ED7]" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="stat-completed-backups">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">{t('dataBackup.completed', 'مكتمل')}</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats?.completedBackups || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="stat-storage-used">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">{t('backup.storageUsed', 'Storage Used')}</p>
                  <p className="text-2xl font-bold text-[#0B1F3B] dark:text-white">{formatFileSize(stats?.totalStorageUsed || 0)}</p>
                </div>
                <HardDrive className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="stat-last-backup">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">{t('backup.lastBackup', 'Last Backup')}</p>
                  <p className="text-lg font-bold text-[#0B1F3B] dark:text-white">
                    {stats?.lastBackupDate ? format(new Date(stats.lastBackupDate), 'MMM dd, yyyy') : 'Never'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-[#F97316]" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-create-backup">
            <CardHeader>
              <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-[#0A5ED7]" />
                {t('backup.createBackup', 'Create Backup')}
              </CardTitle>
              <CardDescription className="text-[#64748B]">
                {t('dataBackup.configureCreateBackup', 'تكوين وإنشاء نسخة احتياطية جديدة')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-[#0B1F3B] dark:text-white">{t('backup.backupType', 'Backup Type')}</Label>
                <Select value={backupType} onValueChange={setBackupType}>
                  <SelectTrigger className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-backup-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    <SelectItem value="full">{t('backup.fullBackup', 'Full Backup')}</SelectItem>
                    <SelectItem value="incremental">{t('backup.incrementalBackup', 'Incremental Backup')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#0B1F3B] dark:text-white">{t('backup.schedule', 'Schedule')}</Label>
                <Select value={schedule} onValueChange={setSchedule}>
                  <SelectTrigger className="mt-1 bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-schedule">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                    <SelectItem value="manual">Manual Only</SelectItem>
                    <SelectItem value="daily">{t('backup.daily', 'Daily')}</SelectItem>
                    <SelectItem value="weekly">{t('backup.weekly', 'Weekly')}</SelectItem>
                    <SelectItem value="monthly">{t('backup.monthly', 'Monthly')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#0B1F3B] dark:text-white mb-2 block">{t('backup.selectData', 'Select Data')}</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {dataTypeOptions.map((option) => (
                    <div 
                      key={option.id} 
                      className="flex items-start space-x-2 p-2 rounded-md hover:bg-[#F8FAFC] dark:hover:bg-[#0E1117]"
                    >
                      <Checkbox
                        id={option.id}
                        checked={selectedDataTypes.includes(option.id)}
                        onCheckedChange={() => handleDataTypeToggle(option.id)}
                        className="mt-0.5"
                        data-testid={`checkbox-${option.id}`}
                      />
                      <div className="flex-1">
                        <Label htmlFor={option.id} className="text-sm font-medium text-[#0B1F3B] dark:text-white cursor-pointer">
                          {option.label}
                        </Label>
                        <p className="text-xs text-[#64748B]">{option.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Button 
                className="w-full bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white" 
                onClick={handleCreateBackup}
                disabled={createBackupMutation.isPending || isCreatingBackup || selectedDataTypes.length === 0}
                data-testid="button-create-backup"
              >
                {isCreatingBackup ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    {t('backup.backupInProgress', 'Backup in Progress...')}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {t('backup.createBackup', 'Create Backup')}
                  </>
                )}
              </Button>

              {isCreatingBackup && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-[#64748B]">
                    <span>Creating backup...</span>
                    <span>Please wait</span>
                  </div>
                  <Progress value={66} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-backup-history">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-[#0B1F3B] dark:text-white flex items-center gap-2">
                  <Clock className="h-5 w-5 text-[#64748B]" />
                  {t('backup.backupHistory', 'Backup History')}
                </CardTitle>
                <CardDescription className="text-[#64748B]">
                  View and manage your backup archives
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetchBackups()}
                className="border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="button-refresh-backups"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {loadingBackups ? (
                <div className="flex items-center justify-center h-48">
                  <RefreshCw className="h-8 w-8 animate-spin text-[#64748B]" />
                </div>
              ) : backups.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-[#64748B]">
                  <Database className="h-12 w-12 mb-4 opacity-50" />
                  <p>{t('backup.noBackups', 'No backups found')}</p>
                  <p className="text-sm">Create your first backup to protect your data</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                        <TableHead className="text-[#64748B]">Type</TableHead>
                        <TableHead className="text-[#64748B]">Status</TableHead>
                        <TableHead className="text-[#64748B]">Size</TableHead>
                        <TableHead className="text-[#64748B]">Date</TableHead>
                        <TableHead className="text-[#64748B] text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {backups.map((backup) => (
                        <TableRow key={backup.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`backup-row-${backup.id}`}>
                          <TableCell className="text-[#0B1F3B] dark:text-white font-medium">
                            {backup.jobType === 'restore' ? (
                              <span className="flex items-center gap-2">
                                <Upload className="h-4 w-4 text-purple-500" />
                                Restore
                              </span>
                            ) : (
                              <span className="flex items-center gap-2">
                                <Download className="h-4 w-4 text-[#0A5ED7]" />
                                {backup.jobType === 'full' ? 'Full' : 'Incremental'}
                              </span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(backup.status)}</TableCell>
                          <TableCell className="text-[#64748B]">
                            {formatFileSize(backup.fileSize)}
                          </TableCell>
                          <TableCell className="text-[#64748B]">
                            {backup.completedAt 
                              ? format(new Date(backup.completedAt), 'MMM dd, yyyy HH:mm')
                              : format(new Date(backup.createdAt), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              {backup.status === 'completed' && backup.jobType !== 'restore' && (
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      className="border-[#E2E8F0] dark:border-[#232A36]"
                                      data-testid={`button-restore-${backup.id}`}
                                    >
                                      <Upload className="h-4 w-4 mr-1" />
                                      Restore
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                                    <AlertDialogHeader>
                                      <AlertDialogTitle className="text-[#0B1F3B] dark:text-white">Restore Backup?</AlertDialogTitle>
                                      <AlertDialogDescription className="text-[#64748B]">
                                        This will restore your data to the state when this backup was created. 
                                        Current data may be overwritten.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel className="border-[#E2E8F0] dark:border-[#232A36]">Cancel</AlertDialogCancel>
                                      <AlertDialogAction 
                                        onClick={() => restoreBackupMutation.mutate(backup.id)}
                                        className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                                      >
                                        Restore
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              )}
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 border-[#E2E8F0] dark:border-[#232A36]"
                                    data-testid={`button-delete-${backup.id}`}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                                  <AlertDialogHeader>
                                    <AlertDialogTitle className="text-[#0B1F3B] dark:text-white">Delete Backup?</AlertDialogTitle>
                                    <AlertDialogDescription className="text-[#64748B]">
                                      This action cannot be undone. This backup will be permanently deleted.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel className="border-[#E2E8F0] dark:border-[#232A36]">Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteBackupMutation.mutate(backup.id)}
                                      className="bg-red-600 hover:bg-red-700 text-white"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
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
      </div>
    </StandardPageLayout>
  );
}
