import { frames } from "../frames";
import { transaction } from "frames.js/core";
import {
  Abi,
  createPublicClient,
  encodeFunctionData,
  getContract,
  http,
  parseGwei,
} from "viem";
import { base } from "viem/chains";

const AFFILIATE_ID =
  "0x4643ba4e17a0f6284d077d19f1a955cb268415380917b929a2d42a4c0ee46bd4";
const GLO_TOKEN_ADDRESS = "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3";
const DONATION_CONTRACT = "0x3aeAd90F79DB5d8F0CAd23Fd416477AB4eF70FFE";

export const POST = frames(async (ctx) => {
  const myContractAbi = [
    {
      inputs: [
        { internalType: "bytes32", name: "_affiliateID", type: "bytes32" },
        { internalType: "address", name: "_charity", type: "address" },
        { internalType: "uint256", name: "_tokenAmount", type: "uint256" },
        { internalType: "address", name: "tokenAddress", type: "address" },
      ],
      name: "processTokenDonation",
      outputs: [],
      stateMutability: "payable",
      type: "function" as "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "_affiliateID", type: "bytes32" },
      ],
      name: "getAffiliateFeeAmount",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ] as Abi;

  const { address, amount } = ctx.searchParams;

  const myCalldata = encodeFunctionData({
    abi: myContractAbi,
    functionName: "processTokenDonation",
    args: [AFFILIATE_ID, address, amount, GLO_TOKEN_ADDRESS],
  });

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const storageRegistry = getContract({
    address: DONATION_CONTRACT,
    abi: myContractAbi,
    client: publicClient,
  });

  const unitPrice = (await storageRegistry.read.getAffiliateFeeAmount([
    AFFILIATE_ID,
  ])) as any;

  const t = transaction({
    chainId: `eip155:${base.id}`,
    method: "eth_sendTransaction",
    params: {
      abi: myContractAbi,
      to: DONATION_CONTRACT,
      data: myCalldata,
      value: unitPrice.toString(),
    },
  });
  console.log(t);
  return t;
});
