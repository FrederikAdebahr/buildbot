import { RiotAPITypes } from '@fightmegg/riot-api';
import { Position } from '../../common/models/champion-build-information';

export interface MatchTimeline {
    matchId: string;
    participants: MatchParticipant[];
    frames: RiotAPITypes.MatchV5.FrameDTO[];
}

export interface MatchParticipant {
    participantId: number;
    championId: number;
    position: Position | undefined;
}
