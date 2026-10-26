import { SourceAdapter } from '../types';

export const githubAdapter: SourceAdapter = {
	name: 'github',
	async fetchActivity(user: string): Promise<Record<string, number>> {
		return {
			'2026-10-22': 4,
			'2026-10-23': 2,
		};
	}
}
