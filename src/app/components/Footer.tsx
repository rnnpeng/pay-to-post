import { CONTRACT_ADDRESS, CHAIN } from "../abi";

export default function Footer() {
    const explorerUrl = CHAIN.blockExplorers?.default.url || "https://basescan.org";

    return (
        <footer className="w-full py-6 mt-12 border-t border-gray-800 text-center">
            <div className="flex flex-col items-center gap-4">
                <div className="flex gap-6 text-sm text-gray-400">
                    <a
                        href={`${explorerUrl}/address/${CONTRACT_ADDRESS}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors flex items-center gap-1"
                    >
                        <span>📜</span> Smart Contract
                    </a>
                    <a
                        href="https://github.com/coinbase/onchainkit"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-400 transition-colors flex items-center gap-1"
                    >
                        <span>⛵️</span> Built with OnchainKit
                    </a>
                </div>
                <p className="text-xs text-gray-600">
                    Pay-to-Post Guestbook • 0.001 ETH per post
                </p>
            </div>
        </footer>
    );
}
