import { ethers } from "ethers";
import { config } from "../core/config.js";
import { createChildLogger } from "../core/logger.js";
import type { WalletManager } from "../wallet/wallet-manager.js";
import { appendBuilderCode } from "../wallet/builder-code.js";

const log = createChildLogger("oracle-updater");

const ORACLE_ABI = [
  "function updateScores(uint32[] zipcodes, uint8[] scores) external",
  "function getScoreFree(uint32 zipcode) view returns (uint8 score, uint256 updatedAt)",
  "function getStats() view returns (uint256 totalQueries, uint256 totalRevenue, uint256 queryFee, uint256 balance)",
];

export class OracleUpdater {
  private contract: ethers.Contract | null = null;

  constructor(private walletManager: WalletManager) {}

  initialize() {
    if (!config.ORACLE_CONTRACT_ADDRESS) {
      log.warn("No oracle contract address configured");
      return;
    }

    this.contract = new ethers.Contract(
      config.ORACLE_CONTRACT_ADDRESS,
      ORACLE_ABI,
      this.walletManager.getSigner(),
    );

    log.info(
      { address: config.ORACLE_CONTRACT_ADDRESS },
      "Oracle updater initialized",
    );
  }

  async batchUpdate(
    scores: Array<{ zipcode: string; compositeScore: number }>,
  ): Promise<string | null> {
    if (!this.contract) {
      log.warn("Oracle contract not initialized");
      return null;
    }

    // Convert to contract-compatible format
    const zipcodes = scores.map((s) => parseInt(s.zipcode));
    // Scale 0-10 score to 0-100 for contract storage
    const scoreValues = scores.map((s) =>
      Math.round(Math.min(100, Math.max(0, s.compositeScore * 10))),
    );

    try {
      // Encode the function call
      const iface = new ethers.Interface(ORACLE_ABI);
      const calldata = iface.encodeFunctionData("updateScores", [
        zipcodes,
        scoreValues,
      ]);

      // Append builder code
      const dataWithBC = appendBuilderCode(calldata, config.BUILDER_CODE);

      const tx = await this.walletManager.getSigner().sendTransaction({
        to: config.ORACLE_CONTRACT_ADDRESS,
        data: dataWithBC,
      });

      log.info(
        { txHash: tx.hash, count: scores.length },
        "Oracle scores updated with builder code",
      );

      await tx.wait();
      return tx.hash;
    } catch (error) {
      log.error({ error }, "Failed to update oracle");
      return null;
    }
  }

  async getStats() {
    if (!this.contract) return null;
    try {
      const [totalQueries, totalRevenue, queryFee, balance] =
        await this.contract.getStats();
      return {
        totalQueries: totalQueries.toString(),
        totalRevenue: ethers.formatEther(totalRevenue),
        queryFee: ethers.formatEther(queryFee),
        balance: ethers.formatEther(balance),
      };
    } catch (error) {
      log.error({ error }, "Failed to get oracle stats");
      return null;
    }
  }
}
