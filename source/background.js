import optionsStorage from './options-storage.js';

/**
 * 
 * @param string apiBaseUrl 
 * @returns boolean
 */
async function isAPIOnline(apiBaseUrl) {

    let responce;

    try {
        
        responce = await fetch(`${apiBaseUrl}/ping`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            }
        });

    } catch (error) {
        return false;
    }

    if (responce) {
        return true;
    }

    return false;
}

function isNotebookAvailable(params) {
    
}

function createNote(api_base_url, token, content) {
            
        fetch(`${api_base_url}/notes?token=${encodeURIComponent(token)}`, {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(content),
		});

}

// function authJoplin(api_base_url) {
            
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
 
    let content = {}

    let titleDate = new Date();

    let body = ""

    tabList.forEach(tab => {
        body += `- [ ]  [${tab.title}](${tab.url})\n`;
    });

    content.title = titleDate.toLocaleString();
    content.body = body;

    if(parentId) {
        content.parent_id = parentId;
    }

    return {
        "title": titleDate.toLocaleString(),
        "body": body,
    }
}

browser.browserAction.onClicked.addListener(async (tab) => {

	const options = await optionsStorage.getAll();

    let token = options.token;
    let notebookId = options.notebook_id;

    if(!token) {
        browser.notifications.create({
            type: "basic",
            title: "Joplin Tab Stash",
            message: "Empty authentication token",
          });

          return;
    }

    let tabList = await browser.tabs.query({ currentWindow: true });

    let noteContent = creareNoteContent(tabList, notebookId)

    if(await isAPIOnline(options.joplin_api_url)) {

        console.log(noteContent);

        createNote(options.joplin_api_url, token, noteContent)

        browser.notifications.create({
            type: "basic",
            title: "Joplin Tab Stash",
            message: "Window stashed",
          });

    } else {

        console.log("aaa");

        browser.notifications.create({
            type: "basic",
            title: "Joplin Tab Stash",
            message: "Cannot connect to Joplin",
          });

    }

// 82a3c803b0e0416388f50d1bf8eca11e

  });
