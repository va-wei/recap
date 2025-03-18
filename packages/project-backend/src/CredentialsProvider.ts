import { Collection, MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

interface ICredentialsDocument {
    username: string;
    password: string;
}

export class CredentialsProvider {
    private readonly collection: Collection<ICredentialsDocument>;

    constructor(mongoClient: MongoClient) {
        const COLLECTION_NAME = process.env.USERCREDS_COLLECTION_NAME;
        if (!COLLECTION_NAME) {
            throw new Error("Missing USERCREDS_COLLECTION_NAME from env file");
        }
        this.collection = mongoClient.db().collection<ICredentialsDocument>(COLLECTION_NAME);
    }

    async registerUser(username: string, plaintextPassword: string) {
        const existingUser = await this.collection.findOne({ username });
        if (existingUser) {
            console.log("User already exists");
            return false; // user already exists
        }

        const salt = await bcrypt.genSalt(10);
        console.log("Salt:", salt);

        const hashedPass = await bcrypt.hash(plaintextPassword, salt);
        console.log("Hash:", hashedPass);

        await this.collection.insertOne({
            username,
            password: hashedPass,
        });

        // Wait for any DB operations to finish before returning!
        return true;
    }

    async verifyPassword(username: string, plaintextPassword: string): Promise<boolean> {
        const user = await this.collection.findOne({ username });
        if (!user) return false;

        return await bcrypt.compare(plaintextPassword, user.password);
    }

    async getUserByUsername(username: string) {
        const user = await this.collection.findOne({ username });
        if (!user) {
            console.log("User not found");
            return null; // If no user found, return null
        }
        return user; // Return the user document (including userId)
    }
}
