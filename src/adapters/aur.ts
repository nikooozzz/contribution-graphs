import { SourceAdapter, Env } from '../types';

export const aurAdapter: SourceAdapter = {
	name: "aur",
	async fetchActivity(user: string, _env: Env, urlParams?: URLSearchParams): Promise<Record<string, number>> {
		const authorFilter = urlParams?.get('aur_author')?.toLowerCase() || '';
		const url = `https://aur.archlinux.org/rpc/v5/search/${encodeURIComponent(user)}?by=maintainer`;
		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Nikoware-Contribution-Graph-Worker',
			},
		});

		if (!response.ok) {
			throw new Error(`AUR API error: ${response.statusText}`);
		}

		const data: any = await response.json();
		if (!data.results || !Array.isArray(data.results)) {
			return {};
		}

		const activityMap: Record<string, number> = {};

		const feedPromises = data.results.map(async (pkg: any) => {
			const pkgName = pkg.PackageBase || pkg.Name;
			if (!pkgName) return;

			try {
				const feedUrl = `https://aur.archlinux.org/cgit/aur.git/atom/?h=${encodeURIComponent(pkgName)}`;
				const feedRes = await fetch(feedUrl, {
					headers: {
						'User-Agent': 'Nikoware-Contribution-Graph-Worker',
					},
				});

				if (!feedRes.ok) return;
				const xmlText = await feedRes.text();
				const entries = xmlText.split('<entry>');
				for (let i = 1; i < entries.length; i++) {
					const entry = entries[i];
					if (authorFilter) {
						const authorBlockMatch = entry.match(/<author>([\s\S]*?)<\/author>/);
						if (authorBlockMatch) {
							const authorText = authorBlockMatch[1].toLowerCase();
							if (!authorText.includes(authorFilter)) {
								continue;
							}
						}
					}

					const dateMatch = entry.match(/<updated>(\d{4}-\d{2}-\d{2})T/);
					if (dateMatch && dateMatch[1]) {
						const dateStr = dateMatch[1];
						activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
					}
				}
			} catch (err) {
				console.error(`Failed to fetch commit history for AUR package ${pkgName}:`, err);
			}
		});

		await Promise.all(feedPromises);
		return activityMap;
	}
};
