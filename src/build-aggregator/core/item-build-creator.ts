import {RiotAPITypes} from '@fightmegg/riot-api';
import LolClient from '../../common/client/lol-client';
import {EventType} from '../model/event-type';
import {ItemBuild} from '../model/item-build';
import {MatchTimeline} from '../model/match-timeline';
import {Trinket} from '../model/trinket';
import {JungleItem} from '../model/jungle-items';
import {Champion} from '../model/champion';
import {RuneSet} from '../../common/model/rune-set';


export const generateItemBuildsFromMatch = (matchTimeline: MatchTimeline) => {
    let itemBuildsInMatch: ItemBuild[] = matchTimeline.participants.map((participant) => ({
        matchId: matchTimeline.matchId,
        position: participant.position,
        participantId: participant.participantId,
        championId: participant.championId,
        summonerSpell1: participant.summonerSpell1,
        summonerSpell2: participant.summonerSpell2,
        items: [],
        runes: initializeRunes(participant.perks),
        skillLevelUps: [],
        trinket: participant.championId == Champion.FIDDLESTICKS ? Trinket.SCARECROW_EFFIGY : Trinket.NO_TRINKET,
    }));
    for (let frame of matchTimeline.frames) {
        for (let event of frame.events) {
            let eventParticipantItemBuild = itemBuildsInMatch.find(
                (build) => build.participantId === event.participantId,
            );
            if (!eventParticipantItemBuild) {
                continue;
            }
            switch (event.type) {
                case EventType.ITEM_PURCHASED:
                    addItemToBuild(eventParticipantItemBuild, event);
                    break;
                case EventType.ITEM_SOLD:
                    removeSoldItemFromBuild(eventParticipantItemBuild, event);
                    break;
                case EventType.ITEM_DESTROYED:
                    removeDestroyedItemFromBuild(eventParticipantItemBuild, event);
                    break;
                case EventType.ITEM_UNDO:
                    applyUndoToBuild(eventParticipantItemBuild, event);
                    break;
                case EventType.SKILL_LEVEL_UP:
                    addSkillLevelUpToBuild(eventParticipantItemBuild, event);
                    break;
            }
        }
    }
    return itemBuildsInMatch;
};

const initializeRunes = (perks: RiotAPITypes.MatchV5.PerksDTO): RuneSet => {
    const primaryTreeSelections = perks.styles[0].selections;
    const secondaryTreeSelections = perks.styles[1].selections;
    return {
        primaryTree: {
            id: perks.styles[0].style,
            perks: [primaryTreeSelections[0].perk, primaryTreeSelections[1].perk, primaryTreeSelections[2].perk, primaryTreeSelections[3].perk],
        },
        secondaryTree: {
            id: perks.styles[1].style,
            perks: [secondaryTreeSelections[0].perk, secondaryTreeSelections[1].perk],
        },
        stats: perks.statPerks,
        popularity: 1
    };
};

const addSkillLevelUpToBuild = (eventParticipantItemBuild: ItemBuild, event: RiotAPITypes.MatchV5.EventDTO) => {
    if (!event.skillSlot) {
        return;
    }
    eventParticipantItemBuild.skillLevelUps.push(event.skillSlot);
    return;
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

const removeSoldItemFromBuild = (itemBuild: ItemBuild, event: RiotAPITypes.MatchV5.EventDTO) => {
    itemBuild.items = itemBuild.items.filter((item) => {
        return item !== event.itemId;
    });
};

const removeDestroyedItemFromBuild = (itemBuild: ItemBuild, event: RiotAPITypes.MatchV5.EventDTO) => {
    if (event.itemId) {
        if (!(event.itemId in JungleItem)) {
            return;
        }
        itemBuild.items = itemBuild.items.filter((item) => {
            return item !== event.itemId;
        });
    }
};

const applyUndoToBuild = (itemBuild: ItemBuild, event: RiotAPITypes.MatchV5.EventDTO) => {
    if (event.beforeId && isCompletedItem(event.beforeId)) {
        if (event.beforeId in Trinket) {
            itemBuild.trinket = Trinket.NO_TRINKET;
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
