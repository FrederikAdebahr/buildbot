import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import LolClient from '../../common/client/lol-client';
import { Position } from '../../common/model/position';
import { collections } from '../../common/services/database.service';
import { createBuildMessage } from '../tui/build-vizualiser';

@Discord()
export class Commands {
    private lolClient: LolClient;

    constructor() {
        this.lolClient = LolClient.getInstance();
    }

    @Slash()
    ping(interaction: CommandInteraction): void {
        interaction.reply('pong!');
    }

    @Slash()
    async build(
        @SlashOption('champion_name', {}) championName: string,
        @SlashOption('position', {}) positionString: string,
        interaction: CommandInteraction
    ) {
        const position = positionString.toUpperCase() as Position;
        if (!(position in Position)) {
            await interaction.reply({
                content: `Please specify a valid position. Valid positions are: ${Object.keys(Position)
                    .join(', ')
                    .toLowerCase()}`,
                ephemeral: true
            });
            return;
        }

        const championId = this.lolClient.searchChampion(championName);

        if (!championId) {
            await interaction.reply({ content: 'Sorry, I could not find a champion with this name.', ephemeral: true });
            return;
        }

        const buildInformation = await collections.builds?.findOne({
            championId,
            position
        });

        if (!buildInformation) {
            await interaction.reply({
                content: 'Sorry, we don\'t seem to have any builds available for this champion.',
                ephemeral: true
            });
            return;
        }

        const msg = await createBuildMessage(buildInformation, interaction.client);
        await interaction.reply({ embeds: msg, ephemeral: true });
    }
}
