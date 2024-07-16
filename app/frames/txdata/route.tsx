import { frames } from "../frames";
import { transaction } from "frames.js/core";
import {
  Abi,
  encodeFunctionData,
} from "viem";

const GLO_TOKEN_ADDRESS = "0x4F604735c1cF31399C6E711D5962b2B3E0225AD3";

export const POST = frames(async (ctx) => {
  const myContractAbi = [
    {
      "constant": false,
      "inputs": [
        {
          "name": "_to",
          "type": "address"
        },
        {
          "name": "_value",
          "type": "uint256"
        }
      ],
      "name": "transfer",
      "outputs": [
        {
          "name": "",
          "type": "bool"
        }
      ],
      "payable": false,
      "stateMutability": "nonpayable",
      "type": "function"
    },
  ] as Abi;

  const { address, amount, chainId } = ctx.searchParams;
  console.log(address, amount, chainId);

  const myCalldata = encodeFunctionData({
    abi: myContractAbi,
    functionName: "transfer",
    args: [address, +amount * (10 ** 18)],
  });

  return transaction({
    chainId: `eip155:${chainId}`,
    method: "eth_sendTransaction",
    params: {
      abi: myContractAbi,
      to: GLO_TOKEN_ADDRESS,
      data: myCalldata,
      value: String(0),
    },
  });
});
