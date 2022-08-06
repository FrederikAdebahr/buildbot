import 'reflect-metadata';
import 'dotenv/config';

import { dirname, importx } from '@discordx/importer';
import type { Interaction, Message } from 'discord.js';
import { IntentsBitField } from 'discord.js';
import { Client } from 'discordx';
import { collections, connectToDatabase } from '../common/services/database.service';
import { Position } from '../common/models/champion-build-information';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

export const bot = new Client({
    botGuilds: [(client) => client.guilds.cache.map((guild) => guild.id)],

    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.GuildVoiceStates,
    ],

    silent: false,
});

bot.once('ready', async () => {
    await bot.guilds.fetch();

    await bot.initApplicationCommands();
    console.log('Bot started');
});

bot.on('interactionCreate', (interaction: Interaction) => {
    bot.executeInteraction(interaction);
});

bot.on('messageCreate', (message: Message) => {
    bot.executeCommand(message);
});

async function run() {
    await importx(dirname(import.meta.url) + '/{events,commands}/**/*.{ts,js}');

    if (!process.env.DISCORD_TOKEN) {
        throw Error('Could not find BOT_TOKEN in your environment');
    }

    await connectToDatabase();

    // TODO: remove
    await collections.builds?.drop();
    await collections.builds?.insertOne({
        championId: 67,
        position: Position.TOP,
        builds: [{ itemIds: [1001, 2010, 2003, 1519, 1518, 1517], trinket: undefined }],
    });

    await bot.login(process.env.DISCORD_TOKEN);
}

run();
