import React, { Component } from 'react';
import PubSub from 'pubsub-js';


export default class Viewfinder extends Component {
	constructor(args) {
		super(args);

		this.state = {
			isFocused: false,
		}

		this.subs = [];

		this.onFocus = this.onFocus.bind(this);
		this.onBlur = this.onBlur.bind(this);
	}

	componentDidMount() {
		this.subs.push(PubSub.subscribe('target.focus', this.onFocus));
		this.subs.push(PubSub.subscribe('target.blur', this.onBlur));
	}

	componentWillUnmount() {
		this.subs.forEach(s => PubSub.unsubscribe(s));
	}

	onFocus(e, data) {
		console.log(data);
		this.setState({ isFocused: true });
	}

	onBlur() {
		this.setState({ isFocused: false });
	}

	render() {
		return (
			<div className={`viewfinder ${this.state.isFocused ? 'viewfinder--focused' : ''}`}>
				<div className="viewfinder__part viewfinder__part--tl"></div>
				<div className="viewfinder__part viewfinder__part--tr"></div>
				<div className="viewfinder__part viewfinder__part--bl"></div>
				<div className="viewfinder__part viewfinder__part--br"></div>
			</div>
		);
	}
}