import OptionsSync from 'webext-options-sync';

export default new OptionsSync({
	defaults: {
		joplin_api_url: 'http://localhost:41184',
		token: '',
		notebook_id: '',
	},
	migrations: [
		OptionsSync.migrations.removeUnused,
	],
	logging: true,
});
