import { ethers } from "ethers";
import { config } from "../core/config.js";
import { createChildLogger } from "../core/logger.js";
import type { WalletManager } from "./wallet-manager.js";

const log = createChildLogger("gas-manager");

// Uniswap V3 SwapRouter on Base
const SWAP_ROUTER_ADDRESS = "0x2626664c2603336E57B271c5C0b26F421741e481";
const WETH_ADDRESS = "0x4200000000000000000000000000000000000006";

const SWAP_ROUTER_ABI = [
  "function exactOutputSingle((address tokenIn, address tokenOut, uint24 fee, address recipient, uint256 amountOut, uint256 amountInMaximum, uint160 sqrtPriceLimitX96)) external payable returns (uint256 amountIn)",
];

export class GasManager {
  constructor(private walletManager: WalletManager) {}

  async ensureGasReserve(): Promise<boolean> {
    const balance = await this.walletManager.getBalance();
    const ethBalance = parseFloat(balance.ethFormatted);

    if (ethBalance >= config.MIN_GAS_RESERVE_ETH) {
      return true; // Enough gas
    }

    const usdcBalance = parseFloat(balance.usdcFormatted);
    if (usdcBalance < 1) {
      log.warn("Not enough USDC to swap for gas");
      return false;
    }

    log.info(
      { ethBalance, target: config.MIN_GAS_RESERVE_ETH },
      "Gas reserve low, swapping USDC for ETH",
    );

    try {
      await this.swapUsdcForEth(config.MIN_GAS_RESERVE_ETH.toString());
      return true;
    } catch (error) {
      log.error({ error }, "Failed to swap USDC for ETH");
      return false;
    }
  }

  private async swapUsdcForEth(ethAmount: string): Promise<void> {
    const signer = this.walletManager.getSigner();
    const router = new ethers.Contract(
      SWAP_ROUTER_ADDRESS,
      SWAP_ROUTER_ABI,
      signer,
    );

    const amountOut = ethers.parseEther(ethAmount);
    // Allow up to 10 USDC for the swap (generous slippage for small amounts)
    const amountInMax = ethers.parseUnits("10", 6);

    // First approve USDC spending
    const usdcAbi = ["function approve(address, uint256) returns (bool)"];
    const usdc = new ethers.Contract(config.USDC_ADDRESS, usdcAbi, signer);
    const approveTx = await usdc.approve(SWAP_ROUTER_ADDRESS, amountInMax);
    await approveTx.wait();

    // Swap USDC → WETH via Uniswap
    const params = {
      tokenIn: config.USDC_ADDRESS,
      tokenOut: WETH_ADDRESS,
      fee: 500, // 0.05% fee tier
      recipient: signer.address,
      amountOut,
      amountInMaximum: amountInMax,
      sqrtPriceLimitX96: 0n,
    };

    const tx = await router.exactOutputSingle(params);
    await tx.wait();

    log.info({ ethAmount, txHash: tx.hash }, "Swapped USDC for ETH");
  }
}
