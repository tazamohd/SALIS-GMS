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
    <Card data-testid="card-2fa">
      <CardHeader>
        <CardTitle>{t('security.twoFactorAuth', 'Two-Factor Authentication (2FA)')}</CardTitle>
        <CardDescription>{t('security.addExtraLayerSecurity', 'Add an extra layer of security to your account')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.enabled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-gray-700" />
                <div>
                  <p className="font-medium">{t('security.2faIsActive', '2FA is Active')}</p>
                  <p className="text-sm text-muted-foreground">
                    {t('security.backupCodesRemaining', 'Backup codes remaining')}: {status.backupCodesCount}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => disableMutation.mutate()}
                disabled={disableMutation.isPending}
                data-testid="button-disable-2fa"
              >
                {t('security.disable2fa', 'Disable 2FA')}
              </Button>
            </div>
          </div>
        ) : setupData ? (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white dark:bg-salis-black rounded-lg">
              <img src={setupData.qrCodeUrl} alt={t('security.2faQRCode', '2FA QR Code')} className="w-64 h-64" data-testid="img-qr-code" />
            </div>
            
            <div className="space-y-2">
              <Label>{t('security.manualEntryKey', 'Manual Entry Key')}</Label>
              <div className="flex gap-2">
                <Input value={setupData.secret} readOnly data-testid="input-secret-key" />
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => copyToClipboard(setupData.secret)}
                  data-testid="button-copy-secret"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('security.backupCodes', 'Backup Codes (Save these securely)')}</Label>
              <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
                {setupData.backupCodes.map((code: string, i: number) => (
                  <code key={i} className="text-sm" data-testid={`text-backup-code-${i}`}>{code}</code>
                ))}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => copyToClipboard(setupData.backupCodes.join('\n'))}
                data-testid="button-copy-backup-codes"
              >
                <Copy className="h-4 w-4 mr-2" />
                {t('security.copyAllCodes', 'Copy All Codes')}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>{t('security.verificationCode', 'Verification Code')}</Label>
              <Input 
                placeholder={t('security.enter6DigitCode', 'Enter 6-digit code from your app')}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                data-testid="input-verification-code"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={() => enableMutation.mutate(verificationCode)}
                disabled={!verificationCode || enableMutation.isPending}
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
                data-testid="button-cancel-setup"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {t('security.2faDescription', 'Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app.')}
            </p>
            <Button 
              onClick={() => setupMutation.mutate()}
              disabled={setupMutation.isPending}
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
    <Card data-testid="card-audit-logs">
      <CardHeader>
        <CardTitle>{t('security.auditLogs', 'Audit Logs')}</CardTitle>
        <CardDescription>{t('security.trackAllSystemActivities', 'Track all system activities and changes')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>{t('security.resourceType', 'Resource Type')}</Label>
            <Select value={filters.resourceType} onValueChange={(value) => setFilters({...filters, resourceType: value === 'all' ? '' : value})}>
              <SelectTrigger data-testid="select-resource-type">
                <SelectValue placeholder={t('common.all', 'All')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                <SelectItem value="job_card">{t('security.jobCards', 'Job Cards')}</SelectItem>
                <SelectItem value="customer">{t('security.customers', 'Customers')}</SelectItem>
                <SelectItem value="invoice">{t('security.invoices', 'Invoices')}</SelectItem>
                <SelectItem value="payment">{t('security.payments', 'Payments')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('security.action', 'Action')}</Label>
            <Select value={filters.action} onValueChange={(value) => setFilters({...filters, action: value === 'all' ? '' : value})}>
              <SelectTrigger data-testid="select-action">
                <SelectValue placeholder={t('common.all', 'All')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('common.all', 'All')}</SelectItem>
                <SelectItem value="create">{t('common.create', 'Create')}</SelectItem>
                <SelectItem value="update">{t('common.update', 'Update')}</SelectItem>
                <SelectItem value="delete">{t('common.delete', 'Delete')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>{t('security.startDate', 'Start Date')}</Label>
            <Input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              data-testid="input-start-date"
            />
          </div>

          <div className="space-y-2">
            <Label>{t('security.endDate', 'End Date')}</Label>
            <Input 
              type="date" 
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              data-testid="input-end-date"
            />
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('security.timestamp', 'Timestamp')}</TableHead>
                <TableHead>{t('security.action', 'Action')}</TableHead>
                <TableHead>{t('security.resource', 'Resource')}</TableHead>
                <TableHead>{t('security.user', 'User')}</TableHead>
                <TableHead>{t('security.ipAddress', 'IP Address')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">{t('common.loading', 'Loading...')}</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {t('security.noAuditLogsFound', 'No audit logs found')}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log: any) => (
                  <TableRow key={log.id} data-testid={`row-audit-log-${log.id}`}>
                    <TableCell>{format(new Date(log.timestamp), 'MMM d, yyyy HH:mm:ss')}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{log.action}</Badge>
                    </TableCell>
                    <TableCell>{log.resourceType}</TableCell>
                    <TableCell>{log.userId}</TableCell>
                    <TableCell>{log.ipAddress || t('common.notAvailable', 'N/A')}</TableCell>
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
    <Card data-testid="card-backup">
      <CardHeader>
        <CardTitle>{t('security.backupRestore', 'Backup & Restore')}</CardTitle>
        <CardDescription>{t('security.createAndManageBackups', 'Create and manage data backups')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>{t('security.backupType', 'Backup Type')}</Label>
            <Select value={backupType} onValueChange={setBackupType}>
              <SelectTrigger data-testid="select-backup-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">{t('security.fullBackup', 'Full Backup')}</SelectItem>
                <SelectItem value="incremental">{t('security.incremental', 'Incremental')}</SelectItem>
                <SelectItem value="database">{t('security.databaseOnly', 'Database Only')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => createBackupMutation.mutate(backupType)}
            disabled={createBackupMutation.isPending}
            data-testid="button-create-backup"
          >
            <Database className="h-4 w-4 mr-2" />
            {t('security.createBackup', 'Create Backup')}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('security.created', 'Created')}</TableHead>
                <TableHead>{t('common.type', 'Type')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead>{t('security.size', 'Size')}</TableHead>
                <TableHead>{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">{t('common.loading', 'Loading...')}</TableCell>
                </TableRow>
              ) : backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {t('security.noBackupsFound', 'No backups found')}
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup: any) => (
                  <TableRow key={backup.id} data-testid={`row-backup-${backup.id}`}>
                    <TableCell>{format(new Date(backup.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell><Badge variant="secondary">{backup.type}</Badge></TableCell>
                    <TableCell>
                      <Badge variant={backup.status === 'completed' ? 'default' : backup.status === 'failed' ? 'destructive' : 'outline'}>
                        {backup.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{backup.size ? `${(backup.size / 1024 / 1024).toFixed(2)} MB` : t('common.notAvailable', 'N/A')}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {backup.status === 'completed' && (
                          <>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => restoreMutation.mutate(backup.id)}
                              disabled={restoreMutation.isPending}
                              data-testid={`button-restore-${backup.id}`}
                            >
                              <Upload className="h-3 w-3 mr-1" />
                              {t('security.restore', 'Restore')}
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
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
    <Card data-testid="card-gdpr">
      <CardHeader>
        <CardTitle>{t('security.gdprCompliance', 'GDPR Compliance')}</CardTitle>
        <CardDescription>{t('security.manageDataSubjectRights', 'Manage data subject rights requests')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('security.requestType', 'Request Type')}</Label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger data-testid="select-request-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="export">{t('security.dataExport', 'Data Export')}</SelectItem>
                  <SelectItem value="deletion">{t('security.dataDeletion', 'Data Deletion')}</SelectItem>
                  <SelectItem value="rectification">{t('security.dataRectification', 'Data Rectification')}</SelectItem>
                  <SelectItem value="restriction">{t('security.processingRestriction', 'Processing Restriction')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('security.dataSubjectId', 'Data Subject ID')}</Label>
              <Input 
                placeholder={t('security.customerUserId', 'Customer/User ID')}
                value={dataSubjectId}
                onChange={(e) => setDataSubjectId(e.target.value)}
                data-testid="input-subject-id"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t('security.reasonOptional', 'Reason (Optional)')}</Label>
            <Textarea 
              placeholder={t('security.reasonForRequest', 'Reason for this request...')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              data-testid="textarea-reason"
            />
          </div>

          <Button 
            onClick={() => createRequestMutation.mutate()}
            disabled={!dataSubjectId || createRequestMutation.isPending}
            data-testid="button-create-request"
          >
            {t('security.createRequest', 'Create Request')}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('security.created', 'Created')}</TableHead>
                <TableHead>{t('common.type', 'Type')}</TableHead>
                <TableHead>{t('security.subjectId', 'Subject ID')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead>{t('common.completed', 'Completed')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">{t('common.loading', 'Loading...')}</TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {t('security.noGdprRequestsFound', 'No GDPR requests found')}
                  </TableCell>
                </TableRow>
              ) : (
                requests.map((request: any) => (
                  <TableRow key={request.id} data-testid={`row-gdpr-${request.id}`}>
                    <TableCell>{format(new Date(request.createdAt), 'MMM d, yyyy')}</TableCell>
                    <TableCell><Badge variant="outline">{request.requestType}</Badge></TableCell>
                    <TableCell>{request.userId}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'completed' ? 'default' : 'secondary'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
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
    <Card data-testid="card-consents">
      <CardHeader>
        <CardTitle>{t('security.userConsents', 'User Consents')}</CardTitle>
        <CardDescription>{t('security.manageConsentPreferences', 'Manage user consent preferences')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>{t('security.consentType', 'Consent Type')}</Label>
            <Select value={consentType} onValueChange={setConsentType}>
              <SelectTrigger data-testid="select-consent-type">
                <SelectValue placeholder={t('security.selectConsentType', 'Select consent type')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketing">{t('security.marketingCommunications', 'Marketing Communications')}</SelectItem>
                <SelectItem value="analytics">{t('security.analyticsTracking', 'Analytics & Tracking')}</SelectItem>
                <SelectItem value="data_processing">{t('security.dataProcessing', 'Data Processing')}</SelectItem>
                <SelectItem value="third_party_sharing">{t('security.thirdPartyDataSharing', 'Third-Party Data Sharing')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label>{t('security.granted', 'Granted')}</Label>
            <Switch 
              checked={granted} 
              onCheckedChange={setGranted}
              data-testid="switch-granted"
            />
          </div>

          <Button 
            onClick={() => createConsentMutation.mutate()}
            disabled={!consentType || createConsentMutation.isPending}
            data-testid="button-record-consent"
          >
            {t('security.recordConsent', 'Record Consent')}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('common.type', 'Type')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead>{t('security.grantedAt', 'Granted At')}</TableHead>
                <TableHead>{t('security.ipAddress', 'IP Address')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">{t('common.loading', 'Loading...')}</TableCell>
                </TableRow>
              ) : consents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    {t('security.noConsentRecordsFound', 'No consent records found')}
                  </TableCell>
                </TableRow>
              ) : (
                consents.map((consent: any) => (
                  <TableRow key={consent.id} data-testid={`row-consent-${consent.id}`}>
                    <TableCell>{consent.consentType}</TableCell>
                    <TableCell>
                      <Badge variant={consent.granted ? 'default' : 'secondary'}>
                        {consent.granted ? t('security.granted', 'Granted') : t('security.denied', 'Denied')}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(consent.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell>{consent.ipAddress || t('common.notAvailable', 'N/A')}</TableCell>
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
    <Card data-testid="card-permissions">
      <CardHeader>
        <CardTitle>{t('security.permissionOverrides', 'Permission Overrides')}</CardTitle>
        <CardDescription>{t('security.grantOrRestrictPermissions', 'Grant or restrict specific permissions for users')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('security.userId', 'User ID')}</Label>
              <Input 
                placeholder={t('security.enterUserId', 'Enter user ID')}
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                data-testid="input-user-id"
              />
            </div>

            <div className="space-y-2">
              <Label>{t('security.permission', 'Permission')}</Label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger data-testid="select-permission">
                  <SelectValue placeholder={t('security.selectPermission', 'Select permission')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manage_users">{t('security.manageUsers', 'Manage Users')}</SelectItem>
                  <SelectItem value="view_reports">{t('security.viewReports', 'View Reports')}</SelectItem>
                  <SelectItem value="manage_inventory">{t('security.manageInventory', 'Manage Inventory')}</SelectItem>
                  <SelectItem value="delete_records">{t('security.deleteRecords', 'Delete Records')}</SelectItem>
                  <SelectItem value="manage_billing">{t('security.manageBilling', 'Manage Billing')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label>{t('security.grantPermission', 'Grant Permission')}</Label>
            <Switch 
              checked={granted} 
              onCheckedChange={setGranted}
              data-testid="switch-grant-permission"
            />
          </div>

          <div className="space-y-2">
            <Label>{t('security.reason', 'Reason')}</Label>
            <Textarea 
              placeholder={t('security.reasonForOverride', 'Reason for this override...')}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              data-testid="textarea-override-reason"
            />
          </div>

          <Button 
            onClick={() => createOverrideMutation.mutate()}
            disabled={!userId || !permission || createOverrideMutation.isPending}
            data-testid="button-create-override"
          >
            {t('security.createOverride', 'Create Override')}
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('security.user', 'User')}</TableHead>
                <TableHead>{t('security.permission', 'Permission')}</TableHead>
                <TableHead>{t('common.status', 'Status')}</TableHead>
                <TableHead>{t('security.grantedBy', 'Granted By')}</TableHead>
                <TableHead>{t('common.actions', 'Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">{t('common.loading', 'Loading...')}</TableCell>
                </TableRow>
              ) : overrides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    {t('security.noPermissionOverridesFound', 'No permission overrides found')}
                  </TableCell>
                </TableRow>
              ) : (
                overrides.map((override: any) => (
                  <TableRow key={override.id} data-testid={`row-override-${override.id}`}>
                    <TableCell>{override.userId}</TableCell>
                    <TableCell>{override.permission}</TableCell>
                    <TableCell>
                      <Badge variant={override.granted ? 'default' : 'destructive'}>
                        {override.granted ? t('security.granted', 'Granted') : t('security.denied', 'Denied')}
                      </Badge>
                    </TableCell>
                    <TableCell>{override.grantedBy}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deleteOverrideMutation.mutate(override.id)}
                        disabled={deleteOverrideMutation.isPending}
                        data-testid={`button-delete-override-${override.id}`}
                      >
                        {t('common.remove', 'Remove')}
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
