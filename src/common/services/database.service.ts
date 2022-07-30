import * as mongoDB from "mongodb";
import * as dotenv from "dotenv";
import Build from "../models/build";

export const collections: { builds?: mongoDB.Collection<Build> } = {};

export async function connectToDatabase() {
  dotenv.config();

  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    process.env.DB_CONN_STRING ?? ""
  );

  await client.connect();

  const db: mongoDB.Db = client.db(process.env.DB_NAME);

  const buildsCollection: mongoDB.Collection<Build> = db.collection<Build>(
    process.env.BUILDS_COLLECTION_NAME ?? ""
  );

  collections.builds = buildsCollection;

  console.log(
    `Successfully connected to database: ${db.databaseName} and collection: ${buildsCollection.collectionName}`
  );
}