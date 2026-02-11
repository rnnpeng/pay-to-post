"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount, useBalance, useReadContract, useWatchContractEvent } from "wagmi";
import {
  CHAIN,
  CONTRACT_ADDRESS,
  EXPLORER_URL,
  GUESTBOOK_ABI,
  type Message,
} from "./abi";
import { Header } from "./components/Header";
import { PostForm } from "./components/PostForm";
import { MessageList } from "./components/MessageList";
import { OwnerPanel } from "./components/OwnerPanel";

type Toast = { message: string; type: "success" | "error" };

export default function Home() {
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const { address, isConnected } = useAccount();

  // Read messages
  const { data: messages, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: GUESTBOOK_ABI,
    functionName: "getMessages",
    chainId: CHAIN.id,
    query: {
      refetchInterval: false, // Disable aggressive polling, use events instead
      staleTime: 60000 // Keep data fresh for a minute unless invalidated
    },
  });

  // Watch for new messages
  useWatchContractEvent({
    address: CONTRACT_ADDRESS,
    abi: GUESTBOOK_ABI,
    eventName: 'MessagePosted',
    chainId: CHAIN.id,
    onLogs: (logs) => {
      // When a new message is posted, refetch the messages list
      // This is more efficient than polling every few seconds
      console.log('New message detected, refreshing...', logs);
      refetch();
    },
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

  const messageList = messages ? [...(messages as Message[])].reverse() : [];
  const chainLabel = CHAIN.id === 8453 ? "Base" : "Base Sepolia";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white selection:bg-blue-500/30">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-opacity animate-fade-in-down ${toast.type === "success"
              ? "bg-green-600/90 text-white shadow-green-900/20"
              : "bg-red-600/90 text-white shadow-red-900/20"
            }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        {/* Env warning */}
        {!process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY && (
          <div className="mb-6 p-4 rounded-lg bg-yellow-900/50 border border-yellow-700 text-yellow-200 text-sm">
            Missing{" "}
            <code className="font-mono">NEXT_PUBLIC_ONCHAINKIT_API_KEY</code> in
            your environment. Wallet features may not work.
          </div>
        )}

        <Header chainLabel={chainLabel} showToast={showToast} />

        <PostForm
          isConnected={isConnected}
          message={message}
          setMessage={setMessage}
          isPosting={isPosting}
          setIsPosting={setIsPosting}
          isApproved={isApproved}
          setIsApproved={setIsApproved}
          showToast={showToast}
          onPostSuccess={() => {
            // Optimistic update or wait for event listener
            setTimeout(() => refetch(), 1000);
          }}
          isOwner={!!isOwner}
        />

        {/* Owner Panel */}
        {isOwner && (
          <OwnerPanel
            contractBalance={contractBalance}
            showToast={showToast}
          />
        )}

        <MessageList
          isLoading={isLoading}
          messages={messageList}
          search={search}
          setSearch={setSearch}
        />
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 mt-16 text-gray-400">
        <div className="max-w-2xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>Built on {chainLabel}</span>
          <a
            href={`${EXPLORER_URL}/address/${CONTRACT_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            View contract on Basescan
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </footer>
    </main>
  );
}
