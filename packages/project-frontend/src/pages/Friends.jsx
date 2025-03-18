import React, { useState } from "react";
import { nanoid } from "nanoid";

const Friends = () => {
	const [friends, setFriends] = useState([
		{ id: 1, name: "Alice", recentHobby: "Reading Dune" },
		{ id: 2, name: "Bob", recentHobby: "Playing chess" },
		{ id: 3, name: "Charlie", recentHobby: "Watching Demon Slayer" },
	]);

	const [newFriendName, setNewFriendName] = useState("");

	const addFriend = () => {
		if (newFriendName.trim() === "") return;
		const newFriend = {
			id: nanoid(),
			name: newFriendName,
			recentHobby: "No recent hobby yet",
		};
		setFriends([...friends, newFriend]);
		setNewFriendName("");
	};

	return (
		<div className="friends-container">
			<h2>Friends</h2>
			<ul>
				{friends.map((friend) => (
					<li key={friend.id}>
						<strong>{friend.name}</strong>: {friend.recentHobby}
					</li>
				))}
			</ul>
			<div className="add-friend">
				<input
					type="text"
					placeholder="Enter friend's name"
					value={newFriendName}
					onChange={(e) => setNewFriendName(e.target.value)}
				/>
				<button onClick={addFriend}>Add Friend</button>
			</div>
		</div>
	);
};

export default Friends;
