import { SourceAdapter } from '../types';
import { githubAdapter } from './github';
import { gitlabAdapter } from './gitlab';

const adapterRegistry: Record<string, SourceAdapter> = {
	github: githubAdapter,
	gitlab: gitlabAdapter,
};

export const ALLOWED_SOURCES = Object.keys(adapterRegistry);

export function getAdapter(name: string): SourceAdapter | undefined {
	return adapterRegistry[name.toLowerCase()];
}
