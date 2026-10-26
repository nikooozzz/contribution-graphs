import { describe, it, expect } from 'vitest';
import { getAdapter, ALLOWED_SOURCES } from '../src/adapters/index';

describe('Adapter Registry & Router Logic (Finalized)', () => {
    it('should contain all expected allowed sources', () => {
        expect(ALLOWED_SOURCES).toEqual(['github', 'gitlab', 'aur', 'hf']);
    });

    it('should ensure every registered adapter has a name matching or mapping to its registry key', () => {
        for (const source of ALLOWED_SOURCES) {
            const adapter = getAdapter(source);
            expect(adapter).toBeDefined();
            expect(adapter?.name.toLowerCase()).toBe(source === 'hf' ? 'huggingface' : source);
        }
    });

    it('should resolve every item in ALLOWED_SOURCES case-insensitively', () => {
        for (const source of ALLOWED_SOURCES) {
            expect(getAdapter(source.toUpperCase())).toBeDefined();
            expect(getAdapter(source.toLowerCase())).toBeDefined();
        }
    });

    it('should return undefined for unregistered or invalid source names', () => {
        expect(getAdapter('bitbucket')).toBeUndefined();
        expect(getAdapter('codeberg')).toBeUndefined();
        expect(getAdapter('')).toBeUndefined();
    });

    it('should handle type edge cases and falsy inputs safely', () => {
        expect(getAdapter(null as unknown as string)).toBeUndefined();
        expect(getAdapter(undefined as unknown as string)).toBeUndefined();
        expect(getAdapter(123 as unknown as string)).toBeUndefined();
    });
});
