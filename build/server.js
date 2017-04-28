const express = require('express');
const http = require('http');
const socket = require('socket.io');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const server = http.createServer(app);
const io = socket.listen(server);

app.get('/', (req, res) => {
	const ua = req.headers['user-agent'];
	if (/mobile/i.test(ua)) {
		console.log('mobile', __dirname);
		app.use(express['static'](path.join(__dirname, '')));
		return res.sendFile(__dirname + '/controller.html');
	} else {
		console.log('desktop', __dirname);
		app.use(express['static'](path.join(__dirname, '')));
		return res.sendFile(__dirname + '/desktop.html');
	}
});

const port = Number(process.env.PORT || 4000);


io.sockets.on('connection', (client) => {

	// console.log('new client connected');

	client.on('desktop-client', (data) => {
		client.join('desktops');
	});

	client.on('mobile-client', (data) => {
		client.join('mobiles');
	});


	client.on('play-audio', (data) => {
		client.to('desktops').emit('play-audio', data);
	});

	client.on('audio-ended', (aId) => {
		client.to('mobiles').emit('audio-ended', aId);
	});

	client.on('audio-time', (control) => {
		client.to('mobiles').emit('audio-time', control);
	});

	client.on('trigger-focus', (data) => {
		client.to('desktops').emit('trigger-focus', data);
	});

	client.on('update-sky-color', (data) => {
		client.to('desktops').emit('update-sky-color', data);
	});

	client.on('reset', (data) => {
		client.to('desktops').emit('reset', data);
	});

	client.on('position-listener', (data) => {
		client.to('desktops').emit('position-listener', data);
	});
});


server.listen(port, () => {
	console.log('listening on ' + port);
});