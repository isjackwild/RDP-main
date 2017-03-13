const THREE = require('three');
import { Noise } from 'noisejs';
import Easing from '../EASINGS.js';
import { ribbonRefs } from '../scene.js';

const createCurvedLine = (start, end) => {
	const dir = new THREE.Vector3().copy(end).sub(start);
	const dist = dir.length();
	dir.normalize();
	dir.applyAxisAngle(new THREE.Vector3(Math.random() * Math.PI, Math.random() * Math.PI, Math.random()).normalize(), 0.6);
	dir.multiplyScalar(dist / 3);

	const points = [];

	const cpOne = new THREE.Vector3().copy(start).add(dir);
	const cpTwo = new THREE.Vector3().copy(end).sub(dir);

	const curve = new THREE.CubicBezierCurve3(start, cpOne, cpTwo, end);

	return curve;
}


function assignUVs(geometry) {
    geometry.faceVertexUvs[0] = [];
    geometry.faces.forEach(function(face) {

        var components = ['x', 'y', 'z'].sort(function(a, b) {
            return Math.abs(face.normal[a]) > Math.abs(face.normal[b]);
        });

        var v1 = geometry.vertices[face.a];
        var v2 = geometry.vertices[face.b];
        var v3 = geometry.vertices[face.c];

        geometry.faceVertexUvs[0].push([
            new THREE.Vector2(v1[components[0]], v1[components[1]]),
            new THREE.Vector2(v2[components[0]], v2[components[1]]),
            new THREE.Vector2(v3[components[0]], v3[components[1]])
        ]);

    });

    geometry.uvsNeedUpdate = true;
}

class CameraPath extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { from, to } = args;

		this.from = from;
		this.to = to;

		this.setup();
		ribbonRefs.push(this);
	}
	
	setup() {
		this.path = createCurvedLine(this.from.position, this.to.position);

		const segs = Math.ceil(this.path.getLength() / 10);
		const points = this.path.getPoints(segs);

		this.geometry = new THREE.Geometry({
			dynamic: true,
		});
		const tmp = new THREE.Vector3(0, 0, 0);
		const tmp2 = new THREE.Vector3(0, 0, 0);
		const up = new THREE.Vector3(0, 1, 0);
		const maxWidth = 1.5;

		const noise = new Noise(Math.random());
		const SCALE = 0.0018;
		const NOISE_OFFSET_MAX = 4;
		const step = Math.PI * 2 / points.length;

		const angleTo = this.from.position.angleTo(this.to.position);
		const directionalNormal = new THREE.Vector3().copy(this.to.position).sub(this.from.position).normalize().applyAxisAngle(up, Math.PI / 2);

		const colourMixAttrs = [];

		points.forEach((point, i) => {
			const mix = i / points.length;
			colourMixAttrs.push(mix, mix);
			tmp.copy(point);

			const valX = noise.simplex3(tmp.x * SCALE - 100, tmp.y * SCALE - 100, tmp.z * SCALE - 100);
			const valY = noise.simplex3(tmp.x * SCALE, tmp.y * SCALE, tmp.z * SCALE);
			const valZ = noise.simplex3(tmp.x * SCALE + 100, tmp.y * SCALE + 100, tmp.z * SCALE + 100);
			const offset = new THREE.Vector3(valX, valY, valZ).multiplyScalar(NOISE_OFFSET_MAX);
			tmp.add(offset);

			const control = (Math.cos(((i * step) - Math.PI)) / 2) + 0.5;
			const thisWidth = maxWidth * Easing.Sinusoidal.EaseInOut(control);

			tmp2.copy(directionalNormal);
			tmp2.multiplyScalar(thisWidth / 2);
			const v1 = new THREE.Vector3().copy(tmp).add(tmp2);
			const v2 = new THREE.Vector3().copy(tmp).sub(tmp2);
			this.geometry.vertices.push(v1, v2);
		});

		for (let i = 0; i < this.geometry.vertices.length; i++) {
			if (i % 2 == 0 && i > 1) {
				const face1 = new THREE.Face3(i - 2, i, i + 1);
				const face2 = new THREE.Face3(i - 2, i - 1, i + 1);
				this.geometry.faces.push(face1, face2);
			} 
		}

		assignUVs(this.geometry);
		this.geometry.computeFaceNormals();
		this.geometry.computeVertexNormals();
		this.geometry.computeVertexNormals();
		// this.geometry.computeFlatVertexNormals();
		this.geometry.verticesNeedUpdate = true;
		this.geometry.elementsNeedUpdate = true;
		this.geometry.uvsNeedUpdate = true;
		this.geometry.normalsNeedUpdate = true;

		this.material = new THREE.MeshLambertMaterial({
			color: this.to.colors.jump,
			side: THREE.DoubleSide,
			// visible: false,
		});
	}

	update() {
	}
}

export default CameraPath