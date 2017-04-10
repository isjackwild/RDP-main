const THREE = require('three');
import PubSub from 'pubsub-js';
import _ from 'lodash';
import { camera } from '../camera.js';
import { moveToPosition, moveAlongJumpPath } from '../controls.js';
import { intersectableObjects } from '../input-handler.js';
import { textureLoader } from '../loader.js';
import { TARGET_SPREAD, TARGET_RADIUS, TARGET_TRIGGER_DURATION, TARGET_WANDER, TARGET_SPRING, TARGET_DAMPING } from '../CONSTANTS.js';
import TweenLite from 'gsap';




class Target extends THREE.Mesh {
	constructor(args) {
		super(args);
		const { position, anchorTo, cameraPath, isActive } = args;

		this.isActive = isActive || false;
		this.isFocused = false;
		this.anchorTo = anchorTo;
		this.cameraPath = cameraPath;
		this.triggerTimeout = undefined;

		this.position.copy(position);
		this.positionVelocity = new THREE.Vector3(0, 0, 0);
		this.restPosition = new THREE.Vector3().copy(position);
		this.targetPosition = new THREE.Vector3().copy(position);
		this.restToTargetVector = new THREE.Vector3();

		this.onTrigger = this.onTrigger.bind(this);
		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.activate = this.activate.bind(this);
		this.deactivate = this.deactivate.bind(this);


		this.init();
	}
	
	init() {
		this.geometry = new THREE.SphereGeometry(TARGET_RADIUS, 20, 20);
		this.material = new THREE.MeshLambertMaterial({
			color: this.anchorTo.colors.jump,
			side: THREE.BackSide,
			// alphaMap: textureLoader.load('assets/maps/alpha-matte-test--4--s.jpg'),
			// transparent: true,
		});
		this.material.side = THREE.DoubleSide;
		if (!this.isActive) {
			this.scale.x = 0.001;
			this.scale.y = 0.001;
			this.scale.z = 0.001;
			this.material.visible = false;
		}
		this.rotation.y += Math.random() * Math.PI * 2;
		this.rotation.x += Math.random() * Math.PI * 2;
		this.onClick = this.onTrigger;

		intersectableObjects.push(this);
	}

	onFocus() {
		if (!this.isActive) return;
		this.isFocused = true;
		const data = { thread: this.anchorTo.threadTitle, subtitle: this.anchorTo.threadSubtitle, theme: this.anchorTo.theme, id: this.anchorTo._aId }

		const colour = new THREE.Color(this.anchorTo.colors.jump);
		const white = new THREE.Color(0xffffff);
		this.material.color = colour.lerp(white, 0.25);

		window.socket.emit('trigger-focus', { color: this.anchorTo.colors.jump });

		PubSub.publish('target.focus', data);
		clearTimeout(this.triggerTimeout);
		this.triggerTimeout = setTimeout(() => {
			this.onTrigger(data.id);
		}, TARGET_TRIGGER_DURATION);
	}

	onBlur() {
		if (!this.isActive) return;
		this.isFocused = false;
		PubSub.publish('target.blur');
		this.material.color = new THREE.Color(this.anchorTo.colors.jump);
		clearTimeout(this.triggerTimeout);
	}

	onTrigger() {
		if (!this.isActive) return;
		clearTimeout(this.triggerTimeout);
		PubSub.publish('target.deactivate');
		if (this.cameraPath) {
			moveAlongJumpPath(this.cameraPath, () => this.anchorTo.onEnter());
		} else {
			moveToPosition(this.anchorTo.position, this.anchorTo.onEnter);
		}
		PubSub.publish('target.blur');
		
		if (!this.parent._aId) return
		this.parent.onLeave();
	}

	activate() {
		this.isActive = true;
		this.material.visible = true;
		TweenLite.to(this.scale, 0.66, { x: 1, y: 1, z: 1, ease: Back.easeOut.config(1.5) });
	}

	deactivate() {
		this.isActive = false;
		TweenLite.to(this.scale, 0.66, { x: 0.001, y: 0.001, z: 0.001, ease: Back.easeIn.config(1.5), onComplete: () => { this.material.visible = false }  });
	}

	update(delta = 1) {
		if (!this.isActive) return;
		if (this.isFocused) {
			this.targetPosition
				.copy(camera.getWorldDirection())
				.multiplyScalar(this.position.length());

			this.restToTargetVector
				.copy(this.targetPosition)
				.sub(this.restPosition);
			const scalar = 1 - ((this.restToTargetVector.length() / TARGET_WANDER) / 2);
			this.restToTargetVector
				.multiplyScalar(Math.max(0, scalar))
				.clampLength(0, TARGET_WANDER);
			this.targetPosition.copy(this.restPosition).add(this.restToTargetVector);

		} else {
			this.targetPosition.copy(this.restPosition);
		}


		this.positionVelocity.add(new THREE.Vector3().copy(this.targetPosition).sub(this.position).multiplyScalar(TARGET_SPRING).multiplyScalar(delta));
		this.position.add(this.positionVelocity.multiplyScalar(TARGET_DAMPING));

		// this.rotation.y += delta * 0.0015;
	}
}

export default Target

