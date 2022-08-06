import { Position } from '../../common/models/champion-build-information';
import { Trinket } from './trinket';

export interface ItemBuild {
    matchId: string;
    position: Position | undefined;
    completedItems: number;
    participantId: number;
    championId: number;
    items: number[];
    trinket: Trinket | undefined;
}
