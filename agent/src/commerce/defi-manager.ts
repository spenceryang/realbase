import { ethers } from "ethers";
import { config } from "../core/config.js";
import { createChildLogger } from "../core/logger.js";
import type { WalletManager } from "../wallet/wallet-manager.js";
import { appendBuilderCode } from "../wallet/builder-code.js";

const log = createChildLogger("defi-manager");

// Aave V3 Pool on Base
const AAVE_POOL_ADDRESS = "0xA238Dd80C259a72e81d7e4664a9801593F98d1c5";

const AAVE_POOL_ABI = [
  "function supply(address asset, uint256 amount, address onBehalfOf, uint16 referralCode) external",
  "function withdraw(address asset, uint256 amount, address to) external returns (uint256)",
];

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
];

// aUSDC (Aave receipt token) on Base
const AUSDC_ADDRESS = "0x4e65fE4DbA92790696d040ac24Aa414708F5c0AB";

export class DeFiManager {
  constructor(private walletManager: WalletManager) {}

  /**
   * Deposit idle USDC into Aave to earn yield.
   */
  async depositToAave(amountUsdc: string): Promise<string | null> {
    try {
      const signer = this.walletManager.getSigner();
      const amount = ethers.parseUnits(amountUsdc, 6);

      // Approve USDC spending by Aave Pool
      const usdc = new ethers.Contract(config.USDC_ADDRESS, ERC20_ABI, signer);
      const approveTx = await usdc.approve(AAVE_POOL_ADDRESS, amount);
      await approveTx.wait();

      // Supply to Aave (with builder code)
      const iface = new ethers.Interface(AAVE_POOL_ABI);
      const calldata = iface.encodeFunctionData("supply", [
        config.USDC_ADDRESS,
        amount,
        this.walletManager.getAddress(),
        0, // no referral
      ]);

      const dataWithBC = appendBuilderCode(calldata, config.BUILDER_CODE);

      const tx = await signer.sendTransaction({
        to: AAVE_POOL_ADDRESS,
        data: dataWithBC,
      });

      await tx.wait();

      log.info(
        { txHash: tx.hash, amount: amountUsdc },
        "Deposited USDC to Aave with builder code",
      );

      return tx.hash;
    } catch (error) {
      log.error({ error }, "Failed to deposit to Aave");
      return null;
    }
  }

  /**
   * Withdraw USDC from Aave back to agent wallet.
   */
  async withdrawFromAave(amountUsdc: string): Promise<string | null> {
    try {
      const signer = this.walletManager.getSigner();
      const amount = ethers.parseUnits(amountUsdc, 6);

      const iface = new ethers.Interface(AAVE_POOL_ABI);
      const calldata = iface.encodeFunctionData("withdraw", [
        config.USDC_ADDRESS,
        amount,
        this.walletManager.getAddress(),
      ]);

      const dataWithBC = appendBuilderCode(calldata, config.BUILDER_CODE);

      const tx = await signer.sendTransaction({
        to: AAVE_POOL_ADDRESS,
        data: dataWithBC,
      });

      await tx.wait();

      log.info(
        { txHash: tx.hash, amount: amountUsdc },
        "Withdrew USDC from Aave with builder code",
      );

      return tx.hash;
    } catch (error) {
      log.error({ error }, "Failed to withdraw from Aave");
      return null;
    }
  }

  /**
   * Get aUSDC balance (USDC deposited in Aave earning yield).
   */
  async getAaveBalance(): Promise<string> {
    try {
      const provider = this.walletManager.getProvider();
      const aUsdc = new ethers.Contract(AUSDC_ADDRESS, ERC20_ABI, provider);
      const balance: bigint = await aUsdc.balanceOf(
        this.walletManager.getAddress(),
      );
      return ethers.formatUnits(balance, 6);
    } catch {
      return "0";
    }
  }
}
