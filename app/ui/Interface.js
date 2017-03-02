import React, { Component } from 'react';
import Viewfinder from './components/viewfinder/Viewfinder.js';
import InfoText from './components/info-text/InfoText.js';
import StatusIndicator from './components/status-indicator/StatusIndicator.js';

const Interface = () => {
	console.log('interface');
	return (
		<div className="interface">
			<Viewfinder />
			<InfoText />
			<StatusIndicator />
		</div>
	);
}

export default Interface;