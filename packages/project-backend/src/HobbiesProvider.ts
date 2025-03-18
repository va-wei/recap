import { MongoClient } from "mongodb";

export interface HobbyDocument {
	_id: string;
	title: string;
	date: string;
	hobbyType: string;
	image: string;
	rating: number;
	userId: string;
}

export class HobbiesProvider {
	constructor(private readonly mongoClient: MongoClient) {}

	// accept object (imageData) to create img doc, ret. insertedId of newly created doc
	async createHobby(hobbyData: {
		_id: string;
		title: string;
		date: string;
		hobbyType: string;
		image: string;
		rating: number;
		userId: string;
	}): Promise<string> {
		const collectionName = process.env.HOBBIES_COLLECTION_NAME;
		if (!collectionName) {
			throw new Error("Missing HOBBIES_COLLECTION_NAME from env vars");
		}

		const collection = this.mongoClient
			.db()
			.collection<HobbyDocument>(collectionName);

		const result = await collection.insertOne(hobbyData);
		return result.insertedId.toString();
	}

	async getHobbiesByUser(userId?: string): Promise<HobbyDocument[]> {
        const collectionName = process.env.HOBBIES_COLLECTION_NAME;
        if (!collectionName) {
            throw new Error("Missing HOBBIES_COLLECTION_NAME from env vars");
        }
        
        const collection = this.mongoClient.db().collection<HobbyDocument>(collectionName);
        return await collection.find({ userId: userId }).toArray();
    }
}
