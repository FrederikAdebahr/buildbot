import { bold } from 'discord.js';
import LolClient from '../../common/client/lol-client';
import { Build } from '../../common/model/build';
import { ChampionBuildInformation } from '../../common/model/champion-build-information';
import {
    getTopThreeBuildsByPopularitySorted,
    getTopTwoSummonerSpellSetsByPopularitySorted,
} from '../../common/core/build-util';
import { SummonerSpellSet } from '../../common/model/summoner-spell-set';

export async function createBuildMessage(buildInformation: ChampionBuildInformation) {
    const championName = LolClient.getInstance().getChampion(buildInformation.championId).name;
    const topThreeBuilds = getTopThreeBuildsByPopularitySorted(buildInformation.builds);
    const buildStrings = topThreeBuilds.map(buildToString);
    return `
Here are the most popular builds for ${bold(championName)} on ${bold(buildInformation.position.toLowerCase())}:

${buildStrings.join('\n')}
`;
}

const buildToString = (build: Build, index: number) => {
    const itemNames = build.itemIds.map((itemId) => LolClient.getInstance().getItem(itemId).name);
    const summonerSpellSets = getTopTwoSummonerSpellSetsByPopularitySorted(build.summonerSpellSets);
    const summonerSpellsSetStrings = summonerSpellSets.map(summonerSpellSetToString);
    return `${bold(`Build ${index + 1}`)}: ${itemNames.join(' \u279c ')}
Most popular summoner spells: ${summonerSpellsSetStrings.join(', ')}
    `;
};

const summonerSpellSetToString = (summonerSpellSet: SummonerSpellSet) =>
    `${summonerSpellToString(summonerSpellSet.summonerSpell1)} and ${summonerSpellToString(summonerSpellSet.summonerSpell2)}`;

const summonerSpellToString = (summonerSpell: number) => LolClient.getInstance().getSummonerSpell(summonerSpell).name;
