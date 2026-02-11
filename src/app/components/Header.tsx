"use client";

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

type HeaderProps = {
    chainLabel: string;
    showToast: (toast: { message: string; type: "success" | "error" }) => void;
};

export function Header({ chainLabel, showToast }: HeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
                    Guestbook
                </h1>
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
                    className="text-gray-400 hover:text-white transition-colors text-sm border border-gray-700 rounded-lg px-3 py-2 hover:bg-gray-800"
                    title="Copy link"
                >
                    Share
                </button>
                <Wallet>
                    <ConnectWallet className="bg-blue-600 hover:bg-blue-700 text-white">
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
    );
}
