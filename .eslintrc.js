module.exports = {
	root: true,
	env: {
		node: true,
		es2020: true,
	},
	parser: '@typescript-eslint/parser',
	plugins: ['eslint-plugin-n8n-nodes-base'],
	extends: ['plugin:eslint-plugin-n8n-nodes-base/nodes'],
	rules: {
		'n8n-nodes-base/node-param-description-missing-from-dynamic-options': 'off',
	},
};
