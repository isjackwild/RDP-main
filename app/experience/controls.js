const THREE = require('three');
import TweenLite from 'gsap';
require('../vendor/OrbitControls.js');
require('../vendor/DeviceOrientationControls.js');
import { camera } from './camera.js';
import { CAMERA_MOVE_SPEED, ACTIVE_OPACITY, INACTIVE_OPACITY, RESET_DURATION } from './constants.js';

export let controls;
let currentLevel = 0;
let currentAnchor = null;
// let lastAlpha = 0;
// let lastBeta = 0;
// let lastGamma = 0;
let resetTO = undefined;
// let isLandscape = window.innerWidth > window.innerHeight ? true : false;
const el = document.getElementsByClassName('fuck-you-dev-tools')[0];

export const init = () => {
	controls = new THREE.OrbitControls(camera);
	controls.target.set(0, 0, 0);
	window.addEventListener('deviceorientation', setOrientationControls, true);
	// window.addEventListener('orientationchange', onOrientationChange, true);
}

const setOrientationControls = (e) => {
	window.removeEventListener('deviceorientation', setOrientationControls, true);
	window.addEventListener('deviceorientation', onOrientation, true);
	if (!e.alpha) return;
	if (controls) controls.dispose();
	controls = new THREE.DeviceOrientationControls(camera, true);
	controls.connect();
	controls.update();
}

const onOrientation = (e) => {
	const { alpha, beta, gamma } = e;

	// const changeAlpha = Math.abs(alpha - lastAlpha);
	// const changeBeta = Math.abs(beta - lastBeta);
	// const changeGamma = Math.abs(gamma - lastGamma);

	// const totalChange = changeAlpha + changeBeta + changeGamma;
	// // if (totalChange < 10) console.log('not moving');
	// el.innerHTML = `${alpha}, ${beta}, ${gamma}`;

	if (resetTO === undefined && Math.abs(beta <= 8) &&  Math.abs(gamma) <= 8) {
		resetTO = setTimeout(() => {
			alert('reset!');
			resetTO = undefined;
		}, 5555);
	} else if (Math.abs(beta > 8) ||  Math.abs(gamma) > 8) {
		clearTimeout(resetTO);
		resetTO = undefined;
	}

	// lastAlpha = alpha;
	// lastBeta = beta;
	// lastGamma = gamma;
}


export const moveToPosition = (position, callback) => {
	const dist = new THREE.Vector3().copy(position).sub(camera.position).length();
	const dir = new THREE.Vector3().copy(position).sub(camera.position).normalize();
	const toPosition = new THREE.Vector3().copy(position).sub(dir);
	const { x, y, z } = toPosition;

	const targetToPosition = new THREE.Vector3().copy(position).add(dir);

	TweenLite.to(
		camera.position,
		CAMERA_MOVE_SPEED,
		{
			x,
			y,
			z,
			ease: Sine.EaseInOut,
			onComplete: callback,
		}
	);

	if (!controls.target) return
	TweenLite.to(
		controls.target,
		CAMERA_MOVE_SPEED,
		{
			x: targetToPosition.x,
			y: targetToPosition.y,
			z: targetToPosition.z,
			ease: Sine.EaseInOut,
		}
	);
}

export const moveAlongJumpPath = (cameraPath, callback) => {
	const dist = cameraPath.path.getLength();
	const dur = dist / 300;

	const control = { t: 0 };
	const dir = new THREE.Vector3();

	const setCamera = () => {
		const pos = cameraPath.path.getPoint(control.t);
		dir.copy(pos).sub(camera.position).normalize().multiplyScalar(0.01);
		camera.position.copy(pos);
		if (controls.target) controls.target.copy(pos.add(dir));
	}

	TweenLite.to(
		control,
		dur,
		{
			t: 1,
			ease: Expo.EaseInOut,
			onUpdate: setCamera,
			onComplete: callback,
		}
	);
}

export const update = (delta) => {
	if (controls) controls.update(delta);
}