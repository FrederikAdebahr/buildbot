import {RiotAPITypes} from '@fightmegg/riot-api';
import {Presets, SingleBar} from 'cli-progress';
import LolClient from '../../common/client/lol-client';
import {Build} from '../../common/model/build';
import {ChampionBuildInformation} from '../../common/model/champion-build-information';
import {MatchTimeline} from '../model/match-timeline';
import {toBuild, toChampionBuildInfo} from './item-build-converter';
import {generateItemBuildsFromMatch} from './item-build-creator';
import {toMatchTimelines} from './match-timeline-converter';

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
    progBar.start(challengerPlayers.entries.length, 1);

    for (let player of challengerPlayers.entries) {
        let matchHistory = await LolClient.getInstance().fetchMatchHistoryForPlayer(player);
        matchHistory.forEach(Set.prototype.add, matchIds);
        progBar.increment();
        // TODO: Remove this
        break;
    }

    progBar.stop();
    return matchIds;
};

const fetchChallengerMatchTimelines = async (matchIds: Set<string>) => {
    let matchesTimeLine: RiotAPITypes.MatchV5.MatchTimelineDTO[] = [];

    console.log('Fetching match timelines...');
    const progBar = new SingleBar({}, Presets.shades_classic);
    progBar.start(matchIds.size, 1);

    for (let matchId of matchIds) {
        matchesTimeLine.push(await LolClient.getInstance().fetchMatchTimelineById(matchId));
        progBar.increment();
    }

    progBar.stop();
    return matchesTimeLine;
};

const fetchChallengerMatches = async (matchIds: Set<string>) => {
    let matches: RiotAPITypes.MatchV5.MatchDTO[] = [];

    console.log('Fetching matches...');
    const progBar = new SingleBar({}, Presets.shades_classic);
    progBar.start(matchIds.size, 1);

    for (let matchId of matchIds) {
        matches.push(await LolClient.getInstance().fetchMatchById(matchId));
        progBar.increment();
    }
    progBar.stop();
    return matches;
};

const extractItemBuildsForAllMatches = (matchTimelines: MatchTimeline[]) => {
    let championBuildInfos: ChampionBuildInformation[] = [];

    console.log('Extracting item builds...');
    const progBar = new SingleBar({}, Presets.shades_classic);
    progBar.start(matchTimelines.length, 1);

    for (let matchTimeline of matchTimelines) {
        let itemBuildsInMatch = generateItemBuildsFromMatch(matchTimeline);
        for (let itemBuild of itemBuildsInMatch) {
            if (!itemBuild.items.length) {
                continue;
            }
            const existingBuildInfo = championBuildInfos.find(
                (buildInfo) =>
                    buildInfo.championId === itemBuild.championId && buildInfo.position === itemBuild.position
            );
            if (existingBuildInfo) {
                existingBuildInfo.builds.push(toBuild(itemBuild));
            } else {
                championBuildInfos.push(toChampionBuildInfo(itemBuild));
            }
        }
        progBar.increment();
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
            builds: mergedDuplicates(withoutSubsets(buildInfo.builds)),
        };
        newBuildInfos.push(newBuildInfo);
    });
    return newBuildInfos;
};

const withoutSubsets = (builds: Build[]) =>
    builds.filter((build1) => builds.every((build2) => !isSubsetOf(build1, build2) || hasSameItems(build1, build2)));

const isSubsetOf = (buildA: Build, buildB: Build) => buildA.itemIds.every((val) => buildB.itemIds.includes(val));

const mergedDuplicates = (builds: Build[]) => {
    const newBuilds: Build[] = [];
    for (const build of builds) {
        const existingBuild = newBuilds.find((addedBuild) => hasSameItems(build, addedBuild));
        if (!existingBuild) {
            newBuilds.push(build);
        } else {
            existingBuild.popularity++;
        }
    }
    return newBuilds;
};

const hasSameItems = (buildA: Build, buildB: Build) =>
    isSubsetOf(buildA, buildB) && buildA.itemIds.length === buildB.itemIds.length;
