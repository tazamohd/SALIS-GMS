import crypto from "crypto";

export interface BlockchainServiceRecord {
  id: string;
  vehicleId: string;
  garageId: string;
  serviceType: string;
  description: string;
  cost: number;
  technicianId: string;
  timestamp: string;
  previousHash: string;
  hash: string;
  blockNumber: number;
  metadata?: any;
}

export class BlockchainService {
  /**
   * Calculate SHA-256 hash of a service record
   */
  static calculateHash(record: Omit<BlockchainServiceRecord, "hash">): string {
    const data = JSON.stringify({
      id: record.id,
      vehicleId: record.vehicleId,
      garageId: record.garageId,
      serviceType: record.serviceType,
      description: record.description,
      cost: record.cost,
      technicianId: record.technicianId,
      timestamp: record.timestamp,
      previousHash: record.previousHash,
      blockNumber: record.blockNumber,
      metadata: record.metadata,
    });

    return crypto.createHash("sha256").update(data).digest("hex");
  }

  /**
   * Verify the integrity of a blockchain record
   */
  static verifyRecord(record: BlockchainServiceRecord): boolean {
    const calculatedHash = this.calculateHash(record);
    return calculatedHash === record.hash;
  }

  /**
   * Verify the entire chain of service records for a vehicle
   */
  static verifyChain(records: BlockchainServiceRecord[]): {
    isValid: boolean;
    invalidBlocks: number[];
  } {
    const invalidBlocks: number[] = [];

    // Sort by block number to ensure proper order
    const sortedRecords = [...records].sort((a, b) => a.blockNumber - b.blockNumber);

    for (let i = 0; i < sortedRecords.length; i++) {
      const record = sortedRecords[i];

      // Verify hash integrity
      if (!this.verifyRecord(record)) {
        invalidBlocks.push(record.blockNumber);
        continue;
      }

      // Verify chain linkage (except for genesis block)
      if (i > 0) {
        const previousRecord = sortedRecords[i - 1];
        if (record.previousHash !== previousRecord.hash) {
          invalidBlocks.push(record.blockNumber);
        }
      }
    }

    return {
      isValid: invalidBlocks.length === 0,
      invalidBlocks,
    };
  }

  /**
   * Create genesis block (first block) for a vehicle
   */
  static createGenesisBlock(vehicleId: string, garageId: string, id: string): Omit<BlockchainServiceRecord, "hash"> {
    return {
      id,
      vehicleId,
      garageId,
      serviceType: "GENESIS",
      description: "Vehicle service history blockchain initialized",
      cost: 0,
      technicianId: "SYSTEM",
      timestamp: new Date().toISOString(),
      previousHash: "0",
      blockNumber: 0,
      metadata: {
        isGenesisBlock: true,
      },
    };
  }

  /**
   * Create a new service record block
   */
  static createServiceBlock(
    data: {
      id: string;
      vehicleId: string;
      garageId: string;
      serviceType: string;
      description: string;
      cost: number;
      technicianId: string;
      metadata?: any;
    },
    previousHash: string,
    blockNumber: number
  ): BlockchainServiceRecord {
    const record: Omit<BlockchainServiceRecord, "hash"> = {
      ...data,
      timestamp: new Date().toISOString(),
      previousHash,
      blockNumber,
    };

    const hash = this.calculateHash(record);

    return {
      ...record,
      hash,
    };
  }

  /**
   * Generate blockchain proof/certificate
   */
  static generateProof(records: BlockchainServiceRecord[]): string {
    const chainData = records.map(r => ({
      block: r.blockNumber,
      hash: r.hash,
      timestamp: r.timestamp,
    }));

    const proofData = JSON.stringify(chainData);
    const proofHash = crypto.createHash("sha256").update(proofData).digest("hex");

    return `SALIS-BLOCKCHAIN-PROOF-${proofHash.substring(0, 16).toUpperCase()}`;
  }
}
