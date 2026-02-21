import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  const agentAddress = process.env.AGENT_WALLET_ADDRESS || deployer.address;

  console.log("Deploying RealBaseOracle with agent:", agentAddress);

  const Oracle = await ethers.getContractFactory("RealBaseOracle");
  const oracle = await Oracle.deploy(agentAddress);
  await oracle.waitForDeployment();

  const oracleAddress = await oracle.getAddress();
  console.log("RealBaseOracle deployed to:", oracleAddress);

  console.log("Deploying RealBaseReport with agent:", agentAddress);

  const Report = await ethers.getContractFactory("RealBaseReport");
  const report = await Report.deploy(agentAddress);
  await report.waitForDeployment();

  const reportAddress = await report.getAddress();
  console.log("RealBaseReport deployed to:", reportAddress);

  console.log("\nAdd these to your .env:");
  console.log(`ORACLE_CONTRACT_ADDRESS=${oracleAddress}`);
  console.log(`REPORT_CONTRACT_ADDRESS=${reportAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
