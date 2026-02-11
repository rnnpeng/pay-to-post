"use client";

import { Message, CHAIN, CONTRACT_ADDRESS } from "../abi";
import { Identity, Avatar, Name } from "@coinbase/onchainkit/identity";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useMemo } from "react";
import { timeAgo } from "../utils";
import { parseEther } from "viem";
import { Transaction, TransactionButton, TransactionStatus, TransactionStatusAction, TransactionStatusLabel } from "@coinbase/onchainkit/transaction";

type MessageListProps = {
    isLoading: boolean;
    messages: Message[];
    search: string;
    setSearch: (search: string) => void;
};

const PAGE_SIZE = 10;

export function MessageList({
    isLoading,
    messages,
    search,
    setSearch,
}: MessageListProps) {
    const [page, setPage] = useState(1);
    const [tippingMsg, setTippingMsg] = useState<string | null>(null);

    const filteredMessages = useMemo(() => {
        return search.trim()
            ? messages.filter(
                (msg) =>
                    msg.content.toLowerCase().includes(search.toLowerCase()) ||
                    msg.sender.toLowerCase().includes(search.toLowerCase())
            )
            : messages;
    }, [messages, search]);

    const visibleMessages = filteredMessages.slice(0, page * PAGE_SIZE);
    const hasMore = visibleMessages.length < filteredMessages.length;

    const handleShare = (platform: 'twitter' | 'warpcast', msg: Message) => {
        const text = encodeURIComponent(`Check out this message on the Guestbook: "${msg.content}"`);
        const url = encodeURIComponent(window.location.href);
        const intentUrl = platform === 'twitter'
            ? `https://twitter.com/intent/tweet?text=${text}&url=${url}`
            : `https://warpcast.com/~/compose?text=${text}&embeds[]=${url}`;
        window.open(intentUrl, '_blank');
    };

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    Messages
                    {messages.length > 0 && (
                        <span className="text-xs font-normal bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full border border-gray-700">
                            {messages.length}
                        </span>
                    )}
                </h2>
            </div>

            {messages.length > 0 && (
                <div className="relative mb-6">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1); // Reset pagination on search
                        }}
                        className="w-full rounded-lg bg-gray-900/50 border border-gray-700 text-white text-sm pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-gray-900 transition-colors"
                    />
                </div>
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
                ) : (
                    <>
                        <AnimatePresence initial={false}>
                            {visibleMessages.length > 0 ? (
                                visibleMessages.map((msg: Message, i: number) => (
                                    <motion.div
                                        key={`${msg.sender}-${msg.timestamp}-${i}`}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-gray-800/40 border border-gray-700 rounded-lg p-4 hover:bg-gray-800/60 transition-colors group relative"
                                    >
                                        <p className="text-white mb-3 whitespace-pre-wrap break-words text-sm sm:text-base leading-relaxed">
                                            {msg.content}
                                        </p>
                                        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-700/50 pt-3 mt-2">
                                            <div className="flex items-center gap-4">
                                                <Identity
                                                    address={msg.sender}
                                                    chain={CHAIN}
                                                    className="!bg-transparent !p-0 hover:opacity-80 transition-opacity"
                                                >
                                                    <Avatar className="h-5 w-5 mr-2 rounded-full" />
                                                    <Name className="text-xs text-gray-400 font-medium" />
                                                </Identity>
                                                <span className="font-mono text-[10px] opacity-70">{timeAgo(msg.timestamp)}</span>
                                            </div>

                                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {/* Social Share */}
                                                <button onClick={() => handleShare('twitter', msg)} className="p-1 hover:text-blue-400" title="Share on X">
                                                    <svg fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                                                </button>
                                                <button onClick={() => handleShare('warpcast', msg)} className="p-1 hover:text-purple-400" title="Share on Warpcast">
                                                    <svg fill="currentColor" viewBox="0 0 24 24" className="h-4 w-4"><path d="M23.2 11.667c0-2.28-1.545-4.14-3.578-4.667.114-.492.174-1.002.174-1.524 0-3.024-2.454-5.476-5.478-5.476-3.024 0-5.478 2.452-5.478 5.476 0 .522.06 1.032.174 1.524-2.033.527-3.578 2.387-3.578 4.667 0 .59.108 1.152.3 1.674-2.67 1.25-4.39 4.12-3.79 7.37.58 3.12 3.32 5.29 6.46 5.29h7.456c3.14 0 5.88-2.17 6.46-5.29.6-3.25-1.12-6.12-3.79-7.37.192-.522.3-1.084.3-1.674z" /></svg>
                                                </button>

                                                {/* Tipping */}
                                                <button
                                                    onClick={() => setTippingMsg(tippingMsg === msg.content ? null : msg.content)}
                                                    className="ml-2 px-2 py-1 bg-green-900/30 hover:bg-green-900/50 text-green-400 rounded text-[10px] font-medium transition-colors"
                                                >
                                                    Tip 0.001
                                                </button>
                                            </div>
                                        </div>

                                        {tippingMsg === msg.content && (
                                            <div className="mt-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700 animate-fade-in-down">
                                                <p className="text-xs text-gray-400 mb-2">Send 0.001 ETH to the author?</p>
                                                <Transaction
                                                    chainId={CHAIN.id}
                                                    calls={[{
                                                        to: msg.sender,
                                                        value: parseEther("0.001"),
                                                        data: "0x"
                                                    }]}
                                                    onSuccess={() => {
                                                        setTippingMsg(null);
                                                        alert("Tip sent!");
                                                    }}
                                                >
                                                    <TransactionButton text="Confirm Tip" className="w-full h-8 min-h-0 text-xs bg-green-600 hover:bg-green-500" />
                                                    <TransactionStatus>
                                                        <TransactionStatusLabel />
                                                        <TransactionStatusAction />
                                                    </TransactionStatus>
                                                </Transaction>
                                            </div>
                                        )}
                                    </motion.div>
                                ))
                            ) : messages.length > 0 && search.trim() ? (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-gray-500 text-center py-12"
                                >
                                    No messages match your search.
                                </motion.p>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-gray-500 text-center py-12 border border-dashed border-gray-800 rounded-xl"
                                >
                                    <p>No messages yet.</p>
                                    <p className="text-sm mt-1 opacity-70">Be the first to post!</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {hasMore && (
                            <div className="flex justify-center pt-4 pb-2">
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    className="px-6 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-sm font-medium text-gray-300 transition-colors border border-gray-700"
                                >
                                    Load More
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
