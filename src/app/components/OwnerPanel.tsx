"use client";

import {
    Transaction,
    TransactionButton,
    TransactionStatus,
    TransactionStatusLabel,
    TransactionStatusAction,
} from "@coinbase/onchainkit/transaction";
import { formatEther } from "viem";
import { CHAIN, CONTRACT_ADDRESS, GUESTBOOK_ABI } from "../abi";
import { encodeFunctionData } from "viem";

type OwnerPanelProps = {
    contractBalance: { value: bigint; symbol: string; decimals: number } | undefined;
    showToast: (toast: { message: string; type: "success" | "error" }) => void;
};

export function OwnerPanel({ contractBalance, showToast }: OwnerPanelProps) {
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

    return (
        <div className="bg-indigo-900/30 rounded-xl p-6 mb-6 border border-indigo-700 shadow-lg shadow-indigo-900/20">
            <h3 className="text-sm font-semibold text-indigo-300 mb-2 uppercase tracking-wide">
                Owner Panel
            </h3>
            <p className="text-sm text-gray-300 mb-4">
                Contract balance:{" "}
                <span className="font-mono text-white text-lg">
                    {contractBalance ? formatEther(contractBalance.value) : "0"} ETH
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
                    <TransactionButton
                        text="Withdraw Funds"
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
                    />
                    <TransactionStatus>
                        <TransactionStatusLabel />
                        <TransactionStatusAction />
                    </TransactionStatus>
                </Transaction>
            )}
        </div>
    );
}
