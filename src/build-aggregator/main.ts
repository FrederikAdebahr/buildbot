import LolClient from '../common/client/lol-client';
import { collections, connectToDatabase } from '../common/services/database.service';
import { getItemBuildsForRecentChallengerMatches } from './core/item-builds-extractor';

const PADDING = 40;

process.stdout.write('Initializing Riot API client...'.padEnd(PADDING));
await LolClient.getInstance().init();
console.log('success');

process.stdout.write('Connecting to database...'.padEnd(PADDING));
await connectToDatabase();
console.log('success');

const itemBuilds = await getItemBuildsForRecentChallengerMatches();

process.stdout.write('Updating database...'.padEnd(PADDING));
await collections.builds?.deleteMany({});
await collections.builds?.insertMany(itemBuilds);
console.log('success');

process.exit();
