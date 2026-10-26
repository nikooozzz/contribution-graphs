import { Env } from './types';
import { ALLOWED_SOURCES, getAdapter } from './adapters';
import { generateSvgGraph } from './renderer';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		const url = new URL(request.url);
		const path = url.pathname;

		const cacheKey = new Request(request.url, request);
		const cache = caches.default;
		if (url.searchParams.has('nocache')) {
			return await generateAndCacheGraph(cacheKey, url, env);
		}

		let cacheResp = await cache.match(cacheKey);
		if (cacheResp) {
			console.log('Cache hit for request!')
			ctx.waitUntil(updateCacheInBackground(cacheKey, url, env));
			return cacheResp;
		}

		return await generateAndCacheGraph(cacheKey, url, env);
	}
}

async function generateAndCacheGraph(cacheKey: Request, url: URL, env: Env): Promise<Response> {
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

	const response = new Response(svgContent, {
		headers: {
			'Content-Type': 'image/svg+xml',
			'Cache-Control': 'public, max-age=14400, stale-while-revalidate=86400',
		},
	});

	await caches.default.put(cacheKey, response.clone());
	return response;
}

async function updateCacheInBackground(cacheKey: Request, url: URL, env: Env) {
	try {
		await generateAndCacheGraph(cacheKey, url, env);
	} catch (err) {
		console.error('Background cache update failed:', err);
	}
}
