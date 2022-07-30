import { RiotAPI, RiotAPITypes, PlatformId } from '@fightmegg/riot-api';
import { SingleBar, Presets } from 'cli-progress';
import 'dotenv/config';
import { ItemBuild } from './model/item-build';
import { Trinket } from './model/trinket';

let rAPI: RiotAPI;
const REGION = PlatformId.EUW1;
const CLUSTER = PlatformId.EUROPE;
const QUEUE = RiotAPITypes.QUEUE.RANKED_SOLO_5x5;
let items: RiotAPITypes.DDragon.DDragonItemWrapperDTO;

updateItemBuilds();

async function updateItemBuilds() {
    if (!process.env.RIOT_TOKEN) {
        throw Error('Could not find RIOT_TOKEN in your environment');
    }
    rAPI = new RiotAPI(process.env.RIOT_TOKEN);
    items = await rAPI.ddragon.items();
    let challengerMatchIds = await fetchChallengerMatchIds();
    let challengerMatchTimelines = await fetchChallengerMatchTimelines(challengerMatchIds);
    let challengerMatches = await fetchChallengerMatches(challengerMatchIds);
    let itemBuilds = await extractItemBuilds(challengerMatches, challengerMatchTimelines);
    printItems(itemBuilds, challengerMatches);
}

async function fetchChallengerMatchIds() {
    let challengerPlayers = await fetchChallengerPlayers();
    let matchIds = new Set<string>();

    console.log('Fetching challenger players...');
    const progBar = new SingleBar({}, Presets.shades_classic);
    progBar.start(challengerPlayers.entries.length, 0);
    for (let player of challengerPlayers.entries) {
        progBar.increment();
        let matchHistory = await fetchMatchHistory(player);
        matchHistory.forEach((e) => matchIds.add(e));
        //TODO Remove this
        break;
    }
    console.log('Done!');

    return matchIds;
}

async function fetchChallengerMatchTimelines(matchIds: Set<string>) {
    let matchesTimeLine: RiotAPITypes.MatchV5.MatchTimelineDTO[] = [];

    console.log('Fetching match timelines...');
    const progBar = new SingleBar({}, Presets.shades_classic);
    progBar.start(matchIds.entries.length, 0);
    for (let matchId of matchIds) {
        progBar.increment();
        matchesTimeLine.push(
            await rAPI.matchV5.getMatchTimelineById({
                cluster: CLUSTER,
                matchId: matchId,
            })
        );
    }
    console.log('Done!');

    return matchesTimeLine;
}

async function fetchChallengerMatches(matchIds: Set<string>) {
    let matches: RiotAPITypes.MatchV5.MatchDTO[] = [];
    console.log('Fetching matches...');
    const progBar = new SingleBar({}, Presets.shades_classic);
    progBar.start(matchIds.entries.length, 0);
    for (let matchId of matchIds) {
        progBar.increment();
        matches.push(
            await rAPI.matchV5.getMatchById({
                cluster: CLUSTER,
                matchId: matchId,
            })
        );
    }
    console.log('Done!');

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

async function extractItemBuilds(
    matches: RiotAPITypes.MatchV5.MatchDTO[],
    matchTimelines: RiotAPITypes.MatchV5.MatchTimelineDTO[]
) {
    // let itemBuilds = new Map<number, number[][]>();
    let itemBuilds: ItemBuild[] = [];

    console.log('Extracting item builds...');
    const progBar = new SingleBar({}, Presets.shades_classic);
    progBar.start(matchTimelines.length, 0);
    for (let i in matchTimelines) {
        progBar.increment();
        let itemBuildsInMatch: ItemBuild[] = [];
        matchTimelines[i].info.participants.forEach((p) =>
            itemBuildsInMatch.push({
                matchId: '',
                completedItems: 0,
                participantId: p.participantId,
                championId: 0,
                items: [],
                trinket: 0,
            })
        );
        insertChampionIds(matches, matchTimelines[i].metadata.matchId, itemBuildsInMatch);
        await insertItemBuilds(matchTimelines[i], itemBuildsInMatch);
        for (let itemBuild of itemBuildsInMatch) {
            // if (!itemBuilds.get(itemBuild.matchId)) {
            //     itemBuilds.set(itemBuild.matchId, []);
            // }
            //itemBuilds.get(itemBuild.championId)!.push(itemBuild.items);
            itemBuilds.push(itemBuild);
        }
    }
    console.log('Done!');

    return itemBuilds;
}

function insertChampionIds(matches: RiotAPITypes.MatchV5.MatchDTO[], matchId: string, itemBuildsInMatch: ItemBuild[]) {
    for (let match of matches) {
        if (match.metadata.matchId === matchId) {
            for (let participant of match.info.participants) {
                for (let itemBuild of itemBuildsInMatch) {
                    if (participant.participantId === itemBuild.participantId) {
                        itemBuild.championId = participant.championId;
                        itemBuild.matchId = matchId;
                        break;
                    }
                }
            }
        }
    }
}

async function insertItemBuilds(matchTimeline: RiotAPITypes.MatchV5.MatchTimelineDTO, itemBuildsInMatch: ItemBuild[]) {
    for (let frame of matchTimeline.info.frames) {
        for (let event of frame.events) {
            if (event.type === 'ITEM_PURCHASED') {
                for (let i in itemBuildsInMatch) {
                    if (itemBuildsInMatch[i].participantId == event.participantId) {
                        if (event.itemId) {
                            if (isTrinket(event.itemId)) {
                                itemBuildsInMatch[i].trinket = event.itemId;
                            } else if (await isCompletedItem(event.itemId)) {
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
    if (!items.data[itemId]) {
        console.error(`Item with id ${itemId} not found!`);
        return false;
    }
    if (items.data[itemId].consumed) {
        return false;
    }

    return !items.data[itemId]['into'] || hasOrnnItem(itemId);
}

function printItems(itemBuilds: ItemBuild[], matches: RiotAPITypes.MatchV5.MatchDTO[]) {
    itemBuilds.forEach((build) => {
        console.log('-------------');
        console.log('Timeline:');
        build.items.forEach((item) => console.log(getItemName(item)));
        console.log(getItemName(build.trinket));
        console.log('-------------');
        console.log('Match:');
        for (let match of matches) {
            if (match.metadata.matchId === build.matchId) {
                for (let participant of match.info.participants) {
                    if (participant.participantId === build.participantId) {
                        console.log(participant.item0 + ': ' + getItemName(participant.item0));
                        console.log(participant.item1 + ': ' + getItemName(participant.item1));
                        console.log(participant.item2 + ': ' + getItemName(participant.item2));
                        console.log(participant.item3 + ': ' + getItemName(participant.item3));
                        console.log(participant.item4 + ': ' + getItemName(participant.item4));
                        console.log(participant.item5 + ': ' + getItemName(participant.item5));
                        console.log(participant.item6 + ': ' + getItemName(participant.item6));
                    }
                }
            }
        }
    });
}

function getItemName(itemId: number) {
    if (itemId == 0) {
        return '';
    }
    return items.data[itemId].name;
}
function isTrinket(itemId: number) {
    return itemId in Trinket;
}
function hasOrnnItem(itemId: number) {
    let next = items.data[itemId]['into'][0];
    return items.data[parseInt(next)].requiredAlly != undefined;
}
