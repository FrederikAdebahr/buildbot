import LolClient from '../common/client/lol-client';
import { collections, connectToDatabase, copyToBuildsCollection } from '../common/services/database.service';
import { processBuilds } from './core/item-builds-extractor';
import { CONSOLE_PADDING } from '../common/core/globals';
import { exit } from 'process';

await LolClient.getInstance().init();
await connectToDatabase();

process.stdout.write('Wiping temp collection...'.padEnd(CONSOLE_PADDING));
await collections.temp?.deleteMany({});
console.log('success');

await processBuilds();

process.stdout.write('Copying builds to build collection...'.padEnd(CONSOLE_PADDING));
await copyToBuildsCollection();

exit();
