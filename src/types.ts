export interface Env {
	GITHUB_TOKEN?: string;
	GITLAB_TOKEN?: string;
	HUGGINGFACE_TOKEN?: string;
}

export interface SourceAdapter {
	name: string;
	fetchActivity(user: string, env: Env, urlParams?: URLSearchParams): Promise<Record<string, number>>;
}
