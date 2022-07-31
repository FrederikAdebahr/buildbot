import { RiotAPITypes } from '@fightmegg/riot-api';

export interface MatchTimeline {
    matchId: string;
    participants: MatchParticipant[];
    frames: RiotAPITypes.MatchV5.FrameDTO[];
}

export interface MatchParticipant {
    participantId: number;
    championId: number;
}