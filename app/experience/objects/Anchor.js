const THREE = require('three');
import PubSub from 'pubsub-js';
import _ from 'lodash';
import { moveToAnchor } from '../controls.js';
import { camera } from '../camera.js';
import { moveToPosition, moveAlongJumpPath } from '../controls.js';
import { fibonacciSphere } from '../UTIL.js';
import textLabel from './text-label.js';
import Artboard from './Artboard.js';
import { intersectableObjects } from '../input-handler.js';
// import JumpPoint from './JumpPoint.js';
import { ANCHOR_BASE_WIDTH, ANCHOR_WIDTH_PER_LINK, OPACITY, FOCUS_OPACITY } from '../CONSTANTS.js';


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
		const { position, id, jumpPoints, colors, theme, threadTitle } = args;

		this._aId = id;

		this.isActive = false;
		this.colors = colors;
		this.anchorsToIds = jumpPoints;
		this.anchorsTo = [];
		this.anchorsFrom = [];
		this.pathsOut = {};
		this.theme = theme;
		this.threadTitle = threadTitle;
		this.triggerTimeout = undefined;

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
		if (this.anchorsTo.length) this.setupArtboard();
		intersectableObjects.push(this);
	}

	setupDebugMesh() {
		// this.geometry = new THREE.CubeGeometry(ANCHOR_BASE_WIDTH, ANCHOR_BASE_WIDTH, ANCHOR_BASE_WIDTH);
		this.geometry = new THREE.SphereGeometry(ANCHOR_BASE_WIDTH, 16, 16);
		// this.material = new THREE.MeshStandardMaterial({
		// 	color: this.colors.anchor, 
		// 	opacity: 1,
		// 	// transparent: true,
		// 	side: THREE.DoubleSide,
		// 	roughness: 0.8,
		// 	metalness: 0.5,
		// 	// wireframe: true,
		// 	// visible: false,
		// });

		this.material = new THREE.ShaderMaterial({
			uniforms: {
				color: {
					type: "c",
					value: new THREE.Color(this.colors.anchor)
				},
				opacity: {
					type: "f",
					value: 0.9,
				},
				grainStrength: {
					type: "f",
					value: 3.0,
				}
			},
			vertexShader: VERTEX_SHADER,
			fragmentShader: NOISE_FRAGMENT_SHADER,
			// transparent: true,
			side: THREE.BackSide,
		});
	}

	setupArtboard() {
		this.artboard = new Artboard({
			anchorsTo: this.anchorsTo,
			onClickTarget: this.onClickTarget.bind(this),
			onFocusTarget: this.onFocusTarget.bind(this),
			onBlurTarget: this.onBlurTarget.bind(this),
		});
		this.add(this.artboard);

		const averagePositionsTo = new THREE.Vector3();
		this.anchorsTo.forEach(anchor => averagePositionsTo.add(anchor.position));

		this.updateMatrixWorld();
		this.worldToLocal(averagePositionsTo);
		this.artboard.position.copy(averagePositionsTo).normalize().multiplyScalar(ANCHOR_BASE_WIDTH / 2);
		this.artboard.lookAt(averagePositionsTo);
	}

	onFocus() {
		if (!this.isActive) return;
		PubSub.publish('target.focus', { thread: this.threadTitle, theme: this.theme });
		
		clearTimeout(this.triggerTimeout);
		this.triggerTimeout = setTimeout(() => {
			this.onClick();
		}, 4000);
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
		}, 4000);
	}

	onBlurTarget(anchorToId) {
		PubSub.publish('target.blur');
		clearTimeout(this.triggerTimeout);
	}

	onFocusTrigger(anchorToId) {
		const path = this.pathsOut[anchorToId];
		clearTimeout(this.triggerTimeout);

		const anchorTo = _.find(this.anchorsTo, a => a._aId === anchorToId);

		PubSub.publish('target.deactivate');
		moveAlongJumpPath(path, anchorTo.onEnter);
		PubSub.publish('target.blur');
		if (this.artboard) this.artboard.deactivateTargets();
	}

	onEnter() {
		setTimeout(() => {
			this.onAudioEnded();
		}, 3333);
		console.log('play audio');
	}

	onAudioEnded() {
		PubSub.publish('target.activate');
		if (this.artboard) this.artboard.activateTargets();
	}
}

export default Anchor