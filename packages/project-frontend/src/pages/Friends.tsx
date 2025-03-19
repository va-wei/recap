import React, { useEffect, useState } from "react";
import { useProfileFetching } from "../hooks/useProfileFetching";

interface Friend {
	id: string;
	name: string;
	recentHobby: string;
}

const Friends: React.FC = () => {
	const authToken = localStorage.getItem("authToken") || "";
	const { isLoading, profile, error } = useProfileFetching(authToken);
	const [friends, setFriends] = useState<Friend[]>([]); // Ensure this is always an array
	const [newFriendName, setNewFriendName] = useState<string>("");

	// Update friends when profile data is fetched
	useEffect(() => {
		if (profile?.friends) {
			setFriends(profile.friends); // Make sure this is an array
		}
	}, [profile]);

	const addFriend = async () => {
		if (newFriendName.trim() === "") return;

		try {
			const checkUserResponse = await fetch(
				`/api/profiles/username/${newFriendName}`,
				{
					headers: {
						Authorization: `Bearer ${authToken}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (!checkUserResponse.ok) {
				throw new Error("Friend not found");
			}

			const addFriendResponse = await fetch("/api/profiles/addFriend", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify({ friendUsername: newFriendName }),
			});

			if (!addFriendResponse.ok) {
				throw new Error("Failed to add friend");
			}

			const updatedProfile = await addFriendResponse.json();
			setFriends(updatedProfile.friends || []); // Safely update friends
			setNewFriendName("");
		} catch (err) {
			console.error(err);
		}
	};

	// Function to handle removing a friend
	const removeFriend = async (friendId: string) => {
		try {
			// Fetching the friend's profile to get their username
			const friendProfile = friends.find(
				(friend) => friend.id === friendId
			);

			if (!friendProfile) {
				throw new Error("Friend not found");
			}

			const response = await fetch("/api/profiles/removeFriend", {
				method: "PATCH",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${authToken}`,
				},
				body: JSON.stringify({ friendUsername: friendProfile.name }), // Send friend's username
			});

			if (!response.ok) {
				throw new Error("Failed to remove friend");
			}

			// If successful, filter the deleted friend out of the local state
			setFriends((prevFriends) =>
				prevFriends.filter((friend) => friend.id !== friendId)
			);
		} catch (err) {
			console.error("Error removing friend:", err);
		}
	};

	return (
		<div className="friends-container">
			<h2>Your Friends</h2>
			{isLoading && <p>Loading friends...</p>}
			{error && <p className="error">{error}</p>}
			<ul>
				{friends.length > 0 ? (
					friends.map((friend) => (
						<li key={friend.id}>
							<strong>{friend.name}</strong>: {friend.recentHobby}
							<button onClick={() => removeFriend(friend.id)}>
								&nbsp;&nbsp;❌
							</button>
						</li>
					))
				) : (
					<p>No friends to display.</p>
				)}
			</ul>
			<div className="add-friend">
				<input
					type="text"
					placeholder="Enter friend's username"
					value={newFriendName}
					onChange={(e) => setNewFriendName(e.target.value)}
				/>
				<button onClick={addFriend}>Add Friend</button>
			</div>
		</div>
	);
};

export default Friends;
