import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import LolClient from '../../common/client/lol-client';
import { Position } from '../../common/models/champion-build-information';
import { collections } from '../../common/services/database.service';
import { createMessage } from '../tui/build-vizualiser';

@Discord()
export class Example {
    private lolClient: LolClient;

    constructor() {
        this.lolClient = new LolClient();
        this.lolClient.init();
    }

    @Slash()
    ping(interaction: CommandInteraction): void {
        interaction.reply('pong!');
    }

    @Slash()
    async build(
        @SlashOption('champion_name', {}) championName: string,
        @SlashOption('position', {}) position: string,
        interaction: CommandInteraction
    ) {
        const positionUp = position.toUpperCase();
        if (!(positionUp in Position)) {
            interaction.reply(
                `Please specify a valid position. Valid positions are: ${Object.keys(Position)
                    .join(', ')
                    .toLowerCase()}`
            );
            return;
        }

        const championId = this.lolClient.searchChampion(championName);

        if (!championId) {
            interaction.reply('Sorry, I could not find a champion with this name.');
            return;
        }

        const buildInformation = await collections.builds?.findOne({ championId });

        if (!buildInformation) {
            interaction.reply('Sorry, we don\'t seem to have any builds available for this champion.');
            return;
        }

        const msg = await createMessage(this.lolClient, buildInformation);
        interaction.reply(msg);
    }
}
