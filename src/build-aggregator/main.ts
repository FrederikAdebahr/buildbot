import LolClient from '../common/client/lol-client';
import { collections, connectToDatabase } from '../common/services/database.service';
import { processBuilds } from './core/item-builds-extractor';
import { CONSOLE_PADDING } from '../common/core/globals';

await LolClient.getInstance().init();
await connectToDatabase();

process.stdout.write('Wiping database...'.padEnd(CONSOLE_PADDING));
await collections.builds?.deleteMany({});
console.log('success');

await processBuilds();

process.exit();
