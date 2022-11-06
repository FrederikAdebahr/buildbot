import { SummonerSpellSet } from './summoner-spell-set';
import { RuneSet } from './rune-set';

export interface Build {
    itemIds: number[];
    skillLevelUps: number[];
    runeSets: RuneSet[];
    trinket: number | undefined;
    summonerSpellSets: SummonerSpellSet[];
    popularity: number;
}

export const getSkillName = (skillId: number) => {
    switch (skillId) {
        case 1:
            return 'Q';
        case 2:
            return 'W';
        case 3:
            return 'E';
        case 4:
            return 'R';
        default:
            return undefined;
    }
};