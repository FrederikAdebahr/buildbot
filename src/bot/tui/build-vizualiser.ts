import { bold } from 'discord.js';
import LolClient from '../../common/client/lol-client';
import { Build } from '../../common/model/build';
import { ChampionBuildInformation } from '../../common/model/champion-build-information';

export async function createMessage(buildInformation: ChampionBuildInformation) {
    let championName = LolClient.getInstance().getChampion(buildInformation.championId)?.name;
    let buildStrings = buildInformation.builds.map(buildToString);
    return `
Here are the most popular builds for ${bold(championName)} on ${bold(buildInformation.position.toLowerCase())}:

${buildStrings.join('\n')}
`;
}

const buildToString = (build: Build, index: number) => {
    const itemNames = build.itemIds.map((itemId) => LolClient.getInstance().getItem(itemId)?.name);
    return `Build ${index + 1}: ${itemNames.join(' \u279c ')}`;
};
