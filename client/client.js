document.addEventListener('DOMContentLoaded', function () {
	const ownUsernameElement = document.getElementById('ownUsername')
	const usernamesListElement = document.getElementById('usernamesList')
	let ownUsername = ''
	const ws = new WebSocket('ws://192.168.2.1:8080')

	ws.onmessage = function (event) {
		const data = JSON.parse(event.data)
		if (data.type === 'username') {
			ownUsername = data.username
			ownUsernameElement.textContent = 'You are: ' + ownUsername
		} else if (data.type === 'usernames') {
			const usernames = data.usernames
			usernamesListElement.innerHTML = '' // Clear the list
			for (let i = 0; i < usernames.length; i++) {
				if (usernames[i] !== ownUsername) {
					const li = document.createElement('li')
					li.textContent = usernames[i]
					usernamesListElement.appendChild(li)
				}
			}
		}
	}

	window.onbeforeunload = function () {
		ws.close()
	}
})
