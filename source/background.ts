
// Don't forget to import this wherever you use it
import browser from 'webextension-polyfill';

import {NoteProperties} from 'joplin-api';
import optionsStorage from './options-storage.js';

async function isApiOnline(apiBaseUrl: string) {
	let responce: Response;

	try {
		responce = await fetch(`${apiBaseUrl}/ping`, {
			method: 'GET',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json',
			},
		});
	} catch {
		return false;
	}

	if (responce) {
		return true;
	}

	return false;
}

function createNote(apiBaseUrl: string, token: string, content) {
	fetch(`${apiBaseUrl}/notes?token=${encodeURIComponent(token)}`, {
		method: 'POST',
		headers: {
			Accept: 'application/json',
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(content),
	});
}

// Function authJoplin(api_base_url) {

//     let aaa =fetch(`${api_base_url}/notes?token=${encodeURIComponent(token)}`, {
//         method: 'POST',
//         headers: {
//             'Accept': 'application/json',
//             'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(content),
//     });

// }

function creareNoteContent(tabList, parentId) {
	const content: NoteProperties = {
		parent_id: '',
		body: '',
		is_conflict: 0,
		latitude: 0,
		longitude: 0,
		altitude: 0,
		author: '',
		source_url: '',
		is_todo: 0,
		todo_due: 0,
		todo_completed: 0,
		source: '',
		source_application: '',
		application_data: '',
		order: 0,
		markup_language: 0,
		body_html: '',
		base_url: '',
		image_data_url: '',
		crop_rect: {
			x: 0,
			y: 0,
			width: 0,
			height: 0,
		},
		id: '',
		created_time: 0,
		updated_time: 0,
		user_created_time: 0,
		user_updated_time: 0,
		title: '',
		encryption_cipher_text: '',
		encryption_applied: 0,
		is_shared: 0,
	};

	const titleDate = new Date();

	let body = '';

	for (const tab of tabList) {
		body += `- [ ]  [${tab.title}](${tab.url})\n`;
	}

	content.title = titleDate.toLocaleString();
	content.body = body;

	if (parentId) {
		content.parent_id = parentId;
	}

	return {
		title: titleDate.toLocaleString(),
		body,
	};
}

browser.browserAction.onClicked.addListener(async () => {
	const options = await optionsStorage.getAll();

	const token = options.token;
	const notebookId = options.notebookId;

	if (!token) {
		browser.notifications.create({
			type: 'basic',
			title: 'Joplin Tab Stash',
			message: 'Empty authentication token',
		});

		return;
	}

	const tabList = await browser.tabs.query({currentWindow: true});

	const noteContent = creareNoteContent(tabList, notebookId);

	if (await isApiOnline(options.joplinApiUrl)) {
		createNote(options.joplinApiUrl, token, noteContent);

		browser.notifications.create({
			type: 'basic',
			title: 'Joplin Tab Stash',
			message: 'Window stashed',
		});
	} else {
		browser.notifications.create({
			type: 'basic',
			title: 'Joplin Tab Stash',
			message: 'Cannot connect to Joplin',
		});
	}
});
