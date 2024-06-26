import OptionsSync from 'webext-options-sync';

export default new OptionsSync({
	defaults: {
		joplinApiUrl: 'http://localhost:41184',
		token: '',
		notebookId: '',
		entryTemplate: '- [ ] [{title}]({url})',
		removeEmoji: false,
		ignoreSpecialPages: true,
		saveAllWindows: true,
		closeTabsOnceSaved: false,
	},
	migrations: [
		OptionsSync.migrations.removeUnused,
	],
	logging: true,
	storageType: 'local',
});
