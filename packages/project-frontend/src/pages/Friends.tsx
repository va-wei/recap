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
    const [friends, setFriends] = useState<Friend[]>([]);
    const [newFriendName, setNewFriendName] = useState<string>("");

    // Update friends when profile data is fetched
    useEffect(() => {
		if (profile?.friends) {
			console.log("Full friends array:", profile.friends);
			
			profile.friends.forEach((friend, index) => {
				console.log(`Friend ${index + 1}:`);
				console.log("ID:", friend.id);
				console.log("Name:", friend.name);
				console.log("Recent Hobby:", friend.recentHobby);
			});
	
			setFriends([...profile.friends]); // Ensure re-render
		}
	}, [profile]);

    const addFriend = async () => {
        if (newFriendName.trim() === "") return;

        try {
            const checkUserResponse = await fetch(`/api/profiles/username/${newFriendName}`, {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            });

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
            setFriends(updatedProfile.friends); // Ensure this is correctly returned
            setNewFriendName("");
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="friends-container">
            <h2>Friends</h2>
            {isLoading && <p>Loading friends...</p>}
            {error && <p className="error">{error}</p>}
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
