import { RiotAPITypes } from '@fightmegg/riot-api';
import { SingleBar, Presets } from 'cli-progress';
import LolClient from '../../common/client/lol-client';
import { Build, Position } from '../../common/models/champion-build-information';
import { EventType } from '../model/event-type';
import { BuildKey, ItemBuild } from '../model/item-build';
import { MatchTimeline } from '../model/match-timeline';
import { Trinket } from '../model/trinket';

export default class ItemBuildsExtractor {
    private readonly lolClient = new LolClient();
    private matchIds?: Set<string>;
    private matchTimelineDtos?: RiotAPITypes.MatchV5.MatchTimelineDTO[];
    private matchDtos?: RiotAPITypes.MatchV5.MatchDTO[];
    private matchTimelines?: MatchTimeline[];

    constructor() {
        this.lolClient.init();
    }

    public async getItemBuildsForAllMatches() {
        this.matchIds = await this.retrieveChallengerMatchIds();
        this.matchTimelineDtos = await this.fetchChallengerMatchTimelines();
        this.matchDtos = await this.fetchChallengerMatches();
        this.matchTimelines = this.toMatchTimelines();
        let championBuildInfos = this.extractItemBuildsForAllMatches();
        this.mergeSubsetBuilds(championBuildInfos);
        return championBuildInfos;
    }

