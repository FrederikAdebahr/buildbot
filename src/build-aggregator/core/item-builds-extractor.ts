import {RiotAPITypes} from '@fightmegg/riot-api';
import {Presets, SingleBar} from 'cli-progress';
import LolClient from '../../common/client/lol-client';
import {Build} from '../../common/model/build';
import {ChampionBuildInformation} from '../../common/model/champion-build-information';
import {MatchTimeline} from '../model/match-timeline';
import {toBuild, toChampionBuildInfo} from './item-build-converter';
import {generateItemBuildsFromMatch} from './item-build-creator';
import {toMatchTimelines} from './match-timeline-converter';
import {SummonerSpellSet} from '../../common/model/summoner-spell-set';

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
        if (i >= 3) {
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
        const newBuildInfo: ChampionBuildInformation = {
            championId: buildInfo.championId,
            position: buildInfo.position,
            builds: mergedBuildDuplicates(withoutSubsets(buildInfo.builds)),
        };
        newBuildInfos.push(newBuildInfo);
    });
    return newBuildInfos;
};

const withoutSubsets = (builds: Build[]) =>
    builds.filter((build1) => builds.every((build2) => !isSubsetOf(build1, build2) || hasSameItems(build1, build2)));

const hasSameItems = (buildA: Build, buildB: Build) =>
    isSubsetOf(buildA, buildB) && buildA.itemIds.length === buildB.itemIds.length;

const isSubsetOf = (buildA: Build, buildB: Build) => buildA.itemIds.every((val) => buildB.itemIds.includes(val));

const mergedBuildDuplicates = (builds: Build[]) => {
    const newBuilds: Build[] = [];
    for (const build of builds) {
        const existingBuild = newBuilds.find((addedBuild) => hasSameItems(build, addedBuild));
        if (!existingBuild) {
            newBuilds.push(build);
        } else {
            build.summonerSpellSets.forEach((summonerSpellSet) => {
                const existingSummonerSpellSet = existingBuild.summonerSpellSets.find(
                    (addedSummonerSpellSet) => hasSameSummonerSpells(addedSummonerSpellSet, summonerSpellSet));
                if (!existingSummonerSpellSet) {
                    existingBuild.summonerSpellSets.push(summonerSpellSet);
                } else {
                    existingSummonerSpellSet.popularity++;
                }
            });
            existingBuild.popularity++;
        }
    }
    return newBuilds;
};

const hasSameSummonerSpells = (summonerSpellSetA: SummonerSpellSet, summonerSpellSetB: SummonerSpellSet) =>
    (summonerSpellSetA.summonerSpell1 === summonerSpellSetB.summonerSpell1
        || summonerSpellSetA.summonerSpell1 === summonerSpellSetB.summonerSpell2)
    && (summonerSpellSetA.summonerSpell2 === summonerSpellSetB.summonerSpell1
        || summonerSpellSetA.summonerSpell2 === summonerSpellSetB.summonerSpell2);
