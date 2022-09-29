import { it } from 'node:test';
import { Build } from '../../common/model/build';
import { ChampionBuildInformation } from '../../common/model/champion-build-information';
import { ItemBuild } from '../../common/model/item-build';

export const toBuild = (itemBuild: ItemBuild) => {
    return {
        itemIds: itemBuild.items,
        trinket: itemBuild.trinket,
    } as Build;
};

export const toChampionBuildInfo = (itemBuild: ItemBuild) => {
    return {
        championId: itemBuild.championId,
        position: itemBuild.position,
        builds: [
            {
                itemIds: itemBuild.items,
                trinket: itemBuild.trinket,
            },
        ],
    } as ChampionBuildInformation;
};
