import LolClient from '../common/client/lol-client';
import { collections, connectToDatabase } from '../common/services/database.service';
import { getItemBuildsForRecentChallengerMatches } from './core/item-builds-extractor';
import { CONSOLE_PADDING } from '../common/core/globals';

await LolClient.getInstance().init();
await connectToDatabase();
const itemBuilds = await getItemBuildsForRecentChallengerMatches();

process.stdout.write('Updating database...'.padEnd(CONSOLE_PADDING));
await collections.builds?.deleteMany({});
await collections.builds?.insertMany(itemBuilds);
console.log('success');

process.exit();
