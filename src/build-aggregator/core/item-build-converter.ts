import { Build } from '../../common/model/build';
import { ChampionBuildInformation } from '../../common/model/champion-build-information';
import { ItemBuild } from '../model/item-build';

export const toBuild = (itemBuild: ItemBuild) => {
    return {
        itemIds: itemBuild.items,
        trinket: itemBuild.trinket,
        popularity: 0,
    } as Build;
};

export const toChampionBuildInfo = (itemBuild: ItemBuild) => {
    return {
        championId: itemBuild.championId,
        position: itemBuild.position,
        builds: [toBuild(itemBuild)],
    } as ChampionBuildInformation;
};
