/**
 * ERC-8021 Builder Code encoding for Base transaction attribution.
 *
 * Every transaction the agent sends appends a builder code suffix
 * to the calldata. This does not affect contract execution (extra
 * calldata is ignored by the EVM) but is readable by indexers.
 *
 * Format: 0x07 + utf8Hex(builderCode) + BUILDER_CODE_TERMINATOR
 */

const BUILDER_CODE_TERMINATOR = "0080218021802180218021802180218021";

export function encodeBuilderCode(builderCode: string): string {
  const hexCode = Buffer.from(builderCode, "utf-8").toString("hex");
  return `07${hexCode}${BUILDER_CODE_TERMINATOR}`;
}

export function appendBuilderCode(
  calldata: string,
  builderCode: string,
): string {
  const suffix = encodeBuilderCode(builderCode);
  // Ensure calldata starts with 0x
  const data = calldata.startsWith("0x") ? calldata : `0x${calldata}`;
  return `${data}${suffix}`;
}

export function hasBuilderCode(calldata: string): boolean {
  return calldata.includes(BUILDER_CODE_TERMINATOR);
}
