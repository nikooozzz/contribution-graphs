import { describe, it, expect, vi, beforeEach } from 'vitest';
import { aurAdapter } from '../src/adapters/aur';
import { huggingfaceAdapter } from '../src/adapters/huggingface';
import { githubAdapter } from '../src/adapters/github';

describe('Contribution Graph Adapters & Logic', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	describe('AUR Adapter', () => {
		it('should parse commit dates from cgit Atom feeds and filter by author', async () => {
			const mockSearchResponse = {
				results: [{ PackageBase: 'test-pkg', Name: 'test-pkg' }],
			};

			const mockAtomFeed = `
				<feed>
					<entry>
						<author><name>TestAuthor</name></author>
						<updated>2026-10-22T12:00:00Z</updated>
					</entry>
					<entry>
						<author><name>SecondTestAuthor</name></author>
						<updated>2026-10-22T13:00:00Z</updated>
					</entry>
					<entry>
						<author><name>TestAuthor</name></author>
						<updated>2026-10-23T02:00:00Z</updated>
					</entry>
				</feed>`;

			vi.stubGlobal(
				'fetch',
				vi.fn().mockImplementation(async (url: string) => {
					if (url.includes('rpc/v5/search')) {
						return new Response(JSON.stringify(mockSearchResponse), { status: 200 });
					}
					if (url.includes('cgit/aur.git/atom')) {
						return new Response(mockAtomFeed, { status: 200});
					}
					return new Response('Not Founder', { status: 404 });
				})
			);

			const urlParams = new URLSearchParams('aur_author=TestAuthor');
			const activity = await aurAdapter.fetchActivity('test', {}, urlParams);

			expect(activity).toEqual({
				'2026-10-22': 1,
				'2026-10-23': 1,
			});
		});
	});

	describe('Hugging Face Adapter', () => {
		it('should aggregate lastModified dates from models, datasets, and spaces', async () => {
			vi.stubGlobal(
				'fetch',
				vi.fn().mockImplementation(async (url: string) => {
					if (url.includes('/api/models')) {
						return new Response(
							JSON.stringify([{ lastModified: '2026-10-22T08:00:00Z' }]),
							{ status: 200 }
						);
					}
					if (url.includes('/api/datasets')) {
						return new Response(
							JSON.stringify([{ lastModified: '2026-10-22T09:00:00Z' }]),
							{ status: 200 }
						);
					}
					if (url.includes('/api/spaces')) {
						return new Response(
							JSON.stringify([{ lastModified: '2026-10-23T10:00:00.000Z' }]),
							{ status: 200 }
						);
					}
					return new Response('[]', { status: 200 });
				})
			);

			const activity = await huggingfaceAdapter.fetchActivity('test', {});

			expect(activity).toEqual({
				'2026-10-22': 2,
				'2026-10-23': 1,
			});
		});
	});

	describe('GitHub Adapter', () => {
    it('should query GitHub GraphQL API and parse contribution calendar days', async () => {
        const mockGraphQLResponse = {
            data: {
                user: {
                    contributionsCollection: {
                        contributionCalendar: {
                            weeks: [
                                {
                                    contributionDays: [
                                        { date: '2026-10-22', contributionCount: 3 },
                                        { date: '2026-10-23', contributionCount: 0 },
                                    ],
                                },
                                {
                                    contributionDays: [
                                        { date: '2026-10-24', contributionCount: 5 },
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
        };

        vi.stubGlobal(
            'fetch',
            vi.fn().mockImplementation(async (url: string) => {
                if (url.includes('api.github.com/graphql')) {
                    return new Response(
                        JSON.stringify(mockGraphQLResponse),
                        { status: 200 }
                    );
                }
                return new Response('Not Found', { status: 404 });
            })
        );

        const activity = await githubAdapter.fetchActivity('octocat', {});

        expect(activity).toEqual({
            '2026-10-22': 3,
            '2026-10-23': 0,
            '2026-10-24': 5,
        });
    });
	});
});
