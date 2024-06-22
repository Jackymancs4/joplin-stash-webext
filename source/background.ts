
// Don't forget to import this wherever you use it
import browser from 'webextension-polyfill';

import {type NoteProperties} from 'joplin-api';
import optionsStorage from './options-storage';

/**
 *
 * @param apiBaseUrl
 * @returns
 */
async function isApiOnline(apiBaseUrl: string) {
	let response: Response;

	try {
		response = await fetch(`${apiBaseUrl}/ping`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});
	} catch {
		return false;
	}

	if (response) {
		return true;
	}

	return false;
}

/**
 *
 * @param apiBaseUrl
 * @param token
 * @param content
 */
async function sendNote(apiBaseUrl: string, token: string, content: Record<string, unknown>) {
	let response: Response;

	response = await fetch(`${apiBaseUrl}/notes?token=${encodeURIComponent(token)}`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(content),
	});

	if (response && response.ok) {
		return true;
	}

	return false;
}

/**
 *
 * @param api_base_url
 * @param token
 * @param content
 */
function authJoplin(api_base_url, token, content) {
	const response = fetch(`${api_base_url}/notes?token=${encodeURIComponent(token)}`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(content),
	});
}

/**
 *
 * @param tabList
 * @param parentId
 * @returns
 */
function createNote(tabList: browser.Tabs.Tab[], parentId: string, template: string, removeEmoji: boolean, ignoreSpecialPages: boolean): Record<string, unknown> {
	// Const content: NoteProperties = {
	// 	parent_id: '',
	// 	body: '',
	// 	is_conflict: 0,
	// 	latitude: 0,
	// 	longitude: 0,
	// 	altitude: 0,
	// 	author: '',
	// 	source_url: '',
	// 	is_todo: 0,
	// 	todo_due: 0,
	// 	todo_completed: 0,
	// 	source: '',
	// 	source_application: '',
	// 	application_data: '',
	// 	order: 0,
	// 	markup_language: 0,
	// 	body_html: '',
	// 	base_url: '',
	// 	image_data_url: '',
	// 	crop_rect: {
	// 		x: 0,
	// 		y: 0,
	// 		width: 0,
	// 		height: 0,
	// 	},
	// 	id: '',
	// 	created_time: 0,
	// 	updated_time: 0,
	// 	user_created_time: 0,
	// 	user_updated_time: 0,
	// 	title: '',
	// 	encryption_cipher_text: '',
	// 	encryption_applied: 0,
	// 	is_shared: 0,
	// };

	let noteBody = '';
	let firstEntryText = "";
	let lastEntryText = "";
	let lastWindowId = -1;

	for (const tab of tabList) {
		if (!tab.url) {
			continue;
		}

		if (ignoreSpecialPages && isSpecialPage(tab.url)) {
			continue;
		}

		let entryText = tab.title ?? tab.url;
		entryText = removeEmoji ? removeEmojiFromString(entryText) : entryText;
		entryText = entryText.trim();

		if(firstEntryText == "") {
			firstEntryText = entryText;
		}

		lastEntryText = entryText;

		if(tab.windowId && lastWindowId != tab.windowId) {
			lastWindowId = tab.windowId

			if (noteBody != '') {
				noteBody += '\n'
			}

			noteBody += formatSection(entryText, "## {title}\n")
		}

		noteBody += formatEntry(entryText, tab.url, template);
	}

	return {
		title: formatNoteTitle(firstEntryText, "{date}"),
		parent_id: parentId,
		body: noteBody,
	};
}

/**
 *
 * @param url
 * @returns
 */
function isSpecialPage(url: string): boolean {
	if (url.startsWith('about')) {
		return true;
	}

	if (url.startsWith('chrome')) {
		return true;
	}

	if (url.startsWith('moz-extension')) {
		return true;
	}

	return false;
}

/**
 * https://stackoverflow.com/a/41543705
 *
 * @param text text from which remove the emojis
 * @returns
 */
function removeEmojiFromString(text: string): string {
	return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
}

/**
 * Apply the template to the tab entry. Replace placeholder {title} and {url}
 * with their respective content. Append a new line char in the end.
 *
 * @param entryText title of the tab
 * @param entryUrl url of the tab
 * @param template template to be appliest
 *
 * @returns the final row
 */
function formatEntry(entryText: string, entryUrl: string, template: string): string {
	const now = (new Date()).toLocaleString();
	const result = template
		.replace('{title}', entryText)
		.replace('{url}', entryUrl)
		.replace('{date}', now);

	return result + '\n';
}

/**
 * Apply the template to the tab entry. Replace placeholder {title} and {url}
 * with their respective content. Append a new line char in the end.
 *
 * @param sectionName title of the tab
 *
 * @returns the final row
 */
function formatSection(sectionName: string, template: string): string {
	const now = (new Date()).toLocaleString();

	const result = template
		.replace('{title}', sectionName)
		.replace('{date}', now);

	return result + '\n';
}

function formatNoteTitle(noteTitle: string, template: string): string {
	const now = (new Date()).toLocaleString();

	const result = template
		.replace('{title}', noteTitle)
		.replace('{date}', now);

	return result;
}

browser.browserAction.onClicked.addListener(async () => {
	const options = await optionsStorage.getAll();

	const token = options.token;

	// Joplin token is mandatory
	if (!token) {
		browser.notifications.create({
			type: 'basic',
			title: 'Joplin Tab Stash',
			message: 'Empty authentication token',
		});

		return;
	}

	const tabQueryOption: browser.Tabs.QueryQueryInfoType = {};

	if (!options.saveAllWindows) {

		// Get a list of all tabs in the current window
		tabQueryOption.currentWindow = true
	}

	const tabList = await browser.tabs.query(tabQueryOption);
	const tabListIds = tabList.map((tab) => {return tab.id ?? 0});

	const noteContent = createNote(tabList, options.notebookId, options.entryTemplate, options.removeEmoji, options.ignoreSpecialPages);

	if (await isApiOnline(options.joplinApiUrl)) {
		const result = await sendNote(options.joplinApiUrl, token, noteContent);

		if (result) {
			browser.notifications.create({
				type: 'basic',
				title: 'Joplin Tab Stash',
				message: 'Window stashed',
			});

			browser.tabs.remove(tabListIds)

		} else {
			browser.notifications.create({
				type: 'basic',
				title: 'Joplin Tab Stash',
				message: 'Error stashing',
			});
		}
	} else {
		browser.notifications.create({
			type: 'basic',
			title: 'Joplin Tab Stash',
			message: 'Cannot connect to Joplin',
		});
	}
});
