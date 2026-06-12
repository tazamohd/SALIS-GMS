import crypto from "crypto";

export interface SmartContract {
  id: string;
  garageId: string;
  customerId: string;
  vehicleId?: string;
  contractType: "service_agreement" | "maintenance_plan" | "warranty";
  serviceDetails: {
    serviceType: string;
    description: string;
    agreedPrice: number;
    estimatedDuration?: string;
  };
  terms: {
    paymentTrigger: "on_completion" | "on_approval" | "on_start";
    penaltyClause?: string;
    warrantyPeriod?: string;
  };
  status: "pending" | "signed" | "active" | "completed" | "cancelled";
  customerSignature?: string;
  garageSignature?: string;
  customerSignedAt?: string;
  garageSignedAt?: string;
  executedAt?: string;
  paymentStatus: "pending" | "processing" | "completed" | "failed";
  paymentIntentId?: string;
  contractHash: string;
  createdAt: string;
  updatedAt: string;
}

export class SmartContractEngine {
  /**
   * Generate contract hash for integrity verification
   */
  static generateContractHash(contract: Omit<SmartContract, "contractHash" | "status" | "paymentStatus" | "executedAt" | "updatedAt">): string {
    const data = JSON.stringify({
      id: contract.id,
      garageId: contract.garageId,
      customerId: contract.customerId,
      vehicleId: contract.vehicleId,
      contractType: contract.contractType,
      serviceDetails: contract.serviceDetails,
      terms: contract.terms,
      createdAt: contract.createdAt,
    });

    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Verify contract integrity
   */
  static verifyContract(contract: SmartContract): boolean {
    const calculatedHash = this.generateContractHash(contract);
    return calculatedHash === contract.contractHash;
  }

  /**
   * Create digital signature
   */
  static createSignature(userId: string, contractId: string, timestamp: string): string {
    const data = `${userId}-${contractId}-${timestamp}`;
    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Verify digital signature
   */
  static verifySignature(signature: string, userId: string, contractId: string, timestamp: string): boolean {
    const expectedSignature = this.createSignature(userId, contractId, timestamp);
    return signature === expectedSignature;
  }

  /**
   * Check if contract is fully signed and ready for execution
   */
  static isReadyForExecution(contract: SmartContract): boolean {
    return !!(
      contract.customerSignature &&
      contract.garageSignature &&
      contract.customerSignedAt &&
      contract.garageSignedAt &&
      contract.status === "signed"
    );
  }

  /**
   * Check if payment should be triggered based on contract terms
   */
  static shouldTriggerPayment(contract: SmartContract, serviceStatus: string): boolean {
    if (contract.paymentStatus === "completed") {
      return false;
    }

    const { paymentTrigger } = contract.terms;

    switch (paymentTrigger) {
      case "on_start":
        return serviceStatus === "started" || serviceStatus === "in_progress";
      case "on_completion":
        return serviceStatus === "completed";
      case "on_approval":
        return serviceStatus === "approved";
      default:
        return false;
    }
  }

  /**
   * Execute contract (trigger payment and mark as executed)
   */
  static async executeContract(
    contract: SmartContract,
    paymentProcessor: (amount: number, customerId: string, description: string) => Promise<{ success: boolean; paymentIntentId?: string }>
  ): Promise<{
    success: boolean;
    paymentIntentId?: string;
    executedAt?: string;
    error?: string;
  }> {
    if (!this.isReadyForExecution(contract)) {
      return {
        success: false,
        error: "Contract is not fully signed",
      };
    }

    try {
      const result = await paymentProcessor(
        contract.serviceDetails.agreedPrice,
        contract.customerId,
        `Service: ${contract.serviceDetails.serviceType} - Contract ${contract.id}`
      );

      if (result.success) {
        return {
          success: true,
          paymentIntentId: result.paymentIntentId,
          executedAt: new Date().toISOString(),
        };
      } 
        return {
          success: false,
          error: "Payment processing failed",
        };
      
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Contract execution failed",
      };
    }
  }

  /**
   * Generate contract proof certificate
   */
  static generateContractProof(contract: SmartContract): string {
    const proofData = {
      contractId: contract.id,
      hash: contract.contractHash,
      signatures: {
        customer: contract.customerSignature,
        garage: contract.garageSignature,
      },
      executedAt: contract.executedAt,
    };

    const proofHash = crypto.createHash("sha256")
      .update(JSON.stringify(proofData))
      .digest("hex");

    return `SALIS-CONTRACT-CERT-${proofHash.substring(0, 16).toUpperCase()}`;
  }
}
