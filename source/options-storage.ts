import OptionsSync from 'webext-options-sync';

export default new OptionsSync({
	defaults: {
		joplinApiUrl: 'http://localhost:41184',
		token: '',
		notebookId: '',
	},
	migrations: [
		OptionsSync.migrations.removeUnused,
	],
	logging: true,
});
