import { SourceAdapter } from '../types';
import { githubAdapter } from './github';

const adapterRegistry: Record<string, SourceAdapter> = {
	github: githubAdapter,
};

export const ALLOWED_SOURCES = Object.keys(adapterRegistry);

export function getAdapter(name: string): SourceAdapter | undefined {
	return adapterRegistry[name.toLowerCase()];
}
