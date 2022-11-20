import LolClient from '../../common/client/lol-client';
import {
    getMostPopularRuneSet,
    getTopThreeBuildsByPopularitySorted,
    getTopTwoSummonerSpellSetsByPopularitySorted
} from '../../common/core/build-util';
import { Build, getSkillName } from '../../common/model/build';
import { ChampionBuildInformation } from '../../common/model/champion-build-information';
import { RuneSet } from '../../common/model/rune-set';
import { SummonerSpellSet } from '../../common/model/summoner-spell-set';
import { getRuneTreeColor } from './colors';
import { bold, Client, EmbedBuilder, inlineCode, italic, underscore } from 'discord.js';
import { getBlankEmoji, getEmojiFromUrl } from '../util';
import { getStatName } from '../../common/model/stat';

export async function createBuildMessage(buildInformation: ChampionBuildInformation, client: Client) {
    const champion = LolClient.getInstance().getChampion(buildInformation.championId);
    const championIconUrl = LolClient.getInstance().getChampionIconUrl(champion);
    const topThreeBuilds = getTopThreeBuildsByPopularitySorted(buildInformation.builds);
    return topThreeBuilds.map((build) =>
        formatBuild(build, champion.name, championIconUrl, buildInformation.position.toLowerCase(), client)
    );
}

const formatBuild = (build: Build, championName: string, championIconUrl: string, position: string, client: Client) => {
    const mostPopularRuneSet = getMostPopularRuneSet(build.runeSets);
    return new EmbedBuilder()
        .setColor(getRuneTreeColor(mostPopularRuneSet.primaryTree.id))
        .setTitle(`Build for ${italic(championName)} on ${italic(position)}`)
        .setThumbnail(championIconUrl)
        .addFields(
            { name: 'Items\n' + getBlankEmoji(client), value: itemBuildToString(build, client) },
            {
                name: getBlankEmoji(client) + '\nSummoner spells\n' + getBlankEmoji(client),
                value: summonerSpellSetsToString(getTopTwoSummonerSpellSetsByPopularitySorted(build.summonerSpellSets), client)
            },
            {
                name: getBlankEmoji(client) + '\nRunes\n' + getBlankEmoji(client),
                value: runesToString(mostPopularRuneSet)
            },
            {
                name: getBlankEmoji(client) + '\nSkill order\n' + getBlankEmoji(client),
                value: skillOrderToString(build.skillLevelUps)
            }
        );
};

const itemBuildToString = (build: Build, client: Client) => {
    const itemNames = build.itemIds.map((itemId) => {
        const item = LolClient.getInstance().getItem(itemId);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return getEmojiFromUrl(item.image.full, client);
    });
    return itemNames.join(' \u279c ');
};

const summonerSpellSetsToString = (summonerSpellSets: SummonerSpellSet[], client: Client) => {
    return summonerSpellSets
        .map((summonerSpellSet) => {
            const summonerSpell1 = LolClient.getInstance().getSummonerSpell(summonerSpellSet.summonerSpell1);
            const summonerSpell2 = LolClient.getInstance().getSummonerSpell(summonerSpellSet.summonerSpell2);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const summonerSpell1Icon = getEmojiFromUrl(summonerSpell1.image.full, client);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const summonerSpell2Icon = getEmojiFromUrl(summonerSpell2.image.full, client);
            return `${summonerSpell1Icon} ${summonerSpell2Icon}`;
        })
        .join(' or ');
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
