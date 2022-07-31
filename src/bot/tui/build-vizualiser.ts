import { ChampionBuildInformation } from '../../common/models/champion-build-information';
import LolClient from '../../common/client/lol-client';

export async function createMessage(lolClient: LolClient, build: ChampionBuildInformation) {
    let championName = lolClient.getChampion(build.championId)?.name;
    let itemNames = build.builds[0].itemIds.map((itemId) => lolClient.getItem(itemId)?.name);
    return `
Here is your build for ${championName} on ${build.position.toLowerCase()}:

Items: ${itemNames.join(', ')}
    `;
}
