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

		this.position.copy(position);

		this.onTrigger = this.onTrigger.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);

		this.init();
	}
	
	init() {
		this.geometry = new THREE.SphereGeometry(TARGET_RADIUS, 16, 16);
		this.material = new THREE.MeshLambertMaterial({
			color: this.anchorTo.colors.jump,
			side: THREE.BackSide,
		});
		this.material.side = THREE.DoubleSide;
		if (!this.isActive) {
			this.scale.x = 0.001;
			this.scale.y = 0.001;
			this.scale.z = 0.001;
		}
		this.onClick = this.onTrigger;
		this.onFocus = this.onFocus;
		this.onBlur = this.onBlur;

		intersectableObjects.push(this);
	}

	onFocus() {
		const data = { thread: anchorTo.threadTitle, subtitle: anchorTo.threadSubtitle, theme: anchorTo.theme, id: anchorTo._aId }

		PubSub.publish('target.focus', data);
		clearTimeout(this.triggerTimeout);
		this.triggerTimeout = setTimeout(() => {
			this.onFocusTrigger(data.id);
		}, TARGET_TRIGGER_DURATION);
	}

	onBlur() {
		PubSub.publish('target.blur');
		clearTimeout(this.triggerTimeout);
	}

	onTrigger() {
		clearTimeout(this.triggerTimeout);
		PubSub.publish('target.deactivate');
		if (this.path) {
			moveAlongJumpPath(this.path, this.anchorTo.onEnter);
		} else {
			moveToPosition(this.anchorTo.position, this.anchorTo.onEnter);
		}
		PubSub.publish('target.blur');
		
		if (!this.parent._aId) return
		this.parent.onLeave();
	}

	activate() {
		this.isActive = true;
		TweenLite.to(this.scale, 0.66, { x: 1, y: 1, z: 1, ease: Back.easeOut.config(1.5) });
	}

	deactivate() {
		this.isActive = false;
		TweenLite.to(this.scale, 0.66, { x: 0.001, y: 0.001, z: 0.001, ease: Back.easeIn.config(1.5) });
	}
}

export default Target

