import React, { Component } from 'react';
import PubSub from 'pubsub-js';


export default class HelpText extends Component {
	constructor(args) {
		super(args);

		this.state = {
			isVisible: false,
			targetsActive: true,
		}

		this.subs = [];

		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onTargetsActivated = this.onTargetsActivated.bind(this);
		this.onTargetsDeactivated = this.onTargetsDeactivated.bind(this);
		this.onIntroFinished = this.onIntroFinished.bind(this);
		this.onReset = this.onReset.bind(this);
		this.showTO = null;
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
		this.setState({ isVisible: true });
	}

	onReset() {
		this.setState({ isVisible: false });
		this.subs.push(PubSub.subscribe('intro.finish', this.onIntroFinished));
		this.subs.forEach(s => PubSub.unsubscribe(s));
	}

	onFocus(e, data) {
		clearTimeout(this.showTO);
		this.setState({ isVisible: false });
	}

	onBlur() {
		if (!this.state.targetsActive) return;
		clearTimeout(this.showTO);
		this.showTO = setTimeout(() => {
			this.setState({ isVisible: true });
		}, 3333);
	}

	onTargetsActivated() {
		this.setState({ targetsActive: true });
		clearTimeout(this.showTO);
		this.showTO = setTimeout(() => {
			this.setState({ isVisible: true });
		}, 3333);
	}

	onTargetsDeactivated() {
		clearTimeout(this.showTO);
		this.setState({ isVisible: false, targetsActive: false });
	}

	render() {
		return (
			<span className={`help-text ${this.state.isVisible ? 'help-text--visible' : ''}`}>
				Hold focus on a sphere to explore a narrative
			</span>
		);
	}
}