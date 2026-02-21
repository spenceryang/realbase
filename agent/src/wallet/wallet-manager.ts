import { ethers } from "ethers";
import { config } from "../core/config.js";
import { createChildLogger } from "../core/logger.js";
import { appendBuilderCode } from "./builder-code.js";

const log = createChildLogger("wallet");

// USDC has 6 decimals on Base
const USDC_DECIMALS = 6;

// Minimal ERC-20 ABI for balance checks
const ERC20_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
];

export class WalletManager {
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet | null = null;
  private address: string = "";
  private usdcContract: ethers.Contract | null = null;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.BASE_RPC_URL);
  }

  async initialize(privateKey?: string) {
    if (privateKey) {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
    } else {
      // Generate a new wallet if no key provided
      const randomWallet = ethers.Wallet.createRandom();
      this.wallet = new ethers.Wallet(randomWallet.privateKey, this.provider);
      log.warn(
        { address: this.wallet.address },
        "Generated new wallet — save this private key!",
      );
      log.warn(
        { privateKey: randomWallet.privateKey },
        "PRIVATE KEY (save this)",
      );
    }

    this.address = this.wallet.address;

    this.usdcContract = new ethers.Contract(
      config.USDC_ADDRESS,
      ERC20_ABI,
      this.wallet,
    );

    log.info({ address: this.address }, "Wallet initialized on Base");
    return this.address;
  }

  getAddress(): string {
    if (!this.address) throw new Error("Wallet not initialized");
    return this.address;
  }

  async getBalance() {
    if (!this.wallet || !this.usdcContract)
      throw new Error("Wallet not initialized");

    const [ethBalance, usdcBalance] = await Promise.all([
      this.provider.getBalance(this.address),
      this.usdcContract.balanceOf(this.address) as Promise<bigint>,
    ]);

    return {
      ethWei: ethBalance.toString(),
      ethFormatted: ethers.formatEther(ethBalance),
      usdcRaw: usdcBalance.toString(),
      usdcFormatted: ethers.formatUnits(usdcBalance, USDC_DECIMALS),
      totalUsdValue: ethers.formatUnits(usdcBalance, USDC_DECIMALS), // simplified, ETH value not included
    };
  }

  async sendTransaction(
    to: string,
    data: string,
    value: bigint = 0n,
  ): Promise<ethers.TransactionResponse> {
    if (!this.wallet) throw new Error("Wallet not initialized");

    // Append ERC-8021 builder code to every transaction
    const dataWithBuilderCode = appendBuilderCode(data, config.BUILDER_CODE);

    const tx = await this.wallet.sendTransaction({
      to,
      data: dataWithBuilderCode,
      value,
    });

    log.info(
      { txHash: tx.hash, to, builderCode: config.BUILDER_CODE },
      "Transaction sent with builder code",
    );

    return tx;
  }

  async sendETH(
    to: string,
    amountEth: string,
  ): Promise<ethers.TransactionResponse> {
    if (!this.wallet) throw new Error("Wallet not initialized");

    const value = ethers.parseEther(amountEth);
    // For simple ETH transfers, builder code goes in the data field
    const data = appendBuilderCode("0x", config.BUILDER_CODE);

    const tx = await this.wallet.sendTransaction({ to, data, value });

    log.info(
      { txHash: tx.hash, to, amount: amountEth },
      "ETH sent with builder code",
    );

    return tx;
  }

  async transferUSDC(
    to: string,
    amountUsdc: string,
  ): Promise<ethers.TransactionResponse> {
    if (!this.wallet || !this.usdcContract)
      throw new Error("Wallet not initialized");

    const amount = ethers.parseUnits(amountUsdc, USDC_DECIMALS);

    // Encode the transfer call
    const iface = new ethers.Interface(ERC20_ABI);
    const calldata = iface.encodeFunctionData("transfer", [to, amount]);

    // Send with builder code appended
    return this.sendTransaction(config.USDC_ADDRESS, calldata);
  }

  getProvider(): ethers.JsonRpcProvider {
    return this.provider;
  }

  getSigner(): ethers.Wallet {
    if (!this.wallet) throw new Error("Wallet not initialized");
    return this.wallet;
  }
}
