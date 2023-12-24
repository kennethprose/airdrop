const WebSocket = require("websocket").server;
const http = require("http");

const server = http.createServer((req, res) => {
	console.log("Received request for", req.url);
	res.writeHead(404);
	res.end();
});

server.listen(8080, () => {
	console.log("Server is listening on port 8080");
});

const wsServer = new WebSocket({
	httpServer: server,
});

const generateUsername = () => {
	const adjectives = ["Happy", "Lucky", "Clever", "Cool", "Energetic"];
	const nouns = ["Cat", "Dog", "Fox", "Tiger", "Rabbit"];

	let username = "";

	do {
		const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
		const noun = nouns[Math.floor(Math.random() * nouns.length)];
		username = `${adjective}${noun}`;
	} while (clients.some((client) => client.username === username));

	return username;
};

const clients = [];

const broadcastUsernames = () => {
	const usernames = clients.map((client) => client.username);
	const messages = clients.reduce((allMessages, client) => {
		return allMessages.concat(
			client.messages.map((message) => ({
				username: client.username,
				message,
				recipient: client.recipient,
			}))
		);
	}, []);
	clients.forEach((client) => {
		client.connection.sendUTF(
			JSON.stringify({ type: "usernames", usernames, messages })
		);
	});
};

wsServer.on("request", (request) => {
	const connection = request.accept(null, request.origin);
	let username = generateUsername();

	const client = { connection, username, messages: [], recipient: null };
	clients.push(client);

	connection.sendUTF(JSON.stringify({ type: "username", username }));
	broadcastUsernames();

	connection.on("message", (message) => {
		if (message.type === "utf8") {
			const data = JSON.parse(message.utf8Data);
			if (
				data.type === "message" &&
				typeof data.message === "string" &&
				typeof data.to === "string"
			) {
				const recipientClient = clients.find((c) => c.username === data.to);
				if (recipientClient) {
					recipientClient.messages.push(data.message);
					console.log(data.message);
					recipientClient.recipient = client.username;
					recipientClient.connection.sendUTF(
						JSON.stringify({
							type: "message",
							username: client.username,
							message: data.message,
						})
					);
				}
				client.recipient = data.to;
				broadcastUsernames();
			}
		}
	});

	connection.on("close", () => {
		// Remove the client from the list of connected clients
		const index = clients.indexOf(client);
		if (index !== -1) {
			clients.splice(index, 1);
			broadcastUsernames();
		}
	});
});
