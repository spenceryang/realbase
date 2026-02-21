import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

const configSchema = z.object({
  // Coinbase Developer Platform (optional — agent can run with raw private key)
  CDP_API_KEY_ID: z.string().default(""),
  CDP_API_KEY_SECRET: z.string().default(""),
  CDP_WALLET_ID: z.string().optional(),

  // Agent wallet private key (used when CDP is not configured)
  AGENT_PRIVATE_KEY: z.string().default(""),

  // Base Builder Code
  BUILDER_CODE: z.string().default("realbase"),

  // Data Source API Keys
  GREATSCHOOLS_API_KEY: z.string().default(""),
  WALKSCORE_API_KEY: z.string().default(""),
  CENSUS_API_KEY: z.string().default(""),
  SOCRATA_APP_TOKEN: z.string().default(""),
  RENTCAST_API_KEY: z.string().default(""),

  // IPFS
  PINATA_JWT: z.string().default(""),
  PINATA_GATEWAY: z.string().default("https://gateway.pinata.cloud"),

  // Contract Addresses
  ORACLE_CONTRACT_ADDRESS: z.string().default(""),
  REPORT_CONTRACT_ADDRESS: z.string().default(""),

  // Agent Configuration
  AGENT_TICK_INTERVAL_MS: z.coerce.number().default(900_000), // 15 minutes
  MIN_OPERATING_BALANCE_USDC: z.coerce.number().default(5),
  MIN_GAS_RESERVE_ETH: z.coerce.number().default(0.001),
  PORT: z.coerce.number().default(4021),

  // Base Mainnet
  BASE_RPC_URL: z.string().default("https://mainnet.base.org"),
  BASE_CHAIN_ID: z.coerce.number().default(8453),

  // USDC on Base
  USDC_ADDRESS: z
    .string()
    .default("0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"),
});

function loadConfig() {
  const result = configSchema.safeParse(process.env);
  if (!result.success) {
    console.error("Configuration validation failed:");
    for (const issue of result.error.issues) {
      console.error(`  ${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
}

export const config = loadConfig();
export type Config = z.infer<typeof configSchema>;
