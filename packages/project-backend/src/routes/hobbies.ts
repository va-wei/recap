import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import { HobbiesProvider } from "../HobbiesProvider";
// import {
// 	hobbyMiddlewareFactory,
// 	handleImageFileErrors,
// } from "../hobbyUploadMiddleware";
import { verifyAuthToken } from "./auth";

export function registerHobbyRoutes(
	app: express.Application,
	mongoClient: MongoClient
) {
	const hobbyProvider = new HobbiesProvider(mongoClient);
	app.get("/api/hobbies/", async (req: Request, res: Response) => {
		try {
			let userId: string | undefined = undefined;
			if (typeof req.query.createdBy === "string") {
				userId = req.query.createdBy;
			}

			const hobbies = await hobbyProvider.getHobbiesByUser(userId); 

			res.json(hobbies);
		} catch (error) {
			console.error("Error fetching hobbies:", error);
			res.status(500).json({ error: "Failed to fetch hobbies" });
		}
	});

	// app.patch(
	// 	"/api/images/:id",
	// 	async (
	// 		req: Request<{ id: string }, {}, { name: string }>,
	// 		res: Response
	// 	): Promise<void> => {
	// 		try {
	// 			const imageId = req.params.id;
	// 			const newName = req.body.name;

	// 			console.log("PATCH req received for image id:", imageId);
	// 			console.log("Requested new name:", newName);

	// 			if (!newName) {
	// 				// if name doesn't exist in req body
	// 				res.status(400).send({
	// 					error: "Bad request",
	// 					message: "Missing name property",
	// 				});
	// 				return;
	// 			}

	// 			const matchedCount = await imageProvider.updateImageName(
	// 				imageId,
	// 				newName
	// 			);

	// 			if (matchedCount === 0) {
	// 				// if image doesnt exist
	// 				res.status(404).send({
	// 					error: "Not found",
	// 					message: "Image does not exist",
	// 				});
	// 				return;
	// 			}

	// 			res.status(204).send();
	// 		} catch (error) {
	// 			console.error("Error handling patch request:", error);
	// 			res.status(500).json({ error: "Failed to process request" });
	// 		}
	// 	}
	// );

	// app.post(
	// 	"/api/images",
    //     verifyAuthToken,
	// 	imageMiddlewareFactory.single("image"),
	// 	handleImageFileErrors,
	// 	async (
	// 		req: Request<{}, {}, { name: string }>,
	// 		res: Response
	// 	): Promise<void> => {
    //         console.log("Request reached /api/images");
	// 		try {
	// 			if (!req.file || !req.body.name) {
	// 				res.status(400).json({
	// 					error: "Image file and name are required.",
	// 				});
	// 				return;
	// 			}

	// 			const username = res.locals.token?.username;
	// 			if (!username) {
	// 				res.status(401).json({
	// 					error: "Unauthorized: Missing user info",
	// 				});
    //                 return;
	// 			}

	// 			const imageDoc = {
	// 				_id: req.file.filename,
	// 				src: `/uploads/${req.file.filename}`,
	// 				name: req.body.name,
	// 				author: username,
	// 				likes: 0,
	// 			};

	// 			const insertedId = await imageProvider.createImage(imageDoc);

	// 			res.status(201).json({
	// 				message: "Image uplaoded",
	// 				id: insertedId,
	// 				image: imageDoc,
	// 			});
	// 		} catch (error) {
	// 			console.error("Error storing image metadata:", error);
	// 			res.status(500).json({
	// 				error: "Failed to store image metadata",
	// 			});
	// 		}
	// 	}
	// );
}
