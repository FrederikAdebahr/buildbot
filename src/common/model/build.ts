import {SummonerSpellSet} from './summoner-spell-set';
import {Runes} from '../../build-aggregator/model/runes';

export interface Build {
    itemIds: number[];
    skillLevelUps: number[];
    runes: Runes;
    trinket: number | undefined;
    summonerSpellSets: SummonerSpellSet[];
    popularity: number;
}
