import { Build } from './build';
import { Position } from './position';

export interface ChampionBuildInformation {
    championId: number;
    position: Position;
    builds: Build[];
}
