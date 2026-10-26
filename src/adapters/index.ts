import { SourceAdapter } from '../types';
import { githubAdapter } from './github';
import { gitlabAdapter } from './gitlab';
import { aurAdapter } from './aur';
import { huggingfaceAdapter } from './huggingface';

const adapterRegistry: Record<string, SourceAdapter> = {
	github: githubAdapter,
	gitlab: gitlabAdapter,
	aur: aurAdapter,
	hf: huggingfaceAdapter,
};

export const ALLOWED_SOURCES = Object.keys(adapterRegistry);

export function getAdapter(name: string): SourceAdapter | undefined {
	if (!name || typeof name !== 'string') {
		return undefined;
	}

	return adapterRegistry[name.toLowerCase()];
}
