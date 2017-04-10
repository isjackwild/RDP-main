const THREE = require('three');
import PubSub from 'pubsub-js';
import _ from 'lodash';
import { moveToAnchor } from '../controls.js';
import { camera } from '../camera.js';
import { moveToPosition, moveAlongJumpPath } from '../controls.js';
import { fibonacciSphere } from '../UTIL.js';
import textLabel from './text-label.js';
// import Artboard from './Artboard.js';
// import { intersectableObjects } from '../input-handler.js';
import Target from './target.js';
import { decode, createPanner } from '../directional-audio.js';
import { textureLoader } from '../loader.js';
// import JumpPoint from './JumpPoint.js';
import { ANCHOR_BASE_WIDTH, ANCHOR_WIDTH_PER_LINK, OPACITY, FOCUS_OPACITY, TARGET_SPREAD, TARGET_RADIUS, TARGET_TRIGGER_DURATION, ANCHOR_NOISE_SPEED, ANCHOR_NOISE_SCALE } from '../CONSTANTS.js';
import TweenLite from 'gsap';
import { Noise } from 'noisejs';


// TODO: crack / mud / concrete texture on the spheres, but sharpened and contrast up and multiplied to look hyper-real. See photo from superstudio lecture


class Anchor extends THREE.Object3D {
	constructor(args) {
		super(args);
		const { position, id, jumpPoints, colors, theme, threadTitle, threadSubtitle, pathDirection } = args;

		this._aId = id;

		this.isInside = false;
		this.colors = colors;
		this.anchorsToIds = jumpPoints;
		this.anchorsTo = [];
		this.anchorsFrom = [];
		this.pathsOut = {};
		this.pathDirection = pathDirection;
		this.targets = [];

		this.position.copy(position);
		this.originalPosition = new THREE.Vector3().copy(position);
		this.noiseOffsetPosition = new THREE.Vector3();

		this.noise = new Noise(Math.random());
		this.noiseTime = 0;
		this.noiseScalar = 1;

		this.theme = theme;
		this.threadTitle = threadTitle;
		this.threadSubtitle = threadSubtitle;

		this.onEnter = this.onEnter.bind(this);
		this.onAudioEnded = this.onAudioEnded.bind(this);
		this.onLoadSound = this.onLoadSound.bind(this);
		this.onDecodeSound = this.onDecodeSound.bind(this);
		this.onErrorDecodeSound = this.onErrorDecodeSound.bind(this);
		this.onResetApp = this.onResetApp.bind(this);

		this.sound = null;
		// if (Math.random() > 0.66) this.loadSound();
	}
	
	setup() {
		PubSub.subscribe('reset.complete', this.onResetApp);

		this.geometry = new THREE.SphereGeometry(ANCHOR_BASE_WIDTH, 12, 12);
		// this.material = new THREE.MeshLambertMaterial({
		// 	color: this.colors.anchor,
		// 	side: THREE.BackSide,
		// 	transparent: true,
		// 	opacity: 0.85,
		// 	alphaMap: textureLoader.load('assets/maps/alpha-matte-test--3.jpg'),
		// });

		const geometry = new THREE.SphereGeometry(ANCHOR_BASE_WIDTH, 12, 12);
		const material = new THREE.MeshLambertMaterial({
			color: this.colors.anchor,
			side: THREE.BackSide,
			transparent: true,
			opacity: 0.7,
			alphaMap: textureLoader.load('assets/maps/alpha-matte-test--3.jpg'),
		});

		this.sphere = new THREE.Mesh(geometry, material);
		this.add(this.sphere);

		this.sphere.rotation.y += Math.random() * Math.PI * 2;
		if (this.anchorsTo.length) this.addTargets();
	}

	addTargets() {
		const up = new THREE.Vector3(0, 1, 0);
		const position = new THREE.Vector3().copy(this.pathDirection).multiplyScalar(ANCHOR_BASE_WIDTH * 0.8);
		const totalSpread = TARGET_SPREAD * (this.anchorsTo.length - 1);
		position.applyAxisAngle(up, totalSpread * -0.5);

		this.anchorsTo.forEach((anchorTo, i) => {
			const target = new Target({ position, anchorTo, cameraPath: this.pathsOut[anchorTo._aId] });
			this.add(target);
			this.targets.push(target);
			position.applyAxisAngle(up, TARGET_SPREAD);
		});
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

	onEnter() {
		this.isInside = true;
		window.socket.on('audio-ended', this.onAudioEnded);
		window.socket.emit('play-audio', { aId: this._aId, color: this.colors.lighting });
		PubSub.publish('audio.start');
		// this.material.transparent = true;
		TweenLite.to(this.sphere.material, 1.5, { opacity: 0.88 });
		TweenLite.to(this, 3, { noiseScalar: 0 });
	}

	onLeave() {
		this.isInside = false;
		this.deactivateTargets();
		TweenLite.to(this, 3, { noiseScalar: 1 });
	}

	onAudioEnded() {
		window.socket.off('audio-ended', this.onAudioEnded);
		PubSub.publish('target.activate');
		PubSub.publish('audio.end');
		TweenLite.to(this.sphere.material, 1.5, { opacity: 0.7 });
		if (this.targets.length) this.activateTargets();
	}

	activateTargets() {
		console.log('activate targets');
		this.targets.forEach(c => c.activate());
	}

	deactivateTargets() {
		console.log('DEactivate targets');
		this.targets.forEach(c => c.deactivate());
	}

	onResetApp() {
		if (!this.isInside) return;

		window.socket.off('audio-ended', this.onAudioEnded);
		PubSub.publish('target.activate');
		PubSub.publish('audio.end');
		this.onLeave();
	}
	
	update(delta) {

		this.noiseTime += (1 * delta);
		this.noiseOffsetPosition.set(
			this.noise.simplex2(this.noiseTime * ANCHOR_NOISE_SPEED, 0) * ANCHOR_NOISE_SCALE,
			this.noise.simplex2(this.noiseTime * ANCHOR_NOISE_SPEED, 1000) * ANCHOR_NOISE_SCALE,
			this.noise.simplex2(this.noiseTime * ANCHOR_NOISE_SPEED, 2000) * ANCHOR_NOISE_SCALE,
		).multiplyScalar(this.noiseScalar);
		this.position.copy(this.originalPosition).add(this.noiseOffsetPosition);
		

		if (!this.isInside) return;
		
		this.sphere.rotation.y -= delta * 0.0012;
		this.targets.forEach(c => c.update(delta));
	} 
}

export default Anchor