    private mergeSubsetBuilds(championBuildInfos: Map<BuildKey, Build[]>) {
        for (const key of championBuildInfos.keys()) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            let builds = championBuildInfos.get(key)!;
            let current = builds.length;
            do {
                current = builds.length;
                for (let i = 0; i < builds.length; i++) {
                    for (let j = i + 1; j < builds.length; j++) {
                        if (this.isSubset(builds[i], builds[j])) {
                            builds.splice(i, 1);
                            break;
                        }
                        if (this.isSubset(builds[j], builds[i])) {
                            builds.splice(j, 1);
                            break;
                        }
                    }
                }
            } while (current > builds.length);
        }
    }

    private isSubset(buildA: Build, buildB: Build) {
        return buildB.itemIds.every((val) => buildA.itemIds.includes(val));
    }

    private extractItemBuildsForAllMatches() {
        let championBuildInfos = new Map<BuildKey, Build[]>();
        let itemBuilds: ItemBuild[] = [];

        console.log('Extracting item builds...');
        const progBar = new SingleBar({}, Presets.shades_classic);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        progBar.start(this.matchTimelines!.length, 0);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (let matchTimeline of this.matchTimelines!) {
            progBar.increment();
            let itemBuildsInMatch: ItemBuild[] = this.createItemBuildsForMatch(matchTimeline);
            for (let itemBuild of itemBuildsInMatch) {
                if (!itemBuild.position) {
                    continue;
                }
                let buildKey = this.getBuildKey(itemBuild.championId, itemBuild.position);
                if (!championBuildInfos.get(buildKey)) {
                    championBuildInfos.set(buildKey, []);
                }
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                championBuildInfos.get(buildKey)!.push({
                    itemIds: itemBuild.items,
                    trinket: itemBuild.trinket,
                });
                itemBuilds.push(itemBuild);
            }
        }
        console.log('\nDone!');
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //this.printItems(itemBuilds, this.matchDtos!);

        return championBuildInfos;
    }

    private getBuildKey(championId: number, position: Position) {
        return {
            championId: championId,
            position: position,
        };
    }

    private async retrieveChallengerMatchIds() {
        let challengerPlayers = await this.lolClient.fetchChallengerPlayers();
        let matchIds = new Set<string>();

        console.log('Fetching challenger players...');
        const progBar = new SingleBar({}, Presets.shades_classic);
        progBar.start(challengerPlayers.entries.length, 0);
        for (let player of challengerPlayers.entries) {
            progBar.increment();
            let matchHistory = await this.lolClient.fetchMatchHistoryForPlayer(player);
            matchHistory.forEach((e) => matchIds.add(e));
            //TODO Remove this
            break;
        }
        console.log('\nDone!');

        return matchIds;
    }

    private async fetchChallengerMatchTimelines() {
        let matchesTimeLine: RiotAPITypes.MatchV5.MatchTimelineDTO[] = [];

        console.log('Fetching match timelines...');
        const progBar = new SingleBar({}, Presets.shades_classic);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        progBar.start(this.matchIds!.size, 0);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (let matchId of this.matchIds!) {
            progBar.increment();
            matchesTimeLine.push(await await this.lolClient.fetchMatchTimelineById(matchId));
        }

        console.log('\nDone!');

        return matchesTimeLine;
    }

    private async fetchChallengerMatches() {
        let matches: RiotAPITypes.MatchV5.MatchDTO[] = [];
        console.log('Fetching matches...');
        const progBar = new SingleBar({}, Presets.shades_classic);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        progBar.start(this.matchIds!.size, 0);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        for (let matchId of this.matchIds!) {
            progBar.increment();
            matches.push(await await this.lolClient.fetchMatchById(matchId));
        }
        console.log('\nDone!');

        return matches;
    }

    private toMatchTimelines() {
        let matchTimelines: MatchTimeline[] = [];
        this.matchTimelineDtos?.forEach((matchTimeline) => {
            matchTimelines.push({
                matchId: matchTimeline.metadata.matchId,
                participants: matchTimeline.info.participants.map((participant) => {
                    return {
                        participantId: participant.participantId,
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        championId: this.matchDtos!.find(
                            (match) => match.metadata.matchId === matchTimeline.metadata.matchId
                        )!.info.participants.find(
                            (matchParticipant) => matchParticipant.participantId === participant.participantId
                        )!.championId,
                        position: this.Position(
                            this.matchDtos
                                ?.find((match) => match.metadata.matchId === matchTimeline.metadata.matchId)
                                ?.info.participants.find(
                                    (matchParticipant) => matchParticipant.participantId === participant.participantId
                                )?.lane,
                            this.matchDtos
                                ?.find((match) => match.metadata.matchId === matchTimeline.metadata.matchId)
                                ?.info.participants.find(
                                    (matchParticipant) => matchParticipant.participantId === participant.participantId
                                )?.role
                        ),
                    };
                }),
                frames: matchTimeline.info.frames,
            });
        });
        return matchTimelines;
    }

    private createItemBuildsForMatch(matchTimeline: MatchTimeline) {
        let itemBuildsInMatch: ItemBuild[] = matchTimeline.participants.map((participant) => {
            return {
                matchId: matchTimeline.matchId,
                completedItems: 0,
                position: participant.position,
                participantId: participant.participantId,
                championId: participant.championId,
                items: [],
                trinket: undefined,
            };
        });
        for (let frame of matchTimeline.frames) {
            for (let event of frame.events) {
                switch (event.type) {
                    case EventType.ITEM_PURCHASED:
                        this.addItemToBuild(itemBuildsInMatch, event);
                        break;
                    case EventType.ITEM_DESTROYED:
                        this.removeItemFromBuild(itemBuildsInMatch, event);
                        break;
                    case EventType.ITEM_SOLD:
                        this.removeItemFromBuild(itemBuildsInMatch, event);
                        break;
                    case EventType.ITEM_UNDO:
                        this.applyUndoToBuild(itemBuildsInMatch, event);
                        break;
                }
            }
        }
        return itemBuildsInMatch;
    }

    private isCompletedItem(itemId: number) {
        let item = this.lolClient.getItem(itemId);
        if (!item) {
            console.error(`Item with id ${itemId} not found!`);
            return false;
        }
        if (item.consumed) {
            return false;
        }

        return !item.into || this.hasOrnnItem(itemId);
    }

    private addItemToBuild(itemBuildsInMatch: ItemBuild[], event: RiotAPITypes.MatchV5.EventDTO) {
        for (let i in itemBuildsInMatch) {
            if (itemBuildsInMatch[i].participantId == event.participantId) {
                if (event.itemId) {
                    if (this.isTrinket(event.itemId)) {
                        itemBuildsInMatch[i].trinket = event.itemId;
                    } else if (this.isCompletedItem(event.itemId)) {
                        itemBuildsInMatch[i].items.push(event.itemId);
                        itemBuildsInMatch[i].completedItems++;
                    }
                }
            }
        }
    }

    private removeItemFromBuild(itemBuildsInMatch: ItemBuild[], event: RiotAPITypes.MatchV5.EventDTO) {
        for (let i in itemBuildsInMatch) {
            if (itemBuildsInMatch[i].participantId == event.participantId) {
                if (event.itemId) {
                    if (this.isTrinket(event.itemId)) {
                        itemBuildsInMatch[i].trinket = undefined;
                    } else if (this.isCompletedItem(event.itemId)) {
                        itemBuildsInMatch[i].items = itemBuildsInMatch[i].items.filter((item) => {
                            return item !== event.itemId;
                        });
                        itemBuildsInMatch[i].completedItems = itemBuildsInMatch.length;
                    }
                }
            }
        }
    }

    private applyUndoToBuild(itemBuildsInMatch: ItemBuild[], event: RiotAPITypes.MatchV5.EventDTO) {
        for (let i in itemBuildsInMatch) {
            if (itemBuildsInMatch[i].participantId == event.participantId) {
                if (event.beforeId && this.isCompletedItem(event.beforeId)) {
                    if (this.isTrinket(event.beforeId)) {
                        itemBuildsInMatch[i].trinket = undefined;
                    } else {
                        itemBuildsInMatch[i].items = itemBuildsInMatch[i].items.filter((item) => {
                            return item !== event.beforeId;
                        });
                        itemBuildsInMatch[i].completedItems = itemBuildsInMatch.length;
                    }
                }
                if (event.afterId && this.isCompletedItem(event.afterId)) {
                    if (this.isTrinket(event.afterId)) {
                        itemBuildsInMatch[i].trinket = event.afterId;
                    } else {
                        itemBuildsInMatch[i].items.push(event.afterId);
                        itemBuildsInMatch[i].completedItems++;
                    }
                }
            }
        }
    }

    private printItems(championBuildInfos: Map<BuildKey, Build[]>) {
        championBuildInfos.forEach((v, k) => {
            console.log(this.lolClient.getChampion(k.championId)?.name + ' on ' + k.position + ' built: \n');
            v.forEach((i) => i.itemIds.forEach((x) => console.log(this.getItemName(x!))));
            console.log();
        });
    }

    private getItemName(itemId: number) {
        if (itemId == 0) {
            return '';
        }
        return this.lolClient.getItem(itemId)?.name;
    }

    private isTrinket(itemId: number) {
        return itemId in Trinket;
    }

    private Position(lane?: string, role?: string) {
        // console.log(lane + ' ' + role);
        switch (lane) {
            case 'TOP':
                return Position.TOP;
            case 'MIDDLE':
                return Position.MID;
            case 'JUNGLE':
                return Position.JUNGLE;
            case 'BOTTOM':
                return role === 'CARRY' ? Position.BOT : Position.SUPPORT;
            default:
                return role === 'SUPPORT' ? Position.SUPPORT : undefined;
        }
    }

    private hasOrnnItem(itemId: number) {
        let potentialOrnnItem = this.lolClient.getItem(itemId)?.into[0];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.lolClient.getItem(parseInt(potentialOrnnItem!))?.requiredAlly != undefined;
    }
}
