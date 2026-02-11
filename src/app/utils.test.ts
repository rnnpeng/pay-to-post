import { describe, it, expect } from 'vitest';
import { timeAgo } from './utils';

describe('timeAgo', () => {
    it('returns "just now" for recent times', () => {
        const now = BigInt(Math.floor(Date.now() / 1000));
        expect(timeAgo(now - 10n)).toBe('just now');
    });

    it('returns minutes ago', () => {
        const now = BigInt(Math.floor(Date.now() / 1000));
        expect(timeAgo(now - 120n)).toBe('2m ago');
    });

    it('returns hours ago', () => {
        const now = BigInt(Math.floor(Date.now() / 1000));
        expect(timeAgo(now - 7200n)).toBe('2h ago');
    });

    it('returns days ago', () => {
        const now = BigInt(Math.floor(Date.now() / 1000));
        expect(timeAgo(now - 86400n * 2n)).toBe('2d ago');
    });
});
