import { RiotAPITypes } from '@fightmegg/riot-api';
import { MatchParticipant } from './match-participant';

export interface MatchTimeline {
    matchId: string;
    participants: MatchParticipant[];
    frames: RiotAPITypes.MatchV5.FrameDTO[];
}
