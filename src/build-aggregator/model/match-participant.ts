import { Position } from '../../common/model/position';
import { RiotAPITypes } from '@fightmegg/riot-api';

export interface MatchParticipant {
    participantId: number;
    championId: number;
    position: Position;
    perks: RiotAPITypes.MatchV5.PerksDTO;
    summonerSpell1: number;
    summonerSpell2: number;
}
