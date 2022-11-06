import LolClient from '../../common/client/lol-client';
import { getMostPopularRuneSet, getTopThreeBuildsByPopularitySorted } from '../../common/core/build-util';
import { Build, getSkillName } from '../../common/model/build';
import { ChampionBuildInformation } from '../../common/model/champion-build-information';
import { RuneSet } from '../../common/model/rune-set';
import { getStatName } from '../../common/model/stat';
import { SummonerSpellSet } from '../../common/model/summoner-spell-set';
import { getRuneTreeColor } from './colors';
import { bold, EmbedBuilder, inlineCode, italic, underscore } from 'discord.js';

export async function createBuildMessage(buildInformation: ChampionBuildInformation) {
    const champion = LolClient.getInstance().getChampion(buildInformation.championId);
    const championIconUrl = LolClient.getInstance().getChampionIconUrl(champion);
    const topThreeBuilds = getTopThreeBuildsByPopularitySorted(buildInformation.builds);
    return topThreeBuilds.map((build) =>
        formatBuild(build, champion.name, championIconUrl, buildInformation.position.toLowerCase())
    );
}

const formatBuild = (build: Build, championName: string, championIconUrl: string, position: string) => {
    const mostPopularRuneSet = getMostPopularRuneSet(build.runeSets);
    return new EmbedBuilder()
        .setColor(getRuneTreeColor(mostPopularRuneSet.primaryTree.id))
        .setTitle(`Build for ${italic(championName)} on ${italic(position)}`)
        .setThumbnail(championIconUrl)
        .addFields(
            { name: 'Items', value: itemBuildToString(build) },
            { name: 'Summoner spells', value: summonerSpellSetsToString(build.summonerSpellSets) },
            { name: 'Runes', value: runesToString(mostPopularRuneSet) },
            { name: 'Skill order', value: skillOrderToString(build.skillLevelUps) }
        );
};

const itemBuildToString = (build: Build) => {
    const itemNames = build.itemIds.map((itemId) => LolClient.getInstance().getItem(itemId).name);
    return itemNames.join(' \u279c ');
};

const summonerSpellSetsToString = (summonerSpellSets: SummonerSpellSet[]) => {
    return summonerSpellSets
        .map((summonerSpellSet) => {
            const summonerSpell1Name = LolClient.getInstance().getSummonerSpell(summonerSpellSet.summonerSpell1).name;
            const summonerSpell2Name = LolClient.getInstance().getSummonerSpell(summonerSpellSet.summonerSpell2).name;
            return `${summonerSpell1Name} & ${summonerSpell2Name}`;
        })
        .join(', ');
};

const runesToString = (runes: RuneSet) => {
    const primaryTree = LolClient.getInstance().getRuneTree(runes.primaryTree.id);
    const secondaryTree = LolClient.getInstance().getRuneTree(runes.secondaryTree.id);
    const primaryTreeNames = primaryTree.slots
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        .map((row, i) => row.runes.find((perk) => perk.id === runes.primaryTree.perks[i])!.name);
    primaryTreeNames[0] = underscore(primaryTreeNames[0]);
    const primaryTreeString = primaryTreeNames.join(', ');
    const secondaryTreeString = runes.secondaryTree.perks
        .map((perkId) => secondaryTree.slots.flatMap((slot) => slot.runes).find((perk) => perk.id === perkId)?.name)
        .join(', ');
    return `${bold(`${primaryTree.name}:`)} ${primaryTreeString}
    ${bold(`${secondaryTree.name}:`)} ${secondaryTreeString}
    ${bold('Stats:')} ${getStatName(runes.stats.offense)}, ${getStatName(runes.stats.flex)}, ${getStatName(
        runes.stats.defense
    )}`;
};

const skillOrderToString = (skillOrder: number[]) => {
    const levelsString = skillOrder.map((_, i) => (i + 1).toString()).join(' ');
    const skillsString = skillOrder
        .map((skill, index) => {
            const offset = (index + 1).toString().length - 1;
            const skillName = getSkillName(skill);
            return skillName + ' '.repeat(offset);
        })
        .join(' ');
    return `${inlineCode(levelsString)}
    ${inlineCode(skillsString)}`;
};
