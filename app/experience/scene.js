const THREE = require('three');
import dat from '../vendor/dat.gui.min.js';
import PubSub from 'pubsub-js';
import _ from 'lodash';
import { camera } from './camera.js';
import { intersectableObjects } from './input-handler.js';
// import Group from './objects/Group.js';
import Anchor from './objects/Anchor.js';
import Target from './objects/Target.js';
import CameraPath from './objects/CameraPath';
import Skybox from './objects/Skybox.js';
import { ANCHOR_SPREAD, ANCHOR_START_SPREAD, ANCHOR_ANGLE_SPREAD, GROUP_RADIUS, SCENE_MAX_RADIUS } from './constants.js';
import { threads } from './data/CONTENT_STRUCTURE';
import { convertToRange } from './MATHS.js';
import { lights } from './lighting.js';
import { controls } from './controls.js';

export let scene, boxMesh, skybox, sceneRadius, directionalLightHelper, anchorRefs = {}, ribbonRefs = [], startTargets = [];
// const directionalLightTarget = new THREE.Vector3();

// Less random spread angles perhaps????
const randomAngle = () => {
	return (Math.random() * Math.PI / 2 - Math.PI / 4);
}



export const init = () => {
	PubSub.subscribe('reset.complete', onResetApp);

	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2(0x55524a, 0.0003);
	scene.add(camera);
	lights.forEach( light => scene.add(light) );
	const up = new THREE.Vector3(0, 1, 0);

	addAnchors();
	addCameraPaths();

	for (let key in anchorRefs) {
		anchorRefs[key].setup();
	}

	requestAnimationFrame(() => {
		const sceneBox = new THREE.Box3().setFromObject(scene);
		const sceneRadius = sceneBox.getBoundingSphere().radius;
		skybox = new Skybox({ radius: sceneRadius });
		scene.add(skybox);

		console.log(sceneRadius, 'scene radius');

		addDots(sceneBox);
	});
}

const addDots = (sceneBox) => {
	const SPACING = 1500;

	sceneBox.min.multiplyScalar(1.1);
	sceneBox.max.multiplyScalar(1.1);

	for (let x = sceneBox.min.x; x < sceneBox.max.x; x += SPACING) {
		for (let y = sceneBox.min.y; y < sceneBox.max.y; y += SPACING) {
			for (let z = sceneBox.min.z; z < sceneBox.max.z; z += SPACING){
				const dot = new THREE.Mesh();
				const tmpGeom = new THREE.SphereGeometry(5, 6, 6);
				dot.geometry = new THREE.BufferGeometry().fromGeometry(tmpGeom);
				dot.material = new THREE.MeshBasicMaterial({
					color: 0xffffff,
					fog: false,
				});
				dot.position.set(x, y, z);
				scene.add(dot);
			}
		}
	}
}

const addAnchors = () => {
	const up = new THREE.Vector3(0, 1, 0);
	const pathDirection = new THREE.Vector3(1, 0, 0);

	threads.forEach((thread, iP) => {
		const angle = (iP / threads.length) * Math.PI * 2;
		const pathDirection = new THREE.Vector3(0, 0, 1).applyAxisAngle(up, angle);

		const RES = 1000;
		const conicalSpiralPoints = [];
		const spiralOffset = Math.random() * Math.PI * 2;
		for (let i = 0; i < RES; i++) {
			const t = i / 200;
			const control = i / RES;
			const vec = new THREE.Vector3(
				t * Math.cos((t * 8) + spiralOffset) * 666,
				t * Math.sin((t * 8) + spiralOffset) * 222,
				(control * 5000),
			).applyAxisAngle(up, angle);
			conicalSpiralPoints.push(vec);
		}
		const conicalSpiral = new THREE.CatmullRomCurve3(conicalSpiralPoints);

		// const geometry = new THREE.Geometry();
		// for (let i = 0; i < 1000; i++) {
		// 	geometry.vertices.push(conicalSpiral.getPoint(i / 1000));
		// }
		// const material = new THREE.LineBasicMaterial( { color: 0xff0000, linewidth: 2 } );
		// const line = new THREE.Line(geometry, material);
		// scene.add(line);

		thread.anchors.forEach((anchorData, iA) => {
			const point = convertToRange(anchorData.depth, [0, 1], [0.2, 1])
			let position;
			position = conicalSpiral.getPoint(point);
			position.add(new THREE.Vector3().copy(pathDirection).multiplyScalar(Math.random() * 1000 - 500));
			position.y += (Math.random() * 1000) - 500;

			const args = {
				...anchorData,
				position,
				pathDirection,
				threadTitle: thread.title,
				threadSubtitle: thread.subtitle,
				colors: thread.colors,
				volume: thread.volume,
			}
			const anchor = new Anchor(args);
			anchorRefs[anchorData.id] = anchor;
			scene.add(anchor);
		
			if (iA === 0) {
				const target = new Target({ position: new THREE.Vector3().copy(pathDirection).multiplyScalar(ANCHOR_START_SPREAD), anchorTo: anchor, isActive: true, isStartTarget: true });
				scene.add(target)
				startTargets.push(target);
			}
		});
	});
}

const addCameraPaths = () => {
	for (let key in anchorRefs) {
		const anchorFrom = anchorRefs[key];
		const anchorsToIds = anchorFrom.anchorsToIds;
		const positionFrom = anchorFrom.position;

		anchorsToIds.forEach((anchorId) => {
			const anchorTo = anchorRefs[anchorId];
			const positionTo = anchorTo.position;

			const cameraPath = new CameraPath({
				from: anchorFrom,
				to: anchorTo,
			});
			scene.add(cameraPath);

			
			anchorFrom.anchorsTo.push(anchorTo);
			anchorFrom.pathsOut[anchorId] = cameraPath;
			anchorTo.anchorsFrom.push(anchorFrom);
		});
	}
}


export const update = (delta) => {
	if (skybox) {
		skybox.update(delta);
		scene.fog.color = skybox.material.color;
	}

	for (let key in anchorRefs) {
		anchorRefs[key].update(delta);
	}

	startTargets.forEach(t => t.update(delta));
}

const onResetApp = () => {
	startTargets.forEach(t => t.activate());
}

