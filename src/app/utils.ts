export function timeAgo(timestamp: bigint): string {
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
