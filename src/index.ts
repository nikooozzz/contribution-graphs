import { Env } from './types';
import { ALLOWED_SOURCES, getAdapter } from './adapters';
import { generateSvgGraph } from './renderer';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url);
		const user = url.searchParams.get('user');
		const sourcesParam = url.searchParams.get('sources');

		if (!user) {
			return new Response('Missing "user" parameter', { status: 400 });
		}

		const sources = sourcesParam
			? sourcesParam.split(',').map(s => s.trim().toLowerCase())
			: ['github'];

		const invalidSources = sources.filter(s => !ALLOWED_SOURCES.includes(s));
		if (invalidSources.length > 0) {
			return new Response(
				`Invalid source(s): ${invalidSources.join(', ')}. Allowed: ${ALLOWED_SOURCES.join(', ')}`,
				{ status: 400 }
			);
		}

		const activityPromises = sources.map(async (sourceName) => {
			const adapter = getAdapter(sourceName);
			if (!adapter) return {};
			try {
				return await adapter.fetchActivity(user, env);
			} catch (err) {
				console.error(`Error fetching from ${sourceName}:`, err);
				return {};
			}
		});

		const results = await Promise.all(activityPromises);

		const mergedActivity: Record<string, number> = {};
		for (const data of results) {
			for (const [date, count] of Object.entries(data)) {
				mergedActivity[date] = (mergedActivity[date] || 0) + count;
			}
		}

		const svgContent = generateSvgGraph(user, mergedActivity);

		return new Response(svgContent, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=14400',
			},
		});
  },
};

