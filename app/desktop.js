const THREE = require('three');
import _ from 'lodash';
import io from 'socket.io-client';
import PubSub from 'pubsub-js';
import TweenLite from 'gsap';
import { lerpRGBColour, hexToRgb } from './lib/colour.js';
import { LIGHTING_LIGHT, LIGHTING_DARK } from './experience/constants.js';
import { threads } from './experience/data/CONTENT_STRUCTURE';
import { positionListener, onAudioStart, onAudioEnd, decode, createPanner, unlockAudio } from './experience/directional-audio.js';
import { convertToRange } from './experience/MATHS.js';

const soundNodes = [];

window.app = window.app || {};

const lightEl = document.getElementById('lightEl');

const light = hexToRgb(LIGHTING_LIGHT);
const dark = hexToRgb(LIGHTING_DARK);
const skyColor = hexToRgb(LIGHTING_DARK);
const currentColor = hexToRgb(LIGHTING_DARK);
const COLOUR_FADE_DURATION = 1.5;
let audioTimeRAF = null;
let audioPlaying = false;
let audio = undefined;

const kickIt = () => {
	window.socket = io();
	window.socket.on('play-audio', onPlayAudio);
	window.socket.on('trigger-focus', onTriggerFocus);
	window.socket.on('update-sky-color', onUpdateSkyColor);
	window.socket.on('position-listener', onPositionListener);
	window.socket.on('reset', onResetApp);
	window.socket.emit('desktop-client');
	updateColor();
	setupAudioNodes();
}

const onResize = () => {
	window.app.width = window.innerWidth;
	window.app.height = window.innerHeight;
}

const addEventListeners = () => {
	window.addEventListener('resize', _.throttle(onResize, 16.666));
}


class SoundNode {
	constructor(aId, position) {
		this._aId = aId;
		this.position = position;

		this.loadSound = this.loadSound.bind(this);
		this.onLoadSound = this.onLoadSound.bind(this);
		this.onDecodeSound = this.onDecodeSound.bind(this);
		this.onErrorDecodeSound = this.onErrorDecodeSound.bind(this);
		
		this.loadSound();
	}

	loadSound() {
		const src = `assets/audio/${this._aId}.mp3`;
		this.request = new XMLHttpRequest();
		this.request.open('GET', src, true);
		this.request.responseType = 'arraybuffer'
		this.request.onload = this.onLoadSound;
		this.request.send();
	}

	onLoadSound(e) {
		if (e.target.readyState === 4 && e.target.status === 200) {
			decode(e.target.response, this.onDecodeSound, this.onErrorDecodeSound);
		} else if (e.target.readyState === 4) {
			console.error('Error: Sound probably missing');
		}
	}

	onDecodeSound(e) {
		this.sound = createPanner(e, this.position);
		this.sound.source.start(0);
	}

	onErrorDecodeSound(e) {
		console.error('Error decoding sound:', e);
	}
} 


const setupAudioNodes = () => {
	const up = new THREE.Vector3(0, 1, 0);
	const pathDirection = new THREE.Vector3(1, 0, 0);

	threads.forEach((thread, iP) => {
		const angle = (iP / threads.length) * Math.PI * 2;
		const pathDirection = new THREE.Vector3(0, 0, 1).applyAxisAngle(up, angle);

		const RES = 1000;
		const conicalSpiralPoints = [];
		const spiralOffset = Math.random() * Math.PI * 2;
		for (let i = 0; i < RES; i++) {
			const t = i / 200;
			const control = i / RES;
			const vec = new THREE.Vector3(
				t * Math.cos((t * 8) + spiralOffset) * 666,
				t * Math.sin((t * 8) + spiralOffset) * 222,
				(control * 5000),
			).applyAxisAngle(up, angle);
			conicalSpiralPoints.push(vec);
		}
		const conicalSpiral = new THREE.CatmullRomCurve3(conicalSpiralPoints);


		thread.anchors.forEach((anchorData, iA) => {
			const point = convertToRange(anchorData.depth, [0, 1], [0.2, 1])
			let position;
			position = conicalSpiral.getPoint(point);
			position.add(new THREE.Vector3().copy(pathDirection).multiplyScalar(Math.random() * 1000 - 500));
			position.y += (Math.random() * 1000) - 500;
			soundNodes.push(new SoundNode(anchorData.id, position))
		});
	});

	unlockAudio();
}




const onPlayAudio = (data) => {
	onAudioStart();
	audioPlaying = true;
	cancelAnimationFrame(audioTimeRAF);
	const rgb = hexToRgb(data.color);
	audio = new Audio(`assets/audio/${data.aId}.mp3`);
	audio.onended = onEndAudio;
	audio.volume = data.volume || 1;
	
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
	onAudioEnd();
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
	updateColor();
}

const onPositionListener = ({ pos, ori }) => {
	positionListener(pos, ori);
}

const onResetApp = () => {
	onAudioEnd();
	cancelAnimationFrame(audioTimeRAF);
	if (audio) audio.pause();
	audioPlaying = false;
	TweenLite.to(currentColor, COLOUR_FADE_DURATION, { r: skyColor.r, g: skyColor.r, b: skyColor.r, onUpdate: updateColor, ease: Power2.easeIn });
}

const updateColor = () => {
	const style = `rgb(${Math.round(currentColor.r)}, ${Math.round(currentColor.g)}, ${Math.round(currentColor.b)})`;
	lightEl.style.background = style;
}


if (document.addEventListener) {
	document.addEventListener('DOMContentLoaded', kickIt);
} else {
	window.attachEvent('onload', kickIt);
}