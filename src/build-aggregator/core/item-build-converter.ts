import { Build } from '../../common/model/build';
import { ChampionBuildInformation } from '../../common/model/champion-build-information';
import { ItemBuild } from '../model/item-build';
import { SummonerSpellSet } from '../../common/model/summoner-spell-set';

export function toChampionBuildInfo(itemBuild: ItemBuild): ChampionBuildInformation {
    return {
        championId: itemBuild.championId,
        position: itemBuild.position,
        builds: [toBuild(itemBuild)],
    };
}

export function toBuild(itemBuild: ItemBuild): Build {
    return {
        itemIds: itemBuild.items,
        trinket: itemBuild.trinket,
        popularity: 0,
        summonerSpellSets: [toSummonerSpellSet(itemBuild)],
    };
}

export function toSummonerSpellSet(itemBuild: ItemBuild): SummonerSpellSet {
    return {
        summonerSpell1: itemBuild.summonerSpell1,
        summonerSpell2: itemBuild.summonerSpell2,
        popularity: 0,
    };
}
