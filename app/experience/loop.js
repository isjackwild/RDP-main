const THREE = require('three');
import _ from 'lodash';
import { init as initScene, update as updateScene, scene, gui } from './scene.js';
import { init as initCamera, camera } from './camera.js';
import { init as initControls, update as updateControls, controls } from './controls.js';
import { init as initInput, onDeviceOrientation } from './input-handler.js';
import { init as initLights } from './lighting.js';
// import { positionListener } from './directional-audio.js';

let canvas;
let raf, then, now, delta;
let currentCamera, currentScene;
export let renderer;

export const init = () => {
	canvas = document.getElementsByClassName('canvas')[0];
	setupRenderer();
	initCamera();
	initLights();
	initControls();
	initScene();
	initInput();

	currentCamera = camera;
	currentScene = scene;
	now = new Date().getTime();
	animate();
}

export const kill = () => {
	cancelAnimationFrame(raf);
}

const setupRenderer = () => {
	renderer = new THREE.WebGLRenderer({
		canvas,
		antialias: true,
	});
	renderer.setClearColor(0xffffff);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
}

export const onResize = (w, h) => {
	if (renderer) renderer.setSize(w, h);
}

const update = (delta) => {
	updateScene(delta);
	updateControls(delta);
	positionListener();
	// positionListener(camera.position, camera.getWorldDirection());
	// onDeviceOrientation();
}

const positionListener = _.throttle(() => {
	window.socket.emit('position-listener', { pos: camera.position, ori: camera.getWorldDirection().normalize() });
}, 111)

const render = () => {
	renderer.render(currentScene, currentCamera);
}

const animate = () => {
	then = now ? now : null;
	now = new Date().getTime();
	delta = then ? (now - then) / 16.666 : 1;
	delta = Math.min(delta, 3);
	update(delta);
	render();
	raf = requestAnimationFrame(animate);
}
