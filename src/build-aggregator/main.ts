import LolClient from '../common/client/lol-client';
import { collections, connectToDatabase } from '../common/services/database.service';
import { getItemBuildsForRecentChallengerMatches } from './core/item-builds-extractor';

await LolClient.getInstance().init();
await connectToDatabase();

const itemBuilds = await getItemBuildsForRecentChallengerMatches();

console.log('Updating database...');
await collections.builds?.deleteMany({});
await collections.builds?.insertMany(itemBuilds);
console.log('Done!');

process.exit();
