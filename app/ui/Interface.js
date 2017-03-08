import React, { Component } from 'react';
import Viewfinder from './components/viewfinder/Viewfinder.js';
import InfoText from './components/info-text/InfoText.js';
import HelpText from './components/help-text/HelpText.js';
import StatusIndicator from './components/status-indicator/StatusIndicator.js';
import Intro from './components/intro/Intro.js';

const Interface = () => {
	console.log('interface');
	return (
		<div className="interface">
			<Viewfinder />
			<InfoText />
			<HelpText />
			<Intro />
			<StatusIndicator />
		</div>
	);
}

export default Interface;