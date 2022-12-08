// eslint-disable-next-line import/no-unassigned-import
import 'webext-base-css';
import './options.css';

import optionsStorage from './options-storage';

async function init() {
	await optionsStorage.syncForm('#options-form');
}

init();
