import { Stats } from './stats';

export interface RuneSet {
    primaryTree: {
        id: number;
        perks: number[];
    },
    secondaryTree: {
        id: number;
        perks: number[];
    }
    stats: {
        offense: Stats,
        defense: Stats,
        flex: Stats
    };
    popularity: number;
}
