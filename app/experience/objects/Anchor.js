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
// import JumpPoint from './JumpPoint.js';
import { ANCHOR_BASE_WIDTH, ANCHOR_WIDTH_PER_LINK, OPACITY, FOCUS_OPACITY, TARGET_SPREAD, TARGET_RADIUS, TARGET_TRIGGER_DURATION } from '../CONSTANTS.js';
import TweenLite from 'gsap';


class Anchor extends THREE.Mesh {
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

		this.position.copy(position);

		this.theme = theme;
		this.threadTitle = threadTitle;
		this.threadSubtitle = threadSubtitle;

		this.onEnter = this.onEnter.bind(this);
		this.onAudioEnded = this.onAudioEnded.bind(this);
		this.onLoadSound = this.onLoadSound.bind(this);
		this.onDecodeSound = this.onDecodeSound.bind(this);
		this.onErrorDecodeSound = this.onErrorDecodeSound.bind(this);

		this.sound = null;
		this.loadSound()
	}
	
	setup() {
		this.geometry = new THREE.SphereGeometry(ANCHOR_BASE_WIDTH, 20, 20);
		this.material = new THREE.MeshLambertMaterial({
			color: this.colors.anchor,
			side: THREE.BackSide,
		});
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
		console.log('decoded sound');
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
		this.material.transparent = true;
		TweenLite.to(this.material, 0.5, { opacity: 0.93 });
	}

	onLeave() {
		this.isInside = false;
		this.deactivateTargets();
		TweenLite.to(this.material, 0.5, { opacity: 1, onComplete: () => this.material.transparent = false });
	}

	onAudioEnded(aId) {
		window.socket.off('audio-ended', this.onAudioEnded);
		console.log('audio ended', aId);
		PubSub.publish('target.activate');
		PubSub.publish('audio.end');
		if (this.children.length) this.activateTargets();
	}

	activateTargets() {
		console.log('activate targets');
		this.children.forEach(c => c.activate());
	}

	deactivateTargets() {
		console.log('DEactivate targets');
		this.children.forEach(c => c.deactivate());
	}
	
	update(delta) {
		if (!this.isInside) return;
		this.children.forEach(c => c.update(delta));
	} 
}

export default Anchor