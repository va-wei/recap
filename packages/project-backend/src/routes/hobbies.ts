import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { HobbiesProvider } from "../HobbiesProvider";
import {
    imageMiddlewareFactory,
    handleImageFileErrors,
} from "../imageUploadMiddleware";
import { verifyAuthToken } from "./auth";

export function registerHobbyRoutes(
    app: express.Application,
    mongoClient: MongoClient
) {
    const hobbyProvider = new HobbiesProvider(mongoClient);
    
    app.get("/api/hobbies", async (req: Request, res: Response) => {
        try {
            // Fetch userId from query parameters
            const userId: string | undefined = req.query.createdBy as string;

            // Get hobbies based on userId (or fetch all if no userId)
            const hobbies = await hobbyProvider.getHobbiesByUser(userId);

            res.json(hobbies);
        } catch (error) {
            console.error("Error fetching hobbies:", error);
            res.status(500).json({ error: "Failed to fetch hobbies" });
        }
    });

    // POST route for creating a new hobby
    app.post(
        "/api/hobbies",
        verifyAuthToken, // Auth middleware to ensure the user is authenticated
        imageMiddlewareFactory.single("image"), // Image upload middleware
        handleImageFileErrors, // Error handler for image file errors
        async (req: Request, res: Response) => {
            try {
                if (!req.body.title || !req.body.hobbyType || !req.body.date) {
                    res.status(400).json({
                        error: "Missing required hobby fields.",
                    });
                    return;
                }

                if (!req.file) {
                    res.status(400).json({
                        error: "Image file is required.",
                    });
                    return;
                }

                // Get the userId from the JWT token
                const userId = res.locals.token?.userId;
                if (!userId) {
                    res.status(401).json({
                        error: "Unauthorized: Missing user info",
                    });
                    return;
                }

                const hobbyDoc = {
                    _id: req.file.filename,
                    title: req.body.title,
                    date: req.body.date,
                    hobbyType: req.body.hobbyType,
                    image: `/uploads/${req.file.filename}`, // Path to the uploaded image
                    rating: 0, // Default rating
                    userId: userId, // User who submitted the hobby
                };

                // Insert hobby into the database
                const insertedId = await hobbyProvider.createHobby(hobbyDoc);

                res.status(201).json({
                    message: "Hobby created successfully",
                    id: insertedId,
                    hobby: hobbyDoc,
                });
            } catch (error) {
                console.error("Error creating hobby:", error);
                res.status(500).json({
                    error: "Failed to create hobby",
                });
            }
        }
    );
}
