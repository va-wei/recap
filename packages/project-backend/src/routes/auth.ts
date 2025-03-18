import express, { Request, Response, NextFunction } from "express";
import { MongoClient } from "mongodb";
import { CredentialsProvider } from "../CredentialsProvider";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

const signatureKey = process.env.JWT_SECRET;
if (!signatureKey) {
	throw new Error("Missing JWT_SECRET from env file");
}

export function verifyAuthToken(
	req: Request,
	res: Response,
	next: NextFunction // Call next() to run the next middleware or request handler
) {
	console.log("Authorization header:", req.get("Authorization"));
	const authHeader = req.get("Authorization");
	// The header should say "Bearer <token string>".  Discard the Bearer part.
	const token = authHeader && authHeader.split(" ")[1];

	if (!token) {
		console.log("No token provided");
		res.status(401).end();
		return;
	} else {
		// signatureKey already declared as a module-level variable
		jwt.verify(token, signatureKey as string, (error, decoded) => {
			if (decoded) {
				res.locals.token = decoded;
				next();
			} else {
				console.error("JWT verification error:", error);
				res.status(403).end();
				return;
			}
		});
	}
}

export function generateAuthToken(username: string, userId: string): Promise<string> {
	return new Promise<string>((resolve, reject) => {
		jwt.sign(
			{ username: username, userId: userId },
			signatureKey as string,
			{ expiresIn: "1h" },
			(error, token) => {
				if (error) reject(error);
				else resolve(token as string);
			}
		);
	});
}

export function registerAuthRoutes(
	app: express.Application,
	mongoClient: MongoClient
) {
	const credentialsProvider = new CredentialsProvider(mongoClient);

	app.post(
		"/auth/register",
		async (req: Request, res: Response): Promise<void> => {
			const { username, password } = req.body;

			// case 1: missing username or password
			if (!username || !password) {
				res.status(400).send({
					error: "Bad request",
					message: "Missing username or password",
				});
				return;
			}

			try {
				const success = await credentialsProvider.registerUser(
					username,
					password
				);

				// case 2: username exists already
				if (!success) {
					res.status(400).send({
						error: "Bad request",
						message: "Username already taken",
					});
					return;
				}

				// case 3: user registered successfully
				res.status(201).json({
					message: "User registered successfully.",
				});
			} catch (error) {
				console.error("Error in registerUser: ", error);
				res.status(500).json({ error: "Internal server error." });
			}
		}
	);

	app.post(
		"/auth/login",
		async (req: Request, res: Response): Promise<void> => {
			const { username, password } = req.body;

			// no username or password
			if (!username || !password) {
				res.status(400).json({
					error: "Bad request",
					message: "Missing username or password",
				});
				return;
			}
			try {
				const user = await credentialsProvider.getUserByUsername(
					username
				);

				// If the user does not exist
				if (!user) {
					res.status(401).json({
						error: "Incorrect username or password",
					});	
					return;
				}

				const isValid = await credentialsProvider.verifyPassword(
					username,
					password
				);
				// invalid username or password
				if (!isValid) {
					res.status(401).json({
						error: "Incorrect username or password",
					});
					return;
				}

				// token creation
				const token = await generateAuthToken(username, user._id.toString());

				res.status(200).json({ token, userId: user._id.toString() }); // success
			} catch (error) {
				console.error("Error in login: ", error);
				res.status(500).json({ error: "Internal server error." });
			}
		}
	);

	function makeDigitalSignature(username: string): string {
		return crypto
			.createHmac("sha256", process.env.SECRET_KEY || "default_secret")
			.update(username + Date.now().toString())
			.digest("hex");
	}
}
