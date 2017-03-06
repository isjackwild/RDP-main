const THREE = require('three');
import { moveToAnchor } from '../controls.js';
import { camera } from '../camera.js';
import { moveToPosition } from '../controls.js';
import { fibonacciSphere } from '../UTIL.js';
import textLabel from './text-label.js';
import { intersectableObjects } from '../input-handler.js';
import TweenLite from 'gsap';
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


class Artboard extends THREE.Object3D {
	constructor(args) {
		super(args);

		const { anchorsTo, onClickTarget, onFocusTarget, onBlurTarget } = args;

		this.anchorsTo = anchorsTo;
		this.onClickTarget = onClickTarget;
		this.onFocusTarget = onFocusTarget;
		this.onBlurTarget = onBlurTarget;
		this.isActive = false;
		this.setup();
	}
	
	setup() {
		this.setupTargets();
	}

	// setupBackground() {
	// 	this.background = new THREE.Mesh();
	// 	this.background.scale.y = 0.5625;
	// 	this.background.geometry = new THREE.PlaneGeometry(ANCHOR_BASE_WIDTH, ANCHOR_BASE_WIDTH);

	// 	this.background.material = new THREE.ShaderMaterial({
	// 		uniforms: {
	// 			color: {
	// 				type: "c",
	// 				value: new THREE.Color(0xfcd8d6)
	// 			},
	// 			opacity: {
	// 				type: "f",
	// 				value: 1
	// 			},
	// 			grainStrength: {
	// 				type: "f",
	// 				value: 9,
	// 			}
	// 		},
	// 		vertexShader: VERTEX_SHADER,
	// 		fragmentShader: NOISE_FRAGMENT_SHADER,
	// 		// transparent: true,
	// 		side: THREE.BackSide,
	// 	});
	// 	this.add(this.background);
	// }

	setupTargets() {
		this.anchorsTo.forEach((anchorTo, i) => {
			const target = new THREE.Mesh();
			// target.geometry = new THREE.PlaneGeometry(ANCHOR_BASE_WIDTH / 5, ANCHOR_BASE_WIDTH / 5);
			target.geometry = new THREE.SphereGeometry(ANCHOR_BASE_WIDTH / 10, 16, 16);
			target.material = new THREE.ShaderMaterial({
				uniforms: {
					color: {
						type: "c",
						value: new THREE.Color(anchorTo.colors.jump),
					},
					opacity: {
						type: "f",
						value: 1,
					},
					grainStrength: {
						type: "f",
						value: 2.0,
					}
				},
				vertexShader: VERTEX_SHADER,
				fragmentShader: NOISE_FRAGMENT_SHADER,
				// transparent: true,
				side: THREE.BackSide,
			});
			target.material.side = THREE.DoubleSide;
			target.scale.x = 0.001;
			target.scale.y = 0.001;
			target.onClick = () => { if (this.isActive) this.onClickTarget(anchorTo._aId) };
			target.onFocus = () => { if (this.isActive) this.onFocusTarget({ thread: anchorTo.threadTitle, theme: anchorTo.theme, id: anchorTo._aId }) };
			target.onBlur = () => { if (this.isActive) this.onBlurTarget() };

			this.updateMatrixWorld();
			const anchorLocalDirection = this.worldToLocal(new THREE.Vector3().copy(anchorTo.position)).normalize();
			
			if (this.anchorsTo.length > 1) {
				const sectionsWidth = ANCHOR_BASE_WIDTH / this.anchorsTo.length;
				target.position.x = (i * sectionsWidth) + (sectionsWidth / 2) - (ANCHOR_BASE_WIDTH / 2);
			}

			this.add(target);
			intersectableObjects.push(target);
		});
	}

	activateTargets() {
		console.log('activateTargets');


		this.children.forEach((child) => {
			TweenLite.to(child.scale, 0.66, { x: 1, y: 1, ease: Back.easeOut.config(1.5) });
		});
		this.isActive = true;
	}

	deactivateTargets() {
		console.log('DEactivateTargets');
		this.children.forEach((child) => {
			TweenLite.to(child.scale, 0.66, { x: 0.001, y: 0.001, ease: Back.easeIn.config(1.5) });
		});
		this.isActive = false;
	}
}

export default Artboard

