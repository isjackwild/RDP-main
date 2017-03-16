import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import TweenLite from 'gsap';

const EASE_FOCUS = Back.easeOut.config(2);
const EASE_BLUR = Back.easeOut.config(2.3);
const DUR_OUT = 0.7;
const DUR_IN = 0.7;

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
		this.onReset = this.onReset.bind(this);

	}

	componentDidMount() {
		this.subs.push(PubSub.subscribe('intro.finish', this.onIntroFinished));
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

	onReset() {
		this.subs.forEach(s => PubSub.unsubscribe(s));
		this.subs.push(PubSub.subscribe('intro.finish', this.onIntroFinished));
		this.setState({ isVisible: false, targetsActivated: false, isFocused: false });
	}

	onFocus(e, data) {
		this.setState({ isFocused: true });
		this.tweens.forEach(t => t.kill());
		this.tweens.push(TweenLite.to(this.refs.tl, DUR_IN, { x: 20, y: 8, ease: EASE_FOCUS }));
		this.tweens.push(TweenLite.to(this.refs.tr, DUR_IN, { x: -20, y: 8, ease: EASE_FOCUS }));
		this.tweens.push(TweenLite.to(this.refs.bl, DUR_IN, { x: 20, y: -8, ease: EASE_FOCUS }));
		this.tweens.push(TweenLite.to(this.refs.br, DUR_IN, { x: -20, y: -8, ease: EASE_FOCUS }));
	}

	onBlur() {
		this.setState({ isFocused: false });
		this.tweens.forEach(t => t.kill());
		this.tweens.push(TweenLite.to(this.refs.tl, DUR_OUT, { x: 0, y: 0, ease: EASE_BLUR }));
		this.tweens.push(TweenLite.to(this.refs.tr, DUR_OUT, { x: 0, y: 0, ease: EASE_BLUR }));
		this.tweens.push(TweenLite.to(this.refs.bl, DUR_OUT, { x: 0, y: 0, ease: EASE_BLUR }));
		this.tweens.push(TweenLite.to(this.refs.br, DUR_OUT, { x: 0, y: 0, ease: EASE_BLUR }));
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