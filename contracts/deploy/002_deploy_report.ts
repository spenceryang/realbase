import { ethers } from "hardhat";

async function main() {
  const agentAddress = process.env.AGENT_WALLET_ADDRESS || (await ethers.getSigners())[0].address;

  console.log("Deploying RealBaseReport with agent:", agentAddress);

  const Report = await ethers.getContractFactory("RealBaseReport");
  const report = await Report.deploy(agentAddress);
  await report.waitForDeployment();

  const reportAddress = await report.getAddress();
  console.log("RealBaseReport deployed to:", reportAddress);
  console.log(`\nREPORT_CONTRACT_ADDRESS=${reportAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
