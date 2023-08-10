import React, { useEffect, useState } from 'react'

const App = () => {
	const [usernames, setUsernames] = useState([])
	const [ownUsername, setOwnUsername] = useState('')

	useEffect(() => {
		const ws = new WebSocket('ws://192.168.2.1:8080')

		ws.onmessage = (event) => {
			const data = JSON.parse(event.data)
			if (data.type === 'username') {
				setOwnUsername(data.username)
			} else if (data.type === 'usernames') {
				setUsernames(data.usernames)
			}
		}

		return () => {
			ws.close()
		}
	}, [])

	return (
		<div className='App'>
			<h1>You are: {ownUsername}</h1>
			<h2>Other Users:</h2>
			<ul>
				{usernames.map(
					(username, index) =>
						username !== ownUsername && (
							<li key={index}>{username}</li>
						)
				)}
			</ul>
		</div>
	)
}

export default App
