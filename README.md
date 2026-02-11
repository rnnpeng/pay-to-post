# Pay-to-Post Guestbook 📜

A decentralized guestbook on the Base blockchain where users pay **0.001 ETH** to leave a permanent message. Built with **Next.js**, **OnchainKit**, and **Tailwind CSS**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Network](https://img.shields.io/badge/network-Base-blue)

## ✨ Features

-   **🖊️ Pay-to-Post**: Write a message for 0.001 ETH (plus gas).
-   **🤖 AI Assistance**: Auto-generate messages using AI.
-   **🛡️ Content Moderation**: AI-powered safety checks for content.
-   **💰 Tipping**: Send tips (0.001 ETH) directly to message authors.
-   **📢 Social Sharing**: Share posts on **X (Twitter)** and **Warpcast**.
-   **⚡ Real-time Updates**: Live message feed updates via blockchain events.

## 🛠️ Tech Stack

-   **Frontend**: Next.js 14, React 18, Tailwind CSS
-   **Blockchain Interaction**: [OnchainKit](https://onchainkit.xyz), Wagmi, Viem
-   **Smart Contract**: Solidity (Deployed on Base)
-   **Styling**: Framer Motion (Animations), Canvas Confetti

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   Coinbase Wallet or any EVM-compatible wallet

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/pay-to-post.git
    cd pay-to-post
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    npm install --legacy-peer-deps (if encountering ESLint conflicts)
    ```

3.  **Set up Environment Variables:**
    Create a `.env.local` file:
    ```env
    NEXT_PUBLIC_ONCHAINKIT_API_KEY=your_api_key
    NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id
    NEXT_PUBLIC_CHAIN=base # or sepolia
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📜 Smart Contract

The Guestbook contract is deployed on **Base**:
`0xB71C596aC966125d03960A43c762E86e51040F9B`

[View on Basescan](https://basescan.org/address/0xB71C596aC966125d03960A43c762E86e51040F9B)

## 🧪 Testing

Run unit tests for utility functions:

```bash
npx vitest run
```

---

Built with 💙 using [OnchainKit](https://onchainkit.xyz).
