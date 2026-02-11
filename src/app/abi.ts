import { base, baseSepolia } from "viem/chains";

export const CHAIN =
  process.env.NEXT_PUBLIC_CHAIN === "sepolia" ? baseSepolia : base;

export const CONTRACT_ADDRESS = (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS ||
  "0xB71C596aC966125d03960A43c762E86e51040F9B") as `0x${string}`;

export const EXPLORER_URL =
  CHAIN.id === base.id
    ? "https://basescan.org"
    : "https://sepolia.basescan.org";

export const GUESTBOOK_ABI = [
  {
    name: "postMessage",
    type: "function",
    stateMutability: "payable",
    inputs: [{ name: "_content", type: "string" }],
    outputs: [],
  },
  {
    name: "getMessages",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "sender", type: "address" },
          { name: "content", type: "string" },
          { name: "timestamp", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "owner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    type: "event",
    name: "MessagePosted",
    inputs: [
      { name: "sender", type: "address", indexed: true },
      { name: "content", type: "string", indexed: false },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
] as const;

export type Message = {
  sender: `0x${string}`;
  content: string;
  timestamp: bigint;
};
