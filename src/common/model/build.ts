import { SummonerSpellSet } from './summoner-spell-set';

export interface Build {
    itemIds: number[];
    trinket: number | undefined;
    summonerSpellSets: SummonerSpellSet[];
    popularity: number;
}
