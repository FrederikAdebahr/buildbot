import type { CommandInteraction } from 'discord.js';
import { Discord, Slash } from 'discordx';
import Build from '../../common/models/build';
import { createMessage } from '../tui/build-vizualiser';

@Discord()
export class Example {
    @Slash()
    ping(interaction: CommandInteraction): void {
        interaction.reply('pong!');
    }

    @Slash('build')
    getBuild(interaction: CommandInteraction): void {
      createMessage(new Build('Ashe', 'BOTTOM', 1001, undefined, undefined, undefined, undefined, undefined, undefined));
    }
}
