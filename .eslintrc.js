module.exports = {
	root: true,
	extends: [ 'plugin:@wordpress/eslint-plugin/recommended' ],
	rules: {
		'prettier/prettier': 'off',
		'no-console': 'off',
	},
	env: {
		browser: true,
		commonjs: false,
		es6: true,
		jquery: false,
	},
};
