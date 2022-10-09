import {Build} from '../../common/model/build';
import {ChampionBuildInformation} from '../../common/model/champion-build-information';
import {ItemBuild} from '../model/item-build';
import {SummonerSpellSet} from '../../common/model/summoner-spell-set';
import {Trinket} from '../model/trinket';

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
        skillLevelUps: itemBuild.skillLevelUps,
        runes: itemBuild.runes,
        trinket: itemBuild.trinket === Trinket.NO_TRINKET ? Trinket.STEALTH_WARD : itemBuild.trinket,
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
