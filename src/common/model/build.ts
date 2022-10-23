import {SummonerSpellSet} from './summoner-spell-set';
import {RuneSet} from './rune-set';

export interface Build {
    itemIds: number[];
    skillLevelUps: number[];
    runeSets: RuneSet[];
    trinket: number | undefined;
    summonerSpellSets: SummonerSpellSet[];
    popularity: number;
}
