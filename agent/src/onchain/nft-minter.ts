import { ethers } from "ethers";
import { config } from "../core/config.js";
import { createChildLogger } from "../core/logger.js";
import type { WalletManager } from "../wallet/wallet-manager.js";
import { appendBuilderCode } from "../wallet/builder-code.js";

const log = createChildLogger("nft-minter");

const REPORT_ABI = [
  "function agentMint(address to, uint32 zipcode, string uri) external returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function latestReport(uint32 zipcode) view returns (uint256)",
];

export interface ReportMetadata {
  name: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

export class NftMinter {
  private contract: ethers.Contract | null = null;

  constructor(private walletManager: WalletManager) {}

  initialize() {
    if (!config.REPORT_CONTRACT_ADDRESS) {
      log.warn("No report contract address configured");
      return;
    }

    this.contract = new ethers.Contract(
      config.REPORT_CONTRACT_ADDRESS,
      REPORT_ABI,
      this.walletManager.getSigner(),
    );

    log.info(
      { address: config.REPORT_CONTRACT_ADDRESS },
      "NFT minter initialized",
    );
  }

  async mintReport(
    zipcode: string,
    metadata: ReportMetadata,
  ): Promise<string | null> {
    if (!this.contract) {
      log.warn("Report contract not initialized");
      return null;
    }

    try {
      // Upload metadata to IPFS (simplified — use data URI for now)
      const metadataUri = await this.uploadMetadata(metadata);

      // Encode the mint call
      const iface = new ethers.Interface(REPORT_ABI);
      const calldata = iface.encodeFunctionData("agentMint", [
        this.walletManager.getAddress(),
        parseInt(zipcode),
        metadataUri,
      ]);

      // Append builder code
      const dataWithBC = appendBuilderCode(calldata, config.BUILDER_CODE);

      const tx = await this.walletManager.getSigner().sendTransaction({
        to: config.REPORT_CONTRACT_ADDRESS,
        data: dataWithBC,
      });

      log.info(
        { txHash: tx.hash, zipcode, name: metadata.name },
        "NFT report minted with builder code",
      );

      await tx.wait();
      return tx.hash;
    } catch (error) {
      log.error({ error }, "Failed to mint NFT report");
      return null;
    }
  }

  private async uploadMetadata(metadata: ReportMetadata): Promise<string> {
    // If Pinata is configured, upload to IPFS
    if (config.PINATA_JWT) {
      try {
        const response = await fetch(
          "https://api.pinata.cloud/pinning/pinJSONToIPFS",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.PINATA_JWT}`,
            },
            body: JSON.stringify({
              pinataContent: metadata,
              pinataMetadata: { name: metadata.name },
            }),
          },
        );

        if (response.ok) {
          const data = await response.json();
          return `ipfs://${data.IpfsHash}`;
        }
      } catch (error) {
        log.warn({ error }, "Pinata upload failed, using data URI fallback");
      }
    }

    // Fallback: data URI (not ideal but works for demo)
    const json = JSON.stringify(metadata);
    const encoded = Buffer.from(json).toString("base64");
    return `data:application/json;base64,${encoded}`;
  }

  async getTotalSupply(): Promise<number> {
    if (!this.contract) return 0;
    try {
      const supply = await this.contract.totalSupply();
      return Number(supply);
    } catch {
      return 0;
    }
  }
}
