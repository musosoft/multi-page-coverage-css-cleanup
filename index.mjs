// index.mjs

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import parseArguments from './parseArguments.mjs';
import fetchSitemap from './fetchSitemap.mjs';
import {
	startCSSCoverage,
	getCSSCoverage,
	updateCSSCoverageUsage,
} from './coverage.mjs';
import evaluateMediaQueries from './evaluateMediaQueries.mjs';
import writeCSS from './writeCSS.mjs';

puppeteer.use(StealthPlugin());

async function main() {
	const { siteMap, outputDir } = parseArguments();
	const browser = await puppeteer.launch({ headless: true });
	const coverage = new Map();
	const urls = await fetchSitemap(siteMap, coverage);

	console.log(`Processing ${urls.length} URLs...`);
	for (const url of urls) {
		console.log(`Navigating to page ${url}...`);
		try {
			await processURL(browser, url, coverage);
		} catch (err) {
			console.error(`Error processing URL ${url}: ${err.message}`);
		}
	}

	console.log('Writing used CSS files to disk...');
	await writeCSS(coverage, outputDir);
	await browser.close();
}

async function processURL(browser, url, coverage) {
	const page = await browser.newPage();
	await navigateToPage(page, url);
	coverage.set(url, { mediaQueries: [] });
	await evaluateMediaQueries(page, coverage, url);
	await startCSSCoverage(page);
	await processCSSCoverage(page, coverage);
	await page.close();
	await sleep(10000);
}

async function navigateToPage(page, url) {
	await page.goto(url, { waitUntil: 'networkidle0' });
}

async function processCSSCoverage(page, coverage) {
	const cssCoverage = await getCSSCoverage(page);
	updateCSSCoverageUsage(cssCoverage, coverage);
}

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((err) => {
	console.error('Error in main process:', err);
});
