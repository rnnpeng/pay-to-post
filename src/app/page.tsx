"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Wallet,
  ConnectWallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import {
  Identity,
  Address,
  Avatar,
  Name,
} from "@coinbase/onchainkit/identity";
import {
  Transaction,
  TransactionButton,
  TransactionStatus,
  TransactionStatusLabel,
  TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";
import { useAccount, useBalance, useReadContract } from "wagmi";
import { encodeFunctionData, formatEther, parseEther } from "viem";
import {
  CHAIN,
  CONTRACT_ADDRESS,
  EXPLORER_URL,
  GUESTBOOK_ABI,
  type Message,
} from "./abi";

const MAX_LENGTH = 280;

function timeAgo(timestamp: bigint): string {
  const seconds = Math.floor(Date.now() / 1000) - Number(timestamp);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(Number(timestamp) * 1000).toLocaleDateString();
}

type Toast = { message: string; type: "success" | "error" };

export default function Home() {
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const { address, isConnected } = useAccount();

  // Read messages
  const { data: messages, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GUESTBOOK_ABI,
    functionName: "getMessages",
    chainId: CHAIN.id,
    query: { refetchInterval: 5000 },
  });

  // Read contract owner
  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GUESTBOOK_ABI,
    functionName: "owner",
    chainId: CHAIN.id,
  });

  // Read contract balance (for owner panel)
  const { data: contractBalance } = useBalance({
    address: CONTRACT_ADDRESS,
    chainId: CHAIN.id,
    query: { refetchInterval: 10000 },
  });

  const isOwner =
    isConnected &&
    address &&
    owner &&
    address.toLowerCase() === (owner as string).toLowerCase();

  const showToast = useCallback((t: Toast) => {
    setToast(t);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(id);
  }, [toast]);

  const generateMessage = useCallback(async () => {
    setIsGenerating(true);
    try {
      const res = await fetch("/api/generate", { method: "POST" });
      if (!res.ok) throw new Error("Generation failed");
      const { text } = await res.json();
      setMessage(text);
      setIsApproved(false);
    } catch {
      showToast({ message: "AI generation failed.", type: "error" });
    } finally {
      setIsGenerating(false);
    }
  }, [showToast]);

  const checkContent = useCallback(async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/check-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const { isSafe, reason } = await res.json();
      if (isSafe) {
        setIsApproved(true);
      } else {
        showToast({ message: `Blocked: ${reason}`, type: "error" });
      }
    } catch {
      showToast({ message: "Content check failed.", type: "error" });
    } finally {
      setIsChecking(false);
    }
  }, [message, showToast]);

  const calls = message.trim()
    ? [
      {
        to: CONTRACT_ADDRESS,
        data: encodeFunctionData({
          abi: GUESTBOOK_ABI,
          functionName: "postMessage",
          args: [message],
        }),
        value: parseEther("0.001"),
      },
    ]
    : [];

  const withdrawCalls = [
    {
      to: CONTRACT_ADDRESS,
      data: encodeFunctionData({
        abi: GUESTBOOK_ABI,
        functionName: "withdraw",
        args: [],
      }),
    },
  ];

  const missingConfig = !process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY;

  const messageList = messages ? [...(messages as Message[])].reverse() : [];
  const filteredMessages = search.trim()
    ? messageList.filter(
      (msg) =>
        msg.content.toLowerCase().includes(search.toLowerCase()) ||
        msg.sender.toLowerCase().includes(search.toLowerCase())
    )
    : messageList;

  const chainLabel = CHAIN.id === 8453 ? "Base" : "Base Sepolia";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-opacity ${
            toast.type === "success"
              ? "bg-green-600/90 text-white"
              : "bg-red-600/90 text-white"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Env warning */}
        {missingConfig && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-900/50 border border-yellow-700 text-yellow-200 text-sm">
            Missing{" "}
            <code className="font-mono">NEXT_PUBLIC_ONCHAINKIT_API_KEY</code> in
            your environment. Wallet features may not work.
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Guestbook</h1>
            <p className="text-gray-400 text-sm mt-1">
              Pay 0.001 ETH to leave a message on {chainLabel}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                showToast({ message: "Link copied!", type: "success" });
              }}
              className="text-gray-400 hover:text-white transition-colors text-sm border border-gray-700 rounded-lg px-3 py-2"
              title="Copy link"
            >
              Share
            </button>
            <Wallet>
              <ConnectWallet>
                <Avatar className="h-6 w-6" />
                <Name />
              </ConnectWallet>
              <WalletDropdown>
                <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                  <Avatar />
                  <Name />
                  <Address />
                </Identity>
                <WalletDropdownDisconnect />
              </WalletDropdown>
            </Wallet>
          </div>
        </div>

        {/* Post Form */}
        <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="message"
              className="text-sm font-medium text-gray-300"
            >
              Your message
            </label>
            {isConnected && (
              <button
                onClick={generateMessage}
                disabled={isGenerating || isPosting}
                className="text-xs text-purple-400 hover:text-purple-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
              >
                {isGenerating ? (
                  <>
                    <span className="inline-block h-3 w-3 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  "✨ Write for me"
                )}
              </button>
            )}
          </div>
          <textarea
            id="message"
            rows={3}
            maxLength={MAX_LENGTH}
            disabled={!isConnected || isPosting}
            className="w-full rounded-lg bg-gray-900 border border-gray-600 text-white px-4 py-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder={
              isConnected
                ? "Write something on the guestbook..."
                : "Connect your wallet to post"
            }
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              setIsApproved(false);
            }}
          />
          <div className="flex items-center justify-between mb-4">
            <span />
            <span
              className={`text-xs ${
                message.length >= MAX_LENGTH ? "text-red-400" : "text-gray-500"
              }`}
            >
              {message.length} / {MAX_LENGTH}
            </span>
          </div>
          {isConnected && message.trim() && !isPosting && !isApproved && (
            <button
              onClick={checkContent}
              disabled={isChecking}
              className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isChecking ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Checking content...
                </>
              ) : (
                "Check & Post (0.001 ETH)"
              )}
            </button>
          )}
          {isConnected && message.trim() && !isPosting && isApproved && (
            <Transaction
              chainId={CHAIN.id}
              calls={calls}
              onStatus={(status) => {
                if (status.statusName === "transactionPending") {
                  setIsPosting(true);
                }
              }}
              onSuccess={() => {
                setMessage("");
                setIsPosting(false);
                setIsApproved(false);
                showToast({ message: "Message posted!", type: "success" });
                setTimeout(() => refetch(), 2000);
              }}
              onError={(error) => {
                console.error("Transaction error:", error);
                setIsPosting(false);
                setIsApproved(false);
                showToast({
                  message: "Transaction failed. Please try again.",
                  type: "error",
                });
              }}
            >
              <TransactionButton text="Post Message (0.001 ETH)" />
              <TransactionStatus>
                <TransactionStatusLabel />
                <TransactionStatusAction />
              </TransactionStatus>
            </Transaction>
          )}
          {isPosting && (
            <p className="text-sm text-gray-400 animate-pulse">
              Posting your message...
            </p>
          )}
        </div>

        {/* Owner Panel */}
        {isOwner && (
          <div className="bg-indigo-900/30 rounded-xl p-6 mb-6 border border-indigo-700">
            <h3 className="text-sm font-semibold text-indigo-300 mb-2">
              Owner Panel
            </h3>
            <p className="text-sm text-gray-300 mb-4">
              Contract balance:{" "}
              <span className="font-mono text-white">
                {contractBalance
                  ? formatEther(contractBalance.value)
                  : "0"}{" "}
                ETH
              </span>
            </p>
            {contractBalance && contractBalance.value > 0n && (
              <Transaction
                chainId={CHAIN.id}
                calls={withdrawCalls}
                onSuccess={() => {
                  showToast({
                    message: "Withdrawal successful!",
                    type: "success",
                  });
                }}
                onError={(error) => {
                  console.error("Withdraw error:", error);
                  showToast({
                    message: "Withdrawal failed.",
                    type: "error",
                  });
                }}
              >
                <TransactionButton text="Withdraw Funds" />
                <TransactionStatus>
                  <TransactionStatusLabel />
                  <TransactionStatusAction />
                </TransactionStatus>
              </Transaction>
            )}
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Messages
            {messageList.length > 0 && (
              <span className="text-sm font-normal text-gray-400 ml-2">
                ({messageList.length})
              </span>
            )}
          </h2>
        </div>

        {/* Search */}
        {messageList.length > 0 && (
          <input
            type="text"
            placeholder="Search messages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-gray-900 border border-gray-700 text-white text-sm px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        )}

        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 animate-pulse"
                >
                  <div className="h-4 bg-gray-700 rounded w-3/4 mb-3" />
                  <div className="h-3 bg-gray-700 rounded w-1/2 mb-2" />
                  <div className="flex justify-between">
                    <div className="h-3 bg-gray-700 rounded w-24" />
                    <div className="h-3 bg-gray-700 rounded w-16" />
                  </div>
                </div>
              ))}
            </>
          ) : filteredMessages.length > 0 ? (
            filteredMessages.map((msg: Message, i: number) => (
              <div
                key={i}
                className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <p className="text-white mb-3 whitespace-pre-wrap break-words">
                  {msg.content}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <Identity
                    address={msg.sender}
                    chain={CHAIN}
                    className="!bg-transparent !p-0"
                  >
                    <Avatar className="h-4 w-4" />
                    <Name className="text-xs text-gray-400" />
                  </Identity>
                  <span>{timeAgo(msg.timestamp)}</span>
                </div>
              </div>
            ))
          ) : messageList.length > 0 && search.trim() ? (
            <p className="text-gray-500 text-center py-8">
              No messages match your search.
            </p>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No messages yet. Be the first to post!
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16">
        <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>Built on {chainLabel}</span>
          <a
            href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-gray-300 transition-colors"
          >
            View contract on Basescan
          </a>
        </div>
      </footer>
    </main>
  );
}
