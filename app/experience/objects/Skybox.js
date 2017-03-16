const THREE = require('three');
import { convertToRange } from '../MATHS.js';
import { camera } from '../camera.js';
import { SKYBOX_LIGHT, SKYBOX_DARK } from '../constants.js';



class Skybox extends THREE.Mesh {
	constructor(args) {
		super(args);
		this.radius = args.radius;
		this.lastControl = null;
		this.setup();
	}

	setup() {
		this.geometry = new THREE.SphereGeometry(this.radius, 10, 10);
		this.material = new THREE.MeshLambertMaterial({
			color: SKYBOX_DARK,
			side: THREE.BackSide,
		});
	}

	update() {
		const control = convertToRange(camera.position.length(), [0, this.radius], [0, 1]);
		// const color = this.dark.lerp(this.light, control);

		const light = new THREE.Color(SKYBOX_LIGHT);
		const dark = new THREE.Color(SKYBOX_DARK);
		const color = dark.lerp(light, control);

		if (this.lastControl !== control) window.socket.emit('update-sky-color', { control: control });
		
		this.lastControl = control;
		this.material.color = color;
	}
}

export default Skybox;