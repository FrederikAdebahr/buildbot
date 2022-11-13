import LolClient from '../common/client/lol-client';
import { collections, connectToDatabase } from '../common/services/database.service';
import { processBuilds } from './core/item-builds-extractor';

await LolClient.getInstance().init();
await connectToDatabase();
await collections.builds?.deleteMany({});
await processBuilds();

process.exit();
