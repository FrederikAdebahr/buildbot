import { Trinket } from './trinket';

export interface ItemBuild {
    matchId: string,
    completedItems: number;
    participantId: number;
    championId: number;
    items: number[];
    trinket: Trinket;
}
