import _ from 'lodash';
import io from 'socket.io-client';
import TweenLite from 'gsap';
import { lerpRGBColour, hexToRgb } from './lib/colour.js';
import { LIGHTING_LIGHT, LIGHTING_DARK } from './experience/constants.js';
window.app = window.app || {};

const light = hexToRgb(LIGHTING_LIGHT);
const dark = hexToRgb(LIGHTING_DARK);
const skyColor = hexToRgb(LIGHTING_DARK);
const currentColor = hexToRgb(LIGHTING_DARK);
const COLOUR_FADE_DURATION = 1.5;
let audioTimeRAF = null;
let audioPlaying = false;

const kickIt = () => {
	window.socket = io();
	window.socket.on('play-audio', onPlayAudio);
	window.socket.on('trigger-focus', onTriggerFocus);
	window.socket.on('update-sky-color', onUpdateSkyColor);
	updateColor();
}

const onResize = () => {
	window.app.width = window.innerWidth;
	window.app.height = window.innerHeight;
}

const addEventListeners = () => {
	window.addEventListener('resize', _.throttle(onResize, 16.666));
}

const onPlayAudio = (data) => {
	audioPlaying = true;
	cancelAnimationFrame(audioTimeRAF);
	const rgb = hexToRgb(data.color);
	const audio = new Audio(`assets/audio/${data.aId}.mp3`);
	audio.onended = onEndAudio;
	
	audio.onloadeddata = () => {
		audio.play();

		const sendAudioTime = () => {
			window.socket.emit('audio-time', audio.currentTime / audio.duration);
			audioTimeRAF = requestAnimationFrame(sendAudioTime);
		}

		audioTimeRAF = requestAnimationFrame(sendAudioTime);
	}

	TweenLite.to(currentColor, COLOUR_FADE_DURATION, { r: rgb.r, g: rgb.g, b: rgb.b, onUpdate: updateColor, ease: Power2.easeOut });
}

const onEndAudio = () => {
	audioPlaying = false;
	cancelAnimationFrame(audioTimeRAF);
	window.socket.emit('audio-ended');
	TweenLite.to(currentColor, COLOUR_FADE_DURATION, { r: skyColor.r, g: skyColor.r, b: skyColor.r, onUpdate: updateColor, ease: Power2.easeIn });
}

const onTriggerFocus = (data) => {
	const rgb = hexToRgb(data.color);

	const tl = new TimelineLite();
	tl
		.to(currentColor, 0.15, { r: rgb.r, g: rgb.g, b: rgb.b, onUpdate: updateColor, ease: Power2.easeOut })
		.to(currentColor, 1.8, { r: skyColor.r, g: skyColor.r, b: skyColor.r, onUpdate: updateColor, ease: Sine.easeOut })
}

const onUpdateSkyColor = (data) => {
	const { r, g, b } = lerpRGBColour(data.control, dark, light);
	skyColor.r = r;
	skyColor.g = g;
	skyColor.b = b;
	
	if (audioPlaying) return;
	currentColor.r = r;
	currentColor.g = g;
	currentColor.b = b;
	console.log(data.control, r);
	updateColor();
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