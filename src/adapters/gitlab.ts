import { SourceAdapter, Env } from '../types';

export const gitlabAdapter: SourceAdapter = {
	name: 'gitlab',
	async fetchActivity(user: string, env: Env): Promise<Record<string, number>> {
		const token = env?.GITLAB_TOKEN;
		const headers: Record<string, string> = {
			'User-Agent': 'Nikoware-Contribution-Graph-Worker',
		};

		if (token) {
			headers['PRIVATE-TOKEN'] = token;
		}

		const userRes = await fetch(`https://gitlab.com/api/v4/users?username=${encodeURIComponent(user)}`, {
			headers,
		});

		if (!userRes.ok) {
			throw new Error(`GitLab API error looking up user: ${userRes.statusText}`);
		}

		const users: any[] = await userRes.json();
		if (!users || users.length === 0) {
			throw new Error(`GitLab user "${user}" not found.`);
		}

		const userId = users[0].id;
		const eventsRes = await fetch(`https://gitlab.com/api/v4/users/${userId}/events?per_page=100`, {
			headers,
		});

		if (!eventsRes.ok) {
			throw new Error(`GitLab API error fetching events: ${eventsRes.statusText}`);
		}

		const events: any[] = await eventsRes.json();
		const activityMap: Record<string, number> = {};

		for (const event of events) {
			if (!event.created_at) continue;
			const dateStr = event.created_at.split('T')[0];
			activityMap[dateStr] = (activityMap[dateStr] || 0) + 1;
		}

		return activityMap;
	},
};
