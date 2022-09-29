import { RiotAPITypes } from '@fightmegg/riot-api';
import LolClient from '../../common/client/lol-client';
import { EventType } from '../model/event-type';
import { ItemBuild } from '../../common/model/item-build';
import { MatchTimeline } from '../model/match-timeline';
import { Trinket } from '../../common/model/trinket';

export const generateItemBuildsFromMatch = (matchTimeline: MatchTimeline) => {
    let itemBuildsInMatch: ItemBuild[] = matchTimeline.participants.map((participant) => ({
        matchId: matchTimeline.matchId,
        position: participant.position,
        participantId: participant.participantId,
        championId: participant.championId,
        items: [],
        trinket: undefined,
    }));
    for (let frame of matchTimeline.frames) {
        for (let event of frame.events) {
            let eventParticipantItemBuild = itemBuildsInMatch.find(
                (build) => build.participantId === event.participantId
            );
            if (!eventParticipantItemBuild) {
                continue;
            }
            switch (event.type) {
                case EventType.ITEM_PURCHASED:
                    addItemToBuild(eventParticipantItemBuild, event);
                    break;
                case EventType.ITEM_SOLD:
                case EventType.ITEM_DESTROYED:
                    removeItemFromBuild(eventParticipantItemBuild, event);
                    break;
                case EventType.ITEM_UNDO:
                    applyUndoToBuild(eventParticipantItemBuild, event);
                    break;
            }
        }
    }
    return itemBuildsInMatch;
};

const addItemToBuild = (itemBuild: ItemBuild, event: RiotAPITypes.MatchV5.EventDTO) => {
    if (event.itemId) {
        if (event.itemId in Trinket) {
            itemBuild.trinket = event.itemId;
        } else if (isCompletedItem(event.itemId)) {
            itemBuild.items.push(event.itemId);
        }
    }
};

const removeItemFromBuild = (itemBuild: ItemBuild, event: RiotAPITypes.MatchV5.EventDTO) => {
    if (event.itemId) {
        if (event.itemId in Trinket) {
            itemBuild.trinket = undefined;
        } else if (isCompletedItem(event.itemId)) {
            itemBuild.items = itemBuild.items.filter((item) => {
                return item !== event.itemId;
            });
        }
    }
};

const applyUndoToBuild = (itemBuild: ItemBuild, event: RiotAPITypes.MatchV5.EventDTO) => {
    if (event.beforeId && isCompletedItem(event.beforeId)) {
        if (event.beforeId in Trinket) {
            itemBuild.trinket = undefined;
        } else {
            itemBuild.items = itemBuild.items.filter((item) => {
                return item !== event.beforeId;
            });
        }
    }
    if (event.afterId && isCompletedItem(event.afterId)) {
        if (event.afterId in Trinket) {
            itemBuild.trinket = event.afterId;
        } else {
            itemBuild.items.push(event.afterId);
        }
    }
};

const isCompletedItem = (itemId: number) => {
    let item = LolClient.getInstance().getItem(itemId);
    if (item.consumed) {
        return false;
    }
    return !item.into || !item.into.length || hasOrnnItem(item);
};

const hasOrnnItem = (item: RiotAPITypes.DDragon.DDragonItemDTO) => {
    let potentialOrnnItem = item.into[0];
    if (!potentialOrnnItem) {
        return false;
    }
    return LolClient.getInstance().getItem(parseInt(potentialOrnnItem))?.requiredAlly != undefined;
};
