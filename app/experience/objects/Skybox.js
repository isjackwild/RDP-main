const THREE = require('three');
import { convertToRange } from '../MATHS.js';
import { camera } from '../camera.js';


const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NOISE_FRAGMENT_SHADER = `
	uniform vec3 color;

	varying vec2 vUv;
	uniform float grainStrength;

	void main() {
		float strength = grainStrength;

    	float x = (vUv.x + 4.0) * (vUv.y + 4.0) * 10.0;
		vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01) - 0.005) * strength;

		gl_FragColor = vec4(color + grain.xyz, 1.0);
	}`;


// TODO: The further away you get from the center, the slightly darker the skybox background becomes

class Skybox extends THREE.Mesh {
	constructor(args) {
		super(args);
		this.radius = args.radius;
		this.dark = new THREE.Color(0x000000);
		this.light = new THREE.Color(0xefefef);
		this.setup();
	}

	setup() {
		this.geometry = new THREE.SphereGeometry(this.radius, 10, 10);
		// this.material = new THREE.ShaderMaterial({
		// 	uniforms: {
		// 		color: {
		// 			type: "c",
		// 			value: 0x4c4c4c,
		// 		},
		// 		opacity: {
		// 			type: "f",
		// 			value: 1
		// 		},
		// 		grainStrength: {
		// 			type: "f",
		// 			value: 3.0,
		// 		}
		// 	},
		// 	vertexShader: VERTEX_SHADER,
		// 	fragmentShader: NOISE_FRAGMENT_SHADER,
		// 	transparent: true,
		// 	shading: THREE.SmoothShading,
		// 	side: THREE.BackSide,
		// 	// wireframe: true,
		// });

		this.material = new THREE.MeshLambertMaterial({
			color: 0x4c4c4c,
			side: THREE.BackSide,
		});
	}

	update() {
		const control = convertToRange(camera.position.length(), [0, this.radius], [0, 1]);
		// const color = this.dark.lerp(this.light, control);

		const dark = new THREE.Color(0x4c4c4c);
		const light = new THREE.Color(0xefefef);
		const color = dark.lerp(light, control);

		this.material.color = color;
	}
}

export default Skybox;