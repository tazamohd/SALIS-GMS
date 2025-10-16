import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function Security() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("2fa");

  return (
    <div className="p-6 space-y-6" data-testid="page-security">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-page-title">Security & Compliance</h1>
          <p className="text-muted-foreground">Manage security settings and compliance features</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="2fa" data-testid="tab-2fa">
            <Lock className="h-4 w-4 mr-2" />
            2FA
          </TabsTrigger>
          <TabsTrigger value="audit" data-testid="tab-audit">
            <FileText className="h-4 w-4 mr-2" />
            Audit Logs
          </TabsTrigger>
          <TabsTrigger value="backup" data-testid="tab-backup">
            <Database className="h-4 w-4 mr-2" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="gdpr" data-testid="tab-gdpr">
            <UserCheck className="h-4 w-4 mr-2" />
            GDPR
          </TabsTrigger>
          <TabsTrigger value="consents" data-testid="tab-consents">
            <CheckCircle className="h-4 w-4 mr-2" />
            Consents
          </TabsTrigger>
          <TabsTrigger value="permissions" data-testid="tab-permissions">
            <Key className="h-4 w-4 mr-2" />
            Permissions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="2fa" className="space-y-4">
          <TwoFactorAuthTab />
        </TabsContent>

        <TabsContent value="audit" className="space-y-4">
          <AuditLogsTab />
        </TabsContent>

        <TabsContent value="backup" className="space-y-4">
          <BackupRestoreTab />
        </TabsContent>

        <TabsContent value="gdpr" className="space-y-4">
          <GDPRTab />
        </TabsContent>

        <TabsContent value="consents" className="space-y-4">
          <ConsentsTab />
        </TabsContent>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function TwoFactorAuthTab() {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [setupData, setSetupData] = useState<any>(null);

  const { data: status } = useQuery({
    queryKey: ['/api/security/2fa/status'],
  });

  const setupMutation = useMutation({
    mutationFn: () => apiRequest('/api/security/2fa/setup', { method: 'POST' }),
    onSuccess: (data) => {
      setSetupData(data);
      toast({ title: "2FA Setup Initiated", description: "Scan the QR code with your authenticator app" });
    },
    onError: (error: any) => {
      toast({ title: "Setup Failed", description: error.message, variant: "destructive" });
    },
  });

  const enableMutation = useMutation({
    mutationFn: (token: string) => apiRequest('/api/security/2fa/enable', { 
      method: 'POST',
      body: JSON.stringify({ token }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/2fa/status'] });
      setSetupData(null);
      setVerificationCode("");
      toast({ title: "2FA Enabled", description: "Two-factor authentication is now active" });
    },
    onError: (error: any) => {
      toast({ title: "Verification Failed", description: error.message, variant: "destructive" });
    },
  });

  const disableMutation = useMutation({
    mutationFn: () => apiRequest('/api/security/2fa', { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/2fa/status'] });
      toast({ title: "2FA Disabled", description: "Two-factor authentication has been disabled" });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied", description: "Copied to clipboard" });
  };

  return (
    <Card data-testid="card-2fa">
      <CardHeader>
        <CardTitle>Two-Factor Authentication (2FA)</CardTitle>
        <CardDescription>Add an extra layer of security to your account</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {status?.enabled ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">2FA is Active</p>
                  <p className="text-sm text-muted-foreground">
                    Backup codes remaining: {status.backupCodesCount}
                  </p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => disableMutation.mutate()}
                disabled={disableMutation.isPending}
                data-testid="button-disable-2fa"
              >
                Disable 2FA
              </Button>
            </div>
          </div>
        ) : setupData ? (
          <div className="space-y-4">
            <div className="flex justify-center p-4 bg-white dark:bg-gray-800 rounded-lg">
              <img src={setupData.qrCodeUrl} alt="2FA QR Code" className="w-64 h-64" data-testid="img-qr-code" />
            </div>
            
            <div className="space-y-2">
              <Label>Manual Entry Key</Label>
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
              <Label>Backup Codes (Save these securely)</Label>
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
                Copy All Codes
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Verification Code</Label>
              <Input 
                placeholder="Enter 6-digit code from your app"
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
                Verify & Enable
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setSetupData(null);
                  setVerificationCode("");
                }}
                data-testid="button-cancel-setup"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Two-factor authentication adds an extra layer of security by requiring a code from your authenticator app.
            </p>
            <Button 
              onClick={() => setupMutation.mutate()}
              disabled={setupMutation.isPending}
              data-testid="button-setup-2fa"
            >
              <Lock className="h-4 w-4 mr-2" />
              Setup 2FA
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AuditLogsTab() {
  const [filters, setFilters] = useState({
    resourceType: '',
    action: '',
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
        <CardTitle>Audit Logs</CardTitle>
        <CardDescription>Track all system activities and changes</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label>Resource Type</Label>
            <Select value={filters.resourceType} onValueChange={(value) => setFilters({...filters, resourceType: value})}>
              <SelectTrigger data-testid="select-resource-type">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="job_card">Job Cards</SelectItem>
                <SelectItem value="customer">Customers</SelectItem>
                <SelectItem value="invoice">Invoices</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Action</Label>
            <Select value={filters.action} onValueChange={(value) => setFilters({...filters, action: value})}>
              <SelectTrigger data-testid="select-action">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input 
              type="date" 
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              data-testid="input-start-date"
            />
          </div>

          <div className="space-y-2">
            <Label>End Date</Label>
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
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No audit logs found
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
                    <TableCell>{log.ipAddress || 'N/A'}</TableCell>
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
  const { toast } = useToast();
  const [backupType, setBackupType] = useState('full');

  const { data: backups = [], isLoading } = useQuery({
    queryKey: ['/api/security/backups'],
  });

  const createBackupMutation = useMutation({
    mutationFn: (type: string) => apiRequest('/api/security/backups', {
      method: 'POST',
      body: JSON.stringify({ type, includeAttachments: true }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/backups'] });
      toast({ title: "Backup Started", description: "Your data backup is in progress" });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/security/backups/${id}/restore`, { method: 'POST' }),
    onSuccess: () => {
      toast({ title: "Restore Initiated", description: "Your data is being restored" });
    },
  });

  return (
    <Card data-testid="card-backup">
      <CardHeader>
        <CardTitle>Backup & Restore</CardTitle>
        <CardDescription>Create and manage data backups</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>Backup Type</Label>
            <Select value={backupType} onValueChange={setBackupType}>
              <SelectTrigger data-testid="select-backup-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full">Full Backup</SelectItem>
                <SelectItem value="incremental">Incremental</SelectItem>
                <SelectItem value="database">Database Only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={() => createBackupMutation.mutate(backupType)}
            disabled={createBackupMutation.isPending}
            data-testid="button-create-backup"
          >
            <Database className="h-4 w-4 mr-2" />
            Create Backup
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No backups found
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
                    <TableCell>{backup.size ? `${(backup.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}</TableCell>
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
                              Restore
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              data-testid={`button-download-${backup.id}`}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
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
  const { toast } = useToast();
  const [requestType, setRequestType] = useState('export');
  const [dataSubjectId, setDataSubjectId] = useState('');
  const [reason, setReason] = useState('');

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['/api/security/gdpr/requests'],
  });

  const createRequestMutation = useMutation({
    mutationFn: () => apiRequest('/api/security/gdpr/requests', {
      method: 'POST',
      body: JSON.stringify({ requestType, dataSubjectId, reason }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/gdpr/requests'] });
      setDataSubjectId('');
      setReason('');
      toast({ title: "GDPR Request Created", description: "The request has been queued for processing" });
    },
  });

  return (
    <Card data-testid="card-gdpr">
      <CardHeader>
        <CardTitle>GDPR Compliance</CardTitle>
        <CardDescription>Manage data subject rights requests</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Select value={requestType} onValueChange={setRequestType}>
                <SelectTrigger data-testid="select-request-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="export">Data Export</SelectItem>
                  <SelectItem value="deletion">Data Deletion</SelectItem>
                  <SelectItem value="rectification">Data Rectification</SelectItem>
                  <SelectItem value="restriction">Processing Restriction</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Data Subject ID</Label>
              <Input 
                placeholder="Customer/User ID"
                value={dataSubjectId}
                onChange={(e) => setDataSubjectId(e.target.value)}
                data-testid="input-subject-id"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Reason (Optional)</Label>
            <Textarea 
              placeholder="Reason for this request..."
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
            Create Request
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Subject ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Completed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : requests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No GDPR requests found
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
  const { toast } = useToast();
  const [consentType, setConsentType] = useState('');
  const [granted, setGranted] = useState(true);

  const { data: consents = [], isLoading } = useQuery({
    queryKey: ['/api/security/consents'],
  });

  const createConsentMutation = useMutation({
    mutationFn: () => apiRequest('/api/security/consents', {
      method: 'POST',
      body: JSON.stringify({ consentType, granted }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/consents'] });
      setConsentType('');
      toast({ title: "Consent Recorded", description: "Your consent preference has been saved" });
    },
  });

  return (
    <Card data-testid="card-consents">
      <CardHeader>
        <CardTitle>User Consents</CardTitle>
        <CardDescription>Manage user consent preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>Consent Type</Label>
            <Select value={consentType} onValueChange={setConsentType}>
              <SelectTrigger data-testid="select-consent-type">
                <SelectValue placeholder="Select consent type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="marketing">Marketing Communications</SelectItem>
                <SelectItem value="analytics">Analytics & Tracking</SelectItem>
                <SelectItem value="data_processing">Data Processing</SelectItem>
                <SelectItem value="third_party_sharing">Third-Party Data Sharing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Label>Granted</Label>
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
            Record Consent
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Granted At</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : consents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No consent records found
                  </TableCell>
                </TableRow>
              ) : (
                consents.map((consent: any) => (
                  <TableRow key={consent.id} data-testid={`row-consent-${consent.id}`}>
                    <TableCell>{consent.consentType}</TableCell>
                    <TableCell>
                      <Badge variant={consent.granted ? 'default' : 'secondary'}>
                        {consent.granted ? 'Granted' : 'Denied'}
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(consent.createdAt), 'MMM d, yyyy HH:mm')}</TableCell>
                    <TableCell>{consent.ipAddress || 'N/A'}</TableCell>
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
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [permission, setPermission] = useState('');
  const [granted, setGranted] = useState(true);
  const [reason, setReason] = useState('');

  const { data: overrides = [], isLoading } = useQuery({
    queryKey: ['/api/security/permissions/overrides'],
  });

  const createOverrideMutation = useMutation({
    mutationFn: () => apiRequest('/api/security/permissions/overrides', {
      method: 'POST',
      body: JSON.stringify({ userId, permission, granted, reason }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/permissions/overrides'] });
      setUserId('');
      setPermission('');
      setReason('');
      toast({ title: "Permission Override Created", description: "The permission has been updated" });
    },
  });

  const deleteOverrideMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/security/permissions/overrides/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/security/permissions/overrides'] });
      toast({ title: "Override Removed", description: "Permission override has been deleted" });
    },
  });

  return (
    <Card data-testid="card-permissions">
      <CardHeader>
        <CardTitle>Permission Overrides</CardTitle>
        <CardDescription>Grant or restrict specific permissions for users</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input 
                placeholder="Enter user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                data-testid="input-user-id"
              />
            </div>

            <div className="space-y-2">
              <Label>Permission</Label>
              <Select value={permission} onValueChange={setPermission}>
                <SelectTrigger data-testid="select-permission">
                  <SelectValue placeholder="Select permission" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manage_users">Manage Users</SelectItem>
                  <SelectItem value="view_reports">View Reports</SelectItem>
                  <SelectItem value="manage_inventory">Manage Inventory</SelectItem>
                  <SelectItem value="delete_records">Delete Records</SelectItem>
                  <SelectItem value="manage_billing">Manage Billing</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Label>Grant Permission</Label>
            <Switch 
              checked={granted} 
              onCheckedChange={setGranted}
              data-testid="switch-grant-permission"
            />
          </div>

          <div className="space-y-2">
            <Label>Reason</Label>
            <Textarea 
              placeholder="Reason for this override..."
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
            Create Override
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Permission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Granted By</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : overrides.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No permission overrides found
                  </TableCell>
                </TableRow>
              ) : (
                overrides.map((override: any) => (
                  <TableRow key={override.id} data-testid={`row-override-${override.id}`}>
                    <TableCell>{override.userId}</TableCell>
                    <TableCell>{override.permission}</TableCell>
                    <TableCell>
                      <Badge variant={override.granted ? 'default' : 'destructive'}>
                        {override.granted ? 'Granted' : 'Denied'}
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
                        Remove
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
