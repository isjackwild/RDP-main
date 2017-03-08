import React, { Component } from 'react';
import PubSub from 'pubsub-js';


export default class Viewfinder extends Component {
	constructor(args) {
		super(args);

		this.state = {
			isFocused: false,
			targetsActivated: true,
			isVisible: false,
		}

		this.subs = [];

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
		this.setState({ isVisible: true });
	}

	onReset() {
		this.subs.forEach(s => PubSub.unsubscribe(s));
		this.subs.push(PubSub.subscribe('intro.finish', this.onIntroFinished));
		this.setState({ isVisible: false, targetsActivated: false, isFocused: false });
	}

	onFocus(e, data) {
		this.setState({ isFocused: true });
	}

	onBlur() {
		this.setState({ isFocused: false });
	}

	onTargetsActivated() {
		this.setState({ isVisible: true });
	}

	onTargetsDeactivated() {
		this.setState({ isVisible: false });
	}

	render() {
		return (
			<div className={`viewfinder ${this.state.isFocused ? 'viewfinder--focused' : ''} ${this.state.isVisible ? 'viewfinder--visible' : ''}`}>
				<div className="viewfinder__part viewfinder__part--tl"></div>
				<div className="viewfinder__part viewfinder__part--tr"></div>
				<div className="viewfinder__part viewfinder__part--bl"></div>
				<div className="viewfinder__part viewfinder__part--br"></div>
			</div>
		);
	}
}