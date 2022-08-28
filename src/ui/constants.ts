import { Token } from "@uniswap/sdk-core";

const V3_SWAP_ROUTER = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
const DECIMALS = 18;
const CHAIN_ID = 5;
const TOKENS = {
    WETH: new Token(
      CHAIN_ID,
      "0xB4FBF271143F4FBf7B91A5ded31805e42b2208d6",
      DECIMALS,
      "WETH",
      "Wrapped Ether"
    ),
    UNI: new Token(
      CHAIN_ID,
      "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      DECIMALS,
      "UNI",
      "Uniswap"
    ),
};

const WETH_ABI = [
    {
      constant: true,
      inputs: [],
      name: "name",
      outputs: [
        {
          name: "",
          type: "string",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "guy",
          type: "address",
        },
        {
          name: "wad",
          type: "uint256",
        },
      ],
      name: "approve",
      outputs: [
        {
          name: "",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [
        {
          name: "",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "src",
          type: "address",
        },
        {
          name: "dst",
          type: "address",
        },
        {
          name: "wad",
          type: "uint256",
        },
      ],
      name: "transferFrom",
      outputs: [
        {
          name: "",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "wad",
          type: "uint256",
        },
      ],
      name: "withdraw",
      outputs: [],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [
        {
          name: "",
          type: "uint8",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "address",
        },
      ],
      name: "balanceOf",
      outputs: [
        {
          name: "",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "symbol",
      outputs: [
        {
          name: "",
          type: "string",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      constant: false,
      inputs: [
        {
          name: "dst",
          type: "address",
        },
        {
          name: "wad",
          type: "uint256",
        },
      ],
      name: "transfer",
      outputs: [
        {
          name: "",
          type: "bool",
        },
      ],
      payable: false,
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      constant: false,
      inputs: [],
      name: "deposit",
      outputs: [],
      payable: true,
      stateMutability: "payable",
      type: "function",
    },
    {
      constant: true,
      inputs: [
        {
          name: "",
          type: "address",
        },
        {
          name: "",
          type: "address",
        },
      ],
      name: "allowance",
      outputs: [
        {
          name: "",
          type: "uint256",
        },
      ],
      payable: false,
      stateMutability: "view",
      type: "function",
    },
    {
      payable: true,
      stateMutability: "payable",
      type: "fallback",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "src",
          type: "address",
        },
        {
          indexed: true,
          name: "guy",
          type: "address",
        },
        {
          indexed: false,
          name: "wad",
          type: "uint256",
        },
      ],
      name: "Approval",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "src",
          type: "address",
        },
        {
          indexed: true,
          name: "dst",
          type: "address",
        },
        {
          indexed: false,
          name: "wad",
          type: "uint256",
        },
      ],
      name: "Transfer",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "dst",
          type: "address",
        },
        {
          indexed: false,
          name: "wad",
          type: "uint256",
        },
      ],
      name: "Deposit",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          name: "src",
          type: "address",
        },
        {
          indexed: false,
          name: "wad",
          type: "uint256",
        },
      ],
      name: "Withdrawal",
      type: "event",
    },
  ];


const SWAP_ROUTER_ABI = [
  "function exactInputSingle(ExactInputParams calldata params) external payable returns (uint256 amountOut)"
]
export {V3_SWAP_ROUTER, DECIMALS, CHAIN_ID, TOKENS, WETH_ABI, SWAP_ROUTER_ABI}