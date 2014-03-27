/*jslint browser: true, regexp: true, nomen: true */
/*global require, __dirname, process */

var http = require('http'),
	connect = require('connect'),
	socketio = require('socket.io'),
	app = connect(),
	server,
	io,
	decks = {},
	util = {
		url: require('url'),
		crypto: require('crypto')
	},
	max_inactive_time = 1800000; // half-hour

function getIdFromUrl(url) {
	'use strict';
	var parsed = util.url.parse(url);

	return parsed.hostname + parsed.pathname;
}

function setupViewer(client, deck) {
	'use strict';
	if (deck.has_master) {
		client.emit('notify', {master: true, current: deck.current});
	}

	client.join(deck.id);
}

function defaultDeckState(id) {
	'use strict';
	return {
		id: id,
		current: 0,
		has_master: false
	};
}

function verifyKey(key, input) {
	'use strict';
	return (key === util.crypto.createHash('md5').update(input).digest('hex'));
}

function clearInactiveSessions() {
	'use strict';
	var now = Date.now(),
		key;
	for (key in decks) {
		if (decks.hasOwnProperty(key)) {
			if (now - decks[key].timestamp > max_inactive_time) {
				delete decks[key];
			}
		}
	}
}

function setupMaster(client, deck) {
	'use strict';
	client.on('master', function (data) {
		if (verifyKey(data.key, data.input)) {
			client.emit('master', true);
			deck.has_master = true;

			io.sockets['in'](deck.id).emit('notify', { master: true });

			client.on('change', function (data) {
				deck.current = data.current;
				deck.timestamp = Date.now();
				io.sockets['in'](deck.id).emit('slide', deck.current);
			});

			client.on('disconnect', function () {
				deck.has_master = false;
				io.sockets['in'](deck.id).emit('notify', { master: false });
			});
		} else {
			client.emit('master', false);
		}
	});
}

// set up server
app.use(function (req, res, next) {
	'use strict';
	res.setHeader('Access-Control-Allow-Origin', '*');
	next();
}).use(connect['static'](__dirname + '/public'));

server = http.createServer(app).listen(process.env.OPENSHIFT_NODEJS_PORT || 8080, process.env.OPENSHIFT_NODEJS_IP);

// set up the socket
io = socketio.listen(server);

io.configure('production', function () {
	'use strict';
	io.enable('browser client minification');  // send minified client
	io.enable('browser client etag');          // apply etag caching logic based on version number
	io.set('log level', 1);                    // reduce logging
});

io.sockets.on('connection', function (client) {
	'use strict';
	client.on('join', function (data) {
		var id = getIdFromUrl(data.url),
			deck = decks[id];

		if (!deck) {
			decks[id] = deck = defaultDeckState(id);
		}

		deck.timestamp = Date.now();

		if (data.is_master) {
			setupMaster(client, deck);
		} else {
			setupViewer(client, deck);
		}
	});
});

setInterval(function () {
	'use strict';
	clearInactiveSessions();
}, max_inactive_time);