import React, { Component } from 'react';
import _ from 'lodash';
import PubSub from 'pubsub-js';
import TweenLite from 'gsap';
import { TARGET_TRIGGER_DURATION, TARGET_TRIGGER_OFF_DURATION } from '../../../experience/constants.js';


export default class StatusIndicator extends Component {
	constructor(args) {
		super(args);

		this.state = {
			focusControl: 0,
			audioControl: 0,
			screenDiameter: window.innerWidth * 2 + window.innerHeight * 2,
			targetsActivated: true,
		}

		this.subs = [];

		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onTargetsActivated = this.onTargetsActivated.bind(this);
		this.onTargetsDeactivated = this.onTargetsDeactivated.bind(this);
		this.onResize = this.onResize.bind(this);

		this.focusTween = undefined;
	}

	componentDidMount() {
		this.subs.push(PubSub.subscribe('target.focus', this.onFocus));
		this.subs.push(PubSub.subscribe('target.blur', this.onBlur));
		this.subs.push(PubSub.subscribe('target.activate', this.onTargetsActivated));
		this.subs.push(PubSub.subscribe('target.deactivate', this.onTargetsDeactivated));
		window.socket.on('audio-time', (control) => {
			this.setState({ audioControl: control });
		});
		window.socket.on('audio-ended', () => {
			this.setState({ audioControl: 0 });
		});
		window.addEventListener('resize', _.debounce(this.onResize, 16.666));
	}

	componentWillUnmount() {
		this.subs.forEach(s => PubSub.unsubscribe(s));
	}

	onResize() {
		this.setState({ screenDiameter: window.innerWidth * 2 + window.innerHeight * 2 });
	}

	onFocus() {
		if (this.focusTween) this.focusTween.kill();
		const t = { control: this.state.focusControl }

		this.focusTween = TweenLite.to(t, TARGET_TRIGGER_DURATION * 0.001, { control: 1, ease: Power1.easeOut, onUpdate: () => this.setState({ focusControl: t.control }) });
	}

	onBlur() {
		console.log('unfocus');
		if (this.focusTween) this.focusTween.kill();
		const t = { control: this.state.focusControl }

		this.focusTween = TweenLite.to(t, TARGET_TRIGGER_OFF_DURATION * 0.001, { control: 0, ease: Power4.easeOut, onUpdate: () => this.setState({ focusControl: t.control }) });
	}

	onTargetsActivated() {
		this.setState({ targetsActivated: true, audioControl: 0 });
	}

	onTargetsDeactivated() {
		this.setState({ targetsActivated: false });
	}

	render() {
		const focusControl = this.state.targetsActivated === false ? 1 : this.state.focusControl;
		return (
			<div className="status-indicator--wrapper">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="status-indicator"
				>
					<rect
						ref="focus"
						strokeDasharray={this.state.screenDiameter}
						strokeDashoffset={this.state.screenDiameter - (this.state.screenDiameter * focusControl)}
						className="status-indicator__inner status-indicator__inner--focus"
					/>
					<rect
						ref="audio"
						strokeDasharray={this.state.screenDiameter}
						strokeDashoffset={this.state.screenDiameter - (this.state.screenDiameter * this.state.audioControl)}
						className="status-indicator__inner status-indicator__inner--audio"
					/>
				</svg>
			</div>
		);
	}
}