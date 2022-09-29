import { RiotAPITypes } from '@fightmegg/riot-api';
import { Position } from '../../common/model/position';
import { SummonerSpell } from '../model/summoner-spell';
import { SupportItem } from '../model/support-item';

const POSITION_TRACKING_START_TIME = 1;
const POSITION_TRACKING_STOP_TIME = 4;
const TOPLANE_DELIMITER = -4000;
const BOTLATNE_DELIMITER = 4000;

export const calculatePosition = (
    frames: RiotAPITypes.MatchV5.FrameDTO[],
    participant: RiotAPITypes.MatchV5.ParticipantDTO
): Position => {
    if (participant.summoner1Id == SummonerSpell.SMITE || participant.summoner2Id == SummonerSpell.SMITE) {
        return Position.JUNGLE;
    }

    if (hasSupportItem(participant)) {
        return Position.SUPPORT;
    }

    const effectiveStopTime = Math.min(frames.length, POSITION_TRACKING_STOP_TIME);
    let averageXPos = 0;
    let averageYPos = 0;

    for (let i = POSITION_TRACKING_START_TIME; i <= effectiveStopTime; i++) {
        let participantFrame = frames[i].participantFrames[participant.participantId];
        averageXPos += participantFrame.position.x;
        averageYPos += participantFrame.position.y;
    }

    averageXPos /= effectiveStopTime;
    averageYPos /= effectiveStopTime;

    if (averageXPos - averageYPos < TOPLANE_DELIMITER) {
        return Position.TOP;
    }

    if (averageXPos - averageYPos > BOTLATNE_DELIMITER) {
        return Position.BOT;
    }

    return Position.MID;
};

const hasSupportItem = (participant: RiotAPITypes.MatchV5.ParticipantDTO) => {
    let items = createItemSet(participant);
    return items.some((item) => item in SupportItem);
};

const createItemSet = (participant: RiotAPITypes.MatchV5.ParticipantDTO) => {
    let items = [];
    items.push(participant.item0);
    items.push(participant.item1);
    items.push(participant.item2);
    items.push(participant.item3);
    items.push(participant.item4);
    items.push(participant.item5);
    items.push(participant.item6);
    return items;
};
