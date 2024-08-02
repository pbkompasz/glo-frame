import { frames } from "../frames";
import { transaction } from "frames.js/core";
import { Abi, encodeFunctionData } from "viem";

const GLO_TOKEN_ADDRESS = "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3";

export const POST = frames(async (ctx) => {
  const myContractAbi = [
    {
      inputs: [
        {
          internalType: "contract Registry",
          name: "_registry",
          type: "address",
        },
      ],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "entity",
          type: "address",
        },
        {
          indexed: true,
          internalType: "uint8",
          name: "entityType",
          type: "uint8",
        },
        {
          indexed: true,
          internalType: "address",
          name: "entityManager",
          type: "address",
        },
      ],
      name: "EntityDeployed",
      type: "event",
    },
    {
      inputs: [],
      name: "ETH_PLACEHOLDER",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "baseToken",
      outputs: [{ internalType: "contract ERC20", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_manager", type: "address" },
        { internalType: "bytes32", name: "_salt", type: "bytes32" },
      ],
      name: "computeFundAddress",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes32", name: "_orgId", type: "bytes32" }],
      name: "computeOrgAddress",
      outputs: [{ internalType: "address", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_manager", type: "address" },
        { internalType: "bytes32", name: "_salt", type: "bytes32" },
      ],
      name: "deployFund",
      outputs: [
        { internalType: "contract Fund", name: "_fund", type: "address" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_manager", type: "address" },
        { internalType: "bytes32", name: "_salt", type: "bytes32" },
        { internalType: "uint256", name: "_amount", type: "uint256" },
      ],
      name: "deployFundAndDonate",
      outputs: [
        { internalType: "contract Fund", name: "_fund", type: "address" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "_manager", type: "address" },
        { internalType: "bytes32", name: "_salt", type: "bytes32" },
        {
          internalType: "contract ISwapWrapper",
          name: "_swapWrapper",
          type: "address",
        },
        { internalType: "address", name: "_tokenIn", type: "address" },
        { internalType: "uint256", name: "_amountIn", type: "uint256" },
        { internalType: "bytes", name: "_data", type: "bytes" },
      ],
      name: "deployFundSwapAndDonate",
      outputs: [
        { internalType: "contract Fund", name: "_fund", type: "address" },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes32", name: "_orgId", type: "bytes32" }],
      name: "deployOrg",
      outputs: [
        { internalType: "contract Org", name: "_org", type: "address" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "_orgId", type: "bytes32" },
        { internalType: "uint256", name: "_amount", type: "uint256" },
      ],
      name: "deployOrgAndDonate",
      outputs: [
        { internalType: "contract Org", name: "_org", type: "address" },
      ],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "_orgId", type: "bytes32" },
        {
          internalType: "contract ISwapWrapper",
          name: "_swapWrapper",
          type: "address",
        },
        { internalType: "address", name: "_tokenIn", type: "address" },
        { internalType: "uint256", name: "_amountIn", type: "uint256" },
        { internalType: "bytes", name: "_data", type: "bytes" },
      ],
      name: "deployOrgSwapAndDonate",
      outputs: [
        { internalType: "contract Org", name: "_org", type: "address" },
      ],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [],
      name: "fundImplementation",
      outputs: [{ internalType: "contract Fund", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "orgImplementation",
      outputs: [{ internalType: "contract Org", name: "", type: "address" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "registry",
      outputs: [
        { internalType: "contract Registry", name: "", type: "address" },
      ],
      stateMutability: "view",
      type: "function",
    },
  ] as Abi;

  const { id, amount, chainId } = ctx.searchParams;

  console.log(ctx.searchParams)

  const url =
    `https://api.endaoment.org/v1/sdk/donations/swap?id=${id}&chainId=8453&tokenAddress=${GLO_TOKEN_ADDRESS}&amountIn=${+amount * 10**12}`;
  const options = {
    method: "GET",
    headers: {
      accept: "application/json",
    },
  };

  let to, value, data, quote;

  try {
    const resp = await fetch(url, options);
    const response = await resp.json();
    to = response.to;
    value = response.value;
    data = response.data;
    quote = response.quote;

    console.log(response)
  } catch (error) {
    console.log("Error fetching swap");
  }

  return transaction({
    chainId: `eip155:${chainId}`,
    method: "eth_sendTransaction",
    params: {
      abi: myContractAbi,
      to: GLO_TOKEN_ADDRESS,
      data,
      value,
      gas: String(100000000000),
    },
  });
});
