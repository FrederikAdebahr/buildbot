import { Presets, SingleBar } from 'cli-progress';
import LolClient from '../../common/client/lol-client';
import { Build } from '../../common/model/build';
import { ChampionBuildInformation } from '../../common/model/champion-build-information';
import { MatchTimeline } from '../model/match-timeline';
import { toBuild, toChampionBuildInfo } from './item-build-converter';
import { generateItemBuildsFromMatch } from './item-build-creator';
import { SummonerSpellSet } from '../../common/model/summoner-spell-set';
import { RuneSet } from '../../common/model/rune-set';
import { toMatchTimeline } from './match-timeline-converter';
import { collections } from '../../common/services/database.service';
import { compare } from 'compare-versions';

export const processBuilds = async () => {
    const matchIds = await fetchChallengerMatchIds();

    console.log('Processing matches...');
    const progBar = new SingleBar({ noTTYOutput: true }, Presets.shades_classic);
    progBar.start(matchIds.size, 0);
    for (const matchId of matchIds) {
        const matchDto = await LolClient.getInstance().fetchMatchById(matchId);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (compare(matchDto.info.gameVersion, LolClient.getInstance().getGameVersion()!, '<')) {
            continue;
        }
        const matchTimelineDto = await LolClient.getInstance().fetchMatchTimelineById(matchId);
        const matchTimeline = toMatchTimeline(matchDto, matchTimelineDto);
        extractItemBuildsForMatch(matchTimeline).forEach(await processBuild);
        progBar.increment();
    }
    progBar.stop();
};

const fetchChallengerMatchIds = async () => {
    let challengerPlayers = await LolClient.getInstance().fetchChallengerPlayers();
    let matchIds = new Set<string>();

    console.log('Fetching challenger matches...');
    const progBar = new SingleBar({ noTTYOutput: true }, Presets.shades_classic);
    progBar.start(challengerPlayers.entries.length, 0);
    for (let player of challengerPlayers.entries) {
        progBar.increment();
        let matchHistory = await LolClient.getInstance().fetchMatchHistoryForPlayer(player);
        matchHistory.forEach(Set.prototype.add, matchIds);
    }
    progBar.stop();
    return matchIds;
};

const extractItemBuildsForMatch = (matchTimeline: MatchTimeline) => {
    let championBuildInfos: ChampionBuildInformation[] = [];

    let itemBuildsInMatch = generateItemBuildsFromMatch(matchTimeline);
    for (let itemBuild of itemBuildsInMatch) {
        if (!itemBuild.items.length) {
            continue;
        }
        const existingBuildInfo = championBuildInfos.find(
            (buildInfo) => buildInfo.championId === itemBuild.championId && buildInfo.position === itemBuild.position
        );
        if (existingBuildInfo) {
            existingBuildInfo.builds.push(toBuild(itemBuild));
        } else {
            championBuildInfos.push(toChampionBuildInfo(itemBuild));
        }
    }

    return championBuildInfos;
};

const processBuild = async (buildInfo: ChampionBuildInformation) => {
    const buildInfoFilter = {
        championId: buildInfo.championId,
        position: buildInfo.position
    };
    const existingBuildInfo = await collections.builds?.findOne(buildInfoFilter);
    if (existingBuildInfo) {
        const newBuilds = existingBuildInfo.builds.concat(buildInfo.builds);
        mergeBuildDuplicates(newBuilds);
        await collections.builds?.updateOne(buildInfoFilter, { $set: { builds: newBuilds } });
    } else {
        await collections.builds?.insertOne({
            championId: buildInfo.championId,
            position: buildInfo.position,
            builds: buildInfo.builds
        });
    }
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
                    builds[j].popularity++;
                    builds.splice(i, 1);
                    break;
                }
                if (isSubset(builds[j], builds[i])) {
                    mergeRunesAndSummonerSpells(builds[i], builds[j]);
                    builds[i].popularity++;
                    builds.splice(j, 1);
                    break;
                }
            }
        }
    } while (current > builds.length);
};

const mergeRunesAndSummonerSpells = (supersetBuild: Build, subsetBuild: Build) => {
    subsetBuild.summonerSpellSets.forEach((summonerSpellSet) => {
        const existingSummonerSpellSet = supersetBuild.summonerSpellSets.find((supersetSummonerSpellSet) =>
            hasSameSummonerSpells(supersetSummonerSpellSet, summonerSpellSet)
        );
        if (existingSummonerSpellSet) {
            existingSummonerSpellSet.popularity += summonerSpellSet.popularity;
        } else {
            supersetBuild.summonerSpellSets.push(summonerSpellSet);
        }
    });
    subsetBuild.runeSets.forEach((runeSet) => {
        const existingRuneSet = supersetBuild.runeSets.find((supersetRuneSet) =>
            hasSameKeyStone(supersetRuneSet, runeSet)
        );
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
    return buildA.itemIds.every((item) => buildB.itemIds.includes(item));
};

const hasSameSummonerSpells = (summonerSpellSetA: SummonerSpellSet, summonerSpellSetB: SummonerSpellSet) =>
    (summonerSpellSetA.summonerSpell1 === summonerSpellSetB.summonerSpell1 ||
        summonerSpellSetA.summonerSpell1 === summonerSpellSetB.summonerSpell2) &&
    (summonerSpellSetA.summonerSpell2 === summonerSpellSetB.summonerSpell1 ||
        summonerSpellSetA.summonerSpell2 === summonerSpellSetB.summonerSpell2);
