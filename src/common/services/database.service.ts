import * as mongoDB from 'mongodb';
import { ChampionBuildInformation } from '../model/champion-build-information';
import { CONSOLE_PADDING } from '../core/globals';

export const collections: { builds?: mongoDB.Collection<ChampionBuildInformation> } = {};

export async function connectToDatabase() {
    process.stdout.write('Connecting to database...'.padEnd(CONSOLE_PADDING));
    const client: mongoDB.MongoClient = new mongoDB.MongoClient(process.env.DB_CONN_STRING ?? '');
    await client.connect();

    const db: mongoDB.Db = client.db(process.env.DB_NAME);
    collections.builds = db.collection<ChampionBuildInformation>(process.env.DB_BUILDS_COLLECTION_NAME ?? '');
    console.log('success');
}
