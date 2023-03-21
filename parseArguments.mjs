// parseArguments.mjs

import { program } from 'commander';
import path from 'path';

function parseArguments() {
	program
		.requiredOption('-sitemap, --site-map <siteMap>', 'Site map URL')
		.option(
			'-o, --output-dir <outputDir>',
			'Output directory name',
			'output'
		)
		.parse(process.argv);

	const { siteMap, outputDir } = program.opts();

	validateSiteMapURL(siteMap);

	return { siteMap, outputDir: path.resolve(process.cwd(), outputDir) };
}

function validateSiteMapURL(siteMap) {
	if (!siteMap || !siteMap.length) {
		console.error(
			'Missing site map URL. Use -sitemap option to specify it.'
		);
		process.exit(1);
	}
}

export default parseArguments;
