import { Trinket } from './trinket';

export interface Build {
    itemIds: number[];
    trinket: Trinket | undefined;
    popularity: number;
}
