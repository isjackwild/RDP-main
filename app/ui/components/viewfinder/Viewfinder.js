import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import TweenLite from 'gsap';
import CubicBezier from '../../../vendor/CubicBezier.js';

// const EASE_FOCUS = Back.easeOut.config(2);
const EASE_BLUR = Back.easeOut.config(2.3);
const EASE_FOCUS = CubicBezier.config(0.38, 0.0, 0.1, 1.65);
// const EASE_BLUR = CubicBezier.config(0.38, 0.0, 0.1, 2);
const DUR_OUT = 0.6;
const DUR_IN = 0.5;

export default class Viewfinder extends Component {
	constructor(args) {
		super(args);

		this.state = {
			isFocused: false,
			targetsActivated: true,
			isVisible: false,
			isPlayingAudio: false,
		}

		this.subs = [];
		this.tweens = [];

		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onTargetsActivated = this.onTargetsActivated.bind(this);
		this.onTargetsDeactivated = this.onTargetsDeactivated.bind(this);
		this.onIntroFinished = this.onIntroFinished.bind(this);
		this.onAudioStart = this.onAudioStart.bind(this);
		this.onAudioEnd = this.onAudioEnd.bind(this);
		this.onResetApp = this.onResetApp.bind(this);

	}

	componentDidMount() {
		this.subs.push(PubSub.subscribe('intro.finish', this.onIntroFinished));
		this.subs.push(PubSub.subscribe('reset.complete', this.onResetApp));
	}

	componentWillUnmount() {
		this.subs.forEach(s => PubSub.unsubscribe(s));
	}

	onIntroFinished() {
		this.subs.push(PubSub.subscribe('target.focus', this.onFocus));
		this.subs.push(PubSub.subscribe('target.blur', this.onBlur));
		this.subs.push(PubSub.subscribe('target.activate', this.onTargetsActivated));
		this.subs.push(PubSub.subscribe('target.deactivate', this.onTargetsDeactivated));
		this.subs.push(PubSub.subscribe('audio.start', this.onAudioStart));
		this.subs.push(PubSub.subscribe('audio.end', this.onAudioEnd));
		this.setState({ isVisible: true });
	}

	onResetApp() {
		this.subs.forEach(s => PubSub.unsubscribe(s));
		this.subs.push(PubSub.subscribe('intro.finish', this.onIntroFinished));
		this.subs.push(PubSub.subscribe('reset.complete', this.onResetApp));
		this.setState({ isVisible: false, targetsActivated: false });
		this.onBlur();
		this.onAudioEnd();
	}

	onFocus(e, data) {
		this.setState({ isFocused: true });
		this.tweens.forEach(t => t.kill());
		this.tweens.push(TweenLite.to(this.refs.tl, DUR_IN, { x: 20, y: 8, ease: EASE_FOCUS, force3D: false }));
		this.tweens.push(TweenLite.to(this.refs.tr, DUR_IN, { x: -20, y: 8, ease: EASE_FOCUS, force3D: false }));
		this.tweens.push(TweenLite.to(this.refs.bl, DUR_IN, { x: 20, y: -8, ease: EASE_FOCUS, force3D: false }));
		this.tweens.push(TweenLite.to(this.refs.br, DUR_IN, { x: -20, y: -8, ease: EASE_FOCUS, force3D: false }));
	}

	onBlur() {
		this.setState({ isFocused: false });
		this.tweens.forEach(t => t.kill());
		this.tweens.push(TweenLite.to(this.refs.tl, DUR_OUT, { x: 0, y: 0, ease: EASE_BLUR, force3D: false }));
		this.tweens.push(TweenLite.to(this.refs.tr, DUR_OUT, { x: 0, y: 0, ease: EASE_BLUR, force3D: false }));
		this.tweens.push(TweenLite.to(this.refs.bl, DUR_OUT, { x: 0, y: 0, ease: EASE_BLUR, force3D: false }));
		this.tweens.push(TweenLite.to(this.refs.br, DUR_OUT, { x: 0, y: 0, ease: EASE_BLUR, force3D: false }));
	}

	onTargetsActivated() {
		this.setState({ isVisible: true });
	}

	onTargetsDeactivated() {
		this.setState({ isVisible: false });
	}

	onAudioStart() {
		this.setState({ isPlayingAudio: true });
	}

	onAudioEnd() {
		this.setState({ isPlayingAudio: false });
	}

	render() {
		return (
			<div>
				<div className={`viewfinder ${this.state.isFocused ? 'viewfinder--focused' : ''} ${this.state.isVisible ? 'viewfinder--visible' : ''}`}>
					<div className="viewfinder__part viewfinder__part--tl" ref="tl"></div>
					<div className="viewfinder__part viewfinder__part--tr" ref="tr"></div>
					<div className="viewfinder__part viewfinder__part--bl" ref="bl"></div>
					<div className="viewfinder__part viewfinder__part--br" ref="br"></div>
				</div>
				<img className={`viewfinder__speaker ${this.state.isPlayingAudio ? 'viewfinder__speaker--visible' : ''}`} src="assets/images/speaker.svg" />
			</div>
		);
	}
}