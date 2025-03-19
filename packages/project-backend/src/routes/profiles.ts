import express, { Request, Response } from "express";
import { MongoClient, ObjectId } from "mongodb";
import { verifyAuthToken } from "./auth";
import {
	imageMiddlewareFactory,
	handleImageFileErrors,
} from "../imageUploadMiddleware";

export function registerProfileRoutes(
	app: express.Application,
	mongoClient: MongoClient
) {
	const profilesCollection = mongoClient
		.db()
		.collection(process.env.PROFILES_COLLECTION_NAME!);

	// Route to get the user's profile
	app.get(
		"/api/profiles",
		verifyAuthToken,
		async (req: Request, res: Response): Promise<void> => {
			try {
				const userId = res.locals.token.userId; // Extract user ID from token

				// Fetch the profile from the database
				const profile = await profilesCollection.findOne({ userId });

				if (!profile) {
					res.status(404).json({ error: "Profile not found" });
					return;
				}

				// Return the profile as is, without modifying the friends array
				res.json(profile);
			} catch (error) {
				console.error("Error fetching profile:", error);
				res.status(500).json({ error: "Failed to fetch profile" });
			}
		}
	);

	// Route to update the user's profile
	app.patch(
		"/api/profiles",
		verifyAuthToken,
		imageMiddlewareFactory.single("avatar"), // Process image upload
		handleImageFileErrors, // Handle upload errors
		async (req: Request, res: Response): Promise<void> => {
			try {
				const userId = res.locals.token.userId; // Extract user ID from token
				const { name, username, bio, friends } = req.body; // Include friends in request body
				let avatar = req.body.avatar;

				const currentProfile = await profilesCollection.findOne({
					userId,
				}); // current profile
				if (!currentProfile) {
					res.status(404).json({ error: "Profile not found" });
					return;
				}

				// Check if a new avatar image was uploaded
				if (req.file) {
					avatar = `/uploads/${req.file.filename}`; // Use the uploaded file's path
				}

				console.log("Updating profile for userId:", userId);
				console.log("Received data:", {
					name,
					username,
					bio,
					avatar,
					friends,
				});

				// Update the user's profile in the database, including the friends list
				const updateResult = await profilesCollection.updateOne(
					{ userId },
					{
						$set: {
							name,
							username,
							bio,
							avatar: avatar || currentProfile.avatar,
							friends: friends || currentProfile.friends, // Update friends list if provided
						},
					}
				);

				if (updateResult.matchedCount === 0) {
					console.log("Profile not found or update failed");
					res.status(404).json({ error: "Profile not found" });
					return;
				}

				const updatedProfile = await profilesCollection.findOne({
					userId,
				});
				console.log("Profile updated successfully:", updatedProfile);
				res.json(updatedProfile);
			} catch (error) {
				console.error("Error updating profile:", error);
				res.status(500).json({ error: "Failed to update profile" });
			}
		}
	);

	app.patch(
		"/api/profiles/addFriend",
		verifyAuthToken,
		async (req: Request, res: Response): Promise<void> => {
			try {
				const userId = res.locals.token.userId; // Extract user ID from token
				const { friendUsername } = req.body; // Friend's username to add

				if (!friendUsername) {
					res.status(400).json({ error: "Missing friend username" });
					return;
				}

				// Find the user's profile
				const profile = await profilesCollection.findOne({ userId });

				if (!profile) {
					res.status(404).json({ error: "Profile not found" });
					return;
				}

				// Find the friend's profile using their username
				const friendProfile = await profilesCollection.findOne({
					username: friendUsername,
				});

				if (!friendProfile) {
					res.status(404).json({ error: "Friend not found" });
					return;
				}

				// Check if the friend is already in the user's friends list
				const friendExists = profile.friends.some(
					(friend: any) => friend.id === friendProfile._id.toString()
				);

				if (friendExists) {
					res.status(400).json({ error: "Friend already added" });
					return;
				}

				// Find the friend's most recent hobby (assuming hobbies are stored in a collection)
				const hobbiesCollection = mongoClient
					.db()
					.collection("hobbies"); // Change to your actual hobbies collection
				const recentHobbyEntry = await hobbiesCollection.findOne(
					{ userId: friendProfile.userId },
					{ sort: { createdAt: -1 } } // Sort by most recent
				);

				// Format the recent hobby
				const recentHobby = recentHobbyEntry
					? formatHobby({
							title: recentHobbyEntry.title,
							hobbyType: recentHobbyEntry.hobbyType,
					  })
					: "No recent hobby";

				// Add the friend's details to the user's friends list
				const updatedFriends = [
					...profile.friends,
					{
						id: friendProfile._id.toString(),
						name: friendProfile.username,
						recentHobby,
					},
				];

				// Update the profile with the new friends list
				const updateResult = await profilesCollection.updateOne(
					{ userId },
					{
						$set: {
							friends: updatedFriends,
						},
					}
				);

				if (updateResult.matchedCount === 0) {
					res.status(404).json({ error: "Profile not found" });
					return;
				}

				// Send the updated profile after adding the friend
				const updatedProfile = await profilesCollection.findOne({
					userId,
				});

				res.json(updatedProfile);
			} catch (error) {
				console.error("Error adding friend:", error);
				res.status(500).json({ error: "Failed to add friend" });
			}
		}
	);

	// Route to remove a friend from the user's friends list
	app.patch(
		"/api/profiles/removeFriend",
		verifyAuthToken,
		async (req: Request, res: Response): Promise<void> => {
			try {
				const userId = res.locals.token.userId; // Extract user ID from token
				const { friendUsername } = req.body; // Friend's username to remove

				if (!friendUsername) {
					res.status(400).json({ error: "Missing friend username" });
					return;
				}

				const profile = await profilesCollection.findOne({ userId });

				if (!profile) {
					res.status(404).json({ error: "Profile not found" });
					return;
				}

				// Check if the friend exists in the list
				if (!profile.friends.includes(friendUsername)) {
					res.status(400).json({ error: "Friend not found" });
					return;
				}

				// Update the profile to remove the friend
				const updateResult = await profilesCollection.updateOne(
					{ userId },
					{
						$pull: { friends: friendUsername }, // Remove the friend from the friends array
					}
				);

				if (updateResult.matchedCount === 0) {
					res.status(404).json({ error: "Profile not found" });
					return;
				}

				const updatedProfile = await profilesCollection.findOne({
					userId,
				});
				res.json(updatedProfile);
			} catch (error) {
				console.error("Error removing friend:", error);
				res.status(500).json({ error: "Failed to remove friend" });
			}
		}
	);

	// Route to check if a username exists
	app.get(
		"/api/profiles/username/:username",
		verifyAuthToken,
		async (req: Request, res: Response): Promise<void> => {
			try {
				const { username } = req.params;

				// Search for a profile with the provided username
				const friendProfile = await profilesCollection.findOne({
					username,
				});

				if (!friendProfile) {
					res.status(404).json({ error: "Friend not found" });
					return;
				}

				res.json({
					message: "Friend found",
					friendId: friendProfile._id.toString(),
				});
			} catch (error) {
				console.error("Error checking friend username:", error);
				res.status(500).json({
					error: "Failed to check friend username",
				});
			}
		}
	);

	// Helper function to format the hobby
	function formatHobby(hobby: { title: string; hobbyType: string }) {
		switch (hobby.hobbyType) {
			case "Movie":
			case "TV Show":
				return `is watching "${hobby.title}"`;
			case "Book":
				return `is reading "${hobby.title}"`;
			case "Other":
				return `is doing "${hobby.title}"`;
			default:
				return `is doing something`;
		}
	}
}
