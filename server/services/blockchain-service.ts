import { ethers } from 'ethers';
import type { ValuationFormData } from '../../client/src/lib/validations';

interface BlockchainValuationRecord {
  timestamp: number;
  valuationId: string;
  valuationAmount: number;
  methodology: string;
  confidence: number;
  hash: string;
}

interface ValuationVerification {
  isVerified: boolean;
  blockNumber: number;
  timestamp: number;
  transactionHash: string;
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    // Initialize provider (e.g., Ethereum mainnet, testnet, or private network)
    this.provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC_URL);
    
    // Initialize wallet with private key
    this.wallet = new ethers.Wallet(
      process.env.BLOCKCHAIN_PRIVATE_KEY || '',
      this.provider
    );

    // Smart contract ABI and address would be needed here
    const contractABI = [
      "function recordValuation(string valuationId, uint256 amount, string methodology, uint8 confidence)",
      "function getValuation(string valuationId) view returns (uint256 amount, uint256 timestamp, string methodology, uint8 confidence)",
      "function verifyValuation(string valuationId, uint256 amount) view returns (bool)"
    ];

    this.contract = new ethers.Contract(
      process.env.VALUATION_CONTRACT_ADDRESS || '',
      contractABI,
      this.wallet
    );
  }

  async recordValuation(
    valuationId: string,
    data: ValuationFormData,
    result: { amount: number; methodology: string; confidence: number }
  ): Promise<BlockchainValuationRecord> {
    try {
      // Create a hash of the valuation data
      const valuationHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify({ data, result }))
      );

      // Record the valuation on the blockchain
      const tx = await this.contract.recordValuation(
        valuationId,
        ethers.parseEther(result.amount.toString()),
        result.methodology,
        result.confidence
      );

      // Wait for transaction confirmation
      const receipt = await tx.wait();

      return {
        timestamp: Date.now(),
        valuationId,
        valuationAmount: result.amount,
        methodology: result.methodology,
        confidence: result.confidence,
        hash: valuationHash
      };
    } catch (error) {
      console.error('Blockchain recording error:', error);
      throw new Error('Failed to record valuation on blockchain');
    }
  }

  async verifyValuation(
    valuationId: string,
    amount: number
  ): Promise<ValuationVerification> {
    try {
      // Verify the valuation on the blockchain
      const isVerified = await this.contract.verifyValuation(
        valuationId,
        ethers.parseEther(amount.toString())
      );

      // Get the transaction details
      const valuation = await this.contract.getValuation(valuationId);

      return {
        isVerified,
        blockNumber: valuation.blockNumber,
        timestamp: valuation.timestamp.toNumber(),
        transactionHash: valuation.transactionHash
      };
    } catch (error) {
      console.error('Blockchain verification error:', error);
      throw new Error('Failed to verify valuation on blockchain');
    }
  }

  async getValuationHistory(valuationId: string): Promise<BlockchainValuationRecord[]> {
    try {
      // Query the blockchain for all valuation events for this ID
      const filter = this.contract.filters.ValuationRecorded(valuationId);
      const events = await this.contract.queryFilter(filter);

      return events.map(event => ({
        timestamp: event.args.timestamp.toNumber(),
        valuationId: event.args.valuationId,
        valuationAmount: ethers.formatEther(event.args.amount),
        methodology: event.args.methodology,
        confidence: event.args.confidence,
        hash: event.transactionHash
      }));
    } catch (error) {
      console.error('Blockchain history retrieval error:', error);
      throw new Error('Failed to retrieve valuation history from blockchain');
    }
  }

  async calculateConsensusValuation(valuationId: string): Promise<number> {
    try {
      const history = await this.getValuationHistory(valuationId);
      
      // Weight more recent valuations higher
      const weightedSum = history.reduce((acc, record, index) => {
        const weight = Math.exp(-0.1 * (history.length - index - 1)); // Exponential decay
        return acc + record.valuationAmount * weight;
      }, 0);

      const weightSum = history.reduce((acc, _, index) => {
        return acc + Math.exp(-0.1 * (history.length - index - 1));
      }, 0);

      return weightedSum / weightSum;
    } catch (error) {
      console.error('Consensus calculation error:', error);
      throw new Error('Failed to calculate consensus valuation');
    }
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();
