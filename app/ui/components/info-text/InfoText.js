import React, { Component } from 'react';
import PubSub from 'pubsub-js';


export default class InfoText extends Component {
	constructor(args) {
		super(args);

		this.state = {
			theme: null,
			thread: null,
			targetsActivated: true,
		}

		this.subs = [];

		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
		this.onTargetsActivated = this.onTargetsActivated.bind(this);
		this.onTargetsDeactivated = this.onTargetsDeactivated.bind(this);
	}

	componentDidMount() {
		this.subs.push(PubSub.subscribe('target.focus', this.onFocus));
		this.subs.push(PubSub.subscribe('target.blur', this.onBlur));
		this.subs.push(PubSub.subscribe('target.activate', this.onTargetsActivated));
		this.subs.push(PubSub.subscribe('target.deactivate', this.onTargetsDeactivated));
	}

	componentWillUnmount() {
		this.subs.forEach(s => PubSub.unsubscribe(s));
	}

	onFocus(e, data) {
		const { theme, thread } = data
		this.setState({ theme, thread });
	}

	onBlur() {
		if (this.state.targetsActivated) this.setState({ theme: null, thread: null });
	}

	onTargetsActivated() {
		this.setState({ targetsActivated: true, theme: null, thread: null });
	}

	onTargetsDeactivated() {
		this.setState({ targetsActivated: false });
	}

	render() {
		return (
			<div className="info-text">
				<span className="info-text__text info-text__text--thread">{ this.state.thread }</span>
				<span className="info-text__text info-text__text--theme">{ this.state.theme }</span>
			</div>
		);
	}
}