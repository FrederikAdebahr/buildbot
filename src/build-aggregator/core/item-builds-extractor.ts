import { RiotAPITypes } from '@fightmegg/riot-api';
import { Presets, SingleBar } from 'cli-progress';
import LolClient from '../../common/client/lol-client';
import { Build } from '../../common/model/build';
import { ChampionBuildInformation } from '../../common/model/champion-build-information';
import { MatchTimeline } from '../model/match-timeline';
import { toBuild, toChampionBuildInfo } from './item-build-converter';
import { generateItemBuildsFromMatch } from './item-build-creator';
import { toMatchTimelines } from './match-timeline-converter';
import { SummonerSpellSet } from '../../common/model/summoner-spell-set';
import { RuneSet } from '../../common/model/rune-set';

export const getItemBuildsForRecentChallengerMatches = async () => {
    const matchIds = await fetchChallengerMatchIds();
    const matchTimelineDtos = await fetchChallengerMatchTimelines(matchIds);
    const matchDtos = await fetchChallengerMatches(matchIds);
    const matchTimelines = toMatchTimelines(matchDtos, matchTimelineDtos);
    let championBuildInfos = extractItemBuildsForAllMatches(matchTimelines);
    return filteredAndMergedBuilds(championBuildInfos);
};

const fetchChallengerMatchIds = async () => {
    let challengerPlayers = await LolClient.getInstance().fetchChallengerPlayers();
    let matchIds = new Set<string>();

    console.log('Fetching challenger players...');
    const progBar = new SingleBar({}, Presets.shades_classic);
    progBar.start(challengerPlayers.entries.length, 0);

    let i = 0;
    for (let player of challengerPlayers.entries) {
        // TODO: Remove this
        if (i >= 4) {
            break;
        }
        progBar.increment();
        let matchHistory = await LolClient.getInstance().fetchMatchHistoryForPlayer(player);
        matchHistory.forEach(Set.prototype.add, matchIds);
        i++;
    }

    progBar.stop();
    return matchIds;
};

const fetchChallengerMatchTimelines = async (matchIds: Set<string>) => {
    let matchesTimeLine: RiotAPITypes.MatchV5.MatchTimelineDTO[] = [];

    console.log('Fetching match timelines...');
    const progBar = new SingleBar({}, Presets.shades_classic);
    progBar.start(matchIds.size, 0);

    for (let matchId of matchIds) {
        progBar.increment();
        matchesTimeLine.push(await LolClient.getInstance().fetchMatchTimelineById(matchId));
    }

    progBar.stop();
    return matchesTimeLine;
};

const fetchChallengerMatches = async (matchIds: Set<string>) => {
    let matches: RiotAPITypes.MatchV5.MatchDTO[] = [];

    console.log('Fetching matches...');
    const progBar = new SingleBar({}, Presets.shades_classic);
    progBar.start(matchIds.size, 0);

    for (let matchId of matchIds) {
        progBar.increment();
        matches.push(await LolClient.getInstance().fetchMatchById(matchId));
    }
    progBar.stop();
    return matches;
};

const extractItemBuildsForAllMatches = (matchTimelines: MatchTimeline[]) => {
    let championBuildInfos: ChampionBuildInformation[] = [];

    console.log('Extracting item builds...');
    const progBar = new SingleBar({}, Presets.shades_classic);
    progBar.start(matchTimelines.length, 0);

    for (let matchTimeline of matchTimelines) {
        progBar.increment();
        let itemBuildsInMatch = generateItemBuildsFromMatch(matchTimeline);
        for (let itemBuild of itemBuildsInMatch) {
            if (!itemBuild.items.length) {
                continue;
            }
            const existingBuildInfo = championBuildInfos.find(
                (buildInfo) =>
                    buildInfo.championId === itemBuild.championId && buildInfo.position === itemBuild.position,
            );
            if (existingBuildInfo) {
                existingBuildInfo.builds.push(toBuild(itemBuild));
            } else {
                championBuildInfos.push(toChampionBuildInfo(itemBuild));
            }
        }
    }

    progBar.stop();
    return championBuildInfos;
};

const filteredAndMergedBuilds = (championBuildInfos: ChampionBuildInformation[]) => {
    const newBuildInfos: ChampionBuildInformation[] = [];
    championBuildInfos.forEach((buildInfo) => {
        mergeBuildDuplicates(buildInfo.builds);
        const newBuildInfo: ChampionBuildInformation = {
            championId: buildInfo.championId,
            position: buildInfo.position,
            builds: buildInfo.builds,
        };
        newBuildInfos.push(newBuildInfo);
    });
    return newBuildInfos;
};

const mergeBuildDuplicates = (builds: Build[]) => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let current;
    do {
        current = builds.length;
        for (let i = 0; i < builds.length; i++) {
            for (let j = i + 1; j < builds.length; j++) {
                if (isSubset(builds[i], builds[j])) {
                    mergeRunesAndSummonerSpells(builds[j], builds[i]);
                    builds.splice(i, 1);
                    break;
                }
                if (isSubset(builds[j], builds[i])) {
                    mergeRunesAndSummonerSpells(builds[i], builds[j]);
                    builds.splice(j, 1);
                    break;
                }
            }
        }
    } while (current > builds.length);
};

const mergeRunesAndSummonerSpells = (supersetBuild: Build, subsetBuild: Build) => {
    subsetBuild.summonerSpellSets.forEach(summonerSpellSet => {
        const existingSummonerSpellSet = supersetBuild.summonerSpellSets
            .find(supersetSummonerSpellSet => hasSameSummonerSpells(supersetSummonerSpellSet, summonerSpellSet));
        if (existingSummonerSpellSet) {
            existingSummonerSpellSet.popularity += summonerSpellSet.popularity;
        } else {
            supersetBuild.summonerSpellSets.push(summonerSpellSet);
        }
    });
    subsetBuild.runeSets.forEach(runeSet => {
        const existingRuneSet = supersetBuild.runeSets.find(supersetRuneSet => hasSameKeyStone(supersetRuneSet, runeSet));
        if (existingRuneSet) {
            existingRuneSet.popularity += runeSet.popularity;
        } else {
            supersetBuild.runeSets.push(runeSet);
        }
    });
};

const hasSameKeyStone = (runeSetA: RuneSet, runeSetB: RuneSet) => {
    return runeSetA.primaryTree.perks[0] === runeSetB.primaryTree.perks[0];
};

const isSubset = (buildA: Build, buildB: Build) => {
    return buildA.itemIds.every(item => buildB.itemIds.includes(item));
};

const hasSameSummonerSpells = (summonerSpellSetA: SummonerSpellSet, summonerSpellSetB: SummonerSpellSet) =>
    (summonerSpellSetA.summonerSpell1 === summonerSpellSetB.summonerSpell1
        || summonerSpellSetA.summonerSpell1 === summonerSpellSetB.summonerSpell2)
    && (summonerSpellSetA.summonerSpell2 === summonerSpellSetB.summonerSpell1
        || summonerSpellSetA.summonerSpell2 === summonerSpellSetB.summonerSpell2);
