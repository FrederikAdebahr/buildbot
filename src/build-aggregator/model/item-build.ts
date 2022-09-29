import { Position } from '../../common/model/position';
import { Trinket } from '../../common/model/trinket';

export interface ItemBuild {
    matchId: string;
    position: Position | undefined;
    participantId: number;
    championId: number;
    items: number[];
    trinket: Trinket | undefined;
}
