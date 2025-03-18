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

	app.get(
		"/api/profiles",
		verifyAuthToken,
		async (req: Request, res: Response): Promise<void> => {
			try {
				const userId = res.locals.token.userId; // Extract user ID from token
				const profile = await profilesCollection.findOne({ userId });

				if (!profile) {
					res.status(404).json({ error: "Profile not found" });
					return;
				}

				res.json(profile);
			} catch (error) {
				console.error("Error fetching profile:", error);
				res.status(500).json({ error: "Failed to fetch profile" });
			}
		}
	);

	app.patch(
		"/api/profiles",
		verifyAuthToken,
		imageMiddlewareFactory.single("avatar"), // Process image upload
		handleImageFileErrors, // Handle upload errors
		async (req: Request, res: Response): Promise<void> => {
			try {
				const userId = res.locals.token.userId; // Extract user ID from token
				const { name, username, bio } = req.body;
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
				console.log("Received data:", { name, username, bio, avatar });

				// Update the user's profile in the database
				const updateResult = await profilesCollection.updateOne(
                    { userId },
                    {
                        $set: {
                            name,
                            username,
                            bio,
                            avatar: avatar || currentProfile.avatar,
                        },
                    }
                );
                
                if (updateResult.matchedCount === 0) {
                    console.log("Profile not found or update failed");
                    res.status(404).json({ error: "Profile not found" });
                    return;
                }
                
                const updatedProfile = await profilesCollection.findOne({ userId });
                console.log("Profile updated successfully:", updatedProfile);
                res.json(updatedProfile);
			} catch (error) {
				console.error("Error updating profile:", error);
				res.status(500).json({ error: "Failed to update profile" });
			}
		}
	);
}
