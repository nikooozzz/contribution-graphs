export interface SourceAdapter {
	name: string;
	fetchActivity(user: string): Promise<Record<string, number>>;
}
