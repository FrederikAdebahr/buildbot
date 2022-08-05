import { RiotAPITypes } from '@fightmegg/riot-api';
import { SingleBar, Presets } from 'cli-progress';
import LolClient from '../../common/client/lol-client';
import { EventType } from '../model/event-type';
import { ItemBuild } from '../model/item-build';
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
        let itemBuilds = this.extractItemBuildsForAllMatches();
        this.printItems(itemBuilds, this.matchDtos);
        return itemBuilds;
    }

    private extractItemBuildsForAllMatches() {
        // let itemBuilds = new Map<number, number[][]>();
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
                // if (!itemBuilds.get(itemBuild.matchId)) {
                //     itemBuilds.set(itemBuild.matchId, []);
                // }
                //itemBuilds.get(itemBuild.championId)!.push(itemBuild.items);
                itemBuilds.push(itemBuild);
            }
        }
        console.log('\nDone!');

        return itemBuilds;
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
            matchesTimeLine.push(await this.lolClient.fetchMatchTimelineById(matchId));
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
            matches.push(await this.lolClient.fetchMatchById(matchId));
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
                participantId: participant.participantId,
                championId: participant.championId,
                items: [],
                trinket: 0,
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
                        itemBuildsInMatch[i].trinket = 0;
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
                        itemBuildsInMatch[i].trinket = 0;
                    } else  {
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

    private printItems(itemBuilds: ItemBuild[], matches: RiotAPITypes.MatchV5.MatchDTO[]) {
        itemBuilds.forEach((build) => {
            // console.log('-------------');
            // console.log('Timeline:');
            // build.items.forEach((item) => console.log(this.getItemName(item)));
            // console.log(this.getItemName(build.trinket));
            // console.log('-------------');
            // console.log('Match:');
            for (let match of matches) {
                if (match.metadata.matchId === build.matchId) {
                    for (let participant of match.info.participants) {
                        if (participant.participantId === build.participantId) {
                            let matchBuild = new Set<number>();
                            if (this.isCompletedItem(participant.item0)) {
                                if (!this.isTrinket(participant.item0)) {
                                    matchBuild.add(participant.item0);
                                }
                            }
                            if (this.isCompletedItem(participant.item1)) {
                                if (!this.isTrinket(participant.item1)) {
                                    matchBuild.add(participant.item1);
                                }
                            }
                            if (this.isCompletedItem(participant.item2)) {
                                if (!this.isTrinket(participant.item2)) {
                                    matchBuild.add(participant.item2);
                                }
                            }
                            if (this.isCompletedItem(participant.item3)) {
                                if (!this.isTrinket(participant.item3)) {
                                    matchBuild.add(participant.item3);
                                }
                            }
                            if (this.isCompletedItem(participant.item4)) {
                                if (!this.isTrinket(participant.item4)) {
                                    matchBuild.add(participant.item4);
                                }
                            }
                            if (this.isCompletedItem(participant.item5)) {
                                if (!this.isTrinket(participant.item5)) {
                                    matchBuild.add(participant.item5);
                                }
                            }
                            if (this.isCompletedItem(participant.item6)) {
                                if (!this.isTrinket(participant.item6)) {
                                    matchBuild.add(participant.item6);
                                }
                            }
                            matchBuild.forEach((i) => {
                                build.items.includes(i)
                                    ? i
                                    : console.log(
                                          `Item ${this.getItemName(i)} in match but not in timeline for participant ${build.participantId}`
                                      );
                            });

                            // console.log(participant.item0 + ': ' + this.getItemName(participant.item0));
                            // console.log(participant.item1 + ': ' + this.getItemName(participant.item1));
                            // console.log(participant.item2 + ': ' + this.getItemName(participant.item2));
                            // console.log(participant.item3 + ': ' + this.getItemName(participant.item3));
                            // console.log(participant.item4 + ': ' + this.getItemName(participant.item4));
                            // console.log(participant.item5 + ': ' + this.getItemName(participant.item5));
                            // console.log(participant.item6 + ': ' + this.getItemName(participant.item6));
                        }
                    }
                }
            }
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

    private hasOrnnItem(itemId: number) {
        let potentialOrnnItem = this.lolClient.getItem(itemId)?.into[0];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return this.lolClient.getItem(parseInt(potentialOrnnItem!))?.requiredAlly != undefined;
    }
}
