import { RiotAPI, RiotAPITypes, PlatformId } from '@fightmegg/riot-api';
import 'dotenv/config';
import fs from 'fs';
import { ItemBuild } from './model/item-build';
import path from 'path';
import { Trinket } from './model/trinket';

let rAPI: RiotAPI;
const REGION = PlatformId.EUW1;
const CLUSTER = PlatformId.EUROPE;
const QUEUE = RiotAPITypes.QUEUE.RANKED_SOLO_5x5;
const ITEM_PATH = path.join('src', 'build-service', 'item.json');

updateItemBuilds();

async function updateItemBuilds() {
    console.log(Trinket.FARSIGHT);
    if (!process.env.RIOT_TOKEN) {
        throw Error('Could not find RIOT_TOKEN in your environment');
    }
    rAPI = new RiotAPI(process.env.RIOT_TOKEN);
    let challengerMatchIds = await fetchChallengerMatchIds();
    let challengerMatchTimelines = await fetchChallengerMatchTimelines(challengerMatchIds);
    let challengerMatches = await fetchChallengerMatches(challengerMatchIds);
    let itemBuilds = extractItemBuilds(challengerMatches, challengerMatchTimelines);
    console.log(itemBuilds);
}

async function fetchChallengerMatchIds() {
    let challengerPlayers = await fetchChallengerPlayers();
    let matchIds = new Set<string>();

    for (let player of challengerPlayers.entries) {
        let matchHistory = await fetchMatchHistory(player);
        matchHistory.forEach((e) => matchIds.add(e));
        //TODO Uncomment this
        break;
    }

    return matchIds;
}

async function fetchChallengerMatchTimelines(matchIds: Set<string>) {
    let matchesTimeLine: RiotAPITypes.MatchV5.MatchTimelineDTO[] = [];

    for (let matchId of matchIds) {
        matchesTimeLine.push(
            await rAPI.matchV5.getMatchTimelineById({
                cluster: CLUSTER,
                matchId: matchId,
            })
        );
    }
    return matchesTimeLine;
}

async function fetchChallengerMatches(matchIds: Set<string>) {
    let matches: RiotAPITypes.MatchV5.MatchDTO[] = [];

    for (let matchId of matchIds) {
        matches.push(
            await rAPI.matchV5.getMatchById({
                cluster: CLUSTER,
                matchId: matchId,
            })
        );
    }
    return matches;
}

async function fetchMatchHistory(player: RiotAPITypes.League.LeagueItemDTO) {
    let summoner = await rAPI.summoner.getBySummonerId({
        region: REGION,
        summonerId: player.summonerId,
    });
    return await rAPI.matchV5.getIdsbyPuuid({
        cluster: CLUSTER,
        puuid: summoner.puuid,
    });
}

async function fetchChallengerPlayers() {
    return await rAPI.league.getChallengerByQueue({
        region: REGION,
        queue: QUEUE,
    });
}

function extractItemBuilds(
    matches: RiotAPITypes.MatchV5.MatchDTO[],
    matchTimelines: RiotAPITypes.MatchV5.MatchTimelineDTO[]
) {
    let itemBuilds = new Map<number, number[][]>();

    for (let i in matchTimelines) {
        let itemBuildsInMatch: ItemBuild[] = [];
        matchTimelines[i].info.participants.forEach((p) =>
            itemBuildsInMatch.push({
                completedItems: 0,
                participantId: p.participantId,
                championId: 0,
                items: [],
            })
        );
        insertChampionIds(matches, matchTimelines[i].metadata.matchId, itemBuildsInMatch);
        insertItemBuilds(matchTimelines[i], itemBuildsInMatch);
        for (let itemBuild of itemBuildsInMatch) {
            if (!itemBuilds.get(itemBuild.championId)) {
                itemBuilds.set(itemBuild.championId, []);
            }
            itemBuilds.get(itemBuild.championId)!.push(itemBuild.items);
        }
    }
    return itemBuilds;
}

function insertChampionIds(matches: RiotAPITypes.MatchV5.MatchDTO[], matchId: string, itemBuildsInMatch: ItemBuild[]) {
    for (let match of matches) {
        if (match.metadata.matchId === matchId) {
            for (let participant of match.info.participants) {
                for (let itemBuild of itemBuildsInMatch) {
                    if (participant.participantId === itemBuild.participantId) {
                        itemBuild.championId = participant.championId;
                        break;
                    }
                }
            }
        }
    }
}

function insertItemBuilds(matchTimeline: RiotAPITypes.MatchV5.MatchTimelineDTO, itemBuildsInMatch: ItemBuild[]) {
    for (let frame of matchTimeline.info.frames) {
        for (let event of frame.events) {
            if (event.type === 'ITEM_PURCHASED') {
                for (let i in itemBuildsInMatch) {
                    if (itemBuildsInMatch[i].participantId == event.participantId) {
                        if (event.itemId) {
                            if (isCompletedItem(event.itemId) && itemBuildsInMatch[i].completedItems < 6) {
                                itemBuildsInMatch[i].items.push(event.itemId);
                                itemBuildsInMatch[i].completedItems++;
                            }
                        }
                    }
                }
            }
        }
    }
}

function isCompletedItem(itemId: number) {
    let items;
    try {
        items = JSON.parse(fs.readFileSync(ITEM_PATH, 'utf8'));
    } catch {
        console.error(`File at ${ITEM_PATH} not found!`);
    }
    if (!items['data'][itemId]) {
        console.error(`Item with id ${itemId} not found!`);
        return false;
    }
    return typeof items['data'][itemId]['into'] !== 'undefined' && items['data'][itemId]['into'].length > 0;
}
