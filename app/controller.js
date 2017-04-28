import MobileDetect from 'mobile-detect';
import PubSub from 'pubsub-js';
import { init as initLoop, renderer, onResize as onResizeRenderer } from './experience/loop.js';
// import { init as initGUI } from './experience/GUI.js';
import { onResize as onResizeCamera } from './experience/camera.js';
import _ from 'lodash';
import React from 'react';
import { render } from 'react-dom';
import Interface from './ui/Interface.js';
import io from 'socket.io-client';

window.app = window.app || {};


const kickIt = () => {
	if (window.location.search.indexOf('debug') > -1) app.debug = true;
	const md = new MobileDetect(window.navigator.userAgent);
	window.mobile = md.mobile() ? true : false;
	window.socket = io();
	window.socket.emit('mobile-client');

	PubSub.subscribe('reset.complete', () => window.socket.emit('reset'));

	addEventListeners();
	onResize();
	initLoop();

	console.log('render interface');
	render(<Interface />, document.getElementById('react-root'));

	window.addEventListener('touchmove', e => e.preventDefault());
	// initGUI();
}

const onResize = () => {
	window.app.width = window.innerWidth;
	window.app.height = window.innerHeight;

	onResizeRenderer(window.app.width, window.app.height);
	onResizeCamera(window.app.width, window.app.height);
}

const addEventListeners = () => {
	window.addEventListener('resize', _.throttle(onResize, 16.666));
}


if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', kickIt);
} else {
	window.attachEvent('onload', kickIt);
}