import {Position} from '../../common/model/position';
import {Trinket} from './trinket';

export interface ItemBuild {
    matchId: string;
    position: Position;
    participantId: number;
    championId: number;
    summonerSpell1: number;
    summonerSpell2: number;
    skillLevelUps: number[];
    items: number[];
    trinket: Trinket;
}
