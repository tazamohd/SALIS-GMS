import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, Lock, Database, FileText, UserCheck, Key, Download, Upload, AlertTriangle, CheckCircle, Clock, Copy } from "lucide-react";
import { format } from "date-fns";
import { TabsPageLayout } from "@/components/layouts";

export default function Security() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("2fa");

  const tabs = [
    {
      id: "2fa",
      label: t('security.2fa', '2FA'),
      icon: Lock,
      content: <TwoFactorAuthTab />,
    },
    {
      id: "audit",
      label: t('security.auditLogs', 'Audit Logs'),
      icon: FileText,
      content: <AuditLogsTab />,
    },
    {
      id: "backup",
      label: t('security.backup', 'Backup'),
      icon: Database,
      content: <BackupRestoreTab />,
    },
    {
      id: "gdpr",
      label: t('security.gdpr', 'GDPR'),
      icon: UserCheck,
      content: <GDPRTab />,
    },
    {
      id: "consents",
      label: t('security.consents', 'Consents'),
      icon: CheckCircle,
      content: <ConsentsTab />,
    },
    {
      id: "permissions",
      label: t('security.permissions', 'Permissions'),
      icon: Key,
      content: <PermissionsTab />,
    },
  ];

  return (
    <TabsPageLayout
      title={t('security.title', 'Security & Compliance')}
      description={t('security.description', 'Manage security settings and compliance features')}
      icon={Shield}
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}

function TwoFactorAuthTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [setupData, setSetupData] = useState<any>(null);

  const { data: status } = useQuery<{ enabled: boolean; backupCodesCount: number }>({
    queryKey: ['/api/security/2fa/status'],
  });

  const setupMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/security/2fa/setup');
      return res.json();
    },
    onSuccess: (data) => {
      setSetupData(data);
      toast({ title: t('security.2faSetupInitiated', '2FA Setup Initiated'), description: t('security.scanQRCode', 'Scan the QR code with your authenticator app') });
    },
    onError: (error: any) => {
      toast({ title: t('security.setupFailed', 'Setup Failed'), description: error.message, variant: "destructive" });
    },
  });

  const enableMutation = useMutation({
    mutationFn: (token: string) => apiRequest('POST', '/api/security/2fa/enable', { token }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/2fa/status'] });
      setSetupData(null);
      setVerificationCode("");
      toast({ title: t('security.2faEnabled', '2FA Enabled'), description: t('security.2faIsNowActive', 'Two-factor authentication is now active') });
    },
    onError: (error: any) => {
      toast({ title: t('security.verificationFailed', 'Verification Failed'), description: error.message, variant: "destructive" });
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => apiRequest('DELETE', '/api/security/2fa'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/2fa/status'] });
      toast({ title: t('security.2faDisabled', '2FA Disabled'), description: t('security.2faHasBeenDisabled', 'Two-factor authentication has been disabled') });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: t('common.copied', 'Copied'), description: t('common.copiedToClipboard', 'Copied to clipboard') });
  };

  return (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-2fa">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('security.twoFactorAuth', 'Two-Factor Authentication (2FA)')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('security.addExtraLayerSecurity', 'Add an extra layer of security to your account')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.enabled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-900/30">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-[#0B1F3B] dark:text-white">{t('security.2faIsActive', '2FA is Active')}</p>
                  <p className="text-sm text-[#64748B]">
                    {t('security.backupCodesRemaining', 'Backup codes remaining')}: {status.backupCodesCount}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => disableMutation.mutate()}
                disabled={disableMutation.isPending}
                className="border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="button-disable-2fa"
              >
                {t('security.disable2fa', 'Disable 2FA')}
              </Button>
            </div>
          </div>
        ) : setupData ? (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg">
              <img src={setupData.qrCodeUrl} alt={t('security.2faQRCode', '2FA QR Code')} className="w-64 h-64" data-testid="img-qr-code" />
            </div>
            
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('security.manualEntryKey', 'Manual Entry Key')}</Label>
              <div className="flex gap-2">
                <Input value={setupData.secret} readOnly className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="input-secret-key" />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(setupData.secret)}
                  className="border-[#E2E8F0] dark:border-[#232A36]"
                  data-testid="button-copy-secret"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('security.backupCodes', 'Backup Codes (Save these securely)')}</Label>
              <div className="grid grid-cols-2 gap-2 p-3 bg-[#F8FAFC] dark:bg-[#0E1117] rounded-lg border border-[#E2E8F0] dark:border-[#232A36]">
                {setupData.backupCodes.map((code: string, i: number) => (
                  <code key={i} className="text-sm text-[#0B1F3B] dark:text-white" data-testid={`text-backup-code-${i}`}>{code}</code>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(setupData.backupCodes.join('\n'))}
                className="border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="button-copy-backup-codes"
              >
                <Copy className="h-4 w-4 mr-2" />
                {t('security.copyAllCodes', 'Copy All Codes')}
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('security.verificationCode', 'Verification Code')}</Label>
              <Input 
                placeholder={t('security.enter6DigitCode', 'Enter 6-digit code from your app')}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-verification-code"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => enableMutation.mutate(verificationCode)}
                disabled={!verificationCode || enableMutation.isPending}
                className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
                data-testid="button-verify-enable"
              >
                {t('security.verifyAndEnable', 'Verify & Enable')}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setSetupData(null);
                  setVerificationCode("");
                }}
                className="border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="button-cancel-setup"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[#64748B]">
              {t('security.2faDescription', 'Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app.')}
            </p>
            <Button 
              onClick={() => setupMutation.mutate()}
              disabled={setupMutation.isPending}
              className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
              data-testid="button-setup-2fa"
            >
              <Lock className="h-4 w-4 mr-2" />
              {t('security.setup2fa', 'Setup 2FA')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AuditLogsTab() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    resourceType: 'all',
    action: 'all',
    startDate: '',
    endDate: '',
  });

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['/api/security/audit-logs', filters],
    queryFn: () => {
      const params = new URLSearchParams();
      if (filters.resourceType) params.append('resourceType', filters.resourceType);
      if (filters.action) params.append('action', filters.action);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      return fetch(`/api/security/audit-logs?${params}`).then(r => r.json());
    },
  });

  return (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-audit-logs">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('security.auditLogs', 'Audit Logs')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('security.trackAllSystemActivities', 'Track all system activities and changes')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('security.resourceType', 'Resource Type')}</Label>
            <Select value={filters.resourceType} onValueChange={(value) => setFilters({...filters, resourceType: value === 'all' ? '' : value})}>
              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-resource-type">
                <SelectValue placeholder={t('common.all', 'All')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                <SelectItem value="job_card">{t('security.jobCards', 'Job Cards')}</SelectItem>
                <SelectItem value="customer">{t('security.customers', 'Customers')}</SelectItem>
                <SelectItem value="invoice">{t('security.invoices', 'Invoices')}</SelectItem>
                <SelectItem value="payment">{t('security.payments', 'Payments')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('security.action', 'Action')}</Label>
            <Select value={filters.action} onValueChange={(value) => setFilters({...filters, action: value === 'all' ? '' : value})}>
              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-action">
                <SelectValue placeholder={t('common.all', 'All')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                <SelectItem value="create">{t('common.create', 'Create')}</SelectItem>
                <SelectItem value="update">{t('common.update', 'Update')}</SelectItem>
                <SelectItem value="delete">{t('common.delete', 'Delete')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('security.startDate', 'Start Date')}</Label>
            <Input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              data-testid="input-start-date"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('security.endDate', 'End Date')}</Label>
            <Input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              data-testid="input-end-date"
            />
          </div>
        </div>

        <div className="rounded-md border border-[#E2E8F0] dark:border-[#232A36]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('security.timestamp', 'Timestamp')}</TableHead>
                <TableHead className="text-[#64748B]">{t('security.action', 'Action')}</TableHead>
                <TableHead className="text-[#64748B]">{t('security.resource', 'Resource')}</TableHead>
                <TableHead className="text-[#64748B]">{t('security.user', 'User')}</TableHead>
                <TableHead className="text-[#64748B]">{t('security.ipAddress', 'IP Address')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#64748B]">{t('common.loading', 'Loading...')}</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#64748B]">
                    {t('security.noAuditLogsFound', 'No audit logs found')}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-audit-log-${log.id}`}>
                    <TableCell className="text-[#0B1F3B] dark:text-white">{format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">{log.action}</Badge>
                    </TableCell>
                    <TableCell className="text-[#64748B]">{log.resourceType}</TableCell>
                    <TableCell className="text-[#64748B]">{log.userId}</TableCell>
                    <TableCell className="text-[#64748B]">{log.ipAddress || t('common.notAvailable', 'N/A')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function BackupRestoreTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [backupType, setBackupType] = useState('full');

  const { data: backups = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/security/backups'],
  });

  const createBackupMutation = useMutation({
    mutationFn: (type: string) => apiRequest('POST', '/api/security/backups', { type, includeAttachments: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/backups'] });
      toast({ title: t('security.backupStarted', 'Backup Started'), description: t('security.backupInProgress', 'Your data backup is in progress') });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => apiRequest('POST', `/api/security/backups/${id}/restore`),
    onSuccess: () => {
      toast({ title: t('security.restoreInitiated', 'Restore Initiated'), description: t('security.dataBeingRestored', 'Your data is being restored') });
    },
  });

  return (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-backup">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('security.backupRestore', 'Backup & Restore')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('security.createAndManageBackups', 'Create and manage data backups')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('security.backupType', 'Backup Type')}</Label>
            <Select value={backupType} onValueChange={setBackupType}>
              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-backup-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="full">{t('security.fullBackup', 'Full Backup')}</SelectItem>
                <SelectItem value="incremental">{t('security.incremental', 'Incremental')}</SelectItem>
                <SelectItem value="database">{t('security.databaseOnly', 'Database Only')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => createBackupMutation.mutate(backupType)}
            disabled={createBackupMutation.isPending}
            className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
            data-testid="button-create-backup"
          >
            <Database className="h-4 w-4 mr-2" />
            {t('security.createBackup', 'Create Backup')}
          </Button>
        </div>

        <div className="rounded-md border border-[#E2E8F0] dark:border-[#232A36]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('security.created', 'Created')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.type', 'Type')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-[#64748B]">{t('security.size', 'Size')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#64748B]">{t('common.loading', 'Loading...')}</TableCell>
                </TableRow>
              ) : backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#64748B]">
                    {t('security.noBackupsFound', 'No backups found')}
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup: any) => (
                  <TableRow key={backup.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-backup-${backup.id}`}>
                    <TableCell className="text-[#0B1F3B] dark:text-white">{format(new Date(backup.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell><Badge className="bg-[#F8FAFC] dark:bg-[#232A36] text-[#64748B]">{backup.type}</Badge></TableCell>
                    <TableCell>
                      <Badge className={backup.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : backup.status === 'failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-[#F8FAFC] dark:bg-[#232A36] text-[#64748B]'}>
                        {backup.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#64748B]">{backup.size ? `${(backup.size / 1024 / 1024).toFixed(2)} MB` : t('common.notAvailable', 'N/A')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {backup.status === 'completed' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => restoreMutation.mutate(backup.id)}
                              disabled={restoreMutation.isPending}
                              className="border-[#E2E8F0] dark:border-[#232A36]"
                              data-testid={`button-restore-${backup.id}`}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              {t('security.restore', 'Restore')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="border-[#E2E8F0] dark:border-[#232A36]"
                              data-testid={`button-download-${backup.id}`}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              {t('common.download', 'Download')}
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function GDPRTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [requestType, setRequestType] = useState('export');
  const [dataSubjectId, setDataSubjectId] = useState('');
  const [reason, setReason] = useState('');

  const { data: requests = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/security/gdpr/requests'],
  });

  const createRequestMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/security/gdpr/requests', { requestType, dataSubjectId, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/gdpr/requests'] });
      setDataSubjectId('');
      setReason('');
      toast({ title: t('security.gdprRequestCreated', 'GDPR Request Created'), description: t('security.requestQueuedForProcessing', 'The request has been queued for processing') });
    },
  });

  return (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-gdpr">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('security.gdprCompliance', 'GDPR Compliance')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('security.manageDataSubjectRights', 'Manage data subject rights requests')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('security.requestType', 'Request Type')}</Label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-request-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="export">{t('security.dataExport', 'Data Export')}</SelectItem>
                  <SelectItem value="deletion">{t('security.dataDeletion', 'Data Deletion')}</SelectItem>
                  <SelectItem value="rectification">{t('security.dataRectification', 'Data Rectification')}</SelectItem>
                  <SelectItem value="restriction">{t('security.processingRestriction', 'Processing Restriction')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('security.dataSubjectId', 'Data Subject ID')}</Label>
              <Input 
                placeholder={t('security.customerUserId', 'Customer/User ID')}
                value={dataSubjectId}
                onChange={(e) => setDataSubjectId(e.target.value)}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-subject-id"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('security.reasonOptional', 'Reason (Optional)')}</Label>
            <Textarea 
              placeholder={t('security.reasonForRequest', 'Reason for this request...')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              data-testid="textarea-reason"
            />
          </div>

          <Button 
            onClick={() => createRequestMutation.mutate()}
            disabled={!dataSubjectId || createRequestMutation.isPending}
            className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
            data-testid="button-create-request"
          >
            {t('security.createRequest', 'Create Request')}
          </Button>
        </div>

        <div className="rounded-md border border-[#E2E8F0] dark:border-[#232A36]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('security.created', 'Created')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.type', 'Type')}</TableHead>
                <TableHead className="text-[#64748B]">{t('security.subjectId', 'Subject ID')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.completed', 'Completed')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#64748B]">{t('common.loading', 'Loading...')}</TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#64748B]">
                    {t('security.noGdprRequestsFound', 'No GDPR requests found')}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request: any) => (
                  <TableRow key={request.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-gdpr-${request.id}`}>
                    <TableCell className="text-[#0B1F3B] dark:text-white">{format(new Date(request.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell><Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36]">{request.requestType}</Badge></TableCell>
                    <TableCell className="text-[#64748B]">{request.userId}</TableCell>
                    <TableCell>
                      <Badge className={request.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-[#F8FAFC] dark:bg-[#232A36] text-[#64748B]'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#64748B]">
                      {request.completedAt ? format(new Date(request.completedAt), 'MMM d, yyyy') : '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function ConsentsTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [consentType, setConsentType] = useState('');
  const [granted, setGranted] = useState(true);

  const { data: consents = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/security/consents'],
  });

  const createConsentMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/security/consents', { consentType, granted }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/consents'] });
      setConsentType('');
      toast({ title: t('security.consentRecorded', 'Consent Recorded'), description: t('security.consentPreferenceSaved', 'Your consent preference has been saved') });
    },
  });

  return (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-consents">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('security.userConsents', 'User Consents')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('security.manageConsentPreferences', 'Manage user consent preferences')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('security.consentType', 'Consent Type')}</Label>
            <Select value={consentType} onValueChange={setConsentType}>
              <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-consent-type">
                <SelectValue placeholder={t('security.selectConsentType', 'Select consent type')} />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                <SelectItem value="marketing">{t('security.marketingCommunications', 'Marketing Communications')}</SelectItem>
                <SelectItem value="analytics">{t('security.analyticsTracking', 'Analytics & Tracking')}</SelectItem>
                <SelectItem value="data_processing">{t('security.dataProcessing', 'Data Processing')}</SelectItem>
                <SelectItem value="third_party_sharing">{t('security.thirdPartyDataSharing', 'Third-Party Data Sharing')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('security.granted', 'Granted')}</Label>
            <Switch 
              checked={granted} 
              onCheckedChange={setGranted}
              data-testid="switch-granted"
            />
          </div>

          <Button 
            onClick={() => createConsentMutation.mutate()}
            disabled={!consentType || createConsentMutation.isPending}
            className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
            data-testid="button-record-consent"
          >
            {t('security.recordConsent', 'Record Consent')}
          </Button>
        </div>

        <div className="rounded-md border border-[#E2E8F0] dark:border-[#232A36]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('common.type', 'Type')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-[#64748B]">{t('security.grantedAt', 'Granted At')}</TableHead>
                <TableHead className="text-[#64748B]">{t('security.ipAddress', 'IP Address')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[#64748B]">{t('common.loading', 'Loading...')}</TableCell>
                </TableRow>
              ) : consents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-[#64748B]">
                    {t('security.noConsentRecordsFound', 'No consent records found')}
                  </TableCell>
                </TableRow>
              ) : (
                consents.map((consent: any) => (
                  <TableRow key={consent.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-consent-${consent.id}`}>
                    <TableCell className="text-[#0B1F3B] dark:text-white">{consent.consentType}</TableCell>
                    <TableCell>
                      <Badge className={consent.granted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-[#F8FAFC] dark:bg-[#232A36] text-[#64748B]'}>
                        {consent.granted ? t('security.granted', 'Granted') : t('security.denied', 'Denied')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#64748B]">{format(new Date(consent.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell className="text-[#64748B]">{consent.ipAddress || t('common.notAvailable', 'N/A')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

function PermissionsTab() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [permission, setPermission] = useState('');
  const [granted, setGranted] = useState(true);
  const [reason, setReason] = useState('');

  const { data: overrides = [], isLoading } = useQuery<any[]>({
    queryKey: ['/api/security/permissions/overrides'],
  });

  const createOverrideMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/security/permissions/overrides', { userId, permission, granted, reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/permissions/overrides'] });
      setUserId('');
      setPermission('');
      setReason('');
      toast({ title: t('security.permissionOverrideCreated', 'Permission Override Created'), description: t('security.permissionUpdated', 'The permission has been updated') });
    },
  });

  const deleteOverrideMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/security/permissions/overrides/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/permissions/overrides'] });
      toast({ title: t('security.overrideRemoved', 'Override Removed'), description: t('security.permissionOverrideDeleted', 'Permission override has been deleted') });
    },
  });

  return (
    <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]" data-testid="card-permissions">
      <CardHeader>
        <CardTitle className="text-[#0B1F3B] dark:text-white">{t('security.permissionOverrides', 'Permission Overrides')}</CardTitle>
        <CardDescription className="text-[#64748B]">{t('security.grantOrRestrictPermissions', 'Grant or restrict specific permissions for users')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('security.userId', 'User ID')}</Label>
              <Input 
                placeholder={t('security.enterUserId', 'Enter user ID')}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
                data-testid="input-user-id"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-[#0B1F3B] dark:text-white">{t('security.permission', 'Permission')}</Label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]" data-testid="select-permission">
                  <SelectValue placeholder={t('security.selectPermission', 'Select permission')} />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <SelectItem value="view_financial">{t('security.viewFinancialData', 'View Financial Data')}</SelectItem>
                  <SelectItem value="edit_customers">{t('security.editCustomers', 'Edit Customers')}</SelectItem>
                  <SelectItem value="delete_records">{t('security.deleteRecords', 'Delete Records')}</SelectItem>
                  <SelectItem value="manage_users">{t('security.manageUsers', 'Manage Users')}</SelectItem>
                  <SelectItem value="export_data">{t('security.exportData', 'Export Data')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end gap-2">
              <div className="flex items-center gap-2">
                <Label className="text-[#0B1F3B] dark:text-white">{t('security.granted', 'Granted')}</Label>
                <Switch 
                  checked={granted} 
                  onCheckedChange={setGranted}
                  data-testid="switch-permission-granted"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-[#0B1F3B] dark:text-white">{t('security.reason', 'Reason')}</Label>
            <Textarea 
              placeholder={t('security.reasonForOverride', 'Reason for this override...')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="bg-white dark:bg-[#0E1117] border-[#E2E8F0] dark:border-[#232A36]"
              data-testid="textarea-override-reason"
            />
          </div>

          <Button 
            onClick={() => createOverrideMutation.mutate()}
            disabled={!userId || !permission || createOverrideMutation.isPending}
            className="bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white"
            data-testid="button-create-override"
          >
            {t('security.createOverride', 'Create Override')}
          </Button>
        </div>

        <div className="rounded-md border border-[#E2E8F0] dark:border-[#232A36]">
          <Table>
            <TableHeader>
              <TableRow className="border-[#E2E8F0] dark:border-[#232A36]">
                <TableHead className="text-[#64748B]">{t('security.user', 'User')}</TableHead>
                <TableHead className="text-[#64748B]">{t('security.permission', 'Permission')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.status', 'Status')}</TableHead>
                <TableHead className="text-[#64748B]">{t('security.reason', 'Reason')}</TableHead>
                <TableHead className="text-[#64748B]">{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#64748B]">{t('common.loading', 'Loading...')}</TableCell>
                </TableRow>
              ) : overrides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-[#64748B]">
                    {t('security.noOverridesFound', 'No permission overrides found')}
                  </TableCell>
                </TableRow>
              ) : (
                overrides.map((override: any) => (
                  <TableRow key={override.id} className="border-[#E2E8F0] dark:border-[#232A36]" data-testid={`row-override-${override.id}`}>
                    <TableCell className="text-[#0B1F3B] dark:text-white">{override.userId}</TableCell>
                    <TableCell className="text-[#64748B]">{override.permission}</TableCell>
                    <TableCell>
                      <Badge className={override.granted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>
                        {override.granted ? t('security.granted', 'Granted') : t('security.denied', 'Denied')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[#64748B] max-w-[200px] truncate">{override.reason || '-'}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteOverrideMutation.mutate(override.id)}
                        disabled={deleteOverrideMutation.isPending}
                        className="border-[#E2E8F0] dark:border-[#232A36] text-red-600 hover:text-red-700"
                        data-testid={`button-delete-override-${override.id}`}
                      >
                        {t('common.delete', 'Delete')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
