import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Shield, CheckCircle2, AlertCircle, Lock, FileCheck, ChevronDown, ChevronUp } from "lucide-react";
import { StandardPageLayout } from "@/components/layouts/StandardPageLayout";

interface BlockchainRecord {
  id: string;
  vehicleId: string;
  recordType: string;
  transactionHash: string;
  blockNumber: number;
  blockchainNetwork: string;
  recordData: any;
  timestamp: string;
  previousHash: string | null;
  verificationStatus: string;
  smartContractAddress: string | null;
  createdAt: string;
}

export default function BlockchainServiceHistory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  const { data: vehicles } = useQuery<any[]>({
    queryKey: ["/api/vehicles"],
    enabled: !!user,
  });

  const { data: blockchainRecords, isLoading } = useQuery<BlockchainRecord[]>({
    queryKey: ["/api/emerging-tech/blockchain", selectedVehicle],
    enabled: !!selectedVehicle,
  });

  const verifyChainMutation = useMutation({
    mutationFn: async () => {
      const isValid = blockchainRecords?.every(r => r.verificationStatus === "verified");
      return { isValid };
    },
    onSuccess: (data) => {
      toast({
        title: data.isValid ? t('blockchain.chainVerified', 'Chain Verified') : t('blockchain.chainIntegrityIssue', 'Chain Integrity Issue'),
        description: data.isValid
          ? t('blockchain.allRecordsVerified', 'All blockchain records are verified and tamper-proof')
          : t('blockchain.pendingVerification', 'Some records have pending verification'),
        variant: data.isValid ? "default" : "destructive",
      });
    },
  });

  const getRecordTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      service: "bg-[#0A5ED7]",
      repair: "bg-[#F97316]",
      inspection: "bg-green-500",
      ownership_transfer: "bg-[#0BB3FF]",
    };
    return colors[type] || "bg-[#64748B]";
  };

  return (
    <StandardPageLayout
      title={t('blockchain.title', 'Blockchain Service History')}
      description={t('blockchain.description', 'Immutable, tamper-proof vehicle service records secured by cryptographic hashing')}
      icon={Shield}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
            <CardHeader>
              <CardTitle className="text-lg text-[#0B1F3B] dark:text-white">{t('blockchain.selectVehicle', 'Select Vehicle')}</CardTitle>
              <CardDescription className="text-[#64748B]">{t('blockchain.viewRecords', 'View blockchain service records')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehicles?.map((vehicle) => (
                <Button
                  key={vehicle.id}
                  variant={selectedVehicle === vehicle.id ? "default" : "outline"}
                  className={`w-full justify-start ${selectedVehicle === vehicle.id ? 'bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] text-white' : 'border-[#E2E8F0] dark:border-[#232A36]'}`}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                  data-testid={`button-select-vehicle-${vehicle.id}`}
                >
                  <div className="text-left">
                    <div className="font-semibold">
                      {vehicle.make} {vehicle.model}
                    </div>
                    <div className="text-xs opacity-70">{vehicle.licensePlate}</div>
                  </div>
                </Button>
              ))}
              {!vehicles?.length && (
                <p className="text-sm text-[#64748B]">{t('blockchain.noVehicles', 'No vehicles found')}</p>
              )}
            </CardContent>
          </Card>

          {selectedVehicle && blockchainRecords && (
            <Card className="mt-4 bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2 text-[#0B1F3B] dark:text-white">
                  <Lock className="w-5 h-5 text-green-600" />
                  {t('blockchain.stats', 'Blockchain Stats')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-[#64748B]">{t('blockchain.totalRecords', 'Total Records')}:</span>
                  <span className="font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-total-records">
                    {blockchainRecords.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#64748B]">{t('blockchain.chainHeight', 'Chain Height')}:</span>
                  <span className="font-semibold text-[#0B1F3B] dark:text-white" data-testid="text-chain-height">
                    {blockchainRecords.length > 0 ? blockchainRecords[0].blockNumber : 0}
                  </span>
                </div>
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-[#0A5ED7] to-[#0BB3FF] hover:from-[#0A5ED7]/90 hover:to-[#0BB3FF]/90 text-white"
                  variant="default"
                  onClick={() => verifyChainMutation.mutate()}
                  disabled={verifyChainMutation.isPending}
                  data-testid="button-verify-chain"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  {t('blockchain.verifyChain', 'Verify Chain Integrity')}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-3">
          {!selectedVehicle && (
            <Card className="h-full flex items-center justify-center min-h-[400px] bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="text-center">
                <Shield className="w-16 h-16 text-[#64748B] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[#0B1F3B] dark:text-white mb-2">
                  {t('blockchain.selectVehiclePrompt', 'Select a Vehicle')}
                </h3>
                <p className="text-[#64748B]">
                  {t('blockchain.selectVehicleDesc', 'Choose a vehicle from the sidebar to view its blockchain service history')}
                </p>
              </CardContent>
            </Card>
          )}

          {selectedVehicle && isLoading && (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A5ED7] mx-auto" />
                <p className="mt-4 text-[#64748B]">{t('blockchain.loadingRecords', 'Loading blockchain records...')}</p>
              </div>
            </div>
          )}

          {selectedVehicle && !isLoading && blockchainRecords && blockchainRecords.length === 0 && (
            <Card className="bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
              <CardContent className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-[#64748B] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[#0B1F3B] dark:text-white mb-2">
                  {t('blockchain.noRecords', 'No Blockchain Records')}
                </h3>
                <p className="text-[#64748B]">
                  {t('blockchain.noRecordsDesc', 'This vehicle has no blockchain service history yet')}
                </p>
              </CardContent>
            </Card>
          )}

          {selectedVehicle && !isLoading && blockchainRecords && blockchainRecords.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-[#0B1F3B] dark:text-white">
                  {t('blockchain.serviceRecords', 'Service Records')} ({blockchainRecords.length})
                </h2>
                <Badge variant="outline" className="flex items-center gap-2 border-[#E2E8F0] dark:border-[#232A36]">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  {t('blockchain.verifiedImmutable', 'Verified & Immutable')}
                </Badge>
              </div>

              {blockchainRecords.map((record, index) => (
                <Card key={record.id} className="border-l-4 border-l-[#0A5ED7] bg-white dark:bg-[#151A23] border-[#E2E8F0] dark:border-[#232A36]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={getRecordTypeColor(record.recordType)}>
                          {record.recordType.replace("_", " ").toUpperCase()}
                        </Badge>
                        <div>
                          <CardTitle className="text-lg text-[#0B1F3B] dark:text-white" data-testid={`text-record-type-${record.id}`}>
                            {(record.recordData?.eventType || record.recordType).replace("_", " ").toUpperCase()}
                          </CardTitle>
                          <CardDescription className="text-[#64748B]">
                            {new Date(record.timestamp).toLocaleString()}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedRecord(expandedRecord === record.id ? null : record.id)
                        }
                        data-testid={`button-toggle-record-${record.id}`}
                      >
                        {expandedRecord === record.id ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  {expandedRecord === record.id && (
                    <CardContent className="border-t border-[#E2E8F0] dark:border-[#232A36] pt-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-[#64748B]">{t('blockchain.blockNumber', 'Block Number')}</p>
                          <p className="font-mono font-semibold text-[#0B1F3B] dark:text-white" data-testid={`text-block-number-${record.id}`}>
                            #{record.blockNumber}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-[#64748B]">{t('blockchain.position', 'Position')}</p>
                          <p className="font-semibold text-[#0B1F3B] dark:text-white">{t('blockchain.recordNumber', 'Record')} #{index + 1}</p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm text-[#64748B] mb-1">{t('blockchain.transactionHash', 'Transaction Hash')}</p>
                        <div className="bg-[#F8FAFC] dark:bg-[#0E1117] p-2 rounded-md border border-[#E2E8F0] dark:border-[#232A36]">
                          <p className="font-mono text-xs break-all text-[#0B1F3B] dark:text-white" data-testid={`text-tx-hash-${record.id}`}>
                            {record.transactionHash}
                          </p>
                        </div>
                      </div>

                      {record.previousHash && (
                        <div>
                          <p className="text-sm text-[#64748B] mb-1">{t('blockchain.previousHash', 'Previous Hash')}</p>
                          <div className="bg-[#F8FAFC] dark:bg-[#0E1117] p-2 rounded-md border border-[#E2E8F0] dark:border-[#232A36]">
                            <p className="font-mono text-xs break-all text-[#0B1F3B] dark:text-white">{record.previousHash}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-[#64748B] mb-1">{t('blockchain.network', 'Blockchain Network')}</p>
                        <Badge variant="outline" className="border-[#E2E8F0] dark:border-[#232A36] text-[#0B1F3B] dark:text-white">{record.blockchainNetwork || "Ethereum"}</Badge>
                      </div>

                      {record.recordData && (
                        <div>
                          <p className="text-sm text-[#64748B] mb-2">{t('blockchain.recordData', 'Record Data')}</p>
                          <div className="bg-[#0A5ED7]/10 p-3 rounded-md border border-[#0A5ED7]/20">
                            <pre className="text-xs overflow-auto text-[#0B1F3B] dark:text-white">
                              {JSON.stringify(record.recordData, null, 2)}
                            </pre>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 pt-2">
                        {record.verificationStatus === "verified" ? (
                          <>
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-semibold text-green-600">
                              {t('blockchain.cryptographicallyVerified', 'Cryptographically Verified')}
                            </span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-5 h-5 text-[#F97316]" />
                            <span className="text-sm font-semibold text-[#F97316]">
                              {t('blockchain.verification', 'Verification')}: {record.verificationStatus}
                            </span>
                          </>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </StandardPageLayout>
  );
}
