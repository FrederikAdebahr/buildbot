import { Build } from '../model/build';
import { SummonerSpellSet } from '../model/summoner-spell-set';
import { RuneSet } from '../model/rune-set';

export const getTopThreeBuildsByPopularitySorted = (builds: Build[]) => [...builds].sort(buildComparator).slice(0, 3);

const buildComparator = (buildA: Build, buildB: Build) => {
    if (buildA.popularity > buildB.popularity) {
        return -1;
    }
    if (buildA.popularity < buildB.popularity) {
        return 1;
    }
    return 0;
};

export const getTopTwoSummonerSpellSetsByPopularitySorted = (summonerSpellSets: SummonerSpellSet[]) => [...summonerSpellSets].sort(summonerSpellSetComparator).slice(0, 2);

const summonerSpellSetComparator = (summonerSpellSetA: SummonerSpellSet, summonerSpellSetB: SummonerSpellSet) => {
    if (summonerSpellSetA.popularity > summonerSpellSetB.popularity) {
        return -1;
    }
    if (summonerSpellSetA.popularity < summonerSpellSetB.popularity) {
        return 1;
    }
    return 0;
};

export const getMostPopularRuneSet = (runeSets: RuneSet[]) => [...runeSets].sort(runeSetComparator)[0];

const runeSetComparator = (runeSetA: RuneSet, runeSetB: RuneSet) => {
    if (runeSetA.popularity > runeSetB.popularity) {
        return -1;
    }
    if (runeSetA.popularity < runeSetB.popularity) {
        return 1;
    }
    return 0;
};
