import { SourceAdapter, Env } from '../types';

export const githubAdapter: SourceAdapter = {
	name: 'github',
	async fetchActivity(user: string, env: Env): Promise<Record<string, number>> {
		const token = env?.GITHUB_TOKEN;

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			'User-Agent': 'Nikoware-Contribution-Graph-Worker',
		};

		if (token) {
			headers['Authorization'] = `Bearer ${token}`;
		}

		const query = `
			query($username: String!) {
				user(login: $username) {
					contributionsCollection {
						contributionCalendar {
							weeks {
								contributionDays {
									date
									contributionCount
								}
							}
						}
					}
				}
			}
		`;

		const response = await fetch('https://api.github.com/graphql', {
			method: 'POST',
			headers,
			body: JSON.stringify({
				query,
				variables: { username: user },
			}),
		});

		if (!response.ok) {
			throw new Error(`GitHub API error: ${response.statusText}`);
		}

		const json: any = await response.json();

		if (json.errors || !json.data?.user) {
			throw new Error(`GitHub user "${user}" not found or API error.`);
		}

		const calendar = json.data.user.contributionsCollection.contributionCalendar;
		const activityMap: Record<string, number> = {};

		for (const week of calendar.weeks) {
			for (const day of week.contributionDays) {
				activityMap[day.date] = day.contributionCount;
			}
		}

		return activityMap;
	},
};
