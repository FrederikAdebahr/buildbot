import Build from '../../common/models/build';
import LolClient from '../../common/client/lol-client';

export async function createMessage(lolClient: LolClient, build: Build) {
    let championName = lolClient.getChampionName(build.champion);
    let item0Name = lolClient.getItemName(build.item0);
    let item1Name = lolClient.getItemName(build.item1);
    let item2Name = lolClient.getItemName(build.item2);
    let item3Name = lolClient.getItemName(build.item3);
    let item4Name = lolClient.getItemName(build.item4);
    let item5Name = lolClient.getItemName(build.item5);
    let item6Name = lolClient.getItemName(build.item6);
    return `
Here is your build for ${championName} on ${build.position.toLowerCase()}:

Items: ${item0Name}, ${item1Name}, ${item2Name}, ${item3Name}, ${item4Name}, ${item5Name}, ${item6Name}
    `;
}
