export interface Env {
	GITHUB_TOKEN?: string;
	GITLAB_TOKEN?: string;
}

export interface SourceAdapter {
	name: string;
	fetchActivity(user: string): Promise<Record<string, number>>;
}
