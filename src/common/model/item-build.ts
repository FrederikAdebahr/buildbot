import { Position } from './position';
import { Trinket } from './trinket';

export interface ItemBuild {
    matchId: string;
    position: Position | undefined;
    participantId: number;
    championId: number;
    items: number[];
    trinket: Trinket | undefined;
}
