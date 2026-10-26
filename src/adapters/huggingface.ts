import { SourceAdapter, Env } from '../types';

export const huggingfaceAdapter: SourceAdapter = {
	name: "hf",
	async fetchActivity(user: string, env: Env): Promise<Record<string, number>> {
		const token = env.HUGGINGFACE_TOKEN;
		const headers: Record<string, string> = {
			'User-Agent': 'Nikoware-Contribution-Graph-Worker',
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const endpoints = [
			`https://huggingface.co/api/models?author=${encodeURIComponent(user)}&full=true`,
			`https://huggingface.co/api/datasets?author=${encodeURIComponent(user)}&full=true`,
			`https://huggingface.co/api/spaces?author=${encodeURIComponent(user)}&full=true`,
		];

		const activityMap: Record<string, number> = {};

		const promises = endpoints.map(async (url) => {
			try {
				const res = await fetch(url, { headers });
				if (!res.ok) return [];
				return (await res.json()) as any[];
			} catch (err) {
				console.error(`Error fetching Hugging Face data from ${url}:`, err);
				return [];
			}
		});

		const results = await Promise.all(promises);

		for (const items of results) {
			if (!Array.isArray(items)) continue;
			for (const item of items) {
				const timestamp = item.lastModified || item.createdAt;
				if (!timestamp) continue;

				const dateStr = timestamp.split('T')[0];
				if (dateStr) {
					activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
				}
			}
		}

		return activityMap;
	},
};
