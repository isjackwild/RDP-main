const THREE = require('three');
import { INNER_ANGLE, OUTER_ANGLE, OUTER_GAIN, ROLLOFF, REF_DIST, DIST_MODEL, GAIN } from './constants.js';
import TweenLite from 'gsap';
import PubSub from 'pubsub-js';
import _ from 'lodash';

let isUnlocked = false;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new window.AudioContext();
context.listener.setPosition(0, 0, 0);

const globalGainNode = context.createGain();
globalGainNode.gain.value = 0;
globalGainNode.connect(context.destination);

export const unlockAudio = () => {
	console.log('unlockAudio');
	window.removeEventListener('touchstart', unlockAudio);
	const buffer = context.createBuffer(1, 1, 22050);
	const source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(context.destination);
	source.start();
	PubSub.subscribe('audio.start', onAudioStart);
	PubSub.subscribe('audio.end', onAudioEnd);

	setTimeout(() => {
		TweenLite.to(globalGainNode.gain, 2, { value: GAIN });
		if((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
			isUnlocked = true;
		}
	}, 0);
}
window.addEventListener('touchstart', unlockAudio);

export const onAudioStart = () => {
	TweenLite.to(globalGainNode.gain, 1.2, { value: 0 });
}

export const onAudioEnd = () => {
	TweenLite.to(globalGainNode.gain, 2, { value: GAIN });
}

export const decode = (response, onSuccess, onError) => {
	context.decodeAudioData(response, onSuccess, onError);
}

const globalUp = new THREE.Vector3(0, 1, 0);
const right = new THREE.Vector3();
const up = new THREE.Vector3();
const tmp = new THREE.Vector3();
export const positionListener = (position, forward) => {
	context.listener.setPosition(position.x, position.y, position.z);
	// // const angle = new THREE.Vector3().copy(front).applyAxisAngle(
	// // 		new THREE.Vector3(0, 1, 0),
	// // 		Math.PI / 4
	// // 	);
	// const up = new THREE.Vector3().copy(front).applyAxisAngle(
	// 		angle, //incorrect
	// 		Math.PI / 4
	// 	);
	right.copy(forward).cross(globalUp);
	up.copy(right).cross(forward).normalize();
	console.log(forward, up);
	context.listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
}

export const createPanner = (buffer, { x, y, z }) => {
	const panner = context.createPanner();
	panner.coneOuterGain = OUTER_GAIN;
	panner.coneOuterAngle = OUTER_ANGLE;
	panner.coneInnerAngle = INNER_ANGLE;
	panner.rollofFactor = ROLLOFF;
	panner.refDistance = REF_DIST;
	panner.maxDistance = 10000;
	panner.distanceModel = DIST_MODEL;
	panner.setPosition(x, y, z);

	const gainNode = context.createGain();
	gainNode.gain.value = 1;
	panner.connect(gainNode);
	gainNode.connect(globalGainNode);

	const source = context.createBufferSource();
	source.buffer = buffer;
	source.loop = true;
	source.connect(panner);

	console.log('create panner');

	return { source, panner, gainNode };
}