import * as mongoDB from 'mongodb';
import * as dotenv from 'dotenv';
import { ChampionBuildInformation } from '../models/champion-build-information';

export const collections: { builds?: mongoDB.Collection<ChampionBuildInformation> } = {};

export async function connectToDatabase() {
    dotenv.config();
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING ?? '');

    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DB_NAME);

    const buildsCollection = db.collection<ChampionBuildInformation>(process.env.BUILDS_COLLECTION_NAME ?? '');

    collections.builds = buildsCollection;

    console.log(
        `Successfully connected to database: ${db.databaseName} and collection: ${buildsCollection.collectionName}`
    );
}
