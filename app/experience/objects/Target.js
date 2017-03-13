const THREE = require('three');
import PubSub from 'pubsub-js';
import _ from 'lodash';
import { camera } from '../camera.js';
import { moveToPosition, moveAlongJumpPath } from '../controls.js';
import { intersectableObjects } from '../input-handler.js';
import { TARGET_SPREAD, TARGET_RADIUS, TARGET_TRIGGER_DURATION } from '../CONSTANTS.js';
import TweenLite from 'gsap';

class Target extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { position, anchorTo, cameraPath, isActive } = args;

		this.isActive = isActive || false;
		this.anchorTo = anchorTo;
		this.cameraPath = cameraPath;
		this.triggerTimeout = undefined;

		console.log(this.cameraPath);

		this.position.copy(position);

		this.onTrigger = this.onTrigger.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.activate = this.activate.bind(this);
		this.deactivate = this.deactivate.bind(this);

		this.init();
	}
	
	init() {
		this.geometry = new THREE.SphereGeometry(TARGET_RADIUS, 12, 12);
		this.material = new THREE.MeshLambertMaterial({
			color: this.anchorTo.colors.jump,
			side: THREE.BackSide,
		});
		this.material.side = THREE.DoubleSide;
		if (!this.isActive) {
			this.scale.x = 0.001;
			this.scale.y = 0.001;
			this.scale.z = 0.001;
			this.material.visible = false;
		}
		this.onClick = this.onTrigger;

		intersectableObjects.push(this);
	}

	onFocus() {
		if (!this.isActive) return;
		const data = { thread: this.anchorTo.threadTitle, subtitle: this.anchorTo.threadSubtitle, theme: this.anchorTo.theme, id: this.anchorTo._aId }

		const colour = new THREE.Color(this.anchorTo.colors.jump);
		const white = new THREE.Color(0xffffff);
		this.material.color = colour.lerp(white, 0.33);

		PubSub.publish('target.focus', data);
		clearTimeout(this.triggerTimeout);
		this.triggerTimeout = setTimeout(() => {
			this.onTrigger(data.id);
		}, TARGET_TRIGGER_DURATION);
	}

	onBlur() {
		if (!this.isActive) return;
		PubSub.publish('target.blur');
		this.material.color = new THREE.Color(this.anchorTo.colors.jump);
		clearTimeout(this.triggerTimeout);
	}

	onTrigger() {
		if (!this.isActive) return;
		clearTimeout(this.triggerTimeout);
		PubSub.publish('target.deactivate');
		if (this.cameraPath) {
			console.log('camera path');
			// this.cameraPath.material.visible = true;
			const callback = () => {
				// this.cameraPath.material.visible = false;
				this.anchorTo.onEnter()
			}
			moveAlongJumpPath(this.cameraPath, callback);
		} else {
			moveToPosition(this.anchorTo.position, this.anchorTo.onEnter);
		}
		PubSub.publish('target.blur');
		
		if (!this.parent._aId) return
		this.parent.onLeave();
	}

	activate() {
		console.log('activate');
		this.isActive = true;
		this.material.visible = true;
		TweenLite.to(this.scale, 0.66, { x: 1, y: 1, z: 1, ease: Back.easeOut.config(1.5) });
	}

	deactivate() {
		console.log('DEactivate');
		this.isActive = false;
		TweenLite.to(this.scale, 0.66, { x: 0.001, y: 0.001, z: 0.001, ease: Back.easeIn.config(1.5), onComplete: () => { this.material.visible = false }  });
	}
}

export default Target

