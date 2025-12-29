import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileSignature, Zap, CreditCard, Shield, Clock, CheckCircle2, XCircle } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

interface SmartContract {
  id: string;
  garageId: string;
  contractType: string;
  contractAddress: string | null;
  blockchain: string;
  partyA: string;
  partyB: string;
  terms: any;
  contractValue: string;
  currency: string;
  status: string;
  deployedAt: string | null;
  executedAt: string | null;
  gasFee: string | null;
  transactionHash: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function SmartContracts() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newContract, setNewContract] = useState({
    contractType: "service_agreement",
    partyA: "",
    partyB: "",
    contractValue: "",
    terms: { service: "", paymentTrigger: "on_completion" },
  });

  // Fetch smart contracts
  const { data: contracts, isLoading } = useQuery<SmartContract[]>({
    queryKey: ["/api/smart-contracts"],
    enabled: !!(user as any)?.garageId,
  });

  // Create contract mutation
  const createContractMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/smart-contracts", data);
    },
    onSuccess: () => {
      toast({
        title: t('smartContracts.contractCreated', 'Smart Contract Created'),
        description: t('smartContracts.contractCreatedSuccess', 'Contract created successfully'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/smart-contracts"] });
      setShowCreateForm(false);
      setNewContract({
        contractType: "service_agreement",
        partyA: "",
        partyB: "",
        contractValue: "",
        terms: { service: "", paymentTrigger: "on_completion" },
      });
    },
    onError: () => {
      toast({
        title: t('common.error', 'Error'),
        description: t('smartContracts.createError', 'Failed to create smart contract'),
        variant: "destructive",
      });
    },
  });

  // Update contract status mutation (simulates signing/execution)
  const updateContractMutation = useMutation({
    mutationFn: async ({ contractId, status }: { contractId: string; status: string }) => {
      return await apiRequest("PATCH", `/api/smart-contracts/${contractId}`, { status });
    },
    onSuccess: () => {
      toast({
        title: t('smartContracts.contractUpdated', 'Contract Updated'),
        description: t('smartContracts.statusUpdatedSuccess', 'Contract status updated successfully'),
      });
      queryClient.invalidateQueries({ queryKey: ["/api/smart-contracts"] });
    },
  });

  const handleCreateContract = () => {
    createContractMutation.mutate({
      garageId: (user as any)?.garageId,
      contractType: newContract.contractType,
      blockchain: "Ethereum",
      partyA: newContract.partyA || t('smartContracts.garage', 'Garage'),
      partyB: newContract.partyB || t('smartContracts.customer', 'Customer'),
      contractValue: newContract.contractValue,
      currency: "USD",
      terms: newContract.terms,
      status: "draft",
    });
  };

  const handleSignContract = (contractId: string) => {
    updateContractMutation.mutate({ contractId, status: "signed" });
  };

  const handleExecuteContract = (contractId: string) => {
    updateContractMutation.mutate({ contractId, status: "executed" });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      draft: "bg-gray-500",
      pending_signature: "bg-yellow-500",
      signed: "bg-blue-500",
      active: "bg-green-500",
      executed: "bg-purple-500",
      completed: "bg-green-700",
    };
    return colors[status] || "bg-gray-500";
  };

  const getStatusIcon = (status: string) => {
    if (status === "completed" || status === "executed") return <CheckCircle2 className="w-4 h-4" />;
    if (status === "active" || status === "signed") return <Clock className="w-4 h-4" />;
    return <XCircle className="w-4 h-4" />;
  };

  return (
    <StandardPageLayout
      title={t('smartContracts.title', 'Smart Contracts')}
      description={t('smartContracts.description', 'Automated service agreements with digital signatures and payment triggers')}
      icon={FileSignature}
      actions={[
        {
          label: t('smartContracts.createContract', 'Create Contract'),
          icon: FileSignature,
          onClick: () => setShowCreateForm(!showCreateForm),
          variant: "default",
        },
      ]}
    >

        {showCreateForm && (
          <Card className="mb-8 border-2 border-blue-600">
            <CardHeader>
              <CardTitle>{t('smartContracts.createNewContract', 'Create New Smart Contract')}</CardTitle>
              <CardDescription>
                {t('smartContracts.automatedContractDesc', 'Automated contract with digital signatures and payment automation')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('smartContracts.contractType', 'Contract Type')}</Label>
                  <Select
                    value={newContract.contractType}
                    onValueChange={(value) =>
                      setNewContract({ ...newContract, contractType: value })
                    }
                  >
                    <SelectTrigger data-testid="select-contract-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service_agreement">{t('smartContracts.serviceAgreement', 'Service Agreement')}</SelectItem>
                      <SelectItem value="warranty">{t('smartContracts.warrantyContract', 'Warranty Contract')}</SelectItem>
                      <SelectItem value="maintenance_plan">{t('smartContracts.maintenancePlan', 'Maintenance Plan')}</SelectItem>
                      <SelectItem value="parts_supply">{t('smartContracts.partsSupplyContract', 'Parts Supply Contract')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t('smartContracts.paymentTrigger', 'Payment Trigger')}</Label>
                  <Select
                    value={newContract.terms.paymentTrigger}
                    onValueChange={(value) =>
                      setNewContract({
                        ...newContract,
                        terms: { ...newContract.terms, paymentTrigger: value },
                      })
                    }
                  >
                    <SelectTrigger data-testid="select-payment-trigger">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on_start">{t('smartContracts.onServiceStart', 'On Service Start')}</SelectItem>
                      <SelectItem value="on_completion">{t('smartContracts.onServiceCompletion', 'On Service Completion')}</SelectItem>
                      <SelectItem value="on_approval">{t('smartContracts.onCustomerApproval', 'On Customer Approval')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t('smartContracts.customerName', 'Customer Name (Party B)')}</Label>
                  <Input
                    placeholder={t('smartContracts.enterCustomerName', 'Enter customer name')}
                    value={newContract.partyB}
                    onChange={(e) =>
                      setNewContract({
                        ...newContract,
                        partyB: e.target.value,
                      })
                    }
                    data-testid="input-customer-name"
                  />
                </div>
                <div>
                  <Label>{t('smartContracts.contractAmount', 'Contract Amount ($)')}</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={newContract.contractValue}
                    onChange={(e) =>
                      setNewContract({
                        ...newContract,
                        contractValue: e.target.value,
                      })
                    }
                    data-testid="input-contract-amount"
                  />
                </div>
              </div>

              <div>
                <Label>{t('smartContracts.serviceDescription', 'Service Description')}</Label>
                <Textarea
                  placeholder={t('smartContracts.describeService', 'Describe the service to be provided...')}
                  value={newContract.terms.service}
                  onChange={(e) =>
                    setNewContract({
                      ...newContract,
                      terms: { ...newContract.terms, service: e.target.value },
                    })
                  }
                  data-testid="input-service-description"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateContract}
                  disabled={createContractMutation.isPending}
                  data-testid="button-submit-contract"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {t('smartContracts.createSignedContract', 'Create Signed Contract')}
                </Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  {t('common.cancel', 'Cancel')}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('smartContracts.totalContracts', 'Total Contracts')}</p>
                  <p className="text-2xl font-bold" data-testid="text-total-contracts">
                    {contracts?.length || 0}
                  </p>
                </div>
                <FileSignature className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('common.active', 'Active')}</p>
                  <p className="text-2xl font-bold">
                    {contracts?.filter((c) => c.status === "active").length || 0}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('smartContracts.executed', 'Executed')}</p>
                  <p className="text-2xl font-bold">
                    {contracts?.filter((c) => c.status === "executed" || c.status === "completed").length || 0}
                  </p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{t('smartContracts.paymentReady', 'Payment Ready')}</p>
                  <p className="text-2xl font-bold">
                    {contracts?.filter((c) => c.status === "signed").length || 0}
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

      {/* Contracts List */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">{t('smartContracts.loadingContracts', 'Loading contracts...')}</p>
          </div>
        </div>
      )}

      {!isLoading && contracts && contracts.length === 0 && !showCreateForm && (
        <Card>
          <CardContent className="text-center py-12">
            <FileSignature className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t('smartContracts.noContracts', 'No Smart Contracts')}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {t('smartContracts.createFirstContract', 'Create your first smart contract with automated payment processing')}
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <FileSignature className="w-4 h-4 mr-2" />
              {t('smartContracts.createContract', 'Create Contract')}
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && contracts && contracts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('smartContracts.contracts', 'Contracts')} ({contracts.length})
          </h2>
          {contracts.map((contract) => (
            <Card key={contract.id} className="border-l-4 border-l-blue-600">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-3">
                      {contract.contractType.replace("_", " ").toUpperCase()}
                      <Badge className={getStatusColor(contract.status)}>
                        <span className="flex items-center gap-1">
                          {getStatusIcon(contract.status)}
                          {contract.status.toUpperCase()}
                        </span>
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {t('smartContracts.created', 'Created')}: {new Date(contract.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {contract.status === "draft" && (
                      <Button
                        size="sm"
                        onClick={() => handleSignContract(contract.id)}
                        disabled={updateContractMutation.isPending}
                        data-testid={`button-sign-contract-${contract.id}`}
                      >
                        <FileSignature className="w-4 h-4 mr-2" />
                        {t('smartContracts.signContract', 'Sign Contract')}
                      </Button>
                    )}
                    {contract.status === "signed" && (
                      <Button
                        size="sm"
                        onClick={() => handleExecuteContract(contract.id)}
                        disabled={updateContractMutation.isPending}
                        data-testid={`button-execute-contract-${contract.id}`}
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        {t('smartContracts.executeContract', 'Execute Contract')}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('smartContracts.parties', 'Parties')}</p>
                    <p className="text-sm font-semibold">{contract.partyA} ↔ {contract.partyB}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('smartContracts.contractValue', 'Contract Value')}</p>
                    <p className="font-semibold">${contract.contractValue} {contract.currency}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('smartContracts.blockchain', 'Blockchain')}</p>
                    <Badge variant="outline">{contract.blockchain}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </StandardPageLayout>
  );
}
