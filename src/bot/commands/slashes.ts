import type { CommandInteraction } from 'discord.js';
import { Discord, Slash, SlashOption } from 'discordx';
import Build, { Position } from '../../common/models/build';
import LolClient from '../../common/client/lol-client';
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

        // TODO: Get build from database

        let msg = await createMessage(
            this.lolClient,
            new Build(523, positionUp as Position, 1001, 2010, 2003, 1519, 1518, 1517, undefined)
        );

        interaction.reply(msg);
    }
}
