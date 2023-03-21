// fetchSitemap.mjs

import sitemapper from 'sitemapper';

async function fetchSitemap(sitemapUrl, coverage) {
	const sitemap = new sitemapper({ timeout: 30000 });
	console.log(`Fetching sitemap from ${sitemapUrl}...`);

	try {
		const data = await sitemap.fetch(sitemapUrl);
		const urls = filterNonXmlUrls(data.sites);
		console.log(`Found ${urls.length} pages to scan.`);
		await initializeCoverageMap(urls, coverage);

		return urls;
	} catch (err) {
		console.error('Error fetching sitemap:', err);
		return [];
	}
}

function filterNonXmlUrls(urls) {
	return urls.filter((url) => !url.endsWith('.xml'));
}

async function initializeCoverageMap(urls, coverage) {
	for (const url of urls) {
		await coverage.set(url, { mediaQueries: [] });
	}
}

export default fetchSitemap;
