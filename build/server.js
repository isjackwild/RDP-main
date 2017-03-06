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

	console.log('new client connected');

	client.on('play-audio', (aId) => {
		client.broadcast.emit('play-audio', aId);
	});

	client.on('audio-ended', (aId) => {
		client.broadcast.emit('audio-ended', aId);
	});
});


server.listen(port, () => {
	console.log('listening on ' + port);
});