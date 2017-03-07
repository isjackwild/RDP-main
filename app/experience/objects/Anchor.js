const THREE = require('three');
import PubSub from 'pubsub-js';
import _ from 'lodash';
import { moveToAnchor } from '../controls.js';
import { camera } from '../camera.js';
import { moveToPosition, moveAlongJumpPath } from '../controls.js';
import { fibonacciSphere } from '../UTIL.js';
import textLabel from './text-label.js';
// import Artboard from './Artboard.js';
import { intersectableObjects } from '../input-handler.js';
// import JumpPoint from './JumpPoint.js';
import { ANCHOR_BASE_WIDTH, ANCHOR_WIDTH_PER_LINK, OPACITY, FOCUS_OPACITY, TARGET_SPREAD, TARGET_RADIUS, TARGET_TRIGGER_DURATION } from '../CONSTANTS.js';
import TweenLite from 'gsap';

const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NOISE_FRAGMENT_SHADER = `
	uniform vec3 color;
	uniform float opacity;
	uniform float grainStrength;

	varying vec2 vUv;

	void main() {
		float strength = grainStrength;

    	float x = (vUv.x + 4.0) * (vUv.y + 4.0) * 10.0;
		vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * strength;

		gl_FragColor = vec4(color + grain.xyz, opacity);
	}`;


class Anchor extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { position, id, jumpPoints, colors, theme, threadTitle, threadSubtitle, pathDirection } = args;

		this._aId = id;

		this.isActive = false;
		this.isTargetsActive = false;
		this.colors = colors;
		this.anchorsToIds = jumpPoints;
		this.anchorsTo = [];
		this.anchorsFrom = [];
		this.pathsOut = {};
		this.theme = theme;
		this.threadTitle = threadTitle;
		this.threadSubtitle = threadSubtitle;
		this.triggerTimeout = undefined;
		this.pathDirection = pathDirection;

		this.position.copy(position);

		this.onClickTarget = this.onClickTarget.bind(this);
		this.onFocusTarget = this.onFocusTarget.bind(this);
		this.onBlurTarget = this.onBlurTarget.bind(this);
		this.onFocusTrigger = this.onFocusTrigger.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onClick = this.onClick.bind(this);
		this.onEnter = this.onEnter.bind(this);
		this.onAudioEnded = this.onAudioEnded.bind(this);
	}
	
	setup() {
		this.setupDebugMesh();
		// if (this.anchorsTo.length) this.setupArtboard();
		if (this.anchorsTo.length) this.addTargets();
		intersectableObjects.push(this);
	}

	setupDebugMesh() {
		this.geometry = new THREE.SphereGeometry(ANCHOR_BASE_WIDTH, 16, 16);
		this.material = new THREE.MeshLambertMaterial({
			color: this.colors.anchor,
			side: THREE.BackSide,
		});
	}

	addTargets() {
		const up = new THREE.Vector3(0, 1, 0);
		const targetPosition = new THREE.Vector3().copy(this.pathDirection).multiplyScalar(ANCHOR_BASE_WIDTH * 0.8);
		const totalSpread = TARGET_SPREAD * (this.anchorsTo.length - 1);
		targetPosition.applyAxisAngle(up, totalSpread * -0.5);

		this.anchorsTo.forEach((anchorTo, i) => {
			const target = new THREE.Mesh();
			target.geometry = new THREE.SphereGeometry(TARGET_RADIUS, 16, 16);
			target.material = new THREE.MeshLambertMaterial({
				color: anchorTo.colors.jump,
				side: THREE.BackSide,
			});
			target.material.side = THREE.DoubleSide;
			target.scale.x = 0.001;
			target.scale.y = 0.001;
			target.scale.z = 0.001;
			target.onClick = () => { if (this.isTargetsActive) this.onClickTarget(anchorTo._aId) };
			target.onFocus = () => { if (this.isTargetsActive) this.onFocusTarget({ thread: anchorTo.threadTitle, subtitle: anchorTo.threadSubtitle, theme: anchorTo.theme, id: anchorTo._aId }) };
			target.onBlur = () => { if (this.isTargetsActive) this.onBlurTarget() };

			target.position.copy(targetPosition);
			targetPosition.applyAxisAngle(up, TARGET_SPREAD);
			this.add(target);
			intersectableObjects.push(target);
		});
	}

	onFocus() {
		if (!this.isActive) return;
		PubSub.publish('target.focus', { thread: this.threadTitle, subtitle: this.threadSubtitle, theme: this.theme });
		
		clearTimeout(this.triggerTimeout);
		this.triggerTimeout = setTimeout(() => {
			this.onClick();
		}, TARGET_TRIGGER_DURATION);
	}

	onBlur() {
		if (!this.isActive) return;
		clearTimeout(this.triggerTimeout);
		PubSub.publish('target.blur');
	}

	onClick() {
		if (!this.isActive) return;
		this.isActive = false;
		// this.onEnter();
		PubSub.publish('target.deactivate');
		moveToPosition(this.position, this.onEnter);
		PubSub.publish('target.blur');
	}

	onClickTarget(anchorToId) {
		this.onFocusTrigger(anchorToId)
	}

	onFocusTarget(data) {
		PubSub.publish('target.focus', data);
		clearTimeout(this.triggerTimeout);
		this.triggerTimeout = setTimeout(() => {
			this.onFocusTrigger(data.id);
		}, TARGET_TRIGGER_DURATION);
	}

	onBlurTarget(anchorToId) {
		PubSub.publish('target.blur');
		clearTimeout(this.triggerTimeout);
	}

	onFocusTrigger(anchorToId) {
		this.material.opacity = 1;
		this.material.transparent = false;
		const path = this.pathsOut[anchorToId];
		clearTimeout(this.triggerTimeout);
		TweenLite.to(this.material, 0.5, { opacity: 1, onComplete: () => this.material.transparent = false });

		const anchorTo = _.find(this.anchorsTo, a => a._aId === anchorToId);

		PubSub.publish('target.deactivate');
		moveAlongJumpPath(path, anchorTo.onEnter);
		PubSub.publish('target.blur');
		if (this.children.length) this.deactivateTargets();
	}

	onEnter() {
		// TODO: Make transparent only on enter
		window.socket.on('audio-ended', this.onAudioEnded);
		window.socket.emit('play-audio', { aId: this._aId, color: this.colors.anchor });
		this.material.transparent = true;
		TweenLite.to(this.material, 0.5, { opacity: 0.93 });
	}

	onAudioEnded(aId) {
		window.socket.off('audio-ended', this.onAudioEnded);
		console.log('audio ended', aId);
		PubSub.publish('target.activate');
		if (this.children.length) this.activateTargets();
	}

	activateTargets() {
		this.children.forEach((child) => {
			TweenLite.to(child.scale, 0.66, { x: 1, y: 1, z: 1, ease: Back.easeOut.config(1.5) });
		});
		this.isTargetsActive = true;
	}

	deactivateTargets() {
		this.children.forEach((child) => {
			TweenLite.to(child.scale, 0.66, { x: 0.001, y: 0.001, z: 0.001, ease: Back.easeIn.config(1.5) });
		});
		this.isTargetsActive = false;
	}
}

export default Anchor