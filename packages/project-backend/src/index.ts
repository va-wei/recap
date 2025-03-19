import express, { Request, Response } from "express";
import { MongoClient } from "mongodb";
import path from "path";
import dotenv from "dotenv";
import { registerHobbyRoutes } from "./routes/hobbies";
import { registerAuthRoutes, verifyAuthToken } from "./routes/auth";
import { registerProfileRoutes } from "./routes/profiles";
import cors from "cors";

dotenv.config(); // Read the .env file in the current working directory, and load values into process.env.

const PORT = process.env.PORT || 3000;
const staticDir = process.env.STATIC_DIR || "public";

const { MONGO_USER, MONGO_PWD, MONGO_CLUSTER, DB_NAME } = process.env;
const connectionStringRedacted = `mongodb+srv://${MONGO_USER}:<password>@${MONGO_CLUSTER}/${DB_NAME}`;
const connectionString = `mongodb+srv://${MONGO_USER}:${MONGO_PWD}@${MONGO_CLUSTER}/${DB_NAME}`;

// console.log("Attempting Mongo connection at " + connectionStringRedacted);

async function setUpServer() {
    try {
        const mongoClient = await MongoClient.connect(connectionString);
        const collectionInfos = await mongoClient.db().listCollections().toArray();
        const IMAGE_UPLOAD_DIR = process.env.IMAGE_UPLOAD_DIR || path.join(__dirname, "../uploads");
        //console.log(collectionInfos.map((collectionInfo: { name: string }) => collectionInfo.name)); // For debug only

        const app = express();
        app.use(cors());

        app.use("/api/*", verifyAuthToken);

        app.use(express.json());
        app.use(express.static(staticDir));
        app.use("/uploads", express.static(IMAGE_UPLOAD_DIR))

        registerAuthRoutes(app, mongoClient);
        registerHobbyRoutes(app, mongoClient);
        registerProfileRoutes(app, mongoClient);

        app.get("/hello", (req: Request, res: Response) => {
            res.send("Hello, World");
        });       

        app.get("*", (req: Request, res: Response) => {
            res.sendFile("index.html", { root: staticDir })
        });

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });

        app.use("/uploads", express.static("uploads"));

    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
}

setUpServer();