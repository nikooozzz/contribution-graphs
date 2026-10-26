const THEME = {
	bg: '#0d1117',
	text: '#8b949e',
	empty: '#161b22',
	levels: [
		'#161b22',
		'#0e4429',
		'#006d32',
		'#26a641',
		'#39d353',
	]
};

function getColorForCount(count: number): string {
	if (count <= 0) return THEME.levels[0];
	if (count <= 3) return THEME.levels[1];
	if (count <= 6) return THEME.levels[2];
	if (count <= 9) return THEME.levels[3];
	return THEME.levels[4];
}

export function generateSvgGraph(user: string, activityMap: Record<string, number>): string {
	const TILE_SIZE = 10;
	const GAP = 3;
	const PADDING_LEFT = 30;
	const PADDING_TOP = 30;
	const WEEKS = 53;
	const DAYS_PER_WEEK = 7;

	const totalWidth = PADDING_LEFT + WEEKS * (TILE_SIZE + GAP) + 20;
	const totalHeight = PADDING_TOP + DAYS_PER_WEEK * (TILE_SIZE + GAP) + 20;

	const today = new Date();
	const endDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());

	const startDate = new Date(endDate);
	startDate.setDate(startDate.getDate() - (WEEKS * 7 - 1));
	startDate.setDate(startDate.getDate() - startDate.getDay());

	let rectsSvg = '';
	let totalContributions = 0;
	const currentDate = new Date(startDate);

	for (let week = 0; week < WEEKS; week++) {
		for (let day = 0; day < DAYS_PER_WEEK; day++) {
			if (currentDate > endDate) break;

			const dateStr = currentDate.toISOString().split('T')[0];
			const count = activityMap[dateStr] || 0;
			totalContributions += count;

			const x = PADDING_LEFT + week * (TILE_SIZE + GAP);
			const y = PADDING_TOP + day * (TILE_SIZE + GAP);
			const color = getColorForCount(count);

			rectsSvg += `
				<rect
					x="${x}" y="${y}"
					width="${TILE_SIZE}" height="${TILE_SIZE}"
					rx="2" ry="2"
					fill="${color}">
				<title>${count} contributions on ${dateStr}</title>
				</rect>`;

			currentDate.setDate(currentDate.getDate() + 1);
		}
	}

	return `
	<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${totalHeight}" viewBox="0 0 ${totalWidth} ${totalHeight}">
		<style>
			.bg { fill: ${THEME.bg}; rx: 6px; }
			.header { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 12px; fill: ${THEME.text}; font-weight: 600; }
			.day-label { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; font-size: 9px; fill: ${THEME.text}; }
		</style>

		<rect class="bg" width="100%" height="100%" />

		<text x="${PADDING_LEFT}" y="18" class="header">
			${totalContributions} contributions in the last year for @${user}
		</text>

		<text x="10" y="${PADDING_TOP + 1 * (TILE_SIZE + GAP) + 8}" class="day-label">Mon</text>
		<text x="10" y="${PADDING_TOP + 3 * (TILE_SIZE + GAP) + 8}" class="day-label">Wed</text>
		<text x="10" y="${PADDING_TOP + 5 * (TILE_SIZE + GAP) + 8}" class="day-label">Fri</text>

		<g>
			${rectsSvg}
		</g>
	</svg>`.trim();
}
