const THREE = require('three');
import { INNER_ANGLE, OUTER_ANGLE, OUTER_GAIN, ROLLOFF, REF_DIST, DIST_MODEL, GAIN } from './constants.js';

let isUnlocked = false;

window.AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new window.AudioContext();
context.listener.setPosition(0, 0, 0);

const globalGainNode = context.createGain();
globalGainNode.gain.value = GAIN;
globalGainNode.connect(context.destination);

const unlockAudio = () => {
	window.removeEventListener('touchstart', unlockAudio);
	const buffer = context.createBuffer(1, 1, 22050);
	const source = context.createBufferSource();
	source.buffer = buffer;
	source.connect(context.destination);
	source.noteOn(0);

	setTimeout(() => {
		if((source.playbackState === source.PLAYING_STATE || source.playbackState === source.FINISHED_STATE)) {
			isUnlocked = true;
		}
	}, 0);
}
window.addEventListener('touchstart', unlockAudio);

export const decode = (response, onSuccess, onError) => {
	context.decodeAudioData(response, onSuccess, onError);
}

export const positionListener = (position, orientation) => {
	context.listener.setPosition(position.x, position.y, position.z);
	const front = orientation;
	const up = new THREE.Vector3().copy(front).applyAxisAngle(
			new THREE.Vector3(1, 0, 1),
			Math.PI / 4
		);
	context.listener.setOrientation(front.x, front.y, front.z, up.x, up.y, up.z);
}

export const createPanner = (buffer, { x, y, z }) => {
	const panner = context.createPanner();
	panner.coneOuterGain = OUTER_GAIN;
	panner.coneOuterAngle = OUTER_ANGLE;
	panner.coneInnerAngle = INNER_ANGLE;
	panner.rollofFactor = ROLLOFF;
	panner.refDistance = REF_DIST;
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

	return { source, panner, gainNode };
}