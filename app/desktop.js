import _ from 'lodash';
import io from 'socket.io-client';
import TweenLite from 'gsap';
import { lerpRGBColour, hexToRgb } from './lib/colour.js';
window.app = window.app || {};

const currentColor = { r: 255, g: 255, b: 255 };
const COLOUR_FADE_DURATION = 1.5;
let audioTimeInterval = null;

const kickIt = () => {
	window.socket = io();

	window.socket.on('play-audio', (data) => {
		onPlayAudio(data);
	});
}

const onResize = () => {
	window.app.width = window.innerWidth;
	window.app.height = window.innerHeight;
}

const addEventListeners = () => {
	window.addEventListener('resize', _.throttle(onResize, 16.666));
}

const onPlayAudio = (data) => {
	console.log('play audio!!!', data.aId);
	clearInterval(audioTimeInterval);
	const rgb = hexToRgb(data.color);
	const audio = new Audio(`assets/audio/${data.aId}.mp3`);
	audio.onended = onEndAudio;
	
	audio.onloadeddata = () => {
		audio.play();
		// console.log(audio.duration, audio.currentTime);
		audioTimeInterval = setInterval(() => {
			console.log(audio.currentTime / audio.duration);
			window.socket.emit('audio-time', audio.currentTime / audio.duration);
		}, 16.666);
	}

	TweenLite.to(currentColor, COLOUR_FADE_DURATION, { r: rgb.r, g: rgb.g, b: rgb.b, onUpdate: updateColor, ease: Power2.easeOut });
	// setTimeout(onEndAudio, 4000);
}

const onEndAudio = () => {
	clearInterval(audioTimeInterval);
	window.socket.emit('audio-ended');
	TweenLite.to(currentColor, COLOUR_FADE_DURATION, { r: 255, g: 255, b: 255, onUpdate: updateColor, ease: Power2.easeIn });
}

const updateColor = () => {
	const style = `rgb(${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)})`;
	document.body.style.background = style;
}


if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', kickIt);
} else {
	window.attachEvent('onload', kickIt);
}