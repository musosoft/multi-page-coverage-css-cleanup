// coverage.mjs

export async function startCSSCoverage(page) {
	await page.coverage.startCSSCoverage();
}

export async function getCSSCoverage(page) {
	return await page.coverage.stopCSSCoverage();
}

export function updateCSSCoverageUsage(cssCoverage, coverageData) {
	for (const entry of cssCoverage) {
		const url = entry.url;
		const text = entry.text;

		if (!coverageData.has(url)) {
			coverageData.set(url, {
				originalText: text,
				ranges: [],
			});
		}

		const data = coverageData.get(url);
		data.ranges = mergeRanges(data.ranges, entry.ranges);

		coverageData.set(url, data);
	}
}

function mergeRanges(ranges1, ranges2) {
	if (!Array.isArray(ranges1) || !Array.isArray(ranges2)) {
		return [];
	}

	const mergedRanges = [...ranges1, ...ranges2];

	mergedRanges.sort((a, b) => {
		if (a.start === b.start) {
			return a.end - b.end;
		}
		return a.start - b.start;
	});

	const result = [];
	let currentRange = mergedRanges[0];

	for (const [nextRange] of mergedRanges.entries()) {
		if (currentRange.end >= nextRange.start) {
			currentRange.end = Math.max(currentRange.end, nextRange.end);
		} else {
			result.push(currentRange);
			currentRange = nextRange;
		}
	}

	if (currentRange) {
		result.push(currentRange);
	}

	return result;
}
