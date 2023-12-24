document.addEventListener("DOMContentLoaded", function () {
	const ownUsernameElement = document.getElementById("ownUsername");
	const usernamesListElement = document.getElementById("usernamesList");
	let ownUsername = "";
	const ws = new WebSocket("ws://192.168.2.1:8080");

	// Event listener for incoming WebSocket messages
	ws.onmessage = function (event) {
		const data = JSON.parse(event.data);

		if (data.type === "username") {
			// Handle assignment of username

			ownUsername = data.username;
			ownUsernameElement.textContent = "You are: " + ownUsername;
		} else if (data.type === "usernames") {
			// Handle list of other users

			const usernames = data.usernames;
			usernamesListElement.innerHTML = ""; // Clear the list

			// Iterate over list of usernames
			for (let i = 0; i < usernames.length; i++) {
				if (usernames[i] !== ownUsername) {
					// Add username to the webpage
					const li = document.createElement("li");
					li.textContent = usernames[i];

					// When a username from the list is clicked...
					li.addEventListener("click", function () {
						// Prompt the user for a message...
						const message = prompt("Enter your message:");
						if (message !== null) {
							// And send the message to the clicked username
							ws.send(
								JSON.stringify({
									type: "message",
									to: usernames[i],
									message: message,
								})
							);
						}
					});
					usernamesListElement.appendChild(li);
				}
			}
		} else if (data.type === "message") {
			// Recieve message from other user
			alert(`Message from ${data.username}: ${data.message}`);
		}
	};

	window.onbeforeunload = function () {
		ws.close();
	};
});
