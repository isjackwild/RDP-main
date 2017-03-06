import _ from 'lodash';
window.app = window.app || {};

const kickIt = () => {
	console.log('desktop');
	window.socket = io();

	window.socket.on('play-audio', (aId) => {
		console.log('play audio', aId);

		setTimeout(() => {
			window.socket.emit('audio-ended');
		}, 4000);
	});
}

const onResize = () => {
	window.app.width = window.innerWidth;
	window.app.height = window.innerHeight;
}

const addEventListeners = () => {
	window.addEventListener('resize', _.throttle(onResize, 16.666));
}


if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', kickIt);
} else {
	window.attachEvent('onload', kickIt);
}