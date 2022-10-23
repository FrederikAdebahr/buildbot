import {Position} from '../../common/model/position';
import {Trinket} from './trinket';
import {RuneSet} from '../../common/model/rune-set';

export interface ItemBuild {
    matchId: string;
    position: Position;
    participantId: number;
    championId: number;
    summonerSpell1: number;
    summonerSpell2: number;
    skillLevelUps: number[];
    runes: RuneSet;
    items: number[];
    trinket: Trinket;
}
