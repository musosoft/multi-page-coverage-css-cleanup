// evaluateMediaQueries.mjs

import {
	startCSSCoverage,
	getCSSCoverage,
	updateCSSCoverageUsage,
} from './coverage.mjs';

async function captureCSSCoverageForMediaQuery(page, width) {
	await page.setViewport({ width, height: 768 });
	await startCSSCoverage(page);
	await page.reload({ waitUntil: 'networkidle0' });
	const cssCoverage = await getCSSCoverage(page);
	return cssCoverage;
}

function extractUniqueWidths(mediaQueries) {
	const widths = new Set();
	const regex = /\((min|max)-(width|height):\s*(\d+)px\)/;

	mediaQueries.forEach((mq) => {
		const match = mq.match(regex);
		if (match) {
			const [, , dimension, value] = match;
			if (dimension === 'width') {
				widths.add(parseInt(value));
			}
		}
	});

	return Array.from(widths);
}

export default async function evaluateMediaQueries(page, coverage, url) {
	const mediaQueries = await page.evaluate(() => {
		return Array.from(document.styleSheets)
			.filter((sheet) => sheet.href !== null)
			.flatMap((sheet) => [...sheet.media]);
	});

	console.log(`Found ${mediaQueries.length} media queries on ${url}.`);

	const uniqueWidths = extractUniqueWidths(mediaQueries);
	console.log(
		`Processing ${uniqueWidths.length} unique viewport widths on ${url}.`
	);

	for (const width of uniqueWidths) {
		console.log(`Processing viewport width ${width}px for ${url}.`);
		const cssCoverage = await captureCSSCoverageForMediaQuery(page, width);
		updateCSSCoverageUsage(cssCoverage, coverage);
	}

	console.log(`Finished processing media queries for ${url}.`);
}
