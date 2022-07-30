import { connectToDatabase, collections } from "./services/database.service";

connectToDatabase();
collections.builds?.insertOne()