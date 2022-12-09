// eslint-disable-next-line import/no-unassigned-import
import 'webext-base-css';
import './options.css';

import optionsStorage from './options-storage.js';

async function init(): Promise<void> {
	await optionsStorage.syncForm('#options-form');
}

void init();
