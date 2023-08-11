const WebSocket = require('websocket').server
const http = require('http')

const server = http.createServer((req, res) => {
	console.log('Received request for', req.url)
	res.writeHead(404)
	res.end()
})

server.listen(8080, () => {
	console.log('Server is listening on port 8080')
})

const wsServer = new WebSocket({
	httpServer: server,
})

const generateUsername = () => {
	const adjectives = ['Happy', 'Lucky', 'Clever', 'Cool', 'Energetic']
	const nouns = ['Cat', 'Dog', 'Fox', 'Tiger', 'Rabbit']

	let username = ''

	do {
		const adjective =
			adjectives[Math.floor(Math.random() * adjectives.length)]
		const noun = nouns[Math.floor(Math.random() * nouns.length)]
		username = `${adjective}${noun}`
	} while (clients.some((client) => client.username === username))

	return username
}

const clients = []

const broadcastUsernames = () => {
	const usernames = clients.map((client) => client.username)
	clients.forEach((client) => {
		client.connection.sendUTF(
			JSON.stringify({ type: 'usernames', usernames })
		)
	})
}

wsServer.on('request', (request) => {
	const connection = request.accept(null, request.origin)
	let username = generateUsername()

	const client = { connection, username }
	clients.push(client)

	connection.sendUTF(JSON.stringify({ type: 'username', username }))
	broadcastUsernames() // Send updated usernames to all clients

	connection.on('message', (message) => {
		if (message.type === 'utf8') {
			username = generateUsername()
			client.username = username

			connection.sendUTF(JSON.stringify({ type: 'username', username }))
			broadcastUsernames() // Send updated usernames to all clients

			console.log(`${username} connected`)
		}
	})

	connection.on('close', () => {
		const index = clients.indexOf(client)
		if (index !== -1) {
			clients.splice(index, 1)
			broadcastUsernames() // Send updated usernames to all clients
		}
	})
})
