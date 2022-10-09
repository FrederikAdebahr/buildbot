import {SummonerSpellSet} from './summoner-spell-set';

export interface Build {
    itemIds: number[];
    skillLevelUps: number[];
    runes: Runes;
    trinket: number | undefined;
    summonerSpellSets: SummonerSpellSet[];
    popularity: number;
}
