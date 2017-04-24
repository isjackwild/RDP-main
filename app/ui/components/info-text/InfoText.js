import React, { Component } from 'react';
import PubSub from 'pubsub-js';
import TweenLite from 'gsap';


export default class InfoText extends Component {
	constructor(args) {
		super(args);

		this.state = {
			theme: null,
			thread: null,
			subtitle: null,
			targetsActivated: true,
		}

		this.subs = [];
		this.tl = null;

		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onTargetsActivated = this.onTargetsActivated.bind(this);
		this.onTargetsDeactivated = this.onTargetsDeactivated.bind(this);
		this.onIntroFinished = this.onIntroFinished.bind(this);
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
	}

	onReset() {
		this.subs.forEach(s => PubSub.unsubscribe(s));
		this.subs.push(PubSub.subscribe('intro.finish', this.onIntroFinished));
		this.setState({ isVisible: false, targetsActivated: false, isFocused: false });
	}

	onFocus(e, data) {
		const { theme, thread, subtitle } = data
		TweenLite.set(this.refs.wrapper, { y: 18, opacity: 0 });
		this.setState({ theme, thread, subtitle });
		TweenLite.to(this.refs.wrapper, 0.66, { opacity: 1, ease: Sine.easeOut, force3D: false });
		TweenLite.to(this.refs.wrapper, 1.85, { y: 0, ease: Power4.easeOut, force3D: false });
	}

	onBlur() {
		if (!this.state.targetsActivated) return

		const onComplete = () => {
			this.setState({ theme: null, thread: null, subtitle: null });
		}

		TweenLite.to(this.refs.wrapper, 0.15, { opacity: 0, onComplete, ease: Sine.easeIn });
	}

	onTargetsActivated() {
		this.setState({ targetsActivated: true });

		const onComplete = () => {
			this.setState({ theme: null, thread: null, subtitle: null });
		}

		TweenLite.to(this.refs.wrapper, 0.15, { opacity: 0, onComplete, ease: Sine.easeIn });
	}

	onTargetsDeactivated() {
		this.setState({ targetsActivated: false });
	}

	render() {
		return (
			<div className="info-text" ref="wrapper">
				<span className="info-text__text info-text__text--thread">
					<span className="info-text__thread--title">{ this.state.thread }</span>
					<span className="info-text__thread--subtitle">{ this.state.subtitle }</span>
				</span>
				<span className="info-text__text info-text__text--theme">{ this.state.theme }</span>
			</div>
		);
	}
}



/*<div className="info-text">
				<span className="info-text__text info-text__text--thread">
					<span className="info-text__thread--title">{ this.state.thread }</span>
					<span className="info-text__thread--subtitle">{ this.state.subtitle }</span>
				</span>
				<span className="info-text__text info-text__text--theme">{ this.state.theme }</span>
			</div>*/