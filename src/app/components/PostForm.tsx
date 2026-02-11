"use client";

import {
    Transaction,
    TransactionButton,
    TransactionStatus,
    TransactionStatusLabel,
    TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";
import { useCallback, useState, useEffect } from "react";
import { encodeFunctionData, parseEther, formatEther } from "viem";
import { useEstimateGas } from "wagmi";
import { CHAIN, CONTRACT_ADDRESS, GUESTBOOK_ABI } from "../abi";

type PostFormProps = {
    isConnected: boolean;
    message: string;
    setMessage: (msg: string) => void;
    isPosting: boolean;
    setIsPosting: (isPosting: boolean) => void;
    isApproved: boolean;
    setIsApproved: (isApproved: boolean) => void;
    showToast: (toast: { message: string; type: "success" | "error" }) => void;
    onPostSuccess: () => void;
    isOwner: boolean;
};

const MAX_LENGTH = 280;

export function PostForm({
    isConnected,
    message,
    setMessage,
    isPosting,
    setIsPosting,
    isApproved,
    setIsApproved,
    showToast,
    onPostSuccess,
    isOwner,
}: PostFormProps) {
    const [isGenerating, setIsGenerating] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

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
    }, [showToast, setMessage, setIsApproved]);

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
    }, [message, showToast, setIsApproved]);

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

    // Gas Estimation
    const { data: gasEstimate } = useEstimateGas({
        account: isConnected ? undefined : undefined, // rely on connector
        to: CONTRACT_ADDRESS,
        data: calls[0]?.data,
        value: calls[0]?.value,
        query: {
            enabled: isConnected && isApproved && message.trim().length > 0
        }
    });

    return (
        <div className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between mb-2">
                <label htmlFor="message" className="text-sm font-medium text-gray-300">
                    Write a message
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
                className="w-full rounded-lg bg-gray-900 border border-gray-600 text-white px-4 py-3 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
                <span className="text-xs text-gray-500">
                    {gasEstimate && isApproved ? `Est. Gas: ${formatEther(gasEstimate * 1000000000n)} ETH (High estimate)` : ""}
                </span>
                <span
                    className={`text-xs ${message.length >= MAX_LENGTH ? "text-red-400" : "text-gray-500"
                        }`}
                >
                    {message.length} / {MAX_LENGTH}
                </span>
            </div>
            {isConnected && message.trim() && !isPosting && !isApproved && (
                <button
                    onClick={checkContent}
                    disabled={isChecking}
                    className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-all hover:shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2"
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
                        import("canvas-confetti").then((confetti) => {
                            confetti.default({
                                particleCount: 100,
                                spread: 70,
                                origin: { y: 0.6 },
                                colors: ["#5D5FEF", "#8B5CF6", "#F472B6"],
                            });
                        });
                        const audio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=");
                        audio.play().catch(e => console.log("Audio play failed", e));
                        onPostSuccess();
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
                    <TransactionButton
                        text="Post Message (0.001 ETH)"
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-medium"
                    />
                    <TransactionStatus>
                        <TransactionStatusLabel />
                        <TransactionStatusAction />
                    </TransactionStatus>
                </Transaction>
            )}
            {isPosting && (
                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-2 animate-pulse">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    Posting your message...
                </div>
            )}
        </div>
    );
}
