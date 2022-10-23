import { bold, underscore } from 'discord.js';
import LolClient from '../../common/client/lol-client';
import { Build } from '../../common/model/build';
import { ChampionBuildInformation } from '../../common/model/champion-build-information';
import {
    getTopThreeBuildsByPopularitySorted,
    getTopTwoSummonerSpellSetsByPopularitySorted,
} from '../../common/core/build-util';
import { SummonerSpellSet } from '../../common/model/summoner-spell-set';
import { Runes } from '../../build-aggregator/model/runes';

export async function createBuildMessage(buildInformation: ChampionBuildInformation) {
    const championName = LolClient.getInstance().getChampion(buildInformation.championId).name;
    const topThreeBuilds = getTopThreeBuildsByPopularitySorted(buildInformation.builds);
    const buildStrings = topThreeBuilds.map(buildToString);
    return `
Here are the most popular builds for ${bold(championName)} on ${bold(buildInformation.position.toLowerCase())}:

${buildStrings.join('\n')}
`;
}

const buildToString = (build: Build) => {
    const itemNames = build.itemIds.map((itemId) => LolClient.getInstance().getItem(itemId).name);
    const summonerSpellSets = getTopTwoSummonerSpellSetsByPopularitySorted(build.summonerSpellSets);
    const summonerSpellSetStrings = summonerSpellSets.map(summonerSpellSetToString);
    const runesString = runesToString(build.runes);
    return `${bold('Item build')}: ${itemNames.join(' \u279c ')}
${bold('Summoner spells:')} ${summonerSpellSetStrings.join(', ')}
${bold('Runes:')}
    ${runesString}
    `;
};

const runesToString = (runes: Runes) => {
    const primaryTree = LolClient.getInstance().getRuneTree(runes.primaryTree.id);
    const secondaryTree = LolClient.getInstance().getRuneTree(runes.secondaryTree.id);
    const primaryTreeNames = primaryTree.slots
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map((row, i) => row.runes
            .find(perk => perk.id === runes.primaryTree.perks[i])!.name);
    primaryTreeNames[0] = underscore(primaryTreeNames[0]);
    const primaryTreeString = primaryTreeNames.join(', ');
    const secondaryTreeString = runes.secondaryTree.perks
        .map(perkId => secondaryTree.slots.flatMap(slot => slot.runes)
            .find(perk => perk.id === perkId)?.name)
        .join(', ');
    return `${bold(`${primaryTree.name}:`)} ${primaryTreeString}
    ${bold(`${secondaryTree.name}:`)} ${secondaryTreeString}
    `;
};

const summonerSpellSetToString = (summonerSpellSet: SummonerSpellSet) =>
    `${summonerSpellToString(summonerSpellSet.summonerSpell1)} & ${summonerSpellToString(summonerSpellSet.summonerSpell2)}`;

const summonerSpellToString = (summonerSpell: number) => LolClient.getInstance().getSummonerSpell(summonerSpell).name;
