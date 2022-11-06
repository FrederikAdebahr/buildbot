import { RuneTree } from './rune-tree';
import { Stats } from './stats';

export interface RuneSet {
    primaryTree: RuneTree;
    secondaryTree: RuneTree;
    stats: Stats;
    popularity: number;
}