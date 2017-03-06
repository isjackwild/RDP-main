import _ from 'lodash';
window.app = window.app || {};

const kickIt = () => {
	console.log('desktop');
	window.socket = io();

	window.socket.on('play-audio', (data) => {
		console.log('play audio', data.aId);
		document.body.style.background = data.color;

		setTimeout(() => {
			window.socket.emit('audio-ended', data.aId);
			document.body.style.background = '';
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