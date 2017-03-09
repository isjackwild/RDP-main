import React, { Component } from 'react';
import PubSub from 'pubsub-js';


export default class Intro extends Component {
	constructor(args) {
		super(args);

		this.state = {
			isVisible: true,
		}

		this.subs = [];
		this.onStart = this.onStart.bind(this);
	}

	componentDidMount() {
	}

	componentWillUnmount() {
		this.subs.forEach(s => PubSub.unsubscribe(s));
	}

	onStart() {
		console.log('start');
		PubSub.publish('intro.finish', true);
		this.setState({ isVisible: false });
	}

	render() {
		return (
			<div className={`intro ${this.state.isVisible ? 'intro--visible' : ''}`}>
				<div className="intro__inner">
					<div className="intro__section">
						<span className="intro__span intro__span--title">
							Earthquake
						</span>
						<span className="intro__span intro__span--app">
							Explore the interconnected stories of the 2009 L'Aquila earthquake
						</span>
						<span className="intro__span intro__span--event">
							In April 2009, an earthquake devisated the Abruzzo region in central Italy leaving communities irriversably changed. In the eight years since, the community have had to come together to rebuild their lives.
						</span>
					</div>
					<div className="intro__section intro__section--grow">
						<span className="intro__span intro__span--start" onClick={this.onStart}>
							Start
						</span>
					</div>
				</div>
			</div>
		);
	}
}