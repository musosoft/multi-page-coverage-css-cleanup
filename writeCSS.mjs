// writeCSS.mjs

import fs from 'fs';
import path from 'path';

function generateCSSUsageReport(cssText, ranges) {
	if (!cssText) return '';

	const uniqueUsedCSS = new Set();

	for (const range of ranges) {
		const rule = cssText.slice(range.start, range.end);
		uniqueUsedCSS.add(rule);
	}

	return Array.from(uniqueUsedCSS).join('\n');
}

export default async function writeCSS(coverage, outputDir) {
	console.log('Writing used CSS files to disk...');

	if (!fs.existsSync(outputDir)) {
		fs.mkdirSync(outputDir, { recursive: true });
	}

	let totalFiles = 0;
	let totalUsed = 0;

	for (const [url, data] of coverage.entries()) {
		const urlObject = new URL(url);
		const relativePath = path.join(urlObject.hostname, urlObject.pathname);
		const filename = path.join(outputDir, relativePath);

		const usedCSS = generateCSSUsageReport(data.originalText, data.ranges);

		if (usedCSS.trim().length > 0) {
			totalUsed++;
			try {
				await fs.promises.mkdir(path.dirname(filename), {
					recursive: true,
				});
				await fs.promises.writeFile(filename, usedCSS, 'utf8');
				console.log(`Wrote used CSS to ${filename}`);
			} catch (error) {
				console.error(`Error writing file ${filename}:`, error);
			}
		}

		totalFiles++;
	}

	const percentage = ((totalUsed / totalFiles) * 100).toFixed(2);
	console.log(
		`Found ${totalFiles} CSS files on pages, ${totalUsed} of which were used (${percentage}%).`
	);
}